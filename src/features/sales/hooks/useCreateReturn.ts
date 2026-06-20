import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { BatchReturnInput } from '@/types/sales';

export const useCreateReturn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: BatchReturnInput) => {
      const { so_id, reason, items } = payload;

      const records = items.map((item) => ({
        so_id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price_usd: item.unit_price_usd,
        unit_price_syp: item.unit_price_syp,
        reason,
      }));

      const { error } = await supabase.from('returns').insert(records);
      if (error) throw new Error(error.message);

      for (const item of items) {
        const { data: product } = await supabase
          .from('products')
          .select('quantity')
          .eq('id', item.product_id)
          .single();

        if (product) {
          const newQty = product.quantity + item.quantity;
          const { error: updateError } = await supabase
            .from('products')
            .update({ quantity: newQty })
            .eq('id', item.product_id);
          if (updateError) throw new Error(updateError.message);
        }
      }

      const returnedUsd = items.reduce((sum, item) => sum + item.unit_price_usd * item.quantity, 0);
      const returnedSyp = items.reduce((sum, item) => sum + item.unit_price_syp * item.quantity, 0);

      const { data: salesOrder } = await supabase
        .from('sales_orders')
        .select('total_usd, total_syp')
        .eq('id', so_id)
        .single();

      if (salesOrder) {
        const newTotalUsd = Math.max(0, salesOrder.total_usd - returnedUsd);
        const newTotalSyp = Math.max(0, salesOrder.total_syp - returnedSyp);
        const { error: updateOrderError } = await supabase
          .from('sales_orders')
          .update({ total_usd: newTotalUsd, total_syp: newTotalSyp })
          .eq('id', so_id);
        if (updateOrderError) throw new Error(updateOrderError.message);
      }

      for (const item of items) {
        const { data: orderItem } = await supabase
          .from('sales_order_items')
          .select('id, quantity')
          .eq('id', item.item_id)
          .single();

        if (orderItem) {
          const newQty = Math.max(0, orderItem.quantity - item.quantity);
          const { error: updateItemError } = await supabase
            .from('sales_order_items')
            .update({ quantity: newQty })
            .eq('id', orderItem.id);
          if (updateItemError) throw new Error(updateItemError.message);
        }
      }

      const { data: activeItems } = await supabase
        .from('sales_order_items')
        .select('id')
        .eq('so_id', so_id)
        .gt('quantity', 0);

      if (!activeItems || activeItems.length === 0) {
        const { error: cancelError } = await supabase
          .from('sales_orders')
          .update({ status: 'cancelled', total_usd: 0, total_syp: 0 })
          .eq('id', so_id);
        if (cancelError) throw new Error(cancelError.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['pos-products'] });
      queryClient.invalidateQueries({ queryKey: ['sales-orders'] });
      queryClient.invalidateQueries({ queryKey: ['returns'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['sales-order-items'] });
    },
  });
};