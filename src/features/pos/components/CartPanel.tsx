import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, Trash, Minus, Plus, X, Percent } from '@phosphor-icons/react';
import type { CartItem } from '@/types/pos';

interface CartPanelProps {
  items: CartItem[];
  totalUsd: number;
  totalSyp: number;
  exchangeRate: number;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onUpdateCustomPrice: (productId: string, field: 'usd' | 'syp', value: number, updateCurrency?: boolean) => void;
  onRemove: (productId: string) => void;
  onCheckout: () => void;
  loading?: boolean;
  discount?: number;
  onDiscountChange?: (value: number) => void;
  onClose?: () => void;
}

const inputBase = 'w-full px-2.5 py-1.5 bg-brand-black/60 border border-brand-border/40 rounded-lg md:rounded-xl text-center text-brand-light text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold/50 transition-all duration-200';

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
  discount = 0,
  onDiscountChange,
  onClose,
}: CartPanelProps) => {
  const { t } = useTranslation();
  const [displayCurrency, setDisplayCurrency] = useState<Record<string, 'usd' | 'syp'>>({});

  const getDisplayCurrency = useCallback((id: string) => displayCurrency[id] ?? 'usd', [displayCurrency]);

  const effectivePriceUsd = (item: CartItem) => item.customPriceUsd ?? item.product.price_usd;
  const effectivePriceSyp = (item: CartItem) => item.customPriceSyp ?? item.product.price_syp;

  const discountFraction = discount / 100;
  const discountUsd = totalUsd * discountFraction;
  const discountSyp = totalSyp * discountFraction;
  const grandTotalUsd = totalUsd - discountUsd;
  const grandTotalSyp = totalSyp - discountSyp;

  return (
    <div className="bg-brand-dark/90 backdrop-blur-sm h-full flex flex-col shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="p-4 md:p-5 border-b border-brand-border/20 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <ShoppingCart size={18} weight="duotone" className="text-brand-gold" />
          <h2 className="text-sm md:text-base font-bold text-brand-gold tracking-tight">
            {t('pos.cart', { count: items.length })}
          </h2>
          {items.length > 0 && (
            <span className="text-[10px] font-mono font-medium text-brand-muted/50 bg-brand-black/40 px-2 py-0.5 rounded-md leading-none">
              {items.length}
            </span>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg md:rounded-xl text-brand-muted/40 hover:text-brand-light hover:bg-brand-black/40 transition-all duration-150 active:scale-[0.9]"
            aria-label="Close"
          >
            <X size={16} weight="bold" />
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl md:rounded-2xl bg-brand-dark/50 border border-brand-border/20 flex items-center justify-center">
              <ShoppingCart size={24} weight="duotone" className="text-brand-muted/20" />
            </div>
            <p className="text-sm text-brand-muted/50">{t('pos.cartEmpty')}</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-2.5 scrollbar-thin">
          {items.map((item, idx) => {
            const hasCustomPrice = item.customPriceUsd !== undefined || item.customPriceSyp !== undefined;
            const lineTotalUsd = effectivePriceUsd(item) * item.quantity;
            const lineTotalSyp = effectivePriceSyp(item) * item.quantity;

            return (
              <div
                key={item.product.id}
                className="bg-brand-black/30 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-brand-border/20 space-y-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
                style={{ animation: `fade-slide-up 0.35s ease-out ${idx * 0.05}s both` }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-brand-light/90 truncate leading-snug">{item.product.name}</p>
                    <p className="text-[10px] font-mono text-brand-muted/40 mt-0.5 tracking-tight">{item.product.sku ?? ''}</p>
                  </div>
                  <button
                    onClick={() => onRemove(item.product.id)}
                    className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-brand-muted/30 hover:text-red-400/80 hover:bg-red-400/8 transition-all duration-150 active:scale-[0.9]"
                    aria-label={t('pos.removeItem', '×')}
                  >
                    <Trash size={14} weight="bold" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      id={`cp-value-${item.product.id}`}
                      type="number"
                      min="0"
                      step={getDisplayCurrency(item.product.id) === 'syp' ? '1' : '0.01'}
                      value={getDisplayCurrency(item.product.id) === 'syp' ? effectivePriceSyp(item) : effectivePriceUsd(item)}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        const currency = getDisplayCurrency(item.product.id);
                        if (currency === 'usd') {
                          onUpdateCustomPrice(item.product.id, 'usd', value);
                          if (exchangeRate > 0) {
                            onUpdateCustomPrice(item.product.id, 'syp', Math.round(value * exchangeRate), false);
                          }
                        } else {
                          onUpdateCustomPrice(item.product.id, 'syp', value);
                          if (exchangeRate > 0) {
                            onUpdateCustomPrice(item.product.id, 'usd', parseFloat((value / exchangeRate).toFixed(2)), false);
                          }
                        }
                      }}
                      className={inputBase}
                    />
                  </div>

                  <div className="flex rounded-lg md:rounded-xl border border-brand-border/30 overflow-hidden shrink-0">
                    <button
                      onClick={() => setDisplayCurrency((prev) => ({ ...prev, [item.product.id]: 'usd' }))}
                      className={`px-2 md:px-2.5 py-1.5 text-[10px] font-mono font-medium leading-none transition-all duration-150 ${
                        getDisplayCurrency(item.product.id) === 'usd'
                          ? 'bg-brand-gold/90 text-brand-black'
                          : 'bg-transparent text-brand-muted/50 hover:text-brand-light/70'
                      }`}
                    >
                      USD
                    </button>
                    <button
                      onClick={() => setDisplayCurrency((prev) => ({ ...prev, [item.product.id]: 'syp' }))}
                      className={`px-2 md:px-2.5 py-1.5 text-[10px] font-mono font-medium leading-none transition-all duration-150 ${
                        getDisplayCurrency(item.product.id) === 'syp'
                          ? 'bg-brand-gold/90 text-brand-black'
                          : 'bg-transparent text-brand-muted/50 hover:text-brand-light/70'
                      }`}
                    >
                      SYP
                    </button>
                  </div>

                  <div className="flex items-center gap-0.5 bg-brand-black/30 rounded-lg md:rounded-xl border border-brand-border/20">
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                      className="w-7 md:w-8 h-7 md:h-8 flex items-center justify-center rounded-lg md:rounded-xl text-brand-muted/50 hover:text-brand-light/80 hover:bg-brand-gold/8 transition-all duration-150 active:scale-[0.9]"
                    >
                      <Minus size={12} weight="bold" />
                    </button>
                    <span className="w-6 md:w-7 text-center text-xs md:text-sm font-mono text-brand-light/80 tabular-nums leading-none">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, Math.min(item.quantity + 1, item.product.quantity))}
                      disabled={item.quantity >= item.product.quantity}
                      className="w-7 md:w-8 h-7 md:h-8 flex items-center justify-center rounded-lg md:rounded-xl text-brand-muted/50 hover:text-brand-light/80 hover:bg-brand-gold/8 transition-all duration-150 active:scale-[0.9] disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-brand-muted/50 disabled:active:scale-100"
                    >
                      <Plus size={12} weight="bold" />
                    </button>
                  </div>
                </div>

                {exchangeRate > 0 && (
                  <p className="text-[10px] font-mono text-brand-muted/35 text-right tracking-tight leading-none">
                    {getDisplayCurrency(item.product.id) === 'usd'
                      ? `≈ ${effectivePriceSyp(item).toLocaleString()} SYP`
                      : `≈ $${effectivePriceUsd(item).toFixed(2)}`
                    }
                  </p>
                )}

                <div className="flex items-center justify-between pt-2.5 border-t border-brand-border/15">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] md:text-[11px] font-mono text-brand-muted/60 tabular-nums tracking-tight">
                      ${lineTotalUsd.toFixed(2)} / {lineTotalSyp.toLocaleString()} SYP
                    </span>
                    {hasCustomPrice && (
                      <span className="text-[9px] font-medium text-brand-gold/70 tracking-tight">
                        {t('pos.customPriceActive')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="border-t border-brand-border/20 p-4 md:p-5 space-y-3">
        {items.length > 0 && (
          <div className="space-y-3 pb-3 md:pb-4 border-b border-brand-border/15">
            {discount > 0 && (
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] text-brand-muted/50 uppercase tracking-widest font-medium">{t('common.subtotal', { defaultValue: 'Subtotal' })}</span>
                <span className="text-xs md:text-sm font-mono text-brand-light/80 font-semibold tabular-nums">${totalUsd.toFixed(2)}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-[130px] md:max-w-[140px]">
                <label htmlFor="cart-discount" className="sr-only">{t('pos.discount', { defaultValue: 'Discount' })}</label>
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-brand-muted/30">
                  <Percent size={12} weight="bold" />
                </div>
                <input
                  id="cart-discount"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={discount}
                  onChange={(e) => {
                    const val = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                    onDiscountChange?.(val);
                  }}
                  className="w-full pl-8 pr-7 py-1.5 bg-brand-black/40 border border-brand-border/30 rounded-lg md:rounded-xl text-xs text-brand-light font-mono focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold/50 transition-all duration-200"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-brand-muted/40 font-mono pointer-events-none">%</span>
              </div>
              <span className="text-[11px] text-red-400/70 font-mono whitespace-nowrap tabular-nums tracking-tight">
                -${discountUsd.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex justify-between items-baseline">
            <span className="text-[10px] text-brand-muted/50 uppercase tracking-widest font-medium">{t('common.total', { defaultValue: 'Total' })}</span>
            <span className="text-brand-gold font-bold font-mono text-xl md:text-2xl tracking-tight tabular-nums">${grandTotalUsd.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-[10px] text-brand-muted/50 uppercase tracking-widest font-medium">{t('pos.sypTotal')}</span>
            <span className="text-brand-light/70 font-mono text-xs md:text-sm tabular-nums tracking-tight">{grandTotalSyp.toLocaleString()} SYP</span>
          </div>
          {exchangeRate > 0 && (
            <div className="flex justify-between text-[10px] text-brand-muted/35 pt-2 border-t border-brand-border/15">
              <span className="tracking-tight">{t('pos.rate')}:</span>
              <span className="tracking-tight">{t('pos.rateValue', { rate: exchangeRate.toLocaleString() })}</span>
            </div>
          )}
        </div>

        <button
          onClick={onCheckout}
          disabled={items.length === 0 || loading}
          className="w-full py-3 md:py-3.5 bg-brand-gold text-brand-black font-semibold rounded-xl md:rounded-2xl text-sm tracking-wide
            hover:bg-[var(--clr-gold-hover)] hover:shadow-[0_0_28px_-6px_rgba(212,175,55,0.3)] hover:-translate-y-0.5
            transition-all duration-300 ease-out-expo disabled:opacity-35 disabled:cursor-not-allowed
            active:scale-[0.97]"
        >
          {loading ? t('pos.processing') : t('pos.checkout')}
        </button>
      </div>
    </div>
  );
};
