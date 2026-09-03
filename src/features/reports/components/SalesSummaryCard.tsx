import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { TrendUp, CurrencyCircleDollar, Receipt } from '@phosphor-icons/react';
import type { SalesSummary } from '@/types/reports';

interface SalesSummaryCardProps {
  data?: SalesSummary;
  loading: boolean;
}

export const SalesSummaryCard = ({ data, loading }: SalesSummaryCardProps) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-brand-border/20 p-5 md:p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <div className="flex items-center justify-between mb-4">
          <div className="h-3 w-24 bg-brand-border/20 rounded-lg animate-pulse" />
          <div className="w-8 h-8 bg-brand-border/20 rounded-xl animate-pulse" />
        </div>
        <div className="h-8 w-32 bg-brand-border/20 rounded-xl animate-pulse mb-3" />
        <div className="space-y-2">
          <div className="h-3 w-20 bg-brand-border/15 rounded-lg animate-pulse" />
          <div className="h-3 w-16 bg-brand-border/10 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-brand-border/20 p-5 md:p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] md:text-[11px] font-medium text-brand-muted/60 uppercase tracking-wider">
            {t('reports.salesSummary')}
          </span>
          <div className="w-8 h-8 rounded-xl bg-brand-dark/40 backdrop-blur-sm flex items-center justify-center text-amber-400/80">
            <TrendUp size={14} weight="duotone" />
          </div>
        </div>
        <p className="text-sm text-brand-muted/50">{t('common.noData')}</p>
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-brand-border/20 p-5 md:p-6 overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] md:text-[11px] font-medium text-brand-muted/60 uppercase tracking-wider">
          {t('reports.salesSummary')}
        </span>
        <div className="w-8 h-8 rounded-xl bg-brand-dark/40 backdrop-blur-sm flex items-center justify-center text-amber-400/80">
          <TrendUp size={14} weight="duotone" />
        </div>
      </div>

      {/* Main Value */}
      <p className="text-2xl md:text-3xl font-bold text-brand-gold font-mono tracking-tight mb-1">
        ${data.totalSalesUsd.toFixed(2)}
      </p>
      <p className="text-[10px] md:text-[11px] text-brand-muted/40 mb-4">
        {t('reports.totalUsd')}
      </p>

      {/* Details */}
      <div className="space-y-2.5 pt-3 border-t border-brand-border/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CurrencyCircleDollar size={12} weight="duotone" className="text-brand-muted/40" />
            <span className="text-[10px] md:text-[11px] text-brand-muted/60">{t('reports.totalSyp')}</span>
          </div>
          <span className="text-xs md:text-sm font-mono text-brand-light/80 tabular-nums">{data.totalSalesSyp.toLocaleString()} ل.س</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt size={12} weight="duotone" className="text-brand-muted/40" />
            <span className="text-[10px] md:text-[11px] text-brand-muted/60">{t('reports.transactions')}</span>
          </div>
          <span className="text-xs md:text-sm font-mono font-medium text-brand-light/80 tabular-nums">{data.transactionCount}</span>
        </div>
      </div>
    </motion.div>
  );
};
