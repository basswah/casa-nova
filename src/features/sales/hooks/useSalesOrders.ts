import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toArray, withTimeout, DEFAULT_TIMEOUT_MS } from '@/lib/supabase-utils';
import { salesOrderSchema, salesOrderItemSchema } from '@/types/schemas';
import type { SalesOrder, SalesOrderItem } from '@/types/sales';

export const useSalesOrders = () => {
  return useQuery({
    queryKey: ['sales-orders'],
    queryFn: async () => {
      const { data, error } = await withTimeout(
        supabase.from('sales_orders').select('*').order('order_date', { ascending: false }),
        DEFAULT_TIMEOUT_MS,
        'Fetch sales orders',
      );
      if (error) throw new Error(error.message);
      return toArray(data, salesOrderSchema) as SalesOrder[];
    },
  });
};

export const useSalesOrderItems = (soId: string) => {
  return useQuery({
    queryKey: ['sales-order-items', soId],
    queryFn: async () => {
      const { data, error } = await withTimeout(
        supabase.from('sales_order_items').select('*').eq('so_id', soId),
        DEFAULT_TIMEOUT_MS,
        'Fetch sales order items',
      );
      if (error) throw new Error(error.message);
      return toArray(data, salesOrderItemSchema) as SalesOrderItem[];
    },
    enabled: !!soId,
  });
};

export const useSalesOrdersItems = (soIds: string[]) => {
  return useQuery({
    queryKey: ['sales-order-items-bulk', [...soIds].sort()],
    queryFn: async () => {
      if (soIds.length === 0) return new Map<string, SalesOrderItem[]>();
      const { data, error } = await withTimeout(
        supabase.from('sales_order_items').select('*').in('so_id', soIds),
        DEFAULT_TIMEOUT_MS,
        'Fetch sales order items (bulk)',
      );
      if (error) throw new Error(error.message);
      const grouped = new Map<string, SalesOrderItem[]>();
      for (const item of toArray(data, salesOrderItemSchema) as SalesOrderItem[]) {
        const list = grouped.get(item.so_id) ?? [];
        list.push(item);
        grouped.set(item.so_id, list);
      }
      return grouped;
    },
    enabled: soIds.length > 0,
  });
};