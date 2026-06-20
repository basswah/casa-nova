import { useTranslation } from 'react-i18next';
import { Trash } from '@phosphor-icons/react';
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

const inputClass = 'w-full px-2.5 py-2 bg-brand-dark border border-brand-border rounded-lg text-sm text-brand-light placeholder-brand-muted/40 focus:outline-none focus:ring-2 focus:ring-brand-gold/25 focus:border-brand-gold/60 hover:border-brand-gold/20 transition-all duration-300 ease-out-expo';

export const POItemRow = ({ item, index, products, canRemove, onItemChange, onRemove }: POItemRowProps) => {
  const { t } = useTranslation();
  return (
    <div className="bg-brand-black/30 rounded-xl border border-brand-border/50 p-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="sm:col-span-2">
          <label htmlFor={`po-prod-${index}`} className="block text-[11px] font-medium text-brand-muted mb-1 tracking-wide uppercase">{t('purchases.product')}</label>
          <select
            id={`po-prod-${index}`}
            value={item.product_id}
            onChange={(e) => onItemChange(index, 'product_id', e.target.value)}
            className={inputClass}
          >
            <option value="">{t('purchases.selectProduct')}</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (SKU: {p.sku ?? 'N/A'}) — {t('common.stock')}: {p.quantity}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`po-qty-${index}`} className="block text-[11px] font-medium text-brand-muted mb-1 tracking-wide uppercase">{t('common.quantity')}</label>
          <input
            id={`po-qty-${index}`}
            type="number" min="1" value={item.quantity}
            onChange={(e) => onItemChange(index, 'quantity', e.target.value)}
            className={`${inputClass} font-mono`}
          />
        </div>
        <div className="flex gap-2 sm:block">
          <div className="flex-1 sm:mb-0">
            <label htmlFor={`po-usd-${index}`} className="block text-[11px] font-medium text-brand-muted mb-1 tracking-wide uppercase">USD</label>
            <input
              id={`po-usd-${index}`}
              type="number" step="0.01" min="0" value={item.unit_price_usd}
              onChange={(e) => onItemChange(index, 'unit_price_usd', e.target.value)}
              className={`${inputClass} font-mono`}
            />
          </div>
          <div className="flex-1">
            <label htmlFor={`po-syp-${index}`} className="block text-[11px] font-medium text-brand-muted mb-1 tracking-wide uppercase">SYP</label>
            <input
              id={`po-syp-${index}`}
              type="number" step="0.01" min="0" value={item.unit_price_syp}
              onChange={(e) => onItemChange(index, 'unit_price_syp', e.target.value)}
              className={`${inputClass} font-mono`}
            />
          </div>
        </div>
      </div>
      {canRemove && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-400 bg-red-400/5 hover:bg-red-400/10 rounded-lg transition-all duration-200 active:scale-[0.95]"
          >
            <Trash size={14} />
            {t('common.remove')}
          </button>
        </div>
      )}
    </div>
  );
};
