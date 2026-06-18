import { useTranslation } from 'react-i18next';
import type { CartItem } from '@/types/pos';

interface CartPanelProps {
  items: CartItem[];
  totalUsd: number;
  totalSyp: number;
  exchangeRate: number;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onUpdateCustomPrice: (productId: string, field: 'usd' | 'syp', value: number) => void;
  onRemove: (productId: string) => void;
  onCheckout: () => void;
  loading?: boolean;
}

const inputClass = 'w-full px-2 py-1 bg-[var(--clr-bg)] border border-brand-border rounded-lg text-center text-[var(--clr-text)] text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-gold transition-all duration-200';

export const CartPanel = ({
  items,
  totalUsd,
  totalSyp,
  exchangeRate,
  onUpdateQuantity,
  onUpdateCustomPrice,
  onRemove,
  onCheckout,
  loading,
}: CartPanelProps) => {
  const { t } = useTranslation();

  const effectivePriceUsd = (item: CartItem) => item.customPriceUsd ?? item.product.price_usd;
  const effectivePriceSyp = (item: CartItem) => item.customPriceSyp ?? item.product.price_syp;

  return (
    <div className="bg-brand-dark border border-brand-border rounded-xl p-5 h-full flex flex-col shadow-[var(--shadow-floating)]">
      <h2 className="text-lg font-bold text-brand-gold mb-4">{t('pos.cart', { count: items.length })}</h2>

      {items.length === 0 ? (
        <p className="text-brand-muted text-center py-8 flex-1">{t('pos.cartEmpty')}</p>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-2">
          {items.map((item) => {
            const hasCustomPrice = item.customPriceUsd !== undefined || item.customPriceSyp !== undefined;

            return (
              <div
                key={item.product.id}
                className="p-3 bg-brand-black rounded-lg space-y-2"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-brand-light truncate flex-1">{item.product.name}</p>
                  <button
                    onClick={() => onRemove(item.product.id)}
                    className="text-brand-muted hover:text-red-400 ml-2 flex-shrink-0 transition-colors duration-150"
                  >
                    ×
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  <div>
                    <label htmlFor={`cp-usd-${item.product.id}`} className="block text-[10px] text-brand-muted mb-0.5 font-medium tracking-wide">USD</label>
                    <input
                      id={`cp-usd-${item.product.id}`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={effectivePriceUsd(item)}
                      onChange={(e) => onUpdateCustomPrice(item.product.id, 'usd', parseFloat(e.target.value) || 0)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor={`cp-syp-${item.product.id}`} className="block text-[10px] text-brand-muted mb-0.5 font-medium tracking-wide">SYP</label>
                    <input
                      id={`cp-syp-${item.product.id}`}
                      type="number"
                      min="0"
                      step="1"
                      value={effectivePriceSyp(item)}
                      onChange={(e) => onUpdateCustomPrice(item.product.id, 'syp', parseFloat(e.target.value) || 0)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor={`cart-qty-${item.product.id}`} className="block text-[10px] text-brand-muted mb-0.5 font-medium tracking-wide">{t('common.qty')}</label>
                    <input
                      id={`cart-qty-${item.product.id}`}
                      type="number"
                      min="1"
                      max={item.product.quantity}
                      value={item.quantity}
                      onChange={(e) => onUpdateQuantity(item.product.id, parseInt(e.target.value) || 0)}
                      className={inputClass}
                    />
                  </div>
                </div>

                {hasCustomPrice && (
                  <p className="text-[10px] text-brand-gold font-medium">
                    {t('pos.customPriceActive')}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-brand-border">
        <div className="space-y-1.5 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-brand-muted">{t('pos.usdTotal')}:</span>
            <span className="text-brand-gold font-bold font-mono text-lg">${totalUsd.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-brand-muted">{t('pos.sypTotal')}:</span>
            <span className="text-brand-light font-mono">{totalSyp.toLocaleString()} SYP</span>
          </div>
          {exchangeRate > 0 && (
            <div className="flex justify-between text-xs text-brand-muted pt-1">
              <span>{t('pos.rate')}:</span>
              <span>{t('pos.rateValue', { rate: exchangeRate.toLocaleString() })}</span>
            </div>
          )}
        </div>
        <button
          onClick={onCheckout}
          disabled={items.length === 0 || loading}
          className="w-full py-3 bg-brand-gold text-brand-black font-semibold rounded-lg hover:bg-[var(--clr-gold-hover)] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          {loading ? t('pos.processing') : t('pos.checkout')}
        </button>
      </div>
    </div>
  );
};