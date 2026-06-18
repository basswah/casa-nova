import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toArray, toSingle } from '@/lib/supabase-utils';
import type { Product, NewProduct, UpdateProduct } from '@/types/inventory';

export const useProducts = () => {
  return useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          sku,
          category_id,
          price_usd,
          price_syp,
          cost_usd,
          cost_syp,
          quantity,
          created_at,
          updated_at,
          category:categories(id, name)
        `);
      if (error) throw new Error(error.message);
      return toArray<Product>(data);
    },
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: NewProduct) => {
      const { data, error } = await supabase
        .from('products')
        .insert(payload)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return toSingle<Product>(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateProduct }) => {
      const { data, error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return toSingle<Product>(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};