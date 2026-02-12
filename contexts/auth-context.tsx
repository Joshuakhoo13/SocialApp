import type { Session } from '@supabase/supabase-js';
import { router } from 'expo-router';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

import {
    getLastAuthTimestamp,
    setLastAuthTimestamp,
    shouldAutoLogin,
} from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { getUserProfile } from '@/lib/users';

type AuthState = 'loading' | 'authenticated' | 'unauthenticated';

type AuthContextType = {
  session: Session | null;
  authState: AuthState;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [authState, setAuthState] = useState<AuthState>('loading');

  const checkAuthAndRedirect = useCallback(async () => {
    const {
      data: { session: currentSession },
    } = await supabase.auth.getSession();
    const lastAuthTimestamp = await getLastAuthTimestamp();

    if (shouldAutoLogin(currentSession, lastAuthTimestamp)) {
      setSession(currentSession);
      setAuthState('authenticated');
      if (currentSession?.user?.id) {
        const { username } = await getUserProfile(currentSession.user.id);
        router.replace(username ? '/(tabs)' : '/username-setup');
      } else {
        router.replace('/reset-to-root');
      }
    } else {
      if (currentSession) {
        await supabase.auth.signOut();
      }
      setSession(null);
      setAuthState('unauthenticated');
      router.replace('/reset-to-root');
    }
  }, []);

  useEffect(() => {
    checkAuthAndRedirect();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_UP') {
        await setLastAuthTimestamp();
      }
      setSession(newSession);
      if (!newSession) {
        setAuthState('unauthenticated');
        router.replace('/reset-to-root');
      }
    });

    return () => subscription.unsubscribe();
  }, [checkAuthAndRedirect]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (!error) {
        await setLastAuthTimestamp();
        if (data.session?.user?.id) {
          const { username } = await getUserProfile(data.session.user.id);
          router.replace(username ? '/(tabs)' : '/username-setup');
        } else {
          router.replace('/(tabs)');
        }
      }
      return { error };
    },
    []
  );

  const signUp = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signUp({ email, password });
      if (!error) {
        await setLastAuthTimestamp();
        router.replace('/username-setup');
      }
      return { error };
    },
    []
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setAuthState('unauthenticated');
    router.replace('/reset-to-root');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        authState,
        signIn,
        signUp,
        signOut,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
