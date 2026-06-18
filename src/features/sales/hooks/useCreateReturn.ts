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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['pos-products'] });
      queryClient.invalidateQueries({ queryKey: ['sales-orders'] });
      queryClient.invalidateQueries({ queryKey: ['returns'] });
    },
  });
};