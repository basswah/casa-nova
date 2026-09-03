import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { adminApi } from '@/lib/admin-api';
import { withTimeout, DEFAULT_TIMEOUT_MS } from '@/lib/supabase-utils';
import type { Profile, AdminUser } from '@/types/user-management';

export const useUsers = () => {
  const query = useQuery<AdminUser[]>({
    queryKey: ['admin', 'users'],
    queryFn: () => adminApi.listUsers(),
  });

  return {
    users: query.data ?? [],
    loading: query.isLoading,
    error: query.error ? (query.error instanceof Error ? query.error.message : 'Failed to load users') : null,
    refresh: () => query.refetch(),
  };
};

export const useProfile = () => {
  const query = useQuery<Profile | null>({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await withTimeout(
        supabase.auth.getUser(),
        DEFAULT_TIMEOUT_MS,
        'Get user',
      );
      if (!user) return null;

      const { data, error } = await withTimeout(
        supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
        DEFAULT_TIMEOUT_MS,
        'Fetch profile',
      );
      // PGRST116 (no rows) is expected for brand-new users; treat as null, not an error.
      if (error && error.code !== 'PGRST116') throw new Error(error.message);
      return (data as Profile | null) ?? null;
    },
  });

  return {
    profile: query.data ?? null,
    loading: query.isLoading,
  };
};
