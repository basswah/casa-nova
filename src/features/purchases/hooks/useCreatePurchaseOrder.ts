import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toSingle, withTimeout, HEAVY_TIMEOUT_MS } from '@/lib/supabase-utils';
import { purchaseOrderSchema } from '@/types/schemas';

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
      userId,
    }: {
      order: { supplier_id: string | null; order_date: string; total_usd: number; total_syp: number; status: string };
      items: PurchaseOrderItemInput[];
      userId?: string | null;
    }) => {
      const { data: orderData, error: orderError } = await withTimeout(
        supabase
          .from('purchase_orders')
          .insert({ ...order, created_by: userId ?? undefined })
          .select()
          .single(),
        HEAVY_TIMEOUT_MS,
        'Create purchase order',
      );
      if (orderError) throw new Error(orderError.message);

      const itemsWithPoId = items.map((i) => ({ ...i, po_id: orderData.id }));
      const { error: itemsError } = await withTimeout(
        supabase.from('purchase_order_items').insert(itemsWithPoId),
        HEAVY_TIMEOUT_MS,
        'Insert purchase order items',
      );
      if (itemsError) throw new Error(itemsError.message);

      return toSingle(orderData, purchaseOrderSchema);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchase-orders'] });
    },
  });
};
