import { useTranslation } from 'react-i18next';
import type { Product } from '@/types/inventory';

interface POItemRowData {
  product_id: string;
  quantity: string;
  unit_price_usd: string;
  unit_price_syp: string;
}

interface POItemRowProps {
  item: POItemRowData;
  index: number;
  products: Product[];
  canRemove: boolean;
  onItemChange: (index: number, field: keyof POItemRowData, value: string) => void;
  onRemove: (index: number) => void;
}

export const POItemRow = ({ item, index, products, canRemove, onItemChange, onRemove }: POItemRowProps) => {
  const { t } = useTranslation();
  return (
    <div className="flex gap-3 bg-brand-dark p-3 rounded-lg">
    <div className="flex-1 min-w-0">
      <label htmlFor={`po-prod-${index}`} className="block text-xs font-medium text-brand-muted mb-1 tracking-wide uppercase">{t('purchases.product')}</label>
      <select
        id={`po-prod-${index}`}
        value={item.product_id}
        onChange={(e) => onItemChange(index, 'product_id', e.target.value)}
        className="w-full px-2 py-1.5 bg-[var(--clr-bg)] border border-brand-border rounded-lg text-[var(--clr-text)] focus:outline-none focus:ring-2 focus:ring-brand-gold transition-all duration-200"
      >
        <option value="">{t('purchases.selectProduct')}</option>
        {products.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name} (SKU: {p.sku ?? 'N/A'}) — {t('common.stock')}: {p.quantity}
          </option>
        ))}
      </select>
    </div>
    <div className="flex-1 min-w-0 flex gap-2">
      <div>
        <label htmlFor={`po-qty-${index}`} className="block text-xs font-medium text-brand-muted mb-1 tracking-wide uppercase">{t('common.quantity')}</label>
        <input
          id={`po-qty-${index}`}
          type="number" min="1" value={item.quantity}
          onChange={(e) => onItemChange(index, 'quantity', e.target.value)}
          className="w-full px-2 py-1.5 bg-[var(--clr-bg)] border border-brand-border rounded-lg text-[var(--clr-text)] focus:outline-none focus:ring-2 focus:ring-brand-gold transition-all duration-200"
        />
      </div>
      <div>
        <label htmlFor={`po-usd-${index}`} className="block text-xs font-medium text-brand-muted mb-1 tracking-wide uppercase">USD</label>
        <input
          id={`po-usd-${index}`}
          type="number" step="0.01" min="0" value={item.unit_price_usd}
          onChange={(e) => onItemChange(index, 'unit_price_usd', e.target.value)}
          className="w-full px-2 py-1.5 bg-[var(--clr-bg)] border border-brand-border rounded-lg text-[var(--clr-text)] focus:outline-none focus:ring-2 focus:ring-brand-gold transition-all duration-200"
        />
      </div>
      <div>
        <label htmlFor={`po-syp-${index}`} className="block text-xs font-medium text-brand-muted mb-1 tracking-wide uppercase">SYP</label>
        <input
          id={`po-syp-${index}`}
          type="number" step="0.01" min="0" value={item.unit_price_syp}
          onChange={(e) => onItemChange(index, 'unit_price_syp', e.target.value)}
          className="w-full px-2 py-1.5 bg-[var(--clr-bg)] border border-brand-border rounded-lg text-[var(--clr-text)] focus:outline-none focus:ring-2 focus:ring-brand-gold transition-all duration-200"
        />
      </div>
    </div>
    <div className="flex-shrink-0 self-end pb-1">
      {canRemove && (
        <button onClick={() => onRemove(index)} className="text-red-400 hover:text-red-300 transition-colors text-lg leading-none">−</button>
      )}
    </div>
    </div>
  );
};
