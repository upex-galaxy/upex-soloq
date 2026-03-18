'use client';

import { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import type { Tables } from '@/types/supabase';

// Types
type Profile = Tables<'profiles'>;
type BusinessProfile = Tables<'business_profiles'>;
type Subscription = Tables<'subscription'>;

interface AuthUser extends User {
  profile?: Profile | null;
  businessProfile?: BusinessProfile | null;
  subscription?: Subscription | null;
}

interface AuthState {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  refreshProfile: () => Promise<void>;
}

// Context
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Provider
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const supabase = useMemo(() => createClient(), []);

  // Fetch user profile data from database
  const fetchUserProfile = useCallback(
    async (userId: string) => {
      const [profileResult, businessResult, subscriptionResult] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('business_profiles').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('subscription').select('*').eq('user_id', userId).maybeSingle(),
      ]);

      return {
        profile: profileResult.data,
        businessProfile: businessResult.data,
        subscription: subscriptionResult.data,
      };
    },
    [supabase]
  );

  // Refresh profile data
  const refreshProfile = useCallback(async () => {
    if (!state.user?.id) return;

    const profileData = await fetchUserProfile(state.user.id);

    setState(prev => ({
      ...prev,
      user: prev.user
        ? {
            ...prev.user,
            ...profileData,
          }
        : null,
    }));
  }, [state.user?.id, fetchUserProfile]);

  // Sign up
  const signUp = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      return { error };
    },
    [supabase]
  );

  // Sign in
  const signIn = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // Update last_login_at only on actual login, not on session restoration (SQ-81 fix)
      if (!error && data.user) {
        supabase
          .from('profiles')
          .update({ last_login_at: new Date().toISOString() })
          .eq('user_id', data.user.id)
          .then();
      }

      return { error };
    },
    [supabase]
  );

  // Sign out - clear state immediately for better UX, then call server
  const signOut = useCallback(async () => {
    // Clear state immediately to ensure logout works even if server call fails
    setState({
      user: null,
      session: null,
      isLoading: false,
      isAuthenticated: false,
    });

    // Then attempt to sign out from server (errors are logged but don't block logout)
    const { error } = await supabase.auth.signOut();

    return { error };
  }, [supabase]);

  // Generation counter to prevent stale updates from race conditions (SQ-74 fix)
  const initGenRef = useRef(0);

  // Initialize auth state via onAuthStateChange only (SQ-74 fix #5)
  // Previous attempts used a separate getUser() call that competed with Supabase's
  // internal token refresh, causing hangs on rapid page refreshes.
  // Now we rely solely on onAuthStateChange which handles INITIAL_SESSION internally.
  useEffect(() => {
    const currentGen = ++initGenRef.current;
    let isMounted = true;
    const isStale = () => !isMounted || currentGen !== initGenRef.current;

    const clearAuthState = () => {
      setState({
        user: null,
        session: null,
        isLoading: false,
        isAuthenticated: false,
      });
    };

    // Safety timeout: force isLoading false if auth events never fire (SQ-74)
    const safetyTimeout = setTimeout(() => {
      if (!isStale()) {
        setState(prev => (prev.isLoading ? { ...prev, isLoading: false } : prev));
      }
    }, 5000);

    // Helper: set authenticated state with profile data, with timeout protection
    const setAuthenticatedState = async (authUser: User, session: Session) => {
      try {
        const profileData = await Promise.race([
          fetchUserProfile(authUser.id),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('profile_timeout')), 4000)
          ),
        ]);

        if (isStale()) return;

        setState({
          user: { ...authUser, ...profileData },
          session,
          isLoading: false,
          isAuthenticated: true,
        });
      } catch {
        // Profile fetch failed or timed out - still set user from session data
        if (!isStale()) {
          setState({
            user: { ...authUser, profile: null, businessProfile: null, subscription: null },
            session,
            isLoading: false,
            isAuthenticated: true,
          });
        }
      }
    };

    // Use onAuthStateChange as the SOLE source of auth state (no separate getUser call)
    // INITIAL_SESSION fires immediately when listener is set up, providing the current session
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (isStale()) return;

      if (
        (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') &&
        session?.user
      ) {
        await setAuthenticatedState(session.user, session);
      } else if (event === 'INITIAL_SESSION' && !session) {
        // No session on initial load - user is not authenticated
        clearAuthState();
      } else if (event === 'SIGNED_OUT') {
        clearAuthState();
      } else if (event === 'TOKEN_REFRESHED' && session) {
        // Just update the session reference, don't re-fetch profile (SQ-81)
        if (!isStale()) {
          setState(prev => ({
            ...prev,
            session,
            user: prev.user ? { ...prev.user, ...session.user } : null,
          }));
        }
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
  }, [supabase, fetchUserProfile]);

  const value = useMemo(
    () => ({
      ...state,
      signUp,
      signIn,
      signOut,
      refreshProfile,
    }),
    [state, signUp, signIn, signOut, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

// Convenience hooks
export function useUser() {
  const { user } = useAuth();
  return user;
}

export function useSession() {
  const { session } = useAuth();
  return session;
}

export function useIsAuthenticated() {
  const { isAuthenticated, isLoading } = useAuth();
  return { isAuthenticated, isLoading };
}
