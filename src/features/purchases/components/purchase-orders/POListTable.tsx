import { useTranslation } from 'react-i18next';
import type { PurchaseOrder } from '@/types/purchases';

interface POListTableProps {
  orders: PurchaseOrder[];
  onView: (id: string) => void;
  onReceive: (order: PurchaseOrder) => void;
  onDelete: (order: PurchaseOrder) => void;
}

const statusStyles: Record<string, string> = {
  pending: 'bg-yellow-900/60 text-yellow-300',
  received: 'bg-green-900/60 text-green-300',
  cancelled: 'bg-red-900/60 text-red-300',
};

const rowStyles: Record<string, string> = {
  pending: 'bg-yellow-950/30',
  received: 'bg-green-950/30',
  cancelled: 'bg-red-950/30',
};

export const POListTable = ({ orders, onView, onReceive, onDelete }: POListTableProps) => {
  const { t } = useTranslation();
  if (orders.length === 0) {
    return <p className="text-brand-muted text-center py-8">{t('purchases.noOrders')}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl">
      <table className="min-w-full divide-y divide-brand-border">
        <thead className="bg-brand-dark">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-brand-muted uppercase tracking-wider">{t('purchases.supplier')}</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-brand-muted uppercase tracking-wider">{t('common.date')}</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-brand-muted uppercase tracking-wider">{t('common.total')} (USD)</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-brand-muted uppercase tracking-wider">{t('common.total')} (SYP)</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-brand-muted uppercase tracking-wider">{t('common.status')}</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-brand-muted uppercase tracking-wider">{t('common.actions')}</th>
          </tr>
        </thead>
        <tbody className="bg-brand-black divide-y divide-brand-border">
          {orders.map((order) => (
            <tr key={order.id} className={`hover:bg-brand-surface-hover transition-colors ${rowStyles[order.status] ?? ''}`}>
              <td className="px-4 py-3 whitespace-nowrap text-sm">{order.supplier?.name || t('purchases.noSupplier')}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-brand-muted">{order.order_date}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-mono">${order.total_usd.toFixed(2)}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-mono">{order.total_syp.toLocaleString()} SYP</td>
              <td className="px-4 py-3 whitespace-nowrap text-center text-xs font-mono">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusStyles[order.status] ?? ''}`}>
                  {order.status}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                <button onClick={() => onView(order.id)} className="text-brand-gold hover:text-[var(--clr-gold-hover)] mr-2 transition-all duration-200 active:scale-[0.98]">
                  {t('common.view')}
                </button>
                {order.status === 'pending' && (
                  <>
                    <button onClick={() => onReceive(order)} className="text-brand-gold hover:text-[var(--clr-gold-hover)] mr-2 transition-all duration-200 active:scale-[0.98]">
                      {t('common.receive')}
                    </button>
                    <button onClick={() => onDelete(order)} className="text-red-400 hover:text-red-300 transition-all duration-200 active:scale-[0.98]">
                      {t('common.delete')}
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
