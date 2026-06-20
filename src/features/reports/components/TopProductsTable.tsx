import { useTranslation } from 'react-i18next';
import { ChartBar, Medal } from '@phosphor-icons/react';
import type { TopProduct } from '@/types/reports';

interface TopProductsTableProps {
  data?: TopProduct[];
  loading: boolean;
}

export const TopProductsTable = ({ data, loading }: TopProductsTableProps) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="rounded-xl border border-brand-border/60 bg-brand-dark p-5 space-y-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-surface-hover animate-pulse shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-40 bg-brand-surface-hover rounded animate-pulse" />
            <div className="h-3 w-56 bg-brand-surface-hover rounded animate-pulse" />
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-brand-surface-hover rounded-lg animate-pulse" />
          ))}
        </div>
        <p className="text-sm text-brand-muted">{t('common.loading')}</p>
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="rounded-xl border border-brand-border/60 bg-brand-dark p-6 flex flex-col items-center justify-center text-center py-10 md:py-14 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <div className="w-12 h-12 rounded-xl bg-brand-surface-hover flex items-center justify-center text-brand-muted/40 mb-3">
          <ChartBar size={24} weight="duotone" />
        </div>
        <p className="text-sm text-brand-muted/60">{t('reports.noSales')}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-brand-border/60 bg-brand-dark overflow-hidden transition-all duration-300 ease-out-expo hover:border-brand-gold/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-brand-border/30">
          <thead>
            <tr className="bg-brand-black/50 backdrop-blur-sm">
              <th className="hidden sm:table-cell px-3 md:px-4 py-3 text-left w-12">
                <span className="sr-only">{t('reports.rank')}</span>
                <Medal size={14} weight="duotone" className="text-brand-muted/40" />
              </th>
              <th className="px-3 md:px-4 py-3 text-left text-xs font-medium text-brand-muted/70 uppercase tracking-widest">
                {t('reports.product')}
              </th>
              <th className="px-3 md:px-4 py-3 text-right text-xs font-medium text-brand-muted/70 uppercase tracking-widest">
                {t('reports.sold')}
              </th>
              <th className="px-3 md:px-4 py-3 text-right text-xs font-medium text-brand-muted/70 uppercase tracking-widest">
                {t('reports.totalUsd')}
              </th>
              <th className="hidden md:table-cell px-3 md:px-4 py-3 text-right text-xs font-medium text-brand-muted/70 uppercase tracking-widest">
                {t('reports.totalSyp')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border/20">
            {data.map((p, i) => (
              <tr
                key={p.productId}
                className="group/row transition-all duration-300 ease-out-expo hover:bg-brand-surface-hover/50"
                style={{ animation: `fade-slide-up 0.4s ease-out ${i * 0.06}s both` }}
              >
                <td className="hidden sm:table-cell px-3 md:px-4 py-3">
                  <div className={`flex items-center justify-center w-6 h-6 md:w-7 md:h-7 rounded-lg text-[10px] md:text-xs font-bold font-mono ${
                    i === 0
                      ? 'bg-brand-gold/10 text-brand-gold'
                      : i === 1
                        ? 'bg-brand-surface-hover text-brand-muted/80'
                        : i === 2
                          ? 'bg-brand-surface-hover text-brand-muted/60'
                          : 'bg-transparent text-brand-muted/40'
                  }`}>
                    <span className={i > 2 ? 'text-[10px]' : ''}>#{i + 1}</span>
                  </div>
                </td>
                <td className="px-3 md:px-4 py-3">
                  <div className="flex items-center gap-2 md:gap-2.5">
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-brand-surface-hover flex items-center justify-center text-[10px] md:text-xs font-bold text-brand-muted/60 font-mono shrink-0">
                      {p.productName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs md:text-sm font-medium text-brand-light group-hover/row:text-brand-gold transition-colors duration-300 leading-snug">
                        {p.productName}
                      </p>
                      {p.sku && (
                        <p className="hidden md:block text-[11px] font-mono text-brand-muted/40">{p.sku}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-3 md:px-4 py-3 text-right">
                  <span className="text-xs md:text-sm font-mono font-medium text-brand-light">{p.quantitySold}</span>
                </td>
                <td className="px-3 md:px-4 py-3 text-right">
                  <span className="text-xs md:text-sm font-mono text-brand-gold">${p.totalUsd.toFixed(2)}</span>
                </td>
                <td className="hidden md:table-cell px-3 md:px-4 py-3 text-right">
                  <span className="text-xs md:text-sm font-mono text-brand-light/70">{p.totalSyp.toLocaleString()} SYP</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
