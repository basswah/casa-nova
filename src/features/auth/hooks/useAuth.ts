import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/store/rootStore';
import { withTimeout, DEFAULT_TIMEOUT_MS } from '@/lib/supabase-utils';

export const useAuth = () => {
  const user = useAppStore((s) => s.user);
  const loading = useAppStore((s) => s.loading);
  const setUser = useAppStore((s) => s.setUser);
  const signOut = useAppStore((s) => s.signOut);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user } } = await withTimeout(
          supabase.auth.getUser(),
          DEFAULT_TIMEOUT_MS,
          'Supabase getUser'
        );
        setUser(user);
      } catch {
        setUser(null);
      }
    };

    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  return { user, loading, signOut };
};