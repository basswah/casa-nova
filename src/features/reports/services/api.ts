import { supabase } from '@/lib/supabase';
import { toArray } from '@/lib/supabase-utils';
import type { SalesSummary, ProfitSummary, TopProduct } from '@/types/reports';

interface ProfitItemRow {
  quantity: number;
  unit_price_usd: number;
  unit_price_syp: number;
  products: { cost_usd: number; cost_syp: number } | null;
}

interface TopProductRow {
  product_id: string | null;
  quantity: number;
  line_total_usd: number | null;
  line_total_syp: number | null;
  products: { name: string; sku: string | null } | null;
}

export const fetchSalesSummary = async (start: string, end: string): Promise<SalesSummary> => {
  const { data, error } = await supabase
    .from('sales_orders')
    .select('total_usd, total_syp')
    .eq('status', 'completed')
    .gte('order_date', start)
    .lte('order_date', end);

  if (error) throw new Error(error.message);

  const rows = data ?? [];
  return {
    totalSalesUsd: rows.reduce((sum, r) => sum + (r.total_usd ?? 0), 0),
    totalSalesSyp: rows.reduce((sum, r) => sum + (r.total_syp ?? 0), 0),
    transactionCount: rows.length,
  };
};

export const fetchProfitSummary = async (start: string, end: string): Promise<ProfitSummary> => {
  const { data: ids } = await supabase
    .from('sales_orders')
    .select('id')
    .eq('status', 'completed')
    .gte('order_date', start)
    .lte('order_date', end);

  if (!ids?.length) return { profitUsd: 0, profitSyp: 0 };

  const { data, error } = await supabase
    .from('sales_order_items')
    .select(`
      quantity,
      unit_price_usd,
      unit_price_syp,
      products!inner(cost_usd, cost_syp)
    `)
    .in('so_id', ids.map(o => o.id));

  if (error) throw new Error(error.message);

  const rows = toArray<ProfitItemRow>(data);
  let profitUsd = 0;
  let profitSyp = 0;

  for (const item of rows) {
    const costUsd = item.products?.cost_usd ?? 0;
    const costSyp = item.products?.cost_syp ?? 0;
    profitUsd += item.quantity * (item.unit_price_usd - costUsd);
    profitSyp += item.quantity * (item.unit_price_syp - costSyp);
  }

  return { profitUsd, profitSyp };
};

export const fetchTopProducts = async (start: string, end: string, limit = 10): Promise<TopProduct[]> => {
  const { data: orderIds } = await supabase
    .from('sales_orders')
    .select('id')
    .eq('status', 'completed')
    .gte('order_date', start)
    .lte('order_date', end);

  if (!orderIds?.length) return [];

  const { data, error } = await supabase
    .from('sales_order_items')
    .select(`
      product_id,
      quantity,
      line_total_usd,
      line_total_syp,
      products!inner(name, sku)
    `)
    .in('so_id', orderIds.map(o => o.id));

  if (error) throw new Error(error.message);

  const rows = toArray<TopProductRow>(data);
  const grouped = new Map<string, { name: string; sku: string | null; qty: number; usd: number; syp: number }>();

  for (const item of rows) {
    const pid = item.product_id ?? '';
    if (!pid) continue;
    const existing = grouped.get(pid) ?? {
      name: item.products?.name ?? '',
      sku: item.products?.sku ?? null,
      qty: 0, usd: 0, syp: 0,
    };
    existing.qty += item.quantity;
    existing.usd += item.line_total_usd ?? 0;
    existing.syp += item.line_total_syp ?? 0;
    grouped.set(pid, existing);
  }

  return Array.from(grouped.entries())
    .map(([productId, g]) => ({
      productId,
      productName: g.name,
      sku: g.sku,
      quantitySold: g.qty,
      totalUsd: g.usd,
      totalSyp: g.syp,
    }))
    .sort((a, b) => b.totalUsd - a.totalUsd)
    .slice(0, limit);
};
