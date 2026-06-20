import { supabase } from '@/lib/supabase';

export const fixReturnedOrders = async () => {
  const { data: orders, error } = await supabase
    .from('sales_orders')
    .select('id')
    .eq('status', 'completed');

  if (error) throw new Error(error.message);
  if (!orders || orders.length === 0) return { fixed: 0 };

  const ids = orders.map((o) => o.id);

  const { data: activeItems, error: itemsError } = await supabase
    .from('sales_order_items')
    .select('so_id')
    .in('so_id', ids)
    .gt('quantity', 0);

  if (itemsError) throw new Error(itemsError.message);

  const activeOrderIds = new Set((activeItems ?? []).map((i) => i.so_id));
  const emptyOrderIds = ids.filter((id) => !activeOrderIds.has(id));

  if (emptyOrderIds.length === 0) return { fixed: 0 };

  const { error: updateError } = await supabase
    .from('sales_orders')
    .update({ status: 'cancelled', total_usd: 0, total_syp: 0 })
    .in('id', emptyOrderIds);

  if (updateError) throw new Error(updateError.message);

  return { fixed: emptyOrderIds.length };
};
