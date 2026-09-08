import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Receipt, ChartLineUp } from '@phosphor-icons/react';
import { Skeleton } from '@/features/shared/components/Skeleton';
import { useSettings } from '@/features/settings/hooks/useSettingsQuery';
import type { SalesSummary } from '@/types/reports';

interface SalesSummaryCardProps {
  data?: SalesSummary;
  loading: boolean;
}

const fmt = (n: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtCompact = (n: number) => {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return fmt(n);
};

export const SalesSummaryCard = ({ data, loading }: SalesSummaryCardProps) => {
  const { t } = useTranslation();
  const { data: settings } = useSettings();

  const totalUsd = data?.totalSalesUsd ?? 0;
  const exchangeRate = settings?.exchangeRate ?? 0;
  const totalSyp = totalUsd * exchangeRate;
  const txCount = data?.transactionCount ?? 0;

  if (loading) {
    return (
      <div className="rounded-2xl bg-brand-dark/60 border border-brand-border/20 p-5 md:p-6 h-full shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
          <Skeleton className="h-3 w-24 rounded-md" />
        </div>
        <Skeleton className="h-10 w-40 rounded-lg mb-5" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-28 rounded-lg" />
          <Skeleton className="h-6 w-6 rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } }}
      className="group relative rounded-2xl border border-brand-border/15 bg-gradient-to-br from-brand-dark/80 via-brand-dark/60 to-brand-dark/30 p-5 md:p-6 h-full overflow-hidden hover:border-[var(--clr-gold)]/25 hover:shadow-[0_12px_48px_-16px_rgba(201,160,60,0.15)] transition-all duration-300"
    >
      {/* Ambient glow */}
      <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-[var(--clr-gold)] blur-[80px] opacity-[0.06] transition-opacity duration-500 group-hover:opacity-[0.1]" />

      {/* Subtle grid texture */}
      <div className="absolute inset-0 opacity-[0.012]" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(201,160,60,0.4) 1px, transparent 0)',
        backgroundSize: '24px 24px',
      }} />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--clr-gold)]/8 border border-[var(--clr-gold)]/15 flex items-center justify-center shrink-0 group-hover:bg-[var(--clr-gold)]/12 group-hover:scale-105 transition-all duration-300">
              <Receipt size={18} weight="duotone" className="text-brand-gold" />
            </div>
            <span
              className="text-[11px] font-semibold text-brand-muted/50 uppercase tracking-wider"
              style={{ fontFamily: "'Satoshi', 'Outfit', sans-serif" }}
            >
              {t('reports.totalSales', 'Total Sales')}
            </span>
          </div>

          {/* Transaction count pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--clr-gold)]/8 text-[10px] font-semibold text-[var(--clr-gold)]/70 border border-[var(--clr-gold)]/10 uppercase tracking-wider">
            <Receipt size={10} weight="bold" />
            {txCount} {t('reports.tx', 'tx')}
          </div>
        </div>

        {/* Main Value — USD */}
        <div className="mb-2">
          <div className="flex items-baseline gap-2">
            <span className="text-[11px] font-mono font-medium text-[var(--clr-gold)]/50">$</span>
            <p className="text-3xl md:text-[2.5rem] font-bold font-mono tracking-tight leading-none text-brand-gold">
              {fmt(totalUsd)}
            </p>
          </div>
          <p className="mt-1 text-xs font-medium text-brand-gold/50">
            {t('reports.totalRevenue', 'Total Revenue')}
          </p>
        </div>

        {/* Divider */}
        <div className="my-4 h-px bg-gradient-to-r from-transparent via-brand-border/20 to-transparent" />

        {/* SYP = USD × Exchange Rate */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center bg-[var(--clr-gold)]/6">
              <ChartLineUp size={12} weight="bold" className="text-[var(--clr-gold)]/50" />
            </div>
            <span className="text-xs text-brand-muted/40 font-medium">
              {t('reports.totalSales', 'Total Sales')}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-mono font-bold text-[var(--clr-gold)]/70">
              {fmtCompact(totalSyp)}
            </span>
            <span className="text-[10px] text-brand-muted/30 font-medium">ل.س</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
