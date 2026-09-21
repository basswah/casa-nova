import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, Trash, Minus, Plus, X, Percent, Receipt, Tag, Package } from '@phosphor-icons/react';
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
  initial: { opacity: 0, x: 24, scale: 0.97 },
  animate: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const } },
  exit: { opacity: 0, x: -16, scale: 0.97, transition: { duration: 0.2 } },
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
    <div className="h-full flex flex-col bg-brand-dark/95 backdrop-blur-2xl">
      {/* Header — Premium */}
      <div className="p-5 md:p-6 border-b border-brand-border/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[var(--clr-gold)]/[0.08] border border-[var(--clr-gold)]/15 flex items-center justify-center">
            <ShoppingCart size={18} weight="duotone" className="text-[var(--clr-gold)]/80" />
          </div>
          <div>
            <h2 className="text-sm md:text-[15px] font-bold text-brand-light tracking-tight" style={{ fontFamily: "'Satoshi', 'Outfit', sans-serif" }}>
              {t('pos.cart', { count: items.length })}
            </h2>
            {items.length > 0 && (
              <p className="text-[10px] font-mono text-brand-muted/35 mt-0.5 tabular-nums">
                {items.length} {items.length === 1 ? t('pos.item', 'item') : t('pos.items', 'items')}
              </p>
            )}
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-brand-muted/30 hover:text-brand-light/70 hover:bg-brand-border/15 transition-all duration-200 active:scale-[0.9] cursor-pointer"
            aria-label={t('common.close')}
          >
            <X size={18} weight="bold" />
          </button>
        )}
      </div>

      {/* Empty State — Elegant */}
      {items.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-brand-dark/50 border border-brand-border/15 flex items-center justify-center">
              <ShoppingCart size={32} weight="duotone" className="text-brand-muted/15" />
            </div>
            <p className="text-sm font-medium text-brand-muted/40 mb-1" style={{ fontFamily: "'Satoshi', 'Outfit', sans-serif" }}>
              {t('pos.cartEmpty')}
            </p>
            <p className="text-[11px] text-brand-muted/25">
              Tap products to add them
            </p>
          </div>
        </div>
      ) : (
        /* Cart Items — Refined */
        <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-2.5 scrollbar-thin">
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
                  className="bg-brand-black/25 backdrop-blur-sm rounded-2xl p-4 border border-brand-border/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]"
                >
                  {/* Item Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0 flex-1 flex items-start gap-3">
                      {/* Thumbnail */}
                      <div className="w-11 h-11 rounded-xl overflow-hidden bg-brand-black/30 border border-brand-border/15 shrink-0">
                        {item.product.image_url ? (
                          <img
                            src={item.product.image_url}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={14} weight="duotone" className="text-brand-muted/15" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-[13px] font-semibold text-brand-light/85 truncate leading-snug" style={{ fontFamily: "'Satoshi', 'Outfit', sans-serif" }}>
                            {item.product.name}
                          </p>
                          {item.product.is_consignment && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-900/25 border border-amber-700/20 shrink-0">
                              <Tag size={8} weight="bold" className="text-amber-400/70" />
                              <span className="text-[8px] font-semibold text-amber-400/70 leading-none">{t('pos.consignment', 'برسم البيع')}</span>
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] font-mono text-brand-muted/25 mt-0.5 tracking-tight">{item.product.sku ?? ''}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => onRemove(item.product.id)}
                      className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-brand-muted/20 hover:text-red-400/70 hover:bg-red-400/[0.06] transition-all duration-200 active:scale-[0.9] cursor-pointer"
                      aria-label={t('pos.removeItem', 'Remove item')}
                    >
                      <Trash size={13} weight="bold" />
                    </button>
                  </div>

                  {/* Price + Currency Toggle + Quantity */}
                  <div className="flex items-center gap-2">
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
                        className="w-full px-3 py-2.5 bg-brand-black/40 border border-brand-border/20 rounded-xl text-center text-brand-light text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-gold/10 focus:border-brand-gold/30 transition-all duration-200 tabular-nums"
                      />
                    </div>

                    {/* Currency Toggle */}
                    <div className="flex rounded-xl border border-brand-border/20 overflow-hidden shrink-0">
                      <button
                        onClick={() => setDisplayCurrency((prev) => ({ ...prev, [item.product.id]: 'usd' }))}
                        className={`px-2.5 py-2.5 text-[10px] font-mono font-medium leading-none transition-all duration-200 cursor-pointer ${
                          getDisplayCurrency(item.product.id) === 'usd'
                            ? 'bg-[var(--clr-gold)]/80 text-brand-black'
                            : 'bg-transparent text-brand-muted/40 hover:text-brand-light/60'
                        }`}
                      >
                        $
                      </button>
                      <button
                        onClick={() => setDisplayCurrency((prev) => ({ ...prev, [item.product.id]: 'syp' }))}
                        className={`px-2.5 py-2.5 text-[10px] font-mono font-medium leading-none transition-all duration-200 cursor-pointer ${
                          getDisplayCurrency(item.product.id) === 'syp'
                            ? 'bg-[var(--clr-gold)]/80 text-brand-black'
                            : 'bg-transparent text-brand-muted/40 hover:text-brand-light/60'
                        }`}
                      >
                        ل.س
                      </button>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-0.5 bg-brand-black/25 rounded-xl border border-brand-border/15">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-brand-muted/40 hover:text-brand-light/70 hover:bg-brand-gold/[0.06] transition-all duration-200 active:scale-[0.9] cursor-pointer"
                      >
                        <Minus size={12} weight="bold" />
                      </button>
                      <span className="w-7 text-center text-xs font-mono text-brand-light/75 tabular-nums leading-none select-none">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, Math.min(item.quantity + 1, item.product.quantity))}
                        disabled={item.quantity >= item.product.quantity}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-brand-muted/40 hover:text-brand-light/70 hover:bg-brand-gold/[0.06] transition-all duration-200 active:scale-[0.9] disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-brand-muted/40 disabled:active:scale-100 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <Plus size={12} weight="bold" />
                      </button>
                    </div>
                  </div>

                  {/* Conversion + Line Total */}
                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-brand-border/[0.06]">
                    <p className="text-[10px] font-mono text-brand-muted/25 tracking-tight leading-none">
                      {exchangeRate > 0 && (
                        getDisplayCurrency(item.product.id) === 'usd'
                          ? `≈ ${effectivePriceSyp(item).toLocaleString()} ل.س`
                          : `≈ $${effectivePriceUsd(item).toFixed(2)}`
                      )}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] md:text-[11px] font-mono text-brand-muted/40 tabular-nums tracking-tight">
                        ${lineTotalUsd.toFixed(2)} / {lineTotalSyp.toLocaleString()} ل.س
                      </span>
                      {hasCustomPrice && (
                        <span className="text-[9px] font-medium text-[var(--clr-gold)]/60 tracking-tight">
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

      {/* Footer — Premium Checkout */}
      <div className="border-t border-brand-border/10 p-5 md:p-6 space-y-4 shrink-0">
        {/* Discount */}
        {items.length > 0 && (
          <div className="space-y-3 pb-4 border-b border-brand-border/[0.06]">
            {discount > 0 && (
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] text-brand-muted/40 uppercase tracking-widest font-medium">{t('common.subtotal', { defaultValue: 'Subtotal' })}</span>
                <span className="text-xs md:text-sm font-mono text-brand-light/70 font-semibold tabular-nums">${totalUsd.toFixed(2)}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-[140px]">
                <label htmlFor="cart-discount" className="sr-only">{t('pos.discount', { defaultValue: 'Discount' })}</label>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-brand-muted/25">
                  <Percent size={11} weight="bold" />
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
                  className="w-full pl-8 pr-7 py-2.5 bg-brand-black/35 border border-brand-border/20 rounded-xl text-xs text-brand-light font-mono focus:outline-none focus:ring-2 focus:ring-brand-gold/10 focus:border-brand-gold/30 transition-all duration-200 tabular-nums"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-brand-muted/30 font-mono pointer-events-none">%</span>
              </div>
              {discount > 0 && (
                <span className="text-[11px] text-red-400/60 font-mono whitespace-nowrap tabular-nums tracking-tight">
                  -${discountUsd.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Totals */}
        <div className="space-y-2">
          <div className="flex justify-between items-baseline">
            <span className="text-[10px] text-brand-muted/40 uppercase tracking-widest font-medium">{t('common.total', { defaultValue: 'Total' })}</span>
            <span className="text-[var(--clr-gold)] font-bold font-mono text-2xl md:text-[1.75rem] tracking-tight tabular-nums leading-none">${grandTotalUsd.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-[10px] text-brand-muted/40 uppercase tracking-widest font-medium">{t('pos.sypTotal')}</span>
            <span className="text-brand-light/50 font-mono text-sm tabular-nums tracking-tight">{grandTotalSyp.toLocaleString()} ل.س</span>
          </div>
          {exchangeRate > 0 && (
            <div className="flex justify-between text-[10px] text-brand-muted/20 pt-2 border-t border-brand-border/[0.06]">
              <span className="tracking-tight">{t('pos.rate')}:</span>
              <span className="tracking-tight">{t('pos.rateValue', { rate: exchangeRate.toLocaleString() })}</span>
            </div>
          )}
        </div>

        {/* Checkout Button — Premium */}
        <motion.button
          onClick={onCheckout}
          disabled={items.length === 0 || loading}
          whileHover={{ scale: items.length > 0 && !loading ? 1.01 : 1 }}
          whileTap={{ scale: items.length > 0 && !loading ? 0.98 : 1 }}
          className="relative w-full py-4 rounded-2xl overflow-hidden text-sm font-bold tracking-wide flex items-center justify-center gap-2.5
            transition-all duration-300 disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer"
          style={{ fontFamily: "'Satoshi', 'Outfit', sans-serif" }}
        >
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--clr-gold)] to-[var(--clr-gold-hover)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.12] to-transparent" />

          {/* Glow effect */}
          <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-white/[0.06] to-transparent" />

          <div className="relative flex items-center justify-center gap-2.5">
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-brand-black/25 border-t-brand-black rounded-full animate-spin" />
                <span className="text-brand-black">{t('pos.processing')}</span>
              </>
            ) : (
              <>
                <Receipt size={18} weight="bold" className="text-brand-black" />
                <span className="text-brand-black">{t('pos.checkout')}</span>
              </>
            )}
          </div>
        </motion.button>
      </div>
    </div>
  );
};
