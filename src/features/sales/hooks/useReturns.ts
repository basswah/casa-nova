import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { ReturnRecord } from '@/types/sales';

export interface ReturnWithOrder extends ReturnRecord {
  sales_orders: { order_date: string } | null;
}

export const useReturns = () => {
  return useQuery({
    queryKey: ['returns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('returns')
        .select('*, sales_orders(order_date)')
        .order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []) as ReturnWithOrder[];
    },
  });
};
