import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toArray, withTimeout, DEFAULT_TIMEOUT_MS } from '@/lib/supabase-utils';
import { purchaseOrderItemSchema } from '@/types/schemas';
import type { PurchaseOrderItem } from '@/types/purchases';

export const usePurchaseOrderItems = (poId: string | null) => {
  return useQuery({
    queryKey: ['purchase-order-items', poId],
    enabled: !!poId,
    queryFn: async () => {
      const { data, error } = await withTimeout(
        supabase.from('purchase_order_items').select('*').eq('po_id', poId!),
        DEFAULT_TIMEOUT_MS,
        'Fetch purchase order items',
      );
      if (error) throw new Error(error.message);
      return toArray(data, purchaseOrderItemSchema) as PurchaseOrderItem[];
    },
  });
};
