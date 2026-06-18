import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { adminApi } from '@/lib/admin-api';
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      return data as Profile | null;
    },
  });

  return {
    profile: query.data ?? null,
    loading: query.isLoading,
  };
};
