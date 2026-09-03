import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion, type Easing } from 'framer-motion';
import {
  ShoppingCart,
  WarningCircle,
  Sparkle,
  Package,
  FolderOpen,
  CurrencyDollar,
  ListNumbers,
} from '@phosphor-icons/react';
import { usePosProducts } from '@/features/pos/hooks/usePosProducts';
import { usePosCart } from '@/features/pos/hooks/usePosCart';
import { ProductGrid } from '@/features/pos/components/ProductGrid';
import { CartPanel } from '@/features/pos/components/CartPanel';
import { completeSale } from '@/features/sales/services/api';
import { useSettings } from '@/features/settings/hooks/useSettingsQuery';
import { useToastStore } from '@/features/shared/store/toastSlice';
import { Skeleton } from '@/features/shared/components/Skeleton';
import type { CartItem } from '@/types/pos';

const easeOutExpo: Easing = [0.16, 1, 0.3, 1];

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
};

const fadeSlideUp = {
  initial: { opacity: 0, y: 20, filter: 'blur(8px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.5, ease: easeOutExpo } },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.92 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: easeOutExpo } },
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

  const metrics = useMemo(() => {
    const totalItems = products.length;
    const totalStock = products.reduce((sum, p) => sum + p.quantity, 0);
    const cartValue = cart.totalUsd;
    const cartCount = cart.items.length;
    return { totalItems, totalStock, cartValue, cartCount };
  }, [products, cart]);

  const handleCheckout = async () => {
    if (cart.items.length === 0) return;

    setCheckingOut(true);
    try {
      const effectivePriceUsd = (item: CartItem) => item.customPriceUsd ?? item.product.price_usd;
      const effectivePriceSyp = (item: CartItem) => item.customPriceSyp ?? item.product.price_syp;

      // Apply the discount at the line level so the stored order total always
      // reconciles with the sum of its line items (prevents return over-credit).
      const factor = 1 - discount / 100;

      const items = cart.items.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price_usd: effectivePriceUsd(item) * factor,
        unit_price_syp: effectivePriceSyp(item) * factor,
      }));

      const discountedTotalUsd = cart.totalUsd * factor;
      const discountedTotalSyp = cart.totalSyp * factor;

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
      queryClient.invalidateQueries({ queryKey: ['sales-orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({
        predicate: (q) => String(q.queryKey[0]).startsWith('report-'),
      });
      queryClient.invalidateQueries({ queryKey: ['consignment-sales'] });

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
        className="min-h-[100dvh] relative overflow-hidden"
        variants={stagger}
        initial="initial"
        animate="animate"
      >
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: -1 }}>
          <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[var(--clr-gold)]/[0.04] blur-[120px]" />
          <div className="absolute bottom-[-15%] right-[-5%] w-[400px] h-[400px] rounded-full bg-blue-500/[0.03] blur-[100px]" />
        </div>

        <div className="px-5 md:px-8 lg:px-12 pt-10 md:pt-16 pb-16 md:pb-24 max-w-[1600px] mx-auto">
          <motion.div variants={fadeSlideUp} className="mb-10 md:mb-14">
            <Skeleton className="h-5 w-32 rounded-full mb-4" />
            <Skeleton className="h-10 w-64 rounded-2xl mb-3" />
            <Skeleton className="h-4 w-80 rounded-xl" />
          </motion.div>

          <motion.div variants={fadeSlideUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-10 md:mb-14">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 md:h-28 rounded-2xl bg-brand-dark/60 border border-brand-border/30 p-4 md:p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <Skeleton className="h-4 w-20 rounded-lg mb-3" />
                <Skeleton className="h-7 w-16 rounded-xl" />
              </div>
            ))}
          </motion.div>

          <motion.div variants={fadeSlideUp}>
            <Skeleton className="h-12 w-full rounded-2xl mb-6" />
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-40 md:h-48 rounded-2xl bg-brand-dark/60 border border-brand-border/30 p-4 md:p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                  <Skeleton className="h-4 w-24 rounded-lg mb-3" />
                  <Skeleton className="h-3 w-16 rounded-lg mb-4" />
                  <Skeleton className="h-6 w-20 rounded-xl" />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-900/15 border border-red-800/20 flex items-center justify-center">
            <WarningCircle size={28} weight="duotone" className="text-red-400/70" />
          </div>
          <p className="text-sm text-red-400/60">{t('common.error')}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-[100dvh] relative overflow-hidden">
        {/* Ambient background */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: -1 }}>
          <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[var(--clr-gold)]/[0.04] blur-[120px]" />
          <div className="absolute bottom-[-15%] right-[-5%] w-[400px] h-[400px] rounded-full bg-blue-500/[0.03] blur-[100px]" />
        </div>

        <div className="px-5 md:px-8 lg:px-12 pt-10 md:pt-16 pb-16 md:pb-24 max-w-[1600px] mx-auto">
          {/* Hero Header */}
          <motion.div
            variants={stagger}
            initial="initial"
            animate="animate"
            className="mb-10 md:mb-14"
          >
            <motion.div variants={fadeSlideUp} className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--clr-gold)]/10 border border-[var(--clr-gold)]/20 text-[var(--clr-gold)] text-[11px] font-medium tracking-wide">
                <Sparkle size={12} weight="fill" />
                {t('pos.title')}
              </span>
            </motion.div>

            <motion.h1
              variants={fadeSlideUp}
              className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold text-brand-light tracking-tight leading-[1.15] mb-3"
              style={{ fontFamily: "'Satoshi', 'Outfit', sans-serif" }}
            >
              {t('pos.title')}
            </motion.h1>

            <motion.p
              variants={fadeSlideUp}
              className="text-sm md:text-base text-brand-muted/60 max-w-lg leading-relaxed"
            >
              {t('pos.searchProducts')}
            </motion.p>
          </motion.div>

          {/* Bento Metrics */}
          <motion.div
            variants={stagger}
            initial="initial"
            animate="animate"
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-10 md:mb-14"
          >
            {[
              {
                label: t('pos.totalProducts'),
                value: metrics.totalItems.toLocaleString(),
                subtext: t('pos.stock', { count: metrics.totalStock }),
                icon: Package,
                accentColor: 'amber',
              },
              {
                label: t('pos.totalQuantity'),
                value: metrics.totalStock.toLocaleString(),
                subtext: t('inventory.inStock', { defaultValue: 'in stock' }),
                icon: ListNumbers,
                accentColor: 'blue',
              },
              {
                label: t('pos.cartItems'),
                value: metrics.cartCount.toLocaleString(),
                subtext: metrics.cartCount === 0 ? t('pos.cartEmpty') : `${metrics.cartCount} ${metrics.cartCount === 1 ? t('pos.item') : t('pos.items')}`,
                icon: FolderOpen,
                accentColor: 'purple',
              },
              {
                label: t('pos.cartTotal'),
                value: `$${metrics.cartValue.toFixed(2)}`,
                subtext: t('pos.usdTotal'),
                icon: CurrencyDollar,
                accentColor: 'emerald',
              },
            ].map((m, i) => {
              const accentStyles = {
                amber: { bg: 'from-amber-500/10 to-orange-500/5', icon: 'text-amber-400', dot: 'bg-amber-400' },
                blue: { bg: 'from-blue-500/10 to-cyan-500/5', icon: 'text-blue-400', dot: 'bg-blue-400' },
                purple: { bg: 'from-purple-500/10 to-pink-500/5', icon: 'text-purple-400', dot: 'bg-purple-400' },
                emerald: { bg: 'from-emerald-500/10 to-teal-500/5', icon: 'text-emerald-400', dot: 'bg-emerald-400' },
              };
              const style = accentStyles[m.accentColor as keyof typeof accentStyles];

              return (
                <motion.div
                  key={i}
                  variants={scaleIn}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className={`relative rounded-2xl bg-gradient-to-br ${style.bg} border border-brand-border/20 p-4 md:p-5 overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-[10px] md:text-[11px] font-semibold text-brand-muted/50 uppercase tracking-wider">
                      {m.label}
                    </span>
                    <div className={`w-9 h-9 rounded-xl bg-brand-dark/40 backdrop-blur-sm flex items-center justify-center ${style.icon}`}>
                      <m.icon size={18} weight="duotone" />
                    </div>
                  </div>
                  <p className="text-xl md:text-2xl font-bold text-brand-light font-mono tracking-tight mb-1">
                    {m.value}
                  </p>
                  <p className="text-[10px] md:text-[11px] text-brand-muted/40 truncate">
                    {m.subtext}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Product Grid */}
          <motion.div
            variants={fadeSlideUp}
            initial="initial"
            animate="animate"
          >
            <ProductGrid
              products={products}
              onAddToCart={cart.addToCart}
              search={search}
              onSearchChange={setSearch}
            />
          </motion.div>
        </div>
      </div>

      {/* Floating Cart FAB */}
      <AnimatePresence>
        {totalQty > 0 && (
          <motion.button
            key="pos-fab"
            onClick={() => setIsCartOpen(true)}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.35, ease: easeOutExpo }}
            className="fixed bottom-6 right-6 z-40 h-14 rounded-2xl bg-[var(--clr-gold)] text-brand-black shadow-[0_4px_24px_-4px_rgba(212,175,55,0.4)] flex items-center gap-2.5 px-5 transition-all duration-300 ease-out-expo active:scale-[0.92] hover:shadow-[0_6px_32px_-4px_rgba(212,175,55,0.55)] hover:-translate-y-0.5"
          >
            <ShoppingCart size={22} weight="bold" />
            <span className="text-sm font-semibold tabular-nums">${cart.totalUsd.toFixed(2)}</span>
            <span className="min-w-[22px] h-[22px] rounded-full bg-brand-black/20 text-brand-black text-[10px] font-bold font-mono flex items-center justify-center px-1 leading-none">
              {totalQty}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
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
