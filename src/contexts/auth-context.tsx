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
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

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

    // Get initial session - use getUser() to validate token with server
    const initializeAuth = async () => {
      try {
        // First validate the user with the server (not just cached session)
        const {
          data: { user: validatedUser },
          error: userError,
        } = await supabase.auth.getUser();

        // Prevent state update if component unmounted or newer init started (SQ-74 fix)
        if (isStale()) return;

        // If no valid user, clear state
        if (userError || !validatedUser) {
          setState({
            user: null,
            session: null,
            isLoading: false,
            isAuthenticated: false,
          });
          return;
        }

        // User is valid, now get the session for token info
        const {
          data: { session },
        } = await supabase.auth.getSession();

        // Prevent state update if stale (SQ-74 fix)
        if (isStale()) return;

        if (session?.user) {
          const profileData = await fetchUserProfile(session.user.id);

          // Final check before setState (SQ-74 fix)
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
        } else {
          setState({
            user: null,
            session: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      } catch {
        if (!isStale()) {
          setState({
            user: null,
            session: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Update last_login_at in profiles table (SQ-81 fix)
        await supabase
          .from('profiles')
          .update({ last_login_at: new Date().toISOString() })
          .eq('user_id', session.user.id);

        const profileData = await fetchUserProfile(session.user.id);

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
        setState({
          user: null,
          session: null,
          isLoading: false,
          isAuthenticated: false,
        });
      } else if (event === 'TOKEN_REFRESHED' && session) {
        // Re-fetch profile to keep user data in sync after token refresh
        if (session.user) {
          const profileData = await fetchUserProfile(session.user.id);
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
        } else {
          setState(prev => ({
            ...prev,
            session,
          }));
        }
      }
    });

    return () => {
      isMounted = false;
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
