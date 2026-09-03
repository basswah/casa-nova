import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkle, ArrowRight, ArrowClockwise } from '@phosphor-icons/react';
import { useSalesSummary, useProfitSummary, useTopProducts } from '@/features/reports/hooks/useReports';
import { DatePresets } from '@/features/reports/components/DatePresets';
import { SalesSummaryCard } from '@/features/reports/components/SalesSummaryCard';
import { ProfitSummaryCard } from '@/features/reports/components/ProfitSummaryCard';
import { TopProductsTable } from '@/features/reports/components/TopProductsTable';
import type { DateRange } from '@/types/reports';

const today = () => new Date().toISOString().split('T')[0];

const easeOutExpo = [0.16, 1, 0.3, 1] as const;

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
};

const fadeSlideUp = {
  initial: { opacity: 0, y: 20, filter: 'blur(8px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.5, ease: easeOutExpo } },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.92 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: easeOutExpo } },
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
    <div className="min-h-[100dvh] relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: -1 }}>
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[var(--clr-gold)]/[0.04] blur-[120px]" />
        <div className="absolute bottom-[-15%] right-[-5%] w-[400px] h-[400px] rounded-full bg-blue-500/[0.03] blur-[100px]" />
      </div>

      <div className="relative px-5 md:px-8 lg:px-12 pt-10 md:pt-16 pb-16 md:pb-24 max-w-[1600px] mx-auto">
        {/* Hero Header */}
        <motion.div
          initial="initial"
          animate="animate"
          className="mb-10 md:mb-14"
        >
          <motion.div variants={fadeSlideUp} className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--clr-gold)]/10 border border-[var(--clr-gold)]/20 text-[var(--clr-gold)] text-[11px] font-medium tracking-wide">
              <Sparkle size={12} weight="fill" />
              {t('reports.title')}
            </span>
          </motion.div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="flex items-center gap-3">
              <div>
                <motion.h1
                  variants={fadeSlideUp}
                  className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold text-brand-light tracking-tight leading-[1.15] mb-3"
                  style={{ fontFamily: "'Satoshi', 'Outfit', sans-serif" }}
                >
                  {t('reports.title')}
                </motion.h1>

                <motion.p
                  variants={fadeSlideUp}
                  className="text-sm md:text-base text-brand-muted/60 max-w-lg leading-relaxed"
                >
                  {t('reports.subtitle', 'Real-time sales performance and insights')}
                </motion.p>
              </div>

              {/* Refresh indicator */}
              <AnimatePresence>
                {isAnyFetching && !isAnyLoading && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="shrink-0"
                  >
                    <ArrowClockwise size={16} weight="bold" className="text-brand-gold/60 animate-spin" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.div variants={fadeSlideUp}>
              <DatePresets value={range} onChange={setRange} />
            </motion.div>
          </div>
        </motion.div>

        {/* Bento Metrics — 3 focused cards */}
        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-10 md:mb-14"
        >
          <motion.div variants={scaleIn}>
            <SalesSummaryCard data={salesData} loading={salesLoading} />
          </motion.div>
          <motion.div variants={scaleIn}>
            <ProfitSummaryCard data={profitData} loading={profitLoading} />
          </motion.div>
          <motion.div variants={scaleIn}>
            <TopProductsTable data={topProducts} loading={topLoading} compact />
          </motion.div>
        </motion.div>

        {/* Top Products Section */}
        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="space-y-5"
        >
          <motion.div variants={fadeSlideUp} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[var(--clr-gold)]/10 border border-[var(--clr-gold)]/20 flex items-center justify-center shrink-0">
                <Sparkle size={16} weight="bold" className="text-brand-gold" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-brand-light tracking-tight" style={{ fontFamily: "'Satoshi', 'Outfit', sans-serif" }}>
                  {t('reports.topProducts')}
                </h2>
                <p className="text-[11px] text-brand-muted/50">
                  {t('reports.topProductsDesc', 'Best performers this period')}
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-brand-muted/40 shrink-0">
              {t('reports.rankedByRevenue', 'Ranked by revenue')}
              <ArrowRight size={12} weight="bold" />
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
