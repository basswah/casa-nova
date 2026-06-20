import { useTranslation } from 'react-i18next';
import { Eye, CheckCircle, XCircle } from '@phosphor-icons/react';
import type { PurchaseOrder } from '@/types/purchases';

interface POListTableProps {
  orders: PurchaseOrder[];
  onView: (id: string) => void;
  onReceive: (order: PurchaseOrder) => void;
  onDelete: (order: PurchaseOrder) => void;
}

const StatusBadge = ({ status }: { status: string }) => {
  const { t } = useTranslation();
  const styles: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    received: 'bg-green-500/10 text-green-400 border-green-500/20',
    cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
  };
  const dots: Record<string, string> = {
    pending: 'bg-yellow-400 animate-[pulse-dot_2s_ease-in-out_infinite]',
    received: 'bg-green-400',
    cancelled: 'bg-red-400',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${styles[status] ?? ''}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[status] ?? ''}`} />
      {t(`purchases.status.${status}`, status)}
    </span>
  );
};

export const POListTable = ({ orders, onView, onReceive, onDelete }: POListTableProps) => {
  const { t } = useTranslation();

  return (
    <div className="hidden lg:block overflow-hidden rounded-xl border border-brand-border/60 bg-brand-dark">
      <table className="min-w-full divide-y divide-brand-border/50">
        <thead>
          <tr className="bg-brand-black/60 backdrop-blur-sm">
            <th className="px-5 py-3.5 text-left text-xs font-medium text-brand-muted uppercase tracking-wider">{t('purchases.supplier')}</th>
            <th className="px-5 py-3.5 text-left text-xs font-medium text-brand-muted uppercase tracking-wider">{t('common.date')}</th>
            <th className="px-5 py-3.5 text-right text-xs font-medium text-brand-muted uppercase tracking-wider">{t('common.total')} (USD)</th>
            <th className="px-5 py-3.5 text-right text-xs font-medium text-brand-muted uppercase tracking-wider">{t('common.total')} (SYP)</th>
            <th className="px-5 py-3.5 text-center text-xs font-medium text-brand-muted uppercase tracking-wider">{t('common.status')}</th>
            <th className="px-5 py-3.5 text-right text-xs font-medium text-brand-muted uppercase tracking-wider">{t('common.actions')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-border/50">
          {orders.map((order, index) => (
            <tr
              key={order.id}
              className="group hover:bg-brand-surface-hover transition-all duration-200 ease-out-expo cursor-pointer"
              onClick={() => onView(order.id)}
              style={{ animation: `fade-slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) both`, animationDelay: `${index * 0.035}s` }}
            >
              <td className="px-5 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-surface-hover flex items-center justify-center text-xs font-semibold text-brand-muted group-hover:bg-brand-gold/10 group-hover:text-brand-gold transition-all duration-200">
                    {(order.supplier?.name || '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-brand-light truncate">
                      {order.supplier?.name || t('purchases.noSupplier')}
                    </p>
                    <p className="text-xs text-brand-muted/60 font-mono mt-0.5">{order.id.slice(0, 8)}</p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-4 whitespace-nowrap text-sm text-brand-muted">
                {new Date(order.order_date).toLocaleDateString(undefined, {
                  year: 'numeric', month: 'short', day: 'numeric',
                })}
              </td>
              <td className="px-5 py-4 whitespace-nowrap text-sm text-right font-mono text-brand-light tabular-nums">
                ${order.total_usd.toFixed(2)}
              </td>
              <td className="px-5 py-4 whitespace-nowrap text-sm text-right font-mono text-brand-muted tabular-nums">
                {order.total_syp.toLocaleString()}
              </td>
              <td className="px-5 py-4 whitespace-nowrap text-center">
                <StatusBadge status={order.status} />
              </td>
              <td className="px-5 py-4 whitespace-nowrap text-right">
                <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onView(order.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-gold bg-brand-gold/5 hover:bg-brand-gold/10 rounded-lg transition-all duration-200 active:scale-[0.95]"
                  >
                    <Eye size={14} />
                    {t('common.view')}
                  </button>
                  {order.status === 'pending' && (
                    <>
                      <button
                        onClick={() => onReceive(order)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-400 bg-green-400/5 hover:bg-green-400/10 rounded-lg transition-all duration-200 active:scale-[0.95]"
                      >
                        <CheckCircle size={14} weight="fill" />
                        {t('common.receive')}
                      </button>
                      <button
                        onClick={() => onDelete(order)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-400 bg-red-400/5 hover:bg-red-400/10 rounded-lg transition-all duration-200 active:scale-[0.95]"
                      >
                        <XCircle size={14} weight="fill" />
                        {t('common.delete')}
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
