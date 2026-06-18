import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSalesSummary, useProfitSummary, useTopProducts } from '@/features/reports/hooks/useReports';
import { DatePresets } from '@/features/reports/components/DatePresets';
import { SalesSummaryCard } from '@/features/reports/components/SalesSummaryCard';
import { ProfitSummaryCard } from '@/features/reports/components/ProfitSummaryCard';
import { TopProductsTable } from '@/features/reports/components/TopProductsTable';
import type { DateRange } from '@/types/reports';

const today = () => new Date().toISOString().split('T')[0];

export const ReportsPage = () => {
  const { t } = useTranslation();
  const [range, setRange] = useState<DateRange>({ start: today(), end: today() });

  useEffect(() => { document.title = `${t('nav.title')} — ${t('reports.title')}`; }, [t]);

  const { data: salesData, isLoading: salesLoading } = useSalesSummary(range);
  const { data: profitData, isLoading: profitLoading } = useProfitSummary(range);
  const { data: topProducts, isLoading: topLoading } = useTopProducts(range);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-brand-gold tracking-tight">{t('reports.title')}</h2>
        <DatePresets value={range} onChange={setRange} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SalesSummaryCard data={salesData} loading={salesLoading} />
        <ProfitSummaryCard data={profitData} loading={profitLoading} />
      </div>

      <TopProductsTable data={topProducts} loading={topLoading} />
    </div>
  );
};
