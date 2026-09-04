import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toArray, toSingle, withTimeout, DEFAULT_TIMEOUT_MS } from '@/lib/supabase-utils';
import { purchaseOrderSchema } from '@/types/schemas';
import type { PurchaseOrder } from '@/types/purchases';

export const usePurchaseOrders = () => {
  return useQuery({
    queryKey: ['purchase-orders'],
    queryFn: async () => {
      const { data, error } = await withTimeout(
        supabase
          .from('purchase_orders')
          .select(`
            *,
            supplier:supplier_id (id, name, contact_info)
          `)
          .order('created_at', { ascending: false }),
        DEFAULT_TIMEOUT_MS,
        'Fetch purchase orders',
      );
      if (error) throw new Error(error.message);
      return toArray(data, purchaseOrderSchema) as PurchaseOrder[];
    },
  });
};

export const usePurchaseOrder = (id: string | null) => {
  return useQuery({
    queryKey: ['purchase-order', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await withTimeout(
        supabase
          .from('purchase_orders')
          .select(`
            *,
            supplier:supplier_id (id, name, contact_info)
          `)
          .eq('id', id!)
          .single(),
        DEFAULT_TIMEOUT_MS,
        'Fetch purchase order',
      );
      if (error) throw new Error(error.message);
      return toSingle(data, purchaseOrderSchema) as PurchaseOrder;
    },
  });
};
