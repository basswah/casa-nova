import { supabase } from '@/lib/supabase';
import { toArray, withTimeout, DEFAULT_TIMEOUT_MS } from '@/lib/supabase-utils';
import type { SalesSummary, ProfitSummary, TopProduct } from '@/types/reports';

export const fetchSalesSummary = async (start: string, end: string): Promise<SalesSummary> => {
  const { data, error } = await withTimeout(
    supabase
      .from('sales_orders')
      .select('total_usd')
      .eq('status', 'completed')
      .gte('order_date', start)
      .lte('order_date', end),
    DEFAULT_TIMEOUT_MS,
    'Sales summary',
  );

  if (error) throw new Error(error.message);

  const rows = data ?? [];
  return {
    totalSalesUsd: rows.reduce((sum, r) => sum + (r.total_usd ?? 0), 0),
    transactionCount: rows.length,
  };
};

export const fetchProfitSummary = async (start: string, end: string): Promise<ProfitSummary> => {
  const { data: ids } = await withTimeout(
    supabase
      .from('sales_orders')
      .select('id')
      .eq('status', 'completed')
      .gte('order_date', start)
      .lte('order_date', end),
    DEFAULT_TIMEOUT_MS,
    'Profit summary orders',
  );

  if (!ids?.length) return { profitUsd: 0 };

  const { data: items, error: itemsError } = await withTimeout(
    supabase
      .from('sales_order_items')
      .select('product_id, quantity, unit_price_usd')
      .in('so_id', ids.map(o => o.id)),
    DEFAULT_TIMEOUT_MS,
    'Profit summary items',
  );

  if (itemsError) throw new Error(itemsError.message);

  const rawItems = toArray(items) as Array<{ product_id: string | null; quantity: number; unit_price_usd: number }>;
  if (!rawItems.length) return { profitUsd: 0 };

  const productIds = [...new Set(rawItems.map(i => i.product_id).filter(Boolean))] as string[];
  const { data: products } = await withTimeout(
    supabase.from('products').select('id, cost_usd').in('id', productIds),
    DEFAULT_TIMEOUT_MS,
    'Profit summary products',
  );

  const costMap = new Map<string, number>();
  for (const p of (products ?? []) as Array<{ id: string; cost_usd: number }>) {
    costMap.set(p.id, Number(p.cost_usd) || 0);
  }

  let profitUsd = 0;

  for (const item of rawItems) {
    const costUsd = item.product_id ? (costMap.get(item.product_id) ?? 0) : 0;
    profitUsd += item.quantity * (item.unit_price_usd - costUsd);
  }

  return { profitUsd };
};

export const fetchTopProducts = async (start: string, end: string, limit = 10): Promise<TopProduct[]> => {
  const { data: orderIds } = await withTimeout(
    supabase
      .from('sales_orders')
      .select('id')
      .eq('status', 'completed')
      .gte('order_date', start)
      .lte('order_date', end),
    DEFAULT_TIMEOUT_MS,
    'Top products orders',
  );

  if (!orderIds?.length) return [];

  const { data, error } = await withTimeout(
    supabase
      .from('sales_order_items')
      .select('product_id, quantity, unit_price_usd, line_total_usd, line_total_syp')
      .in('so_id', orderIds.map(o => o.id)),
    DEFAULT_TIMEOUT_MS,
    'Top products items',
  );

  if (error) throw new Error(error.message);

  const rawItems = toArray(data) as Array<{
    product_id: string | null; quantity: number;
    unit_price_usd: number;
    line_total_usd: number | null; line_total_syp: number | null;
  }>;

  const productIds = [...new Set(rawItems.map(i => i.product_id).filter(Boolean))] as string[];
  const { data: products } = await withTimeout(
    supabase.from('products').select('id, name, sku, cost_usd').in('id', productIds),
    DEFAULT_TIMEOUT_MS,
    'Top products details',
  );

  const productMap = new Map<string, { name: string; sku: string | null; cost_usd: number }>();
  for (const p of (products ?? []) as Array<{ id: string; name: string; sku: string | null; cost_usd: number }>) {
    productMap.set(p.id, { name: p.name, sku: p.sku, cost_usd: Number(p.cost_usd) || 0 });
  }

  const grouped = new Map<string, { name: string; sku: string | null; qty: number; usd: number; syp: number; profitUsd: number }>();

  for (const item of rawItems) {
    const pid = item.product_id ?? '';
    if (!pid) continue;
    const prod = productMap.get(pid);
    const existing = grouped.get(pid) ?? {
      name: prod?.name ?? '',
      sku: prod?.sku ?? null,
      qty: 0, usd: 0, syp: 0, profitUsd: 0,
    };
    const costUsd = prod?.cost_usd ?? 0;
    existing.qty += item.quantity;
    existing.usd += item.line_total_usd ?? 0;
    existing.syp += item.line_total_syp ?? 0;
    existing.profitUsd += item.quantity * (item.unit_price_usd - costUsd);
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
      profitUsd: g.profitUsd,
    }))
    .sort((a, b) => b.totalUsd - a.totalUsd)
    .slice(0, limit);
};
