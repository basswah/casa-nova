import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, Trash, Minus, Plus, X, Percent, Receipt, Tag } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
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

const itemVariant = {
  initial: { opacity: 0, x: 20, filter: 'blur(4px)' },
  animate: { opacity: 1, x: 0, filter: 'blur(0px)', transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const } },
  exit: { opacity: 0, x: -20, filter: 'blur(4px)', transition: { duration: 0.2 } },
} satisfies Variants;

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
    <div className="bg-brand-dark/95 backdrop-blur-xl h-full flex flex-col shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      {/* Header */}
      <div className="p-5 md:p-6 border-b border-brand-border/15 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[var(--clr-gold)]/10 border border-[var(--clr-gold)]/20 flex items-center justify-center">
            <ShoppingCart size={16} weight="duotone" className="text-brand-gold" />
          </div>
          <div>
            <h2 className="text-sm md:text-base font-bold text-brand-light tracking-tight" style={{ fontFamily: "'Satoshi', 'Outfit', sans-serif" }}>
              {t('pos.cart', { count: items.length })}
            </h2>
            {items.length > 0 && (
              <p className="text-[10px] font-mono text-brand-muted/40 mt-0.5">
                {items.length} {items.length === 1 ? t('pos.item', 'item') : t('pos.items', 'items')}
              </p>
            )}
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-brand-muted/40 hover:text-brand-light hover:bg-brand-border/20 transition-all duration-200 active:scale-[0.9]"
            aria-label={t('common.close')}
          >
            <X size={18} weight="bold" />
          </button>
        )}
      </div>

      {/* Empty State */}
      {items.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-brand-dark/50 border border-brand-border/20 flex items-center justify-center">
              <ShoppingCart size={28} weight="duotone" className="text-brand-muted/20" />
            </div>
            <p className="text-sm text-brand-muted/50" style={{ fontFamily: "'Satoshi', 'Outfit', sans-serif" }}>{t('pos.cartEmpty')}</p>
          </div>
        </div>
      ) : (
        /* Cart Items */
        <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-3 scrollbar-thin">
          <AnimatePresence>
            {items.map((item) => {
              const hasCustomPrice = item.customPriceUsd !== undefined || item.customPriceSyp !== undefined;
              const lineTotalUsd = effectivePriceUsd(item) * item.quantity;
              const lineTotalSyp = effectivePriceSyp(item) * item.quantity;

              return (
                <motion.div
                  key={item.product.id}
                  variants={itemVariant}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  layout
                  className="bg-brand-black/30 backdrop-blur-sm rounded-2xl p-4 border border-brand-border/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
                >
                  {/* Item Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-brand-light/90 truncate leading-snug" style={{ fontFamily: "'Satoshi', 'Outfit', sans-serif" }}>
                          {item.product.name}
                        </p>
                        {item.product.is_consignment && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-900/25 border border-amber-700/30 shrink-0">
                            <Tag size={9} weight="bold" className="text-amber-400/80" />
                            <span className="text-[8px] font-semibold text-amber-400/80 leading-none">{t('pos.consignment', 'برسم البيع')}</span>
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] font-mono text-brand-muted/35 mt-0.5 tracking-tight">{item.product.sku ?? ''}</p>
                    </div>
                    <button
                      onClick={() => onRemove(item.product.id)}
                      className="shrink-0 w-8 h-8 flex items-center justify-center rounded-xl text-brand-muted/30 hover:text-red-400/80 hover:bg-red-400/8 transition-all duration-200 active:scale-[0.9]"
                      aria-label={t('pos.removeItem', '×')}
                    >
                      <Trash size={14} weight="bold" />
                    </button>
                  </div>

                  {/* Price + Currency Toggle + Quantity */}
                  <div className="flex items-center gap-2.5">
                    {/* Price Input */}
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
                        className="w-full px-3 py-2 bg-brand-black/50 border border-brand-border/30 rounded-xl text-center text-brand-light text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-gold/15 focus:border-brand-gold/40 transition-all duration-200"
                      />
                    </div>

                    {/* Currency Toggle */}
                    <div className="flex rounded-xl border border-brand-border/25 overflow-hidden shrink-0">
                      <button
                        onClick={() => setDisplayCurrency((prev) => ({ ...prev, [item.product.id]: 'usd' }))}
                        className={`px-2.5 py-2 text-[10px] font-mono font-medium leading-none transition-all duration-200 ${
                          getDisplayCurrency(item.product.id) === 'usd'
                            ? 'bg-[var(--clr-gold)]/90 text-brand-black'
                            : 'bg-transparent text-brand-muted/50 hover:text-brand-light/70'
                        }`}
                      >
                        $
                      </button>
                      <button
                        onClick={() => setDisplayCurrency((prev) => ({ ...prev, [item.product.id]: 'syp' }))}
                        className={`px-2.5 py-2 text-[10px] font-mono font-medium leading-none transition-all duration-200 ${
                          getDisplayCurrency(item.product.id) === 'syp'
                            ? 'bg-[var(--clr-gold)]/90 text-brand-black'
                            : 'bg-transparent text-brand-muted/50 hover:text-brand-light/70'
                        }`}
                      >
                        ل.س
                      </button>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-0.5 bg-brand-black/30 rounded-xl border border-brand-border/20">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-xl text-brand-muted/50 hover:text-brand-light/80 hover:bg-brand-gold/8 transition-all duration-200 active:scale-[0.9]"
                      >
                        <Minus size={12} weight="bold" />
                      </button>
                      <span className="w-7 text-center text-xs font-mono text-brand-light/80 tabular-nums leading-none">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, Math.min(item.quantity + 1, item.product.quantity))}
                        disabled={item.quantity >= item.product.quantity}
                        className="w-8 h-8 flex items-center justify-center rounded-xl text-brand-muted/50 hover:text-brand-light/80 hover:bg-brand-gold/8 transition-all duration-200 active:scale-[0.9] disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-brand-muted/50 disabled:active:scale-100"
                      >
                        <Plus size={12} weight="bold" />
                      </button>
                    </div>
                  </div>

                  {/* Conversion + Line Total */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-brand-border/10">
                    <p className="text-[10px] font-mono text-brand-muted/35 tracking-tight leading-none">
                      {exchangeRate > 0 && (
                        getDisplayCurrency(item.product.id) === 'usd'
                          ? `≈ ${effectivePriceSyp(item).toLocaleString()} ل.س`
                          : `≈ $${effectivePriceUsd(item).toFixed(2)}`
                      )}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] md:text-[11px] font-mono text-brand-muted/50 tabular-nums tracking-tight">
                        ${lineTotalUsd.toFixed(2)} / {lineTotalSyp.toLocaleString()} ل.س
                      </span>
                      {hasCustomPrice && (
                        <span className="text-[9px] font-medium text-brand-gold/70 tracking-tight">
                          {t('pos.customPriceActive')}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Footer — Totals + Checkout */}
      <div className="border-t border-brand-border/15 p-5 md:p-6 space-y-4">
        {/* Discount */}
        {items.length > 0 && (
          <div className="space-y-3 pb-4 border-b border-brand-border/10">
            {discount > 0 && (
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] text-brand-muted/50 uppercase tracking-widest font-medium">{t('common.subtotal', { defaultValue: 'Subtotal' })}</span>
                <span className="text-xs md:text-sm font-mono text-brand-light/80 font-semibold tabular-nums">${totalUsd.toFixed(2)}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-[140px]">
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
                  className="w-full pl-8 pr-7 py-2 bg-brand-black/40 border border-brand-border/25 rounded-xl text-xs text-brand-light font-mono focus:outline-none focus:ring-2 focus:ring-brand-gold/15 focus:border-brand-gold/40 transition-all duration-200"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-brand-muted/40 font-mono pointer-events-none">%</span>
              </div>
              <span className="text-[11px] text-red-400/70 font-mono whitespace-nowrap tabular-nums tracking-tight">
                -${discountUsd.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Totals */}
        <div className="space-y-2.5">
          <div className="flex justify-between items-baseline">
            <span className="text-[10px] text-brand-muted/50 uppercase tracking-widest font-medium">{t('common.total', { defaultValue: 'Total' })}</span>
            <span className="text-brand-gold font-bold font-mono text-2xl md:text-3xl tracking-tight tabular-nums">${grandTotalUsd.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-[10px] text-brand-muted/50 uppercase tracking-widest font-medium">{t('pos.sypTotal')}</span>
            <span className="text-brand-light/60 font-mono text-sm tabular-nums tracking-tight">{grandTotalSyp.toLocaleString()} ل.س</span>
          </div>
          {exchangeRate > 0 && (
            <div className="flex justify-between text-[10px] text-brand-muted/30 pt-2 border-t border-brand-border/10">
              <span className="tracking-tight">{t('pos.rate')}:</span>
              <span className="tracking-tight">{t('pos.rateValue', { rate: exchangeRate.toLocaleString() })}</span>
            </div>
          )}
        </div>

        {/* Checkout Button */}
        <motion.button
          onClick={onCheckout}
          disabled={items.length === 0 || loading}
          whileHover={{ scale: items.length > 0 && !loading ? 1.01 : 1 }}
          whileTap={{ scale: items.length > 0 && !loading ? 0.98 : 1 }}
          className="w-full py-3.5 md:py-4 bg-[var(--clr-gold)] text-brand-black font-bold rounded-2xl text-sm tracking-wide flex items-center justify-center gap-2.5
            transition-all duration-300 disabled:opacity-35 disabled:cursor-not-allowed"
          style={{ fontFamily: "'Satoshi', 'Outfit', sans-serif" }}
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-brand-black/30 border-t-brand-black rounded-full animate-spin" />
              {t('pos.processing')}
            </>
          ) : (
            <>
              <Receipt size={18} weight="bold" />
              {t('pos.checkout')}
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
};
