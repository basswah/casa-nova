import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Receipt, ChartBar, ArrowRight } from '@phosphor-icons/react';
import { useSalesSummary, useProfitSummary, useTopProducts } from '@/features/reports/hooks/useReports';
import { DatePresets } from '@/features/reports/components/DatePresets';
import { SalesSummaryCard } from '@/features/reports/components/SalesSummaryCard';
import { ProfitSummaryCard } from '@/features/reports/components/ProfitSummaryCard';
import { TopProductsTable } from '@/features/reports/components/TopProductsTable';
import type { DateRange } from '@/types/reports';

const today = () => new Date().toISOString().split('T')[0];

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export const ReportsPage = () => {
  const { t } = useTranslation();
  const [range, setRange] = useState<DateRange>({ start: today(), end: today() });

  useEffect(() => { document.title = `${t('nav.title')} — ${t('reports.title')}`; }, [t]);

  const { data: salesData, isLoading: salesLoading } = useSalesSummary(range);
  const { data: profitData, isLoading: profitLoading } = useProfitSummary(range);
  const { data: topProducts, isLoading: topLoading } = useTopProducts(range);

  return (
    <div className="min-h-[100dvh] max-w-7xl mx-auto space-y-8 md:space-y-12">
      {/* Split Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="max-w-full sm:max-w-lg">
          <h1 className="text-2xl md:text-3xl font-bold text-brand-gold tracking-tight">
            {t('reports.title')}
          </h1>
          <p className="text-sm text-brand-muted mt-1.5 leading-relaxed">
            {t('reports.subtitle', 'Real-time sales performance and insights')}
          </p>
        </div>
        <DatePresets value={range} onChange={setRange} />
      </div>

      {/* Asymmetric Bento Metrics */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:[grid-template-columns:1.6fr_1fr_1fr] gap-4 md:gap-5"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={staggerItem}>
          <SalesSummaryCard data={salesData} loading={salesLoading} />
        </motion.div>
        <motion.div variants={staggerItem}>
          <ProfitSummaryCard data={profitData} loading={profitLoading} />
        </motion.div>
        <motion.div variants={staggerItem}>
          <div className="group rounded-xl border border-brand-border/60 bg-brand-dark p-5 md:p-6 transition-all duration-300 ease-out-expo hover:border-brand-gold/20 hover:shadow-[var(--shadow-hover)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center bg-brand-surface-hover text-brand-light">
                <Receipt size={20} weight="duotone" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-brand-muted/70 uppercase tracking-widest">
                  {t('reports.transactions')}
                </p>
                {salesLoading ? (
                  <div className="mt-1 h-7 w-20 bg-brand-surface-hover rounded-md animate-pulse" />
                ) : (
                  <p className="text-2xl font-bold font-mono mt-1 leading-none text-brand-light">
                    {salesData?.transactionCount ?? '-'}
                  </p>
                )}
                <p className="text-[11px] text-brand-muted/50 mt-1.5">
                  {t('reports.inSelectedPeriod', 'In selected period')}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Top Products Section */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-gold/10 flex items-center justify-center shrink-0">
              <ChartBar size={16} weight="bold" className="text-brand-gold" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-brand-light tracking-tight">
                {t('reports.topProducts')}
              </h2>
              <p className="text-[11px] text-brand-muted/60">
                {t('reports.topProductsDesc', 'Best performers this period')}
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-brand-muted/50 shrink-0">
            {t('reports.rankedByRevenue', 'Ranked by revenue')}
            <ArrowRight size={12} weight="bold" />
          </div>
        </div>
        <TopProductsTable data={topProducts} loading={topLoading} />
      </div>
    </div>
  );
};
