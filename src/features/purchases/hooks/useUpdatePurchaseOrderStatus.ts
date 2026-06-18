import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toSingle } from '@/lib/supabase-utils';
import type { PurchaseOrder } from '@/types/purchases';

export const useUpdatePurchaseOrderStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'pending' | 'received' | 'cancelled' }) => {
      const { data, error } = await supabase
        .from('purchase_orders')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return toSingle<PurchaseOrder>(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchase-orders'] });
      qc.invalidateQueries({ queryKey: ['purchase-order-items'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['pos-products'] });
    },
  });
};
