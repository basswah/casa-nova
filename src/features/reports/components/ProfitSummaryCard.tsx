import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { TrendUp, TrendDown, ArrowUpRight, ArrowDownRight, Bank } from '@phosphor-icons/react';
import { Skeleton } from '@/features/shared/components/Skeleton';
import { useSettings } from '@/features/settings/hooks/useSettingsQuery';
import type { ProfitSummary } from '@/types/reports';

interface ProfitSummaryCardProps {
  data?: ProfitSummary;
  loading: boolean;
}

const fmt = (n: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtCompact = (n: number) => {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return fmt(n);
};

export const ProfitSummaryCard = ({ data, loading }: ProfitSummaryCardProps) => {
  const { t } = useTranslation();
  const { data: settings } = useSettings();

  const profitUsd = data?.profitUsd ?? 0;
  const exchangeRate = settings?.exchangeRate ?? 0;
  const profitSyp = profitUsd * exchangeRate;
  const isPositive = profitUsd >= 0;

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
      className={`group relative rounded-2xl border p-5 md:p-6 h-full overflow-hidden transition-all duration-300 ${
        isPositive
          ? 'bg-gradient-to-br from-emerald-950/50 via-emerald-950/30 to-emerald-950/10 border-emerald-500/15 hover:border-emerald-500/30 hover:shadow-[0_12px_48px_-16px_rgba(16,185,129,0.2)]'
          : 'bg-gradient-to-br from-red-950/50 via-red-950/30 to-red-950/10 border-red-500/15 hover:border-red-500/30 hover:shadow-[0_12px_48px_-16px_rgba(239,68,68,0.2)]'
      }`}
    >
      {/* Ambient glow */}
      <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[80px] opacity-20 transition-opacity duration-500 group-hover:opacity-30 ${
        isPositive ? 'bg-emerald-400' : 'bg-red-400'
      }`} />

      {/* Subtle grid texture */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, ${isPositive ? 'rgba(16,185,129,0.5)' : 'rgba(239,68,68,0.5)'} 1px, transparent 0)`,
        backgroundSize: '24px 24px',
      }} />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-all duration-300 ${
              isPositive
                ? 'bg-emerald-500/10 border-emerald-500/20 group-hover:bg-emerald-500/15 group-hover:scale-105'
                : 'bg-red-500/10 border-red-500/20 group-hover:bg-red-500/15 group-hover:scale-105'
            }`}>
              <Bank size={18} weight="duotone" className={isPositive ? 'text-emerald-400' : 'text-red-400'} />
            </div>
            <span
              className="text-[11px] font-semibold text-brand-muted/50 uppercase tracking-wider"
              style={{ fontFamily: "'Satoshi', 'Outfit', sans-serif" }}
            >
              {t('reports.profit', 'Profit')}
            </span>
          </div>

          {/* Status pill */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
            isPositive
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15'
              : 'bg-red-500/10 text-red-400 border border-red-500/15'
          }`}>
            {isPositive ? <ArrowUpRight size={10} weight="bold" /> : <ArrowDownRight size={10} weight="bold" />}
            {isPositive ? '+' : '-'}{fmt(Math.abs(profitUsd))}
          </div>
        </div>

        {/* Main Value — USD */}
        <div className="mb-2">
          <div className="flex items-baseline gap-2">
            <span className={`text-[11px] font-mono font-medium ${isPositive ? 'text-emerald-400/50' : 'text-red-400/50'}`}>$</span>
            <p className={`text-3xl md:text-[2.5rem] font-bold font-mono tracking-tight leading-none ${
              isPositive ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {fmt(Math.abs(profitUsd))}
            </p>
          </div>
          <p className={`mt-1 text-xs font-medium ${isPositive ? 'text-emerald-400/60' : 'text-red-400/60'}`}>
            {isPositive ? t('reports.netProfit', 'Net Profit') : t('reports.netLoss', 'Net Loss')}
          </p>
        </div>

        {/* Divider */}
        <div className="my-4 h-px bg-gradient-to-r from-transparent via-brand-border/20 to-transparent" />

        {/* SYP Profit = USD Profit × Exchange Rate */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
              isPositive ? 'bg-emerald-500/8' : 'bg-red-500/8'
            }`}>
              {isPositive ? (
                <TrendUp size={12} weight="bold" className="text-emerald-400/60" />
              ) : (
                <TrendDown size={12} weight="bold" className="text-red-400/60" />
              )}
            </div>
            <span className="text-xs text-brand-muted/40 font-medium">
              {t('reports.netProfit', 'Net Profit')}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`text-sm font-mono font-bold ${isPositive ? 'text-emerald-300/80' : 'text-red-300/80'}`}>
              {fmtCompact(profitSyp)}
            </span>
            <span className="text-[10px] text-brand-muted/30 font-medium">ل.س</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
