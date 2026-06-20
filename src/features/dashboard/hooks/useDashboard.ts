import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toArray } from '@/lib/supabase-utils';
import type { SalesOrder } from '@/types/sales';
import type { PurchaseOrder } from '@/types/purchases';

export interface DashboardData {
  todaySalesUsd: number;
  todaySalesSyp: number;
  todaySalesCount: number;
  totalProducts: number;
  lowStockCount: number;
  recentSales: SalesOrder[];
  recentPurchaseOrders: PurchaseOrder[];
}

export const useDashboard = () => {
  return useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];

      const [
        { data: todayOrders, error: ordersError },
        { count: totalProducts, error: productsError },
        { data: lowStockProducts, error: lowStockError },
        { data: recentSales, error: recentSalesError },
        { data: recentPOs, error: recentPOsError },
      ] = await Promise.all([
        supabase
          .from('sales_orders')
          .select('*')
          .gte('order_date', today)
          .lte('order_date', today),
        supabase
          .from('products')
          .select('*', { count: 'exact', head: true }),
        supabase
          .from('products')
          .select('id')
          .lte('quantity', 3),
        supabase
          .from('sales_orders')
          .select('*')
          .order('order_date', { ascending: false })
          .limit(5),
        supabase
          .from('purchase_orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      if (ordersError) throw new Error(ordersError.message);
      if (productsError) throw new Error(productsError.message);
      if (lowStockError) throw new Error(lowStockError.message);
      if (recentSalesError) throw new Error(recentSalesError.message);
      if (recentPOsError) throw new Error(recentPOsError.message);

      const todayOrdersArray = toArray<SalesOrder>(todayOrders);
      const todaySalesUsd = todayOrdersArray.reduce((sum, o) => sum + (o.total_usd || 0), 0);
      const todaySalesSyp = todayOrdersArray.reduce((sum, o) => sum + (o.total_syp || 0), 0);

      return {
        todaySalesUsd,
        todaySalesSyp,
        todaySalesCount: todayOrdersArray.length,
        totalProducts: totalProducts ?? 0,
        lowStockCount: lowStockProducts?.length ?? 0,
        recentSales: toArray<SalesOrder>(recentSales),
        recentPurchaseOrders: toArray<PurchaseOrder>(recentPOs),
      };
    },
  });
};
