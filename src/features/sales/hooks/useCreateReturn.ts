import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { withTimeout, HEAVY_TIMEOUT_MS } from '@/lib/supabase-utils';
import type { BatchReturnInput } from '@/types/sales';
import type { Json } from '@/types/database';

interface RpcReturnResponse {
  success: boolean;
  error?: string;
}

export const useCreateReturn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: BatchReturnInput) => {
      // Atomic: the create_return RPC records returns, restores stock, adjusts
      // order totals/items, and cancels emptied orders in a single transaction.
      const { data, error } = await withTimeout(
        supabase.rpc('create_return', {
          p_so_id: payload.so_id,
          p_reason: payload.reason,
          p_items: payload.items as unknown as Json,
        }),
        HEAVY_TIMEOUT_MS,
        'Create return',
      );

      if (error) throw new Error(error.message);
      const result = data as RpcReturnResponse | null;
      if (!result?.success) {
        throw new Error(result?.error || 'Return failed');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['pos-products'] });
      queryClient.invalidateQueries({ queryKey: ['sales-orders'] });
      queryClient.invalidateQueries({ queryKey: ['returns'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['sales-order-items'] });
      queryClient.invalidateQueries({
        predicate: (q) => String(q.queryKey[0]).startsWith('report-'),
      });
    },
  });
};