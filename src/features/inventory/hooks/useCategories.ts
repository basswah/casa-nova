import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toArray, toSingle, withTimeout, DEFAULT_TIMEOUT_MS, HEAVY_TIMEOUT_MS } from '@/lib/supabase-utils';
import { categorySchema } from '@/types/schemas';

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await withTimeout(
        supabase.from('categories').select('id, name, created_at').order('name'),
        DEFAULT_TIMEOUT_MS,
        'Fetch categories',
      );
      if (error) throw new Error(error.message);
      return toArray(data, categorySchema);
    },
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await withTimeout(
        supabase.from('categories').insert({ name }).select().single(),
        HEAVY_TIMEOUT_MS,
        'Create category',
      );
      if (error) throw new Error(error.message);
      return toSingle(data, categorySchema);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { data, error } = await withTimeout(
        supabase.from('categories').update({ name }).eq('id', id).select().single(),
        HEAVY_TIMEOUT_MS,
        'Update category',
      );
      if (error) throw new Error(error.message);
      return toSingle(data, categorySchema);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await withTimeout(
        supabase.from('categories').delete().eq('id', id),
        HEAVY_TIMEOUT_MS,
        'Delete category',
      );
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};
