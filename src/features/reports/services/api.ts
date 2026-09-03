import { supabase } from '@/lib/supabase';
import { toArray, withTimeout, DEFAULT_TIMEOUT_MS } from '@/lib/supabase-utils';
import { z } from 'zod';
import type { SalesSummary, ProfitSummary, TopProduct } from '@/types/reports';

const profitItemRowSchema = z.object({
  quantity: z.number(),
  unit_price_usd: z.number(),
  unit_price_syp: z.number(),
  products: z.object({ cost_usd: z.number(), cost_syp: z.number() }).nullable(),
});

const topProductRowSchema = z.object({
  product_id: z.string().nullable(),
  quantity: z.number(),
  line_total_usd: z.number().nullable(),
  line_total_syp: z.number().nullable(),
  products: z.object({ name: z.string(), sku: z.string().nullable() }).nullable(),
});

export const fetchSalesSummary = async (start: string, end: string): Promise<SalesSummary> => {
  const { data, error } = await withTimeout(
    supabase
      .from('sales_orders')
      .select('total_usd, total_syp')
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
    totalSalesSyp: rows.reduce((sum, r) => sum + (r.total_syp ?? 0), 0),
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

  if (!ids?.length) return { profitUsd: 0, profitSyp: 0 };

  const { data, error } = await withTimeout(
    supabase
      .from('sales_order_items')
      .select(`
        quantity,
        unit_price_usd,
        unit_price_syp,
        products!inner(cost_usd, cost_syp)
      `)
      .in('so_id', ids.map(o => o.id)),
    DEFAULT_TIMEOUT_MS,
    'Profit summary items',
  );

  if (error) throw new Error(error.message);

  const rows = toArray(data, profitItemRowSchema);
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
      .select(`
        product_id,
        quantity,
        line_total_usd,
        line_total_syp,
        products!inner(name, sku)
      `)
      .in('so_id', orderIds.map(o => o.id)),
    DEFAULT_TIMEOUT_MS,
    'Top products items',
  );

  if (error) throw new Error(error.message);

  const rows = toArray(data, topProductRowSchema);
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
