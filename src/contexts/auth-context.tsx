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

  // Initialize auth state and listen for changes
  useEffect(() => {
    // Increment generation for this initialization attempt
    const currentGen = ++initGenRef.current;

    // Track if component is still mounted to prevent state updates after unmount
    let isMounted = true;

    // Helper to check if this is still the latest initialization attempt
    const isStale = () => !isMounted || currentGen !== initGenRef.current;

    const clearAuthState = () => {
      setState({
        user: null,
        session: null,
        isLoading: false,
        isAuthenticated: false,
      });
    };

    // Safety timeout: if initialization hangs, force isLoading to false (SQ-74 fix)
    // This prevents the skeleton from showing forever after rapid refreshes
    const safetyTimeout = setTimeout(() => {
      if (!isStale()) {
        setState(prev => {
          if (prev.isLoading) {
            return { ...prev, isLoading: false };
          }
          return prev;
        });
      }
    }, 8000);

    // Get initial session - use getUser() to validate token with server
    const initializeAuth = async () => {
      try {
        // First validate the user with the server (not just cached session)
        const {
          data: { user: validatedUser },
          error: userError,
        } = await supabase.auth.getUser();

        if (isStale()) return;

        if (userError || !validatedUser) {
          clearAuthState();
          return;
        }

        // Parallelize getSession + fetchUserProfile to reduce init time (SQ-74 fix)
        const [sessionResult, profileData] = await Promise.all([
          supabase.auth.getSession(),
          fetchUserProfile(validatedUser.id),
        ]);

        if (isStale()) return;

        const session = sessionResult.data.session;
        setState({
          user: {
            ...validatedUser,
            ...profileData,
          },
          session,
          isLoading: false,
          isAuthenticated: true,
        });
      } catch {
        if (!isStale()) {
          clearAuthState();
        }
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Prevent stale event handlers from setting state (SQ-74 fix)
      if (isStale()) return;

      if (event === 'SIGNED_IN' && session?.user) {
        // Note: last_login_at is updated in signIn() function, not here (SQ-81 fix)
        const profileData = await fetchUserProfile(session.user.id);

        if (isStale()) return;

        setState({
          user: {
            ...session.user,
            ...profileData,
          },
          session,
          isLoading: false,
          isAuthenticated: true,
        });
      } else if (event === 'SIGNED_OUT') {
        clearAuthState();
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        // Re-fetch profile to keep user data in sync after token refresh
        const profileData = await fetchUserProfile(session.user.id);

        if (isStale()) return;

        setState(prev => ({
          ...prev,
          user: prev.user
            ? {
                ...session.user,
                ...profileData,
              }
            : null,
          session,
        }));
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
