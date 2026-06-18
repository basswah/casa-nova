import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toArray, toSingle } from '@/lib/supabase-utils';
import type { Supplier } from '@/types/purchases';

export const useSuppliers = () => {
  return useQuery<Supplier[]>({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const { data, error } = await supabase.from('suppliers').select('*');
      if (error) throw new Error(error.message);
      return toArray<Supplier>(data);
    },
  });
};

export const useCreateSupplier = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; contact_info?: string | null }) => {
      const { data, error } = await supabase.from('suppliers').insert(payload).select().single();
      if (error) throw new Error(error.message);
      return toSingle<Supplier>(data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['suppliers'] }),
  });
};

export const useUpdateSupplier = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: Supplier) => {
      const { data, error } = await supabase.from('suppliers').update(payload).eq('id', id).select().single();
      if (error) throw new Error(error.message);
      return toSingle<Supplier>(data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['suppliers'] }),
  });
};

export const useDeleteSupplier = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('suppliers').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['suppliers'] }),
  });
};