import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toSingle } from '@/lib/supabase-utils';
import type { PurchaseOrder } from '@/types/purchases';

export interface PurchaseOrderItemInput {
  product_id: string | null;
  quantity: number;
  unit_price_usd: number;
  unit_price_syp: number;
}

export const useCreatePurchaseOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      order,
      items,
    }: {
      order: { supplier_id: string | null; order_date: string; total_usd: number; total_syp: number; status: string };
      items: PurchaseOrderItemInput[];
    }) => {
      const { data: orderData, error: orderError } = await supabase
        .from('purchase_orders')
        .insert(order)
        .select()
        .single();
      if (orderError) throw new Error(orderError.message);

      const itemsWithPoId = items.map((i) => ({ ...i, po_id: orderData.id }));
      const { error: itemsError } = await supabase.from('purchase_order_items').insert(itemsWithPoId);
      if (itemsError) throw new Error(itemsError.message);

      return toSingle<PurchaseOrder>(orderData);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchase-orders'] });
    },
  });
};
