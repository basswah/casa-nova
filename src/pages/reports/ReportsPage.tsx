import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ChartBar, ArrowRight, ArrowClockwise, Sparkle } from '@phosphor-icons/react';
import { useSalesSummary, useProfitSummary, useTopProducts } from '@/features/reports/hooks/useReports';
import { DatePresets } from '@/features/reports/components/DatePresets';
import { SalesSummaryCard } from '@/features/reports/components/SalesSummaryCard';
import { ProfitSummaryCard } from '@/features/reports/components/ProfitSummaryCard';
import { TopProductsTable } from '@/features/reports/components/TopProductsTable';
import type { DateRange } from '@/types/reports';

const today = () => new Date().toISOString().split('T')[0];

const easeOutExpo = [0.16, 1, 0.3, 1] as const;

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

const fadeSlideUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOutExpo } },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.95, y: 12 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: easeOutExpo } },
};

export const ReportsPage = () => {
  const { t } = useTranslation();
  const [range, setRange] = useState<DateRange>({ start: today(), end: today() });

  useEffect(() => { document.title = `${t('nav.title')} — ${t('reports.title')}`; }, [t]);

  const { data: salesData, isLoading: salesLoading, isFetching: salesFetching } = useSalesSummary(range);
  const { data: profitData, isLoading: profitLoading, isFetching: profitFetching } = useProfitSummary(range);
  const { data: topProducts, isLoading: topLoading, isFetching: topFetching } = useTopProducts(range);

  const isAnyLoading = salesLoading || profitLoading || topLoading;
  const isAnyFetching = salesFetching || profitFetching || topFetching;

  return (
    <div className="min-h-[100dvh] relative overflow-x-hidden">
      {/* Ambient background — premium glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: -1 }}>
        <div className="absolute top-[-25%] left-[-15%] w-[600px] h-[600px] rounded-full bg-[var(--clr-gold)]/[0.03] blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/[0.02] blur-[120px]" />
        <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full bg-emerald-500/[0.015] blur-[100px]" />
      </div>

      <div className="relative px-5 md:px-8 lg:px-12 pt-8 md:pt-12 pb-16 md:pb-24 max-w-[1600px] mx-auto">
        {/* Hero Header */}
        <motion.div
          initial="initial"
          animate="animate"
          className="mb-8 md:mb-12 relative z-10"
        >
          <motion.div variants={fadeSlideUp} className="flex items-center gap-2 mb-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--clr-gold)]/8 border border-[var(--clr-gold)]/15 text-[var(--clr-gold)] text-[11px] font-semibold tracking-wider uppercase">
              <Sparkle size={11} weight="fill" />
              {t('reports.title')}
            </span>
            <AnimatePresence>
              {isAnyFetching && !isAnyLoading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="shrink-0"
                >
                  <ArrowClockwise size={13} weight="bold" className="text-brand-gold/50 animate-spin" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
            <motion.div variants={fadeSlideUp}>
              <h1
                className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold text-brand-light tracking-tight leading-[1.1] mb-2"
                style={{ fontFamily: "'Satoshi', 'Outfit', sans-serif" }}
              >
                {t('reports.title')}
              </h1>
              <p className="text-sm text-brand-muted/50 max-w-lg leading-relaxed">
                {t('reports.subtitle', 'Real-time sales performance and insights')}
              </p>
            </motion.div>

            <motion.div variants={fadeSlideUp}>
              <DatePresets value={range} onChange={setRange} />
            </motion.div>
          </div>
        </motion.div>

        {/* Key Metrics — Premium Bento Grid */}
        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-8 md:mb-12 relative z-0"
        >
          <motion.div variants={scaleIn}>
            <SalesSummaryCard data={salesData} loading={salesLoading} />
          </motion.div>
          <motion.div variants={scaleIn}>
            <ProfitSummaryCard data={profitData} loading={profitLoading} />
          </motion.div>
          <motion.div variants={scaleIn} className="sm:col-span-2 lg:col-span-1">
            <TopProductsTable data={topProducts} loading={topLoading} compact />
          </motion.div>
        </motion.div>

        {/* Top Products Section */}
        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="space-y-4"
        >
          <motion.div variants={fadeSlideUp} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[var(--clr-gold)]/8 border border-[var(--clr-gold)]/15 flex items-center justify-center shrink-0">
                <ChartBar size={16} weight="bold" className="text-brand-gold" />
              </div>
              <div>
                <h2
                  className="text-sm font-semibold text-brand-light tracking-tight"
                  style={{ fontFamily: "'Satoshi', 'Outfit', sans-serif" }}
                >
                  {t('reports.topProducts')}
                </h2>
                <p className="text-[11px] text-brand-muted/45">
                  {t('reports.topProductsDesc', 'Best performers this period')}
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-brand-muted/35 shrink-0">
              {t('reports.rankedByRevenue', 'Ranked by revenue')}
              <ArrowRight size={11} weight="bold" />
            </div>
          </motion.div>

          <motion.div variants={fadeSlideUp}>
            <TopProductsTable data={topProducts} loading={topLoading} />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
