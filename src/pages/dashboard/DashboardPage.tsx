import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDashboard } from '@/features/dashboard/hooks/useDashboard';

export const DashboardPage = () => {
  const { t } = useTranslation();
  const { data, isLoading, error } = useDashboard();

  useEffect(() => { document.title = `${t('nav.title')} — ${t('dashboard.title')}`; }, [t]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-brand-dark rounded-xl p-5 border border-brand-border h-24" />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return <p className="text-red-400 text-center py-12">{t('common.error')}</p>;
  }

  const cards = [
    { label: t('dashboard.todaySalesUsd'), value: `$${data.todaySalesUsd.toFixed(2)}`, color: 'text-green-400' },
    { label: t('dashboard.todaySalesSyp'), value: `${data.todaySalesSyp.toLocaleString()} SYP`, color: 'text-brand-light' },
    { label: t('dashboard.todayOrders'), value: String(data.todaySalesCount), color: 'text-brand-gold' },
    { label: t('dashboard.totalProducts'), value: String(data.totalProducts), color: 'text-blue-400' },
    { label: t('dashboard.lowStock'), value: String(data.lowStockCount), color: data.lowStockCount > 0 ? 'text-red-400' : 'text-green-400' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-brand-gold tracking-tight">{t('dashboard.title')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-brand-dark rounded-xl p-5 border border-brand-border">
            <p className="text-xs font-medium text-brand-muted uppercase tracking-wider mb-1">{card.label}</p>
            <p className={`text-2xl font-bold font-mono ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-brand-dark rounded-xl p-5 border border-brand-border">
          <h2 className="text-sm font-semibold text-brand-gold mb-3">{t('dashboard.recentSales')}</h2>
          {data.recentSales.length === 0 ? (
            <p className="text-brand-muted text-sm">{t('common.noData')}</p>
          ) : (
            <ul className="space-y-2">
              {data.recentSales.map((s) => (
                <li key={s.id} className="flex justify-between items-center text-sm">
                  <span className="text-brand-muted font-mono text-xs">{s.id.slice(0, 8)}</span>
                  <span className="text-brand-light font-mono">${s.total_usd.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-brand-dark rounded-xl p-5 border border-brand-border">
          <h2 className="text-sm font-semibold text-brand-gold mb-3">{t('dashboard.recentOrders')}</h2>
          {data.recentPurchaseOrders.length === 0 ? (
            <p className="text-brand-muted text-sm">{t('common.noData')}</p>
          ) : (
            <ul className="space-y-2">
              {data.recentPurchaseOrders.map((po) => (
                <li key={po.id} className="flex justify-between items-center text-sm">
                  <span className="text-brand-muted font-mono text-xs">{po.id.slice(0, 8)}</span>
                  <span className="text-brand-light">{po.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
