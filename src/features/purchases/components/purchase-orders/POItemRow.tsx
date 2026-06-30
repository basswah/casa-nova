import { useTranslation } from 'react-i18next';
import { Trash, Plus } from '@phosphor-icons/react';
import type { Product } from '@/types/inventory';

export interface POItemRowData {
  product_id: string;
  product_name: string;
  quantity: string;
  unit_price_usd: string;
}

interface POItemRowProps {
  item: POItemRowData;
  index: number;
  products: Product[];
  exchangeRate: number;
  canRemove: boolean;
  onItemChange: (index: number, field: keyof POItemRowData, value: string) => void;
  onRemove: (index: number) => void;
  onNewProduct: () => void;
}

const inputClass = 'w-full px-2.5 py-2 bg-brand-dark border border-brand-border rounded-lg text-sm text-brand-light placeholder-brand-muted/40 focus:outline-none focus:ring-2 focus:ring-brand-gold/25 focus:border-brand-gold/60 hover:border-brand-gold/20 transition-all duration-300 ease-out-expo';

export const POItemRow = ({ item, index, products, exchangeRate, canRemove, onItemChange, onRemove, onNewProduct }: POItemRowProps) => {
  const { t } = useTranslation();
  const qty = parseInt(item.quantity) || 0;
  const priceUsd = parseFloat(item.unit_price_usd) || 0;
  const lineUsd = qty * priceUsd;
  const lineSyp = Math.round(lineUsd * exchangeRate);

  return (
    <div className="bg-brand-black/30 rounded-xl border border-brand-border/50 p-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="sm:col-span-3">
          <label htmlFor={`po-prod-${index}`} className="block text-[11px] font-medium text-brand-muted mb-1 tracking-wide uppercase">{t('purchases.product')}</label>
          <select
            id={`po-prod-${index}`}
            value={item.product_id}
            onChange={(e) => {
              const selectedProduct = products.find((p) => p.id === e.target.value);
              onItemChange(index, 'product_id', e.target.value);
              if (selectedProduct) {
                onItemChange(index, 'product_name', selectedProduct.name);
              } else {
                onItemChange(index, 'product_name', '');
              }
            }}
            className={inputClass}
          >
            <option value="">{t('purchases.selectProduct')}</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {t('common.stock')}: {p.quantity}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button
            type="button"
            onClick={onNewProduct}
            className="w-full px-3 py-2 bg-brand-gold/10 text-brand-gold border border-brand-gold/20 rounded-lg text-xs font-medium hover:bg-brand-gold/20 transition-all duration-200 active:scale-[0.97] flex items-center justify-center gap-1.5"
          >
            <Plus size={14} weight="bold" />
            {t('purchases.newProduct', 'New')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        <div className="sm:col-span-2">
          <label htmlFor={`po-name-${index}`} className="block text-[11px] font-medium text-brand-muted mb-1 tracking-wide uppercase">{t('purchases.productName')}</label>
          <input
            id={`po-name-${index}`}
            type="text"
            value={item.product_name}
            readOnly={!!item.product_id}
            onChange={(e) => onItemChange(index, 'product_name', e.target.value)}
            placeholder={item.product_id ? '' : t('purchases.newProductName')}
            className={`${inputClass} ${item.product_id ? 'opacity-60 cursor-not-allowed' : ''}`}
          />
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
        <div>
          <label htmlFor={`po-usd-${index}`} className="block text-[11px] font-medium text-brand-muted mb-1 tracking-wide uppercase">USD</label>
          <input
            id={`po-usd-${index}`}
            type="number" step="0.01" min="0" value={item.unit_price_usd}
            onChange={(e) => onItemChange(index, 'unit_price_usd', e.target.value)}
            className={`${inputClass} font-mono`}
          />
        </div>
        <div>
          <label className="block text-[11px] font-medium text-brand-muted mb-1 tracking-wide uppercase">SYP</label>
          <div className={`${inputClass} font-mono bg-brand-black/20 text-brand-muted/60`}>
            {lineSyp > 0 ? lineSyp.toLocaleString() : '—'}
          </div>
        </div>
        <div>
          <label className="block text-[11px] font-medium text-brand-muted mb-1 tracking-wide uppercase">{t('common.total')} USD</label>
          <div className={`${inputClass} font-mono text-brand-gold`}>
            {lineUsd > 0 ? `$${lineUsd.toFixed(2)}` : '—'}
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
