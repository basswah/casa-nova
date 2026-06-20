import { useTranslation } from 'react-i18next';
import { Hash, Building, CalendarBlank, Circle } from '@phosphor-icons/react';
import type { PurchaseOrder } from '@/types/purchases';

interface PODetailInfoProps {
  order: PurchaseOrder;
}

const statusStyles: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  received: 'bg-green-500/10 text-green-400 border border-green-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border border-red-500/20',
};

const statusDots: Record<string, string> = {
  pending: 'bg-yellow-400 animate-[pulse-dot_2s_ease-in-out_infinite]',
  received: 'bg-green-400',
  cancelled: 'bg-red-400',
};

export const PODetailInfo = ({ order }: PODetailInfoProps) => {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div className="bg-brand-black/40 rounded-xl p-4 border border-white/[0.03]">
        <div className="flex items-center gap-2 mb-2">
          <Hash size={14} className="text-brand-muted" />
          <span className="text-[11px] font-medium text-brand-muted uppercase tracking-wider">{t('purchases.orderId')}</span>
        </div>
        <p className="text-sm font-mono text-brand-light break-all">{order.id.slice(0, 12)}</p>
      </div>
      <div className="bg-brand-black/40 rounded-xl p-4 border border-white/[0.03]">
        <div className="flex items-center gap-2 mb-2">
          <Building size={14} className="text-brand-muted" />
          <span className="text-[11px] font-medium text-brand-muted uppercase tracking-wider">{t('purchases.supplier')}</span>
        </div>
        <p className="text-sm text-brand-light">{order.supplier?.name || t('purchases.noSupplier')}</p>
      </div>
      <div className="bg-brand-black/40 rounded-xl p-4 border border-white/[0.03]">
        <div className="flex items-center gap-2 mb-2">
          <CalendarBlank size={14} className="text-brand-muted" />
          <span className="text-[11px] font-medium text-brand-muted uppercase tracking-wider">{t('common.date')}</span>
        </div>
        <p className="text-sm text-brand-light font-mono">
          {new Date(order.order_date).toLocaleDateString(undefined, {
            year: 'numeric', month: 'short', day: 'numeric',
          })}
        </p>
      </div>
      <div className="bg-brand-black/40 rounded-xl p-4 border border-white/[0.03]">
        <div className="flex items-center gap-2 mb-2">
          <Circle size={14} weight="fill" className="text-brand-muted" />
          <span className="text-[11px] font-medium text-brand-muted uppercase tracking-wider">{t('common.status')}</span>
        </div>
        <p className="mt-1">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium ${statusStyles[order.status] ?? ''}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusDots[order.status] ?? ''}`} />
            {order.status}
          </span>
        </p>
      </div>
    </div>
  );
};
