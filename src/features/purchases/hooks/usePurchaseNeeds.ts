import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toArray } from '@/lib/supabase-utils';
import type { PurchaseNeed, NewPurchaseNeed, UpdatePurchaseNeed } from '@/types/purchases';

export const usePurchaseNeeds = () => {
  return useQuery<PurchaseNeed[]>({
    queryKey: ['purchase-needs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchase_needs')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return toArray<PurchaseNeed>(data);
    },
  });
};

export const useCreatePurchaseNeed = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: NewPurchaseNeed) => {
      const { data, error } = await supabase
        .from('purchase_needs')
        .insert(payload)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as PurchaseNeed;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchase-needs'] });
    },
  });
};

export const useUpdatePurchaseNeed = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdatePurchaseNeed }) => {
      const { data, error } = await supabase
        .from('purchase_needs')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as PurchaseNeed;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchase-needs'] });
    },
  });
};

export const useDeletePurchaseNeed = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('purchase_needs')
        .delete()
        .eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchase-needs'] });
    },
  });
};
