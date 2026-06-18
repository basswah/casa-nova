import { useTranslation } from 'react-i18next';
import type { SalesSummary } from '@/types/reports';

interface SalesSummaryCardProps {
  data?: SalesSummary;
  loading: boolean;
}

export const SalesSummaryCard = ({ data, loading }: SalesSummaryCardProps) => {
  const { t } = useTranslation();
  return (
    <div className="bg-brand-dark rounded-xl p-5 border border-brand-border">
      <h3 className="text-xs font-medium text-brand-muted uppercase tracking-wider mb-3">{t('reports.salesSummary')}</h3>
      {loading ? (
        <p className="text-brand-muted text-sm">{t('common.loading')}</p>
      ) : !data ? (
        <p className="text-brand-muted text-sm">{t('common.noData')}</p>
      ) : (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-brand-muted">{t('reports.totalUsd')}</span>
            <span className="text-brand-gold font-bold font-mono text-lg">${data.totalSalesUsd.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-brand-muted">{t('reports.totalSyp')}</span>
            <span className="text-brand-light font-mono">{data.totalSalesSyp.toLocaleString()} SYP</span>
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-brand-border">
            <span className="text-sm text-brand-muted">{t('reports.transactions')}</span>
            <span className="text-brand-light font-mono font-medium">{data.transactionCount}</span>
          </div>
        </div>
      )}
    </div>
  );
};
