import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Wallet, TrendUp, TrendDown } from '@phosphor-icons/react';
import type { ProfitSummary } from '@/types/reports';

interface ProfitSummaryCardProps {
  data?: ProfitSummary;
  loading: boolean;
}

export const ProfitSummaryCard = ({ data, loading }: ProfitSummaryCardProps) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-brand-border/20 p-5 md:p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <div className="flex items-center justify-between mb-4">
          <div className="h-3 w-24 bg-brand-border/20 rounded-lg animate-pulse" />
          <div className="w-8 h-8 bg-brand-border/20 rounded-xl animate-pulse" />
        </div>
        <div className="h-8 w-32 bg-brand-border/20 rounded-xl animate-pulse mb-3" />
        <div className="h-3 w-20 bg-brand-border/15 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-brand-border/20 p-5 md:p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] md:text-[11px] font-medium text-brand-muted/60 uppercase tracking-wider">
            {t('reports.profitSummary')}
          </span>
          <div className="w-8 h-8 rounded-xl bg-brand-dark/40 backdrop-blur-sm flex items-center justify-center text-blue-400/80">
            <Wallet size={14} weight="duotone" />
          </div>
        </div>
        <p className="text-sm text-brand-muted/50">{t('common.noData')}</p>
      </div>
    );
  }

  const profitPositive = data.profitUsd >= 0;

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`rounded-2xl bg-gradient-to-br ${
        profitPositive
          ? 'from-emerald-500/10 to-teal-500/5'
          : 'from-red-500/10 to-rose-500/5'
      } border border-brand-border/20 p-5 md:p-6 overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] md:text-[11px] font-medium text-brand-muted/60 uppercase tracking-wider">
          {t('reports.profitSummary')}
        </span>
        <div className={`w-8 h-8 rounded-xl bg-brand-dark/40 backdrop-blur-sm flex items-center justify-center ${
          profitPositive ? 'text-emerald-400/80' : 'text-red-400/80'
        }`}>
          <Wallet size={14} weight="duotone" />
        </div>
      </div>

      {/* Main Value */}
      <div className="flex items-baseline gap-2 mb-1">
        <p className={`text-2xl md:text-3xl font-bold font-mono tracking-tight ${
          profitPositive ? 'text-emerald-400' : 'text-red-400'
        }`}>
          ${Math.abs(data.profitUsd).toFixed(2)}
        </p>
        {profitPositive ? (
          <TrendUp size={16} weight="bold" className="text-emerald-400/60" />
        ) : (
          <TrendDown size={16} weight="bold" className="text-red-400/60" />
        )}
      </div>
      <p className="text-[10px] md:text-[11px] text-brand-muted/40 mb-4">
        {t('reports.profitUsd')}
      </p>

      {/* SYP */}
      <div className="pt-3 border-t border-brand-border/10">
        <div className="flex items-center justify-between">
          <span className="text-[10px] md:text-[11px] text-brand-muted/60">{t('reports.profitSyp')}</span>
          <span className={`text-xs md:text-sm font-mono tabular-nums ${
            data.profitSyp >= 0 ? 'text-emerald-400/80' : 'text-red-400/80'
          }`}>
            {data.profitSyp >= 0 ? '' : '-'}{Math.abs(data.profitSyp).toLocaleString()} ل.س
          </span>
        </div>
      </div>
    </motion.div>
  );
};
