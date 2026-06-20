import { useState, useCallback, useMemo } from 'react';
import type { CartItem, PosProduct } from '@/types/pos';

const effectivePriceUsd = (item: CartItem) => item.customPriceUsd ?? item.product.price_usd;
const effectivePriceSyp = (item: CartItem) => item.customPriceSyp ?? item.product.price_syp;

export const usePosCart = () => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = useCallback((product: PosProduct, quantity: number = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        const newQty = existing.quantity + quantity;
        if (newQty > product.quantity) return prev;
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: newQty } : i
        );
      }
      return [...prev, { product, quantity }];
    });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) {
        return prev.filter((i) => i.product.id !== productId);
      }
      return prev.map((i) =>
        i.product.id === productId ? { ...i, quantity } : i
      );
    });
  }, []);

  const updateCustomPrice = useCallback((productId: string, field: 'usd' | 'syp', value: number, updateCurrency: boolean = true) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.product.id !== productId) return item;
        if (field === 'usd') return { ...item, customPriceUsd: value, ...(updateCurrency ? { customPriceCurrency: 'usd' } : {}) };
        return { ...item, customPriceSyp: value, ...(updateCurrency ? { customPriceCurrency: 'syp' } : {}) };
      })
    );
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totals = useMemo(() => {
    const totalUsd = items.reduce(
      (sum, i) => sum + effectivePriceUsd(i) * i.quantity,
      0
    );
    const totalSyp = items.reduce(
      (sum, i) => sum + effectivePriceSyp(i) * i.quantity,
      0
    );
    return { totalUsd, totalSyp };
  }, [items]);

  return {
    items,
    addToCart,
    updateQuantity,
    updateCustomPrice,
    removeFromCart,
    clearCart,
    ...totals,
  };
};