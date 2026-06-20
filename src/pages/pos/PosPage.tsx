import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion, type Easing } from 'framer-motion';
import { ShoppingCart, WarningCircle } from '@phosphor-icons/react';

const easeOutExpo: Easing = [0.16, 1, 0.3, 1];
import { usePosProducts } from '@/features/pos/hooks/usePosProducts';
import { usePosCart } from '@/features/pos/hooks/usePosCart';
import { ProductGrid } from '@/features/pos/components/ProductGrid';
import { CartPanel } from '@/features/pos/components/CartPanel';
import { completeSale } from '@/features/sales/services/api';
import { useSettings } from '@/features/settings/hooks/useSettingsQuery';
import { useToastStore } from '@/features/shared/store/toastSlice';
import { Skeleton } from '@/features/shared/components/Skeleton';
import type { CartItem } from '@/types/pos';

const stagger = {
  animate: { transition: { staggerChildren: 0.05 } },
};

const fadeSlideUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeOutExpo } },
};

export const PosPage = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [checkingOut, setCheckingOut] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { data: products = [], isLoading, error } = usePosProducts();
  const cart = usePosCart();
  const queryClient = useQueryClient();
  const { data: settings } = useSettings();
  const addToast = useToastStore((s) => s.addToast);
  const exchangeRate = settings?.exchangeRate ?? 0;
  const totalQty = cart.items.reduce((sum, i) => sum + i.quantity, 0);

  useEffect(() => { document.title = `${t('nav.title')} — ${t('pos.title')}`; }, [t]);

  const handleCheckout = async () => {
    if (cart.items.length === 0) return;

    setCheckingOut(true);
    try {
      const effectivePriceUsd = (item: CartItem) => item.customPriceUsd ?? item.product.price_usd;
      const effectivePriceSyp = (item: CartItem) => item.customPriceSyp ?? item.product.price_syp;

      const items = cart.items.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price_usd: effectivePriceUsd(item),
        unit_price_syp: effectivePriceSyp(item),
      }));

      const discountFraction = discount / 100;
      const discountedTotalUsd = cart.totalUsd * (1 - discountFraction);
      const discountedTotalSyp = cart.totalSyp * (1 - discountFraction);

      const result = await completeSale(discountedTotalUsd, discountedTotalSyp, items);

      if (!result.success) {
        throw new Error(result.error || t('common.error'));
      }

      cart.clearCart();
      setSearch('');
      setDiscount(0);
      setIsCartOpen(false);
      queryClient.invalidateQueries({ queryKey: ['pos-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });

      addToast(t('pos.saleComplete'), 'success');
    } catch (err) {
      addToast(err instanceof Error ? err.message : t('common.error'), 'error');
    } finally {
      setCheckingOut(false);
    }
  };

  if (isLoading) {
    return (
      <motion.div
        className="min-h-[calc(100dvh-8rem)]"
        variants={stagger}
        initial="initial"
        animate="animate"
      >
        <motion.div variants={fadeSlideUp}>
          <div className="flex items-center justify-between mb-5">
            <Skeleton className="h-7 w-36 rounded-lg" />
            <Skeleton className="h-10 w-28 rounded-xl" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-brand-dark/60 rounded-xl md:rounded-2xl border border-brand-border/30 p-4 md:p-5 space-y-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <div className="flex justify-between items-start">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-12 rounded-lg" />
                </div>
                <Skeleton className="h-3 w-16" />
                <div className="pt-4 border-t border-brand-border/20 space-y-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100dvh-8rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl md:rounded-2xl bg-red-900/15 border border-red-800/20 flex items-center justify-center">
            <WarningCircle size={28} weight="duotone" className="text-red-400/70" />
          </div>
          <p className="text-sm text-red-400/60">{t('common.error')}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-[calc(100dvh-8rem)] flex flex-col gap-4 md:gap-5">
        <div className="shrink-0 flex items-center justify-between">
          <h1 className="text-lg md:text-xl font-bold text-brand-light tracking-tight">
            {t('pos.title')}
          </h1>
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2.5 px-3.5 md:px-4 py-2 md:py-2.5 bg-brand-dark/60 backdrop-blur-sm border border-brand-border/40 rounded-xl md:rounded-2xl hover:border-brand-gold/30 hover:shadow-[0_0_20px_-8px_rgba(212,175,55,0.15)] transition-all duration-300 ease-out-expo active:scale-[0.97]"
          >
            <ShoppingCart size={18} weight="duotone" className="text-brand-gold" />
            {totalQty > 0 && (
              <>
                <span className="text-xs md:text-sm font-mono text-brand-light/70 font-medium tabular-nums leading-none">
                  ${cart.totalUsd.toFixed(2)}
                </span>
                <span className="inline-flex items-center justify-center min-w-[20px] h-5 rounded-full bg-brand-gold text-brand-black text-[10px] font-bold font-mono px-1.5 leading-none">
                  {totalQty}
                </span>
              </>
            )}
          </button>
        </div>

        <div className="flex-1 min-h-0">
          <ProductGrid
            products={products}
            onAddToCart={cart.addToCart}
            search={search}
            onSearchChange={setSearch}
          />
        </div>
      </div>

      <AnimatePresence>
        {totalQty > 0 && (
          <motion.button
            key="pos-fab"
            onClick={() => setIsCartOpen(true)}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.35, ease: easeOutExpo }}
            className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-2xl bg-brand-gold text-brand-black shadow-[0_4px_24px_-4px_rgba(212,175,55,0.4)] flex items-center justify-center transition-all duration-300 ease-out-expo active:scale-[0.92] hover:shadow-[0_6px_32px_-4px_rgba(212,175,55,0.55)] hover:-translate-y-0.5"
          >
            <ShoppingCart size={24} weight="bold" />
            <span className="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] rounded-full bg-brand-black text-brand-gold text-[10px] font-bold font-mono flex items-center justify-center px-1 border border-brand-gold/30 shadow-sm leading-none">
              {totalQty}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            key="cart-drawer"
            className="fixed inset-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsCartOpen(false)}
            />
            <motion.div
              className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-brand-dark/95 backdrop-blur-sm border-l border-brand-border/30 shadow-[var(--shadow-floating)] flex flex-col overflow-hidden"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.35, ease: easeOutExpo }}
            >
              <div className="sm:hidden w-10 h-1 rounded-full bg-brand-muted/15 mx-auto mt-3 shrink-0" />
              <div className="flex-1 overflow-hidden">
                <CartPanel
                  items={cart.items}
                  totalUsd={cart.totalUsd}
                  totalSyp={cart.totalSyp}
                  exchangeRate={exchangeRate}
                  onUpdateQuantity={cart.updateQuantity}
                  onUpdateCustomPrice={cart.updateCustomPrice}
                  onRemove={cart.removeFromCart}
                  onCheckout={handleCheckout}
                  loading={checkingOut}
                  discount={discount}
                  onDiscountChange={setDiscount}
                  onClose={() => setIsCartOpen(false)}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
