import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toArray } from '@/lib/supabase-utils';
import type { PurchaseReturn, NewPurchaseReturn } from '@/types/purchases';

export const usePurchaseReturns = () => {
  return useQuery<PurchaseReturn[]>({
    queryKey: ['purchase-returns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchase_returns')
        .select(`
          *,
          product:products(id, name),
          purchase_order:purchase_orders(id, order_date)
        `)
        .order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return toArray<PurchaseReturn & { product?: { id: string; name: string } | null; purchase_order?: { id: string; order_date: string } | null }>(data);
    },
  });
};

export const useCreatePurchaseReturn = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: NewPurchaseReturn) => {
      const { data, error } = await supabase
        .from('purchase_returns')
        .insert(payload)
        .select()
        .single();
      if (error) throw new Error(error.message);

      if (payload.product_id) {
        const { data: product } = await supabase
          .from('products')
          .select('quantity')
          .eq('id', payload.product_id)
          .single();

        const currentQty = product?.quantity ?? 0;
        const newQty = Math.max(0, currentQty - payload.quantity);

        await supabase
          .from('products')
          .update({ quantity: newQty })
          .eq('id', payload.product_id);
      }

      return data as PurchaseReturn;
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
      const { error } = await supabase
        .from('purchase_returns')
        .delete()
        .eq('id', ret.id);
      if (error) throw new Error(error.message);

      if (ret.product_id) {
        const { data: product } = await supabase
          .from('products')
          .select('quantity')
          .eq('id', ret.product_id)
          .single();

        const currentQty = product?.quantity ?? 0;
        const restoredQty = currentQty + ret.quantity;

        await supabase
          .from('products')
          .update({ quantity: restoredQty })
          .eq('id', ret.product_id);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchase-returns'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['pos-products'] });
    },
  });
};
