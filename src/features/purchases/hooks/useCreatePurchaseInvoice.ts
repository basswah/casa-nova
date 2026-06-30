import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

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
      items: {
        product_id: string | null;
        product_name: string;
        quantity: number;
        unit_price_usd: number;
        unit_price_syp: number;
      }[];
      userId: string | null;
    }) => {
      const { data: orderData, error: orderError } = await supabase
        .from('purchase_orders')
        .insert({
          ...order,
          status: 'received',
          created_by: userId,
        })
        .select()
        .single();
      if (orderError) throw new Error(orderError.message);

      const resolvedItems = await Promise.all(
        items.map(async (item) => {
          if (item.product_id) {
            return { ...item, product_id: item.product_id };
          }

          const { data: newProduct, error: createError } = await supabase
            .from('products')
            .insert({
              name: item.product_name,
              quantity: 0,
              price_usd: item.unit_price_usd,
              price_syp: item.unit_price_syp,
              cost_usd: item.unit_price_usd,
              cost_syp: item.unit_price_syp,
            })
            .select()
            .single();
          if (createError) throw new Error(createError.message);

          return { ...item, product_id: newProduct.id };
        })
      );

      const itemsWithPoId = resolvedItems.map((i) => ({
        product_id: i.product_id,
        quantity: i.quantity,
        unit_price_usd: i.unit_price_usd,
        unit_price_syp: i.unit_price_syp,
        po_id: orderData.id,
      }));

      const { error: itemsError } = await supabase.from('purchase_order_items').insert(itemsWithPoId);
      if (itemsError) throw new Error(itemsError.message);

      const updates = resolvedItems.map((item) =>
        supabase
          .from('products')
          .select('quantity, cost_usd, cost_syp')
          .eq('id', item.product_id!)
          .single()
          .then(async ({ data }) => {
            const product = data;
            const oldQty = product?.quantity ?? 0;
            const oldCostUsd = product?.cost_usd ?? 0;
            const oldCostSyp = product?.cost_syp ?? 0;
            const newQty = oldQty + item.quantity;
            const newCostUsd = oldQty > 0 ? (oldCostUsd * oldQty + item.unit_price_usd * item.quantity) / newQty : item.unit_price_usd;
            const newCostSyp = oldQty > 0 ? (oldCostSyp * oldQty + item.unit_price_syp * item.quantity) / newQty : item.unit_price_syp;
            return supabase
              .from('products')
              .update({
                quantity: newQty,
                cost_usd: newCostUsd,
                cost_syp: newCostSyp,
              })
              .eq('id', item.product_id!);
          })
      );

      const results = await Promise.all(updates);
      const errors = results.filter((r) => r.error);
      if (errors.length > 0) {
        throw new Error(errors[0].error!.message);
      }

      return orderData;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchase-orders'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['pos-products'] });
    },
  });
};
