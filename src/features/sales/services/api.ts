import { supabase } from '@/lib/supabase';
import { toArray, toSingle, withTimeout, DEFAULT_TIMEOUT_MS, HEAVY_TIMEOUT_MS } from '@/lib/supabase-utils';
import { salesOrderSchema } from '@/types/schemas';
import type { UpdateSalesOrder } from '@/types/sales';
import type { CheckoutPayload, RpcSaleResponse } from '@/types/pos';
import type { Json } from '@/types/database';

export const fetchSalesOrders = async () => {
  const { data, error } = await withTimeout(
    supabase.from('sales_orders').select('*').order('order_date', { ascending: false }),
    DEFAULT_TIMEOUT_MS,
    'Fetch sales orders',
  );
  if (error) throw new Error(error.message);
  return toArray(data, salesOrderSchema);
};

export const updateSalesOrder = async (id: string, payload: UpdateSalesOrder) => {
  const { data, error } = await withTimeout(
    supabase.from('sales_orders').update(payload).eq('id', id).select().single(),
    DEFAULT_TIMEOUT_MS,
    'Update sales order',
  );
  if (error) throw new Error(error.message);
  return toSingle(data, salesOrderSchema);
};

export const deleteSalesOrder = async (id: string): Promise<void> => {
  await withTimeout(
    supabase.from('sales_order_items').delete().eq('so_id', id),
    DEFAULT_TIMEOUT_MS,
    'Delete sales order items',
  );
  const { error } = await withTimeout(
    supabase.from('sales_orders').delete().eq('id', id),
    DEFAULT_TIMEOUT_MS,
    'Delete sales order',
  );
  if (error) throw new Error(error.message);
};

/**
 * Completes a sale atomically via the `complete_sale` Postgres RPC.
 * The database function locks stock rows, validates availability, inserts the
 * order + items, deducts stock, and rolls the whole thing back on any failure.
 */
export const completeSale = async (
  totalUsd: number,
  totalSyp: number,
  items: CheckoutPayload['items'],
  paymentMethod: string = 'cash',
): Promise<RpcSaleResponse> => {
  const { data, error } = await withTimeout(
    supabase.rpc('complete_sale', {
      p_total_usd: totalUsd,
      p_total_syp: totalSyp,
      p_items: items as unknown as Json,
      p_payment_method: paymentMethod,
    }),
    HEAVY_TIMEOUT_MS,
    'Complete sale',
  );

  if (error) return { success: false, error: error.message };
  return (data as unknown as RpcSaleResponse) ?? { success: false, error: 'Empty response' };
};