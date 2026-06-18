import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toArray, toSingle } from '@/lib/supabase-utils';
import type { PurchaseOrder } from '@/types/purchases';

export const usePurchaseOrders = () => {
  return useQuery<PurchaseOrder[]>({
    queryKey: ['purchase-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select(`
          *,
          supplier:supplier_id (id, name, contact_info)
        `)
        .order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return toArray<PurchaseOrder>(data);
    },
  });
};

export const usePurchaseOrder = (id: string | null) => {
  return useQuery<PurchaseOrder | null>({
    queryKey: ['purchase-order', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select(`
          *,
          supplier:supplier_id (id, name, contact_info)
        `)
        .eq('id', id!)
        .single();
      if (error) throw new Error(error.message);
      return toSingle<PurchaseOrder | null>(data);
    },
  });
};
