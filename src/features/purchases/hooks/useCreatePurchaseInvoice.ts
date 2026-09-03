import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { withTimeout, HEAVY_TIMEOUT_MS } from '@/lib/supabase-utils';
import { resolveProduct } from '../services/stock';

interface InvoiceItem {
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price_usd: number;
  unit_price_syp: number;
}

export const useCreatePurchaseInvoice = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      order,
      items,
      userId,
    }: {
      order: {
        supplier_id: string;
        order_date: string;
        total_usd: number;
        total_syp: number;
        status: string;
      };
      items: InvoiceItem[];
      userId: string | null;
    }) => {
      const { data: orderData, error: orderError } = await withTimeout(
        supabase
          .from('purchase_orders')
          .insert({ ...order, status: 'received', created_by: userId })
          .select()
          .single(),
        HEAVY_TIMEOUT_MS,
        'Create purchase invoice',
      );
      if (orderError) throw new Error(orderError.message);

      const resolvedItems = await Promise.all(
        items.map(async (item) => ({ ...item, product_id: await resolveProduct(item) })),
      );

      const itemsWithPoId = resolvedItems.map((i) => ({
        product_id: i.product_id,
        quantity: i.quantity,
        unit_price_usd: i.unit_price_usd,
        unit_price_syp: i.unit_price_syp,
        po_id: orderData.id,
      }));

      const { error: itemsError } = await withTimeout(
        supabase.from('purchase_order_items').insert(itemsWithPoId),
        HEAVY_TIMEOUT_MS,
        'Insert purchase invoice items',
      );
      if (itemsError) throw new Error(itemsError.message);

      for (const item of resolvedItems) {
        const { error } = await withTimeout(
          supabase.rpc('receive_stock', {
            p_product_id: item.product_id,
            p_quantity: item.quantity,
            p_unit_cost_usd: item.unit_price_usd,
            p_unit_cost_syp: item.unit_price_syp,
          }),
          HEAVY_TIMEOUT_MS,
          'Receive stock for invoice',
        );
        if (error) throw new Error(error.message);
      }

      return orderData;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchase-orders'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['pos-products'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};
