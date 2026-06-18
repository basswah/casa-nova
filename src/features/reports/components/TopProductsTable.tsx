import { useTranslation } from 'react-i18next';
import type { TopProduct } from '@/types/reports';

interface TopProductsTableProps {
  data?: TopProduct[];
  loading: boolean;
}

export const TopProductsTable = ({ data, loading }: TopProductsTableProps) => {
  const { t } = useTranslation();
  return (
    <div className="bg-brand-dark rounded-xl p-5 border border-brand-border shadow-sm">
    <h3 className="text-sm font-medium text-brand-muted mb-3 tracking-wide uppercase">{t('reports.topProducts')}</h3>
    {loading ? (
      <p className="text-brand-muted text-sm">{t('common.loading')}</p>
    ) : !data?.length ? (
      <p className="text-brand-muted text-sm">{t('reports.noSales')}</p>
    ) : (
      <div className="overflow-x-auto rounded-lg">
        <table className="min-w-full divide-y divide-brand-border">
          <thead className="bg-brand-black">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-brand-muted uppercase tracking-wider">{t('reports.product')}</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-brand-muted uppercase tracking-wider">{t('reports.sold')}</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-brand-muted uppercase tracking-wider">{t('reports.totalUsd')}</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-brand-muted uppercase tracking-wider">{t('reports.totalSyp')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {data.map((p, i) => (
              <tr key={p.productId} className="hover:bg-brand-surface-hover transition-colors">
                <td className="px-3 py-2 text-sm text-brand-light">
                  <span className="text-brand-muted mr-2 font-mono">#{i + 1}</span>
                  {p.productName}
                </td>
                <td className="px-3 py-2 text-sm text-right font-mono">{p.quantitySold}</td>
                <td className="px-3 py-2 text-sm text-right font-mono">${p.totalUsd.toFixed(2)}</td>
                <td className="px-3 py-2 text-sm text-right font-mono">{p.totalSyp.toLocaleString()} SYP</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
    </div>
  );
};
