import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toArray, toSingle, withTimeout, DEFAULT_TIMEOUT_MS, HEAVY_TIMEOUT_MS } from '@/lib/supabase-utils';
import { purchaseReturnSchema } from '@/types/schemas';
import { deductStockForReturn, restoreStockForReturn } from '../services/stock';
import type { NewPurchaseReturn, PurchaseReturn } from '@/types/purchases';

export const usePurchaseReturns = () => {
  return useQuery({
    queryKey: ['purchase-returns'],
    queryFn: async () => {
      const { data, error } = await withTimeout(
        supabase
          .from('purchase_returns')
          .select(`
            *,
            product:products(id, name),
            purchase_order:purchase_orders(id, order_date)
          `)
          .order('created_at', { ascending: false }),
        DEFAULT_TIMEOUT_MS,
        'Fetch purchase returns',
      );
      if (error) throw new Error(error.message);
      return toArray(data, purchaseReturnSchema) as PurchaseReturn[];
    },
  });
};

export const useCreatePurchaseReturn = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: NewPurchaseReturn) => {
      const { data, error } = await withTimeout(
        supabase.from('purchase_returns').insert(payload).select().single(),
        HEAVY_TIMEOUT_MS,
        'Create purchase return',
      );
      if (error) throw new Error(error.message);

      if (payload.product_id) {
        await deductStockForReturn(payload.product_id, payload.quantity);
      }

      return toSingle(data, purchaseReturnSchema);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchase-returns'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['pos-products'] });
    },
  });
};

export const useDeletePurchaseReturn = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ret: PurchaseReturn) => {
      const { error } = await withTimeout(
        supabase.from('purchase_returns').delete().eq('id', ret.id),
        HEAVY_TIMEOUT_MS,
        'Delete purchase return',
      );
      if (error) throw new Error(error.message);

      if (ret.product_id) {
        await restoreStockForReturn(ret.product_id, ret.quantity);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchase-returns'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['pos-products'] });
    },
  });
};
