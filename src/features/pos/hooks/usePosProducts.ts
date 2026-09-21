import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toArray, withTimeout, DEFAULT_TIMEOUT_MS } from '@/lib/supabase-utils';
import { posProductSchema } from '@/types/schemas';
import type { PosProduct } from '@/types/pos';

export const usePosProducts = () => {
  return useQuery({
    queryKey: ['pos-products'],
    queryFn: async () => {
      const { data, error } = await withTimeout(
        supabase
          .from('products')
          .select('id, name, sku, image_url, price_usd, price_syp, quantity, is_consignment')
          .gt('quantity', 0),
        DEFAULT_TIMEOUT_MS,
        'Fetch POS products',
      );
      if (error) throw new Error(error.message);
      return toArray(data, posProductSchema) as PosProduct[];
    },
  });
};