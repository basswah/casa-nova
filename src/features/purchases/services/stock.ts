import { supabase } from '@/lib/supabase';
import { withTimeout, HEAVY_TIMEOUT_MS } from '@/lib/supabase-utils';

interface InvoiceItem {
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price_usd: number;
  unit_price_syp: number;
}

/**
 * Resolves a product for an invoice line. If no product_id is given, reuses an
 * existing product with the same (trimmed, case-insensitive) name to avoid
 * duplicate rows, otherwise creates a new one.
 */
export const resolveProduct = async (item: InvoiceItem): Promise<string> => {
  if (item.product_id) return item.product_id;

  const name = item.product_name.trim();
  const { data: existing } = await supabase
    .from('products')
    .select('id')
    .ilike('name', name)
    .limit(1)
    .maybeSingle();
  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from('products')
    .insert({
      name,
      quantity: 0,
      price_usd: item.unit_price_usd,
      price_syp: item.unit_price_syp,
      cost_usd: item.unit_price_usd,
      cost_syp: item.unit_price_syp,
      is_consignment: false,
      supplier_id: null,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return created.id;
};

/**
 * Deducts stock for a purchase return via the atomic receive_stock RPC.
 */
export const deductStockForReturn = async (
  productId: string,
  quantity: number,
): Promise<void> => {
  const { error } = await withTimeout(
    supabase.rpc('receive_stock', {
      p_product_id: productId,
      p_quantity: -Math.abs(quantity),
      p_unit_cost_usd: 0,
      p_unit_cost_syp: 0,
    }),
    HEAVY_TIMEOUT_MS,
    'Deduct stock for return',
  );
  if (error) throw new Error(error.message);
};

/**
 * Restores stock for a deleted purchase return via the atomic receive_stock RPC.
 */
export const restoreStockForReturn = async (
  productId: string,
  quantity: number,
): Promise<void> => {
  const { error } = await withTimeout(
    supabase.rpc('receive_stock', {
      p_product_id: productId,
      p_quantity: Math.abs(quantity),
      p_unit_cost_usd: 0,
      p_unit_cost_syp: 0,
    }),
    HEAVY_TIMEOUT_MS,
    'Restore stock for return',
  );
  if (error) throw new Error(error.message);
};
