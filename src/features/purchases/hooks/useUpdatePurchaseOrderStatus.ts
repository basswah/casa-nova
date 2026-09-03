import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toSingle, withTimeout, HEAVY_TIMEOUT_MS } from '@/lib/supabase-utils';
import { purchaseOrderSchema } from '@/types/schemas';

export const useUpdatePurchaseOrderStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'pending' | 'received' | 'cancelled' }) => {
      const { data, error } = await withTimeout(
        supabase.from('purchase_orders').update({ status }).eq('id', id).select().single(),
        HEAVY_TIMEOUT_MS,
        'Update purchase order status',
      );
      if (error) throw new Error(error.message);
      return toSingle(data, purchaseOrderSchema);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchase-orders'] });
      qc.invalidateQueries({ queryKey: ['purchase-order-items'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['pos-products'] });
    },
  });
};
