import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { withTimeout, DEFAULT_TIMEOUT_MS } from '@/lib/supabase-utils';
import { fetchSalesSummary, fetchProfitSummary, fetchTopProducts } from '@/features/reports/services/api';
import type { DateRange } from '@/types/reports';

export const useSalesSummary = (range: DateRange) => {
  return useQuery({
    queryKey: ['report-sales-summary', range],
    queryFn: () => fetchSalesSummary(range.start, range.end),
  });
};

export const useProfitSummary = (range: DateRange) => {
  return useQuery({
    queryKey: ['report-profit-summary', range],
    queryFn: () => fetchProfitSummary(range.start, range.end),
  });
};

export const useTopProducts = (range: DateRange, limit = 10) => {
  return useQuery({
    queryKey: ['report-top-products', range, limit],
    queryFn: () => fetchTopProducts(range.start, range.end, limit),
  });
};

export interface AvailableMonth {
  year: number;
  month: number;
}

export const useAvailableMonths = () => {
  return useQuery<AvailableMonth[]>({
    queryKey: ['report-available-months'],
    queryFn: async () => {
      const { data, error } = await withTimeout(
        supabase
          .from('sales_orders')
          .select('order_date')
          .eq('status', 'completed')
          .not('order_date', 'is', null),
        DEFAULT_TIMEOUT_MS,
        'Available months',
      );

      if (error) throw new Error(error.message);
      if (!data?.length) return [];

      const monthSet = new Set<string>();
      for (const row of data) {
        if (row.order_date) {
          const d = new Date(row.order_date);
          const key = `${d.getFullYear()}-${d.getMonth()}`;
          monthSet.add(key);
        }
      }

      return Array.from(monthSet)
        .map((key) => {
          const [y, m] = key.split('-').map(Number);
          return { year: y, month: m };
        })
        .sort((a, b) => b.year - a.year || b.month - a.month);
    },
  });
};
