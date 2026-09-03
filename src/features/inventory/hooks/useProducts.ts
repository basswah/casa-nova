import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toArray, toSingle, withTimeout, DEFAULT_TIMEOUT_MS, HEAVY_TIMEOUT_MS } from '@/lib/supabase-utils';
import { productSchema } from '@/types/schemas';
import type { NewProduct, UpdateProduct } from '@/types/inventory';

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await withTimeout(
        supabase.from('products').select(`
          id,
          name,
          sku,
          category_id,
          price_usd,
          price_syp,
          cost_usd,
          cost_syp,
          quantity,
          is_consignment,
          supplier_id,
          created_at,
          updated_at,
          category:categories(id, name)
        `),
        DEFAULT_TIMEOUT_MS,
        'Fetch products',
      );
      if (error) throw new Error(error.message);
      return toArray(data, productSchema);
    },
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: NewProduct) => {
      const { data, error } = await withTimeout(
        supabase.from('products').insert(payload).select().single(),
        HEAVY_TIMEOUT_MS,
        'Create product',
      );
      if (error) throw new Error(error.message);
      return toSingle(data, productSchema);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['pos-products'] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateProduct }) => {
      const { data, error } = await withTimeout(
        supabase.from('products').update(payload).eq('id', id).select().single(),
        HEAVY_TIMEOUT_MS,
        'Update product',
      );
      if (error) throw new Error(error.message);
      return toSingle(data, productSchema);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['pos-products'] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await withTimeout(
        supabase.from('products').delete().eq('id', id),
        HEAVY_TIMEOUT_MS,
        'Delete product',
      );
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};