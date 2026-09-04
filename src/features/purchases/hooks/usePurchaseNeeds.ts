import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toArray, toSingle, withTimeout, DEFAULT_TIMEOUT_MS, HEAVY_TIMEOUT_MS } from '@/lib/supabase-utils';
import { purchaseNeedSchema } from '@/types/schemas';
import type { PurchaseNeed, NewPurchaseNeed, UpdatePurchaseNeed } from '@/types/purchases';

export const usePurchaseNeeds = () => {
  return useQuery({
    queryKey: ['purchase-needs'],
    queryFn: async () => {
      const { data, error } = await withTimeout(
        supabase
          .from('purchase_needs')
          .select('*')
          .order('created_at', { ascending: false }),
        DEFAULT_TIMEOUT_MS,
        'Fetch purchase needs',
      );
      if (error) throw new Error(error.message);
      return toArray(data, purchaseNeedSchema) as PurchaseNeed[];
    },
  });
};

export const useCreatePurchaseNeed = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: NewPurchaseNeed) => {
      const { data, error } = await withTimeout(
        supabase.from('purchase_needs').insert(payload).select().single(),
        HEAVY_TIMEOUT_MS,
        'Create purchase need',
      );
      if (error) throw new Error(error.message);
      return toSingle(data, purchaseNeedSchema) as PurchaseNeed;
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
      const { data, error } = await withTimeout(
        supabase.from('purchase_needs').update(payload).eq('id', id).select().single(),
        HEAVY_TIMEOUT_MS,
        'Update purchase need',
      );
      if (error) throw new Error(error.message);
      return toSingle(data, purchaseNeedSchema) as PurchaseNeed;
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
