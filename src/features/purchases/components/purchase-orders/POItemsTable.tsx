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
    return (
      <div className="text-center py-8 bg-brand-black/30 rounded-xl border border-white/[0.03]">
        <p className="text-sm text-brand-muted/60">{t('common.noData')}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-brand-border/60">
      <table className="min-w-full divide-y divide-brand-border/50">
        <thead className="bg-brand-black/60 backdrop-blur-sm">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-brand-muted uppercase tracking-wider">{t('purchases.product')}</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-brand-muted uppercase tracking-wider">{t('common.quantity')}</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-brand-muted uppercase tracking-wider">USD</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-brand-muted uppercase tracking-wider">SYP</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-brand-muted uppercase tracking-wider">{t('purchases.lineUsd')}</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-brand-muted uppercase tracking-wider">{t('purchases.lineSyp')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-border/50">
          {items.map((item, index) => (
            <tr
              key={item.id}
              className="hover:bg-brand-surface-hover transition-colors duration-150"
              style={{ animation: `fade-slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1) both`, animationDelay: `${0.05 + index * 0.03}s` }}
            >
              <td className="px-4 py-3 text-sm text-brand-light">
                <ProductName productId={item.product_id} />
              </td>
              <td className="px-4 py-3 text-sm text-center font-mono text-brand-light tabular-nums">{item.quantity}</td>
              <td className="px-4 py-3 text-sm text-right font-mono text-brand-light tabular-nums">${item.unit_price_usd.toFixed(2)}</td>
              <td className="px-4 py-3 text-sm text-right font-mono text-brand-muted tabular-nums">{item.unit_price_syp.toLocaleString()}</td>
              <td className="px-4 py-3 text-sm text-right font-mono text-brand-gold tabular-nums font-medium">${(item.unit_price_usd * item.quantity).toFixed(2)}</td>
              <td className="px-4 py-3 text-sm text-right font-mono text-brand-muted tabular-nums">{(item.unit_price_syp * item.quantity).toLocaleString()} SYP</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
