import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { withTimeout, HEAVY_TIMEOUT_MS } from '@/lib/supabase-utils';

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
      // Atomic: the receive_stock RPC locks the row and recomputes the
      // weighted-average cost in a single transaction (no lost updates).
      const { data, error } = await withTimeout(
        supabase.rpc('receive_stock', {
          p_product_id: productId,
          p_quantity: quantity,
          p_unit_cost_usd: unitCostUsd,
          p_unit_cost_syp: unitCostSyp,
        }),
        HEAVY_TIMEOUT_MS,
        'Receive stock',
      );
      if (error) throw new Error(error.message);
      const result = data as { success: boolean; error?: string } | null;
      if (!result?.success) throw new Error(result?.error || 'Failed to receive stock');
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['pos-products'] });
      qc.invalidateQueries({ queryKey: ['purchase-orders'] });
    },
  });
};