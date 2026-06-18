import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/i18n';
import { CartPanel } from '../CartPanel';
import type { CartItem } from '@/types/pos';

const mockItem: CartItem = {
  product: {
    id: 'prod-1',
    name: 'Espresso Beans',
    sku: 'ESP-001',
    price_usd: 25.00,
    price_syp: 312500,
    cost_usd: 15.00,
    cost_syp: 187500,
    quantity: 10,
  },
  quantity: 2,
};

const mockItemWithCustomPrice: CartItem = {
  product: {
    id: 'prod-2',
    name: 'Latte Cup',
    sku: 'LAT-002',
    price_usd: 10.00,
    price_syp: 125000,
    cost_usd: 5.00,
    cost_syp: 62500,
    quantity: 20,
  },
  quantity: 3,
  customPriceUsd: 12.00,
  customPriceSyp: 150000,
};

describe('CartPanel', () => {
  const defaultProps = {
    items: [] as CartItem[],
    totalUsd: 0,
    totalSyp: 0,
    exchangeRate: 15000,
    onUpdateQuantity: vi.fn(),
    onUpdateCustomPrice: vi.fn(),
    onRemove: vi.fn(),
    onCheckout: vi.fn(),
  };

  const renderPanel = (props = {}) => {
    return render(
      <I18nextProvider i18n={i18n}>
        <CartPanel {...defaultProps} {...props} />
      </I18nextProvider>
    );
  };

  it('shows empty cart message when no items', () => {
    renderPanel();
    expect(screen.getByText(i18n.t('pos.cartEmpty'))).toBeInTheDocument();
  });

  it('displays cart title with item count', () => {
    renderPanel({ items: [mockItem] });
    expect(screen.getByText(i18n.t('pos.cart', { count: 1 }))).toBeInTheDocument();
  });

  it('renders item name', () => {
    renderPanel({ items: [mockItem] });
    expect(screen.getByText('Espresso Beans')).toBeInTheDocument();
  });

  it('displays USD total', () => {
    renderPanel({ items: [mockItem], totalUsd: 50.00 });
    expect(screen.getByText('$50.00')).toBeInTheDocument();
  });

  it('displays SYP total', () => {
    renderPanel({ items: [mockItem], totalSyp: 625000 });
    expect(screen.getByText('625,000 SYP')).toBeInTheDocument();
  });

  it('displays exchange rate when > 0', () => {
    renderPanel({ items: [mockItem], exchangeRate: 15000 });
    expect(screen.getByText(i18n.t('pos.rateValue', { rate: '15,000' }))).toBeInTheDocument();
  });

  it('hides exchange rate when 0', () => {
    renderPanel({ items: [mockItem], exchangeRate: 0 });
    expect(screen.queryByText(/rate/i)).not.toBeInTheDocument();
  });

  it('disables checkout when cart is empty', () => {
    renderPanel();
    const btn = screen.getByRole('button', { name: /complete sale/i });
    expect(btn).toBeDisabled();
  });

  it('enables checkout when cart has items', () => {
    renderPanel({ items: [mockItem] });
    const btn = screen.getByRole('button', { name: /complete sale/i });
    expect(btn).toBeEnabled();
  });

  it('calls onCheckout when checkout button clicked', async () => {
    const onCheckout = vi.fn();
    const user = userEvent.setup();
    renderPanel({ items: [mockItem], onCheckout });
    await user.click(screen.getByRole('button', { name: /complete sale/i }));
    expect(onCheckout).toHaveBeenCalledTimes(1);
  });

  it('calls onRemove when remove button clicked', async () => {
    const onRemove = vi.fn();
    const user = userEvent.setup();
    renderPanel({ items: [mockItem], onRemove });
    const removeBtn = screen.getByRole('button', { name: '×' });
    await user.click(removeBtn);
    expect(onRemove).toHaveBeenCalledWith('prod-1');
  });

  it('shows custom price indicator when custom price is set', () => {
    renderPanel({ items: [mockItemWithCustomPrice] });
    expect(screen.getByText(i18n.t('pos.customPriceActive'))).toBeInTheDocument();
  });

  it('shows processing text when loading', () => {
    renderPanel({ items: [mockItem], loading: true });
    expect(screen.getByText(i18n.t('pos.processing'))).toBeInTheDocument();
  });

  it('disables checkout when loading', () => {
    renderPanel({ items: [mockItem], loading: true });
    const btn = screen.getByRole('button', { name: /processing/i });
    expect(btn).toBeDisabled();
  });
});
