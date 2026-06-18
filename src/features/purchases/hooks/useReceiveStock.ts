import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export const useReceiveStock = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      quantity,
      unitCostUsd,
      unitCostSyp,
    }: {
      productId: string;
      quantity: number;
      unitCostUsd: number;
      unitCostSyp: number;
    }) => {
      const { data: product, error: err1 } = await supabase
        .from('products')
        .select('quantity, cost_usd, cost_syp')
        .eq('id', productId)
        .single();
      if (err1) throw new Error(err1.message);

      const oldQty = product?.quantity ?? 0;
      const oldCostUsd = product?.cost_usd ?? 0;
      const oldCostSyp = product?.cost_syp ?? 0;
      const totalQty = oldQty + quantity;

      let newCostUsd = oldCostUsd;
      let newCostSyp = oldCostSyp;
      if (totalQty > 0) {
        newCostUsd = (oldCostUsd * oldQty + unitCostUsd * quantity) / totalQty;
        newCostSyp = (oldCostSyp * oldQty + unitCostSyp * quantity) / totalQty;
      }

      const { error: err2 } = await supabase
        .from('products')
        .update({ quantity: totalQty, cost_usd: newCostUsd, cost_syp: newCostSyp })
        .eq('id', productId);
      if (err2) throw new Error(err2.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['pos-products'] });
      qc.invalidateQueries({ queryKey: ['purchase-orders'] });
    },
  });
};