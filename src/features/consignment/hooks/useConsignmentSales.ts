import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { withTimeout, DEFAULT_TIMEOUT_MS } from '@/lib/supabase-utils';

export interface ConsignmentSaleItem {
  id: string;
  so_id: string;
  product_id: string;
  quantity: number;
  unit_price_usd: number;
  unit_price_syp: number;
  line_total_usd: number;
  line_total_syp: number;
  is_settled: boolean;
  settled_at: string | null;
  product_name: string;
  product_sku: string | null;
  supplier_id: string | null;
  supplier_name: string | null;
  order_date: string;
}

export interface SupplierSettlement {
  supplier_id: string;
  supplier_name: string;
  items: ConsignmentSaleItem[];
  total_quantity: number;
  total_usd: number;
  total_syp: number;
  settled_quantity: number;
  unsettled_quantity: number;
  settled_usd: number;
  unsettled_usd: number;
}

const fetchConsignmentSales = async (): Promise<ConsignmentSaleItem[]> => {
  const { data, error } = await withTimeout(
    supabase
      .from('sales_order_items')
      .select(`
        id,
        so_id,
        product_id,
        quantity,
        unit_price_usd,
        unit_price_syp,
        line_total_usd,
        line_total_syp,
        is_settled,
        settled_at,
        product:products!product_id (
          name,
          sku,
          supplier_id,
          supplier:suppliers!supplier_id (name)
        ),
        sales_order:sales_orders!so_id (order_date)
      `)
      .order('created_at', { ascending: false }),
    DEFAULT_TIMEOUT_MS,
    'Fetch consignment sales',
  );

  if (error) throw new Error(error.message);

  const items: ConsignmentSaleItem[] = [];

  for (const item of data ?? []) {
    if (item.product && item.product.supplier_id) {
      items.push({
        id: item.id,
        so_id: item.so_id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price_usd: item.unit_price_usd,
        unit_price_syp: item.unit_price_syp,
        line_total_usd: item.line_total_usd,
        line_total_syp: item.line_total_syp,
        is_settled: item.is_settled ?? false,
        settled_at: item.settled_at ?? null,
        product_name: (item.product as Record<string, unknown>).name as string,
        product_sku: (item.product as Record<string, unknown>).sku as string | null,
        supplier_id: (item.product as Record<string, unknown>).supplier_id as string,
        supplier_name: ((item.product as Record<string, unknown>).supplier as Record<string, unknown>)?.name as string | null,
        order_date: (item.sales_order as Record<string, unknown>)?.order_date as string,
      });
    }
  }

  return items;
};

export const useConsignmentSales = () => {
  return useQuery({
    queryKey: ['consignment-sales'],
    queryFn: fetchConsignmentSales,
    staleTime: 30000,
  });
};

export const useSettleConsignmentSale = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId }: { itemId: string }) => {
      const { error } = await withTimeout(
        supabase
          .from('sales_order_items')
          .update({
            is_settled: true,
            settled_at: new Date().toISOString(),
          })
          .eq('id', itemId),
        DEFAULT_TIMEOUT_MS,
        'Settle consignment sale',
      );

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['consignment-sales'] });
    },
  });
};

export const useSettleAllForSupplier = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ supplierId, itemIds }: { supplierId: string; itemIds: string[] }) => {
      const { error } = await withTimeout(
        supabase
          .from('sales_order_items')
          .update({
            is_settled: true,
            settled_at: new Date().toISOString(),
          })
          .in('id', itemIds)
          .eq('product_id', supplierId),
        DEFAULT_TIMEOUT_MS,
        'Settle all for supplier',
      );

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['consignment-sales'] });
    },
  });
};
