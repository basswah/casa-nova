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

interface RawItem {
  id: string;
  so_id: string;
  product_id: string | null;
  quantity: number;
  unit_price_usd: number;
  unit_price_syp: number;
  line_total_usd: number;
  line_total_syp: number;
  is_settled?: boolean;
  settled_at?: string | null;
}

const fetchConsignmentSales = async (): Promise<ConsignmentSaleItem[]> => {
  const { data: items, error: itemsError } = await withTimeout(
    supabase
      .from('sales_order_items')
      .select('*')
      .order('created_at', { ascending: false }),
    DEFAULT_TIMEOUT_MS,
    'Fetch consignment sale items',
  );

  if (itemsError) throw new Error(itemsError.message);

  const rawItems = (items ?? []) as unknown as RawItem[];
  if (rawItems.length === 0) return [];

  const productIds = [...new Set(rawItems.map((i) => i.product_id).filter(Boolean))] as string[];
  const soIds = [...new Set(rawItems.map((i) => i.so_id))];

  const [{ data: products }, { data: orders }, { data: suppliers }] = await Promise.all([
    supabase.from('products').select('id, name, sku, supplier_id, is_consignment').in('id', productIds),
    supabase.from('sales_orders').select('id, order_date').in('id', soIds),
    supabase.from('suppliers').select('id, name'),
  ]);

  const productMap = new Map<string, { name: string; sku: string | null; supplier_id: string | null }>();
  for (const p of (products ?? []) as Array<{ id: string; name: string; sku: string | null; supplier_id: string | null; is_consignment: boolean }>) {
    if (p.is_consignment) {
      productMap.set(p.id, { name: p.name, sku: p.sku, supplier_id: p.supplier_id });
    }
  }

  const orderMap = new Map<string, string>();
  for (const o of (orders ?? []) as Array<{ id: string; order_date: string }>) {
    orderMap.set(o.id, o.order_date);
  }

  const supplierMap = new Map<string, string>();
  for (const s of (suppliers ?? []) as Array<{ id: string; name: string }>) {
    supplierMap.set(s.id, s.name);
  }

  const result: ConsignmentSaleItem[] = [];

  for (const item of rawItems) {
    if (!item.product_id) continue;
    const product = productMap.get(item.product_id);
    if (!product) continue;

    result.push({
      id: item.id,
      so_id: item.so_id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price_usd: Number(item.unit_price_usd) || 0,
      unit_price_syp: Number(item.unit_price_syp) || 0,
      line_total_usd: Number(item.line_total_usd) || 0,
      line_total_syp: Number(item.line_total_syp) || 0,
      is_settled: item.is_settled ?? false,
      settled_at: item.settled_at ?? null,
      product_name: product.name,
      product_sku: product.sku,
      supplier_id: product.supplier_id,
      supplier_name: product.supplier_id ? (supplierMap.get(product.supplier_id) ?? null) : null,
      order_date: orderMap.get(item.so_id) ?? '',
    });
  }

  return result;
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
    mutationFn: async ({ supplierId: _supplierId, itemIds }: { supplierId: string; itemIds: string[] }) => {
      const { error } = await withTimeout(
        supabase
          .from('sales_order_items')
          .update({
            is_settled: true,
            settled_at: new Date().toISOString(),
          })
          .in('id', itemIds),
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
