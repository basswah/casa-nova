import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { usePosProducts } from '@/features/pos/hooks/usePosProducts';
import { usePosCart } from '@/features/pos/hooks/usePosCart';
import { ProductGrid } from '@/features/pos/components/ProductGrid';
import { CartPanel } from '@/features/pos/components/CartPanel';
import { completeSale } from '@/features/sales/services/api';
import { useSettings } from '@/features/settings/hooks/useSettingsQuery';
import { useToastStore } from '@/features/shared/store/toastSlice';
import { SkeletonCard } from '@/features/shared/components/Skeleton';
import type { CartItem } from '@/types/pos';

export const PosPage = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [checkingOut, setCheckingOut] = useState(false);
  const { data: products = [], isLoading, error } = usePosProducts();
  const cart = usePosCart();
  const queryClient = useQueryClient();
  const { data: settings } = useSettings();
  const addToast = useToastStore((s) => s.addToast);
  const exchangeRate = settings?.exchangeRate ?? 0;

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

      const result = await completeSale(cart.totalUsd, cart.totalSyp, items);

      if (!result.success) {
        throw new Error(result.error || t('common.error'));
      }

      cart.clearCart();
      setSearch('');
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
      <div className="h-[calc(100vh-120px)] flex gap-6">
        <div className="flex-1 grid grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="w-80"><SkeletonCard /></div>
      </div>
    );
  }

  if (error) {
    return <p className="text-red-400 text-center py-12">{t('common.error')}</p>;
  }

  return (
    <div className="h-[calc(100vh-120px)] flex gap-6">
      <div className="flex-1 overflow-y-auto">
        <ProductGrid
          products={products}
          onAddToCart={cart.addToCart}
          search={search}
          onSearchChange={setSearch}
        />
      </div>
      <div className="w-80 flex-shrink-0">
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
        />
      </div>
    </div>
  );
};