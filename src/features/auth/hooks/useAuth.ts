import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/store/rootStore';

const withTimeout = <T>(promise: Promise<T>, ms: number, label: string): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    )
  ]);
};

export const useAuth = () => {
  const user = useAppStore((s) => s.user);
  const loading = useAppStore((s) => s.loading);
  const setUser = useAppStore((s) => s.setUser);
  const signOut = useAppStore((s) => s.signOut);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        console.log('[Auth] Fetching current user...');
        const { data: { user } } = await withTimeout(
          supabase.auth.getUser(),
          10000,
          'Supabase getUser'
        );
        console.log('[Auth] Current user:', user?.email ?? 'none');
        setUser(user);
      } catch (err) {
        console.error('[Auth] getUser failed:', err);
        setUser(null);
      }
    };

    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('[Auth] Auth state changed:', session?.user?.email ?? 'none');
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  return { user, loading, signOut };
};