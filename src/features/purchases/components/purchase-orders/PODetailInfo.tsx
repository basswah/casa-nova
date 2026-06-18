import { useTranslation } from 'react-i18next';
import type { PurchaseOrder } from '@/types/purchases';

interface PODetailInfoProps {
  order: PurchaseOrder;
}

const statusStyles: Record<string, string> = {
  pending: 'bg-yellow-900/60 text-yellow-300',
  received: 'bg-green-900/60 text-green-300',
  cancelled: 'bg-red-900/60 text-red-300',
};

export const PODetailInfo = ({ order }: PODetailInfoProps) => {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-2 gap-4 mb-6 bg-brand-surface-hover rounded-xl p-4">
      <div>
        <span className="text-brand-muted text-xs tracking-wide uppercase">{t('purchases.orderId')}</span>
        <p className="text-brand-light font-mono text-xs mt-1">{order.id}</p>
      </div>
      <div>
        <span className="text-brand-muted text-xs tracking-wide uppercase">{t('purchases.supplier')}</span>
        <p className="text-brand-light mt-1">{order.supplier?.name || t('purchases.noSupplier')}</p>
      </div>
      <div>
        <span className="text-brand-muted text-xs tracking-wide uppercase">{t('common.date')}</span>
        <p className="text-brand-light mt-1">{order.order_date}</p>
      </div>
      <div>
        <span className="text-brand-muted text-xs tracking-wide uppercase">{t('common.status')}</span>
        <p className="mt-1">
          <span className={`px-3 py-1 rounded-lg text-xs font-medium inline-block ${statusStyles[order.status] ?? ''}`}>
            {order.status}
          </span>
        </p>
      </div>
    </div>
  );
};
