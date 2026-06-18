import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toArray } from '@/lib/supabase-utils';
import type { PosProduct } from '@/types/pos';

export const usePosProducts = () => {
  return useQuery<PosProduct[]>({
    queryKey: ['pos-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, sku, price_usd, price_syp, cost_usd, cost_syp, quantity')
        .gt('quantity', 0);
      if (error) throw new Error(error.message);
      return toArray<PosProduct>(data);
    },
  });
};