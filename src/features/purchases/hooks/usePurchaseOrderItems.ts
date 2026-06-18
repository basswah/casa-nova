import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toArray } from '@/lib/supabase-utils';
import type { PurchaseOrderItem } from '@/types/purchases';

export const usePurchaseOrderItems = (poId: string | null) => {
  return useQuery<PurchaseOrderItem[]>({
    queryKey: ['purchase-order-items', poId],
    enabled: !!poId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchase_order_items')
        .select('*')
        .eq('po_id', poId!);
      if (error) throw new Error(error.message);
      return toArray<PurchaseOrderItem>(data);
    },
  });
};
