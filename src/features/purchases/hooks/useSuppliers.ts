import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toArray, toSingle, withTimeout, DEFAULT_TIMEOUT_MS, HEAVY_TIMEOUT_MS } from '@/lib/supabase-utils';
import { supplierSchema } from '@/types/schemas';

export const useSuppliers = () => {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const { data, error } = await withTimeout(
        supabase.from('suppliers').select('*'),
        DEFAULT_TIMEOUT_MS,
        'Fetch suppliers',
      );
      if (error) throw new Error(error.message);
      return toArray(data, supplierSchema);
    },
  });
};

export const useCreateSupplier = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; contact_info?: string | null }) => {
      const { data, error } = await withTimeout(
        supabase.from('suppliers').insert(payload).select().single(),
        HEAVY_TIMEOUT_MS,
        'Create supplier',
      );
      if (error) throw new Error(error.message);
      return toSingle(data, supplierSchema);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['suppliers'] }),
  });
};

export const useUpdateSupplier = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string; name: string; contact_info?: string | null }) => {
      const { data, error } = await withTimeout(
        supabase.from('suppliers').update(payload).eq('id', id).select().single(),
        HEAVY_TIMEOUT_MS,
        'Update supplier',
      );
      if (error) throw new Error(error.message);
      return toSingle(data, supplierSchema);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['suppliers'] }),
  });
};

export const useDeleteSupplier = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await withTimeout(
        supabase.from('suppliers').delete().eq('id', id),
        HEAVY_TIMEOUT_MS,
        'Delete supplier',
      );
      if (error) throw new Error(error.message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['suppliers'] }),
  });
};