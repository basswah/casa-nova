import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toArray } from '@/lib/supabase-utils';
import type { SalesOrder, SalesOrderItem } from '@/types/sales';

export const useSalesOrders = () => {
  return useQuery({
    queryKey: ['sales-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales_orders')
        .select('*')
        .order('order_date', { ascending: false });
      if (error) throw new Error(error.message);
      return toArray<SalesOrder>(data);
    },
  });
};

export const useSalesOrderItems = (soId: string) => {
  return useQuery({
    queryKey: ['sales-order-items', soId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales_order_items')
        .select('*')
        .eq('so_id', soId);
      if (error) throw new Error(error.message);
      return toArray<SalesOrderItem>(data);
    },
    enabled: !!soId,
  });
};