import { type StateCreator } from "zustand";
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { withTimeout, DEFAULT_TIMEOUT_MS } from '@/lib/supabase-utils';

export interface AuthSlice {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const createAuthSlice: StateCreator<AuthSlice> = (set) => ({
  user: null,
  loading: true,
  signIn: async (email: string, password: string) => {
    set({ loading: true });
    try {
      const { data, error } = await withTimeout(
        supabase.auth.signInWithPassword({ email, password }),
        DEFAULT_TIMEOUT_MS,
        'Supabase signInWithPassword'
      );
      if (error) throw new Error(error.message);
      set({ user: data.user, loading: false });
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },
  signOut: async () => {
    try {
      await withTimeout(supabase.auth.signOut(), DEFAULT_TIMEOUT_MS, 'Supabase signOut');
    } finally {
      set({ user: null, loading: false });
    }
  },
  setUser: (user: User | null) => set({ user, loading: false }),
});