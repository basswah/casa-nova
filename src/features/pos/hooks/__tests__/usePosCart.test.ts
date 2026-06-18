import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePosCart } from '../usePosCart';
import type { PosProduct } from '@/types/pos';

const mockProduct: PosProduct = {
  id: 'prod-1',
  name: 'Test Product',
  sku: 'SKU-001',
  price_usd: 25.00,
  price_syp: 312500,
  cost_usd: 15.00,
  cost_syp: 187500,
  quantity: 10,
};

const mockProduct2: PosProduct = {
  id: 'prod-2',
  name: 'Test Product 2',
  sku: 'SKU-002',
  price_usd: 50.00,
  price_syp: 625000,
  cost_usd: 30.00,
  cost_syp: 375000,
  quantity: 5,
};

describe('usePosCart', () => {
  it('starts with empty cart', () => {
    const { result } = renderHook(() => usePosCart());
    expect(result.current.items).toEqual([]);
    expect(result.current.totalUsd).toBe(0);
    expect(result.current.totalSyp).toBe(0);
  });

  it('adds item to cart', () => {
    const { result } = renderHook(() => usePosCart());

    act(() => {
      result.current.addToCart(mockProduct, 2);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].product.id).toBe('prod-1');
    expect(result.current.items[0].quantity).toBe(2);
  });

  it('defaults quantity to 1 when not specified', () => {
    const { result } = renderHook(() => usePosCart());

    act(() => {
      result.current.addToCart(mockProduct);
    });

    expect(result.current.items[0].quantity).toBe(1);
  });

  it('increments quantity when adding same product', () => {
    const { result } = renderHook(() => usePosCart());

    act(() => {
      result.current.addToCart(mockProduct, 2);
    });
    act(() => {
      result.current.addToCart(mockProduct, 3);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(5);
  });

  it('does not exceed available stock', () => {
    const { result } = renderHook(() => usePosCart());

    act(() => {
      result.current.addToCart(mockProduct, 8);
    });
    act(() => {
      result.current.addToCart(mockProduct, 5);
    });

    expect(result.current.items[0].quantity).toBe(8);
  });

  it('adds different products separately', () => {
    const { result } = renderHook(() => usePosCart());

    act(() => {
      result.current.addToCart(mockProduct, 1);
    });
    act(() => {
      result.current.addToCart(mockProduct2, 2);
    });

    expect(result.current.items).toHaveLength(2);
  });

  it('updates quantity', () => {
    const { result } = renderHook(() => usePosCart());

    act(() => {
      result.current.addToCart(mockProduct, 1);
    });
    act(() => {
      result.current.updateQuantity('prod-1', 5);
    });

    expect(result.current.items[0].quantity).toBe(5);
  });

  it('removes item when quantity is set to 0', () => {
    const { result } = renderHook(() => usePosCart());

    act(() => {
      result.current.addToCart(mockProduct, 1);
    });
    act(() => {
      result.current.updateQuantity('prod-1', 0);
    });

    expect(result.current.items).toHaveLength(0);
  });

  it('removes item when quantity is negative', () => {
    const { result } = renderHook(() => usePosCart());

    act(() => {
      result.current.addToCart(mockProduct, 1);
    });
    act(() => {
      result.current.updateQuantity('prod-1', -1);
    });

    expect(result.current.items).toHaveLength(0);
  });

  it('removes item from cart', () => {
    const { result } = renderHook(() => usePosCart());

    act(() => {
      result.current.addToCart(mockProduct, 1);
    });
    act(() => {
      result.current.addToCart(mockProduct2, 1);
    });
    act(() => {
      result.current.removeFromCart('prod-1');
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].product.id).toBe('prod-2');
  });

  it('clears entire cart', () => {
    const { result } = renderHook(() => usePosCart());

    act(() => {
      result.current.addToCart(mockProduct, 1);
    });
    act(() => {
      result.current.addToCart(mockProduct2, 1);
    });
    act(() => {
      result.current.clearCart();
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.totalUsd).toBe(0);
    expect(result.current.totalSyp).toBe(0);
  });

  it('calculates totals correctly', () => {
    const { result } = renderHook(() => usePosCart());

    act(() => {
      result.current.addToCart(mockProduct, 2);
    });
    act(() => {
      result.current.addToCart(mockProduct2, 1);
    });

    expect(result.current.totalUsd).toBe(100.00);
    expect(result.current.totalSyp).toBe(1250000);
  });

  it('sets custom USD price', () => {
    const { result } = renderHook(() => usePosCart());

    act(() => {
      result.current.addToCart(mockProduct, 1);
    });
    act(() => {
      result.current.updateCustomPrice('prod-1', 'usd', 30.00);
    });

    expect(result.current.items[0].customPriceUsd).toBe(30.00);
    expect(result.current.totalUsd).toBe(30.00);
  });

  it('sets custom SYP price', () => {
    const { result } = renderHook(() => usePosCart());

    act(() => {
      result.current.addToCart(mockProduct, 1);
    });
    act(() => {
      result.current.updateCustomPrice('prod-1', 'syp', 400000);
    });

    expect(result.current.items[0].customPriceSyp).toBe(400000);
    expect(result.current.totalSyp).toBe(400000);
  });

  it('uses default price when no custom price set', () => {
    const { result } = renderHook(() => usePosCart());

    act(() => {
      result.current.addToCart(mockProduct, 3);
    });

    expect(result.current.totalUsd).toBe(75.00);
    expect(result.current.totalSyp).toBe(937500);
  });
});
