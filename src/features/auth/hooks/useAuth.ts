import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/store/rootStore';

export const useAuth = () => {
  const user = useAppStore((s) => s.user);
  const loading = useAppStore((s) => s.loading);
  const setUser = useAppStore((s) => s.setUser);
  const signOut = useAppStore((s) => s.signOut);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  return { user, loading, signOut };
};