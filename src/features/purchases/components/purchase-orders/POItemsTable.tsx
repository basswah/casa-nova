import { useTranslation } from 'react-i18next';
import { useProducts } from '@/features/inventory/hooks/useProducts';
import type { PurchaseOrderItem } from '@/types/purchases';

interface POItemsTableProps {
  items: PurchaseOrderItem[];
}

const ProductName = ({ productId }: { productId: string | null }) => {
  const { data: products } = useProducts();
  if (!productId) return <span className="text-brand-muted">—</span>;
  const product = products?.find((p) => p.id === productId);
  return <span>{product?.name ?? productId.slice(0, 8)}</span>;
};

export const POItemsTable = ({ items }: POItemsTableProps) => {
  const { t } = useTranslation();
  if (items.length === 0) {
    return <p className="text-brand-muted text-center py-4">{t('common.noData')}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg">
      <table className="min-w-full divide-y divide-brand-border">
        <thead className="bg-brand-black">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-medium text-brand-muted uppercase tracking-wider">{t('purchases.product')}</th>
            <th className="px-3 py-2 text-center text-xs font-medium text-brand-muted uppercase tracking-wider">{t('common.quantity')}</th>
            <th className="px-3 py-2 text-right text-xs font-medium text-brand-muted uppercase tracking-wider">USD</th>
            <th className="px-3 py-2 text-right text-xs font-medium text-brand-muted uppercase tracking-wider">SYP</th>
            <th className="px-3 py-2 text-right text-xs font-medium text-brand-muted uppercase tracking-wider">{t('purchases.lineUsd')}</th>
            <th className="px-3 py-2 text-right text-xs font-medium text-brand-muted uppercase tracking-wider">{t('purchases.lineSyp')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-border">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-brand-surface-hover transition-colors">
              <td className="px-3 py-2 text-sm text-brand-light"><ProductName productId={item.product_id} /></td>
              <td className="px-3 py-2 text-sm text-center font-mono">{item.quantity}</td>
              <td className="px-3 py-2 text-sm text-right font-mono">${item.unit_price_usd.toFixed(2)}</td>
              <td className="px-3 py-2 text-sm text-right font-mono">{item.unit_price_syp.toLocaleString()} SYP</td>
              <td className="px-3 py-2 text-sm text-right font-mono">${(item.unit_price_usd * item.quantity).toFixed(2)}</td>
              <td className="px-3 py-2 text-sm text-right font-mono">{(item.unit_price_syp * item.quantity).toLocaleString()} SYP</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
