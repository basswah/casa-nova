import { useQuery } from '@tanstack/react-query';
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
