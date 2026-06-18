import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toArray } from '@/lib/supabase-utils';
import type { Category } from '@/types/inventory';

export const useCategories = () => {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, created_at')
        .order('name');
      if (error) throw new Error(error.message);
      return toArray<Category>(data);
    },
  });
};