import { type StateCreator } from "zustand";
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

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
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    set({ user: data.user, loading: false });
  },
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, loading: false });
  },
  setUser: (user: User | null) => set({ user, loading: false }),
});