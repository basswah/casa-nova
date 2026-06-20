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

// Helper to add timeout to promises
const withTimeout = <T>(promise: Promise<T>, ms: number, label: string): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    )
  ]);
};

export const createAuthSlice: StateCreator<AuthSlice> = (set) => ({
  user: null,
  loading: true,
  signIn: async (email: string, password: string) => {
    set({ loading: true });
    try {
      console.log('[Auth] Attempting sign in for:', email);
      const { data, error } = await withTimeout(
        supabase.auth.signInWithPassword({ email, password }),
        15000,
        'Supabase signInWithPassword'
      );
      console.log('[Auth] Response:', { data: !!data.user, error: error?.message });
      if (error) throw new Error(error.message);
      set({ user: data.user, loading: false });
      console.log('[Auth] Sign in successful');
    } catch (err) {
      console.error('[Auth] Sign in failed:', err);
      set({ loading: false });
      throw err;
    }
  },
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, loading: false });
  },
  setUser: (user: User | null) => set({ user, loading: false }),
});