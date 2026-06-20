import { useTranslation } from 'react-i18next';
import { Wallet } from '@phosphor-icons/react';
import type { ProfitSummary } from '@/types/reports';

interface ProfitSummaryCardProps {
  data?: ProfitSummary;
  loading: boolean;
}

export const ProfitSummaryCard = ({ data, loading }: ProfitSummaryCardProps) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="rounded-xl border border-brand-border/60 bg-brand-dark p-5 md:p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <div className="flex items-start gap-4 mb-4">
          <div className="shrink-0 w-11 h-11 rounded-xl bg-brand-surface-hover animate-pulse" />
          <div className="space-y-2 flex-1">
            <div className="h-3 w-24 bg-brand-surface-hover rounded animate-pulse" />
            <div className="h-7 w-32 bg-brand-surface-hover rounded animate-pulse" />
          </div>
        </div>
        <div className="space-y-2.5">
          <div className="h-4 w-full bg-brand-surface-hover rounded animate-pulse" />
          <div className="h-4 w-3/4 bg-brand-surface-hover rounded animate-pulse" />
        </div>
        <p className="text-sm text-brand-muted mt-3">{t('common.loading')}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-xl border border-brand-border/60 bg-brand-dark p-5 md:p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <div className="flex items-start gap-4">
          <div className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center bg-brand-surface-hover text-brand-muted/50">
            <Wallet size={20} weight="duotone" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-brand-muted/70 uppercase tracking-widest">
              {t('reports.profitSummary')}
            </p>
            <p className="text-sm text-brand-muted/50 mt-2">{t('common.noData')}</p>
          </div>
        </div>
      </div>
    );
  }

  const profitPositive = data.profitUsd >= 0;

  return (
    <div className="group rounded-xl border border-brand-border/60 bg-brand-dark p-5 md:p-6 transition-all duration-300 ease-out-expo hover:border-brand-gold/20 hover:shadow-[var(--shadow-hover)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="flex items-start gap-4 mb-4">
        <div className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-300 ease-out-expo group-hover:scale-110 ${
          profitPositive
            ? 'bg-green-500/10 text-green-400'
            : 'bg-red-500/10 text-red-400'
        }`}>
          <Wallet size={20} weight="duotone" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-brand-muted/70 uppercase tracking-widest">
            {t('reports.profitSummary')}
          </p>
          <p className={`text-xl md:text-2xl font-bold font-mono mt-1 leading-none ${
            profitPositive ? 'text-green-400' : 'text-red-400'
          }`}>
            ${data.profitUsd.toFixed(2)}
          </p>
          <p className="text-[11px] text-brand-muted/50 mt-1">
            {t('reports.profitUsd')}
          </p>
        </div>
      </div>
      <div className="space-y-2.5">
        <div className="flex items-center justify-between py-2 border-t border-brand-border/40">
          <span className="text-xs text-brand-muted/70">{t('reports.profitSyp')}</span>
          <span className={`text-xs md:text-sm font-mono ${
            data.profitSyp >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {data.profitSyp.toLocaleString()} SYP
          </span>
        </div>
      </div>
    </div>
  );
};
