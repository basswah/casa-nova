import { supabase } from '@/lib/supabase';
import { toArray, toSingle } from '@/lib/supabase-utils';
import type { SalesOrder, NewSalesOrder, UpdateSalesOrder, NewSalesOrderItem } from '@/types/sales';

export const fetchSalesOrders = async (): Promise<SalesOrder[]> => {
  const { data, error } = await supabase.from('sales_orders').select('*').order('order_date', { ascending: false });
  if (error) throw new Error(error.message);
  return toArray<SalesOrder>(data);
};

export const createSalesOrder = async (order: NewSalesOrder, items: NewSalesOrderItem[]): Promise<SalesOrder> => {
  const { data: orderData, error: orderError } = await supabase
    .from('sales_orders')
    .insert(order)
    .select()
    .single();
  if (orderError) throw new Error(orderError.message);

  const itemsWithOrderId = items.map(item => ({ ...item, so_id: orderData.id }));
  await supabase
    .from('sales_order_items')
    .insert(itemsWithOrderId);

  return toSingle<SalesOrder>(orderData);
};

export const updateSalesOrder = async (id: string, payload: UpdateSalesOrder): Promise<SalesOrder> => {
  const { data, error } = await supabase
    .from('sales_orders')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return toSingle<SalesOrder>(data);
};

export const deleteSalesOrder = async (id: string): Promise<void> => {
  await supabase.from('sales_order_items').delete().eq('so_id', id);
  const { error } = await supabase.from('sales_orders').delete().eq('id', id);
  if (error) throw new Error(error.message);
};

export const completeSale = async (
  totalUsd: number,
  totalSyp: number,
  items: Array<{ product_id: string; quantity: number; unit_price_usd: number; unit_price_syp: number }>
): Promise<{ success: boolean; order_id?: string; error?: string }> => {
  const { data: orderData, error: orderError } = await supabase
    .from('sales_orders')
    .insert({
      total_usd: totalUsd,
      total_syp: totalSyp,
      payment_method: 'cash',
      status: 'completed',
    })
    .select()
    .single();

  if (orderError) {
    return { success: false, error: orderError.message };
  }

  const itemsWithOrderId = items.map(item => ({
    ...item,
    so_id: orderData.id,
  }));

  const { error: itemsError } = await supabase
    .from('sales_order_items')
    .insert(itemsWithOrderId);

  if (itemsError) {
    return { success: false, error: itemsError.message };
  }

  for (const item of items) {
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('quantity')
      .eq('id', item.product_id)
      .single();

    if (fetchError || !product) {
      return { success: false, error: `Product ${item.product_id} not found` };
    }

    const newQty = product.quantity - item.quantity;
    if (newQty < 0) {
      return { success: false, error: `Insufficient stock for product ${item.product_id}` };
    }

    const { error: updateError } = await supabase
      .from('products')
      .update({ quantity: newQty })
      .eq('id', item.product_id);

    if (updateError) {
      return { success: false, error: updateError.message };
    }
  }

  return { success: true, order_id: orderData.id };
};