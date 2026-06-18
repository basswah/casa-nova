import { useTranslation } from 'react-i18next';
import type { ProfitSummary } from '@/types/reports';

interface ProfitSummaryCardProps {
  data?: ProfitSummary;
  loading: boolean;
}

export const ProfitSummaryCard = ({ data, loading }: ProfitSummaryCardProps) => {
  const { t } = useTranslation();
  return (
    <div className="bg-brand-dark rounded-xl p-5 border border-brand-border">
      <h3 className="text-xs font-medium text-brand-muted uppercase tracking-wider mb-3">{t('reports.profitSummary')}</h3>
      {loading ? (
        <p className="text-brand-muted text-sm">{t('common.loading')}</p>
      ) : !data ? (
        <p className="text-brand-muted text-sm">{t('common.noData')}</p>
      ) : (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-brand-muted">{t('reports.profitUsd')}</span>
            <span className={`font-bold font-mono ${data.profitUsd >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${data.profitUsd.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-brand-muted">{t('reports.profitSyp')}</span>
            <span className={`font-bold font-mono ${data.profitSyp >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {data.profitSyp.toLocaleString()} SYP
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
