import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/i18n';
import { ProductGrid } from '../ProductGrid';
import type { PosProduct } from '@/types/pos';

const mockProducts: PosProduct[] = [
  { id: '1', name: 'Espresso Beans', sku: 'ESP-001', price_usd: 25.00, price_syp: 312500, cost_usd: 15.00, cost_syp: 187500, quantity: 10 },
  { id: '2', name: 'Latte Cup', sku: 'LAT-002', price_usd: 10.00, price_syp: 125000, cost_usd: 5.00, cost_syp: 62500, quantity: 0 },
  { id: '3', name: 'Moka Pot', sku: null, price_usd: 45.00, price_syp: 562500, cost_usd: 20.00, cost_syp: 250000, quantity: 5 },
];

describe('ProductGrid', () => {
  const defaultProps = {
    products: mockProducts,
    onAddToCart: vi.fn(),
    search: '',
    onSearchChange: vi.fn(),
  };

  const renderGrid = (props = {}) => {
    return render(
      <I18nextProvider i18n={i18n}>
        <ProductGrid {...defaultProps} {...props} />
      </I18nextProvider>
    );
  };

  it('renders all products', () => {
    renderGrid();
    expect(screen.getByText('Espresso Beans')).toBeInTheDocument();
    expect(screen.getByText('Latte Cup')).toBeInTheDocument();
    expect(screen.getByText('Moka Pot')).toBeInTheDocument();
  });

  it('displays product prices', () => {
    renderGrid();
    expect(screen.getByText('$25.00')).toBeInTheDocument();
    expect(screen.getByText('$10.00')).toBeInTheDocument();
  });

  it('displays SKU or no-sku message', () => {
    renderGrid();
    expect(screen.getByText('ESP-001')).toBeInTheDocument();
    expect(screen.getByText('LAT-002')).toBeInTheDocument();
    expect(screen.getByText(i18n.t('pos.noSku'))).toBeInTheDocument();
  });

  it('disables button for out-of-stock products', () => {
    renderGrid();
    const latteBtn = screen.getByText('Latte Cup').closest('button');
    expect(latteBtn).toBeDisabled();
  });

  it('enables button for in-stock products', () => {
    renderGrid();
    const espressoBtn = screen.getByText('Espresso Beans').closest('button');
    expect(espressoBtn).toBeEnabled();
  });

  it('calls onAddToCart when product clicked', async () => {
    const onAddToCart = vi.fn();
    const user = userEvent.setup();
    renderGrid({ onAddToCart });
    await user.click(screen.getByText('Espresso Beans'));
    expect(onAddToCart).toHaveBeenCalledWith(mockProducts[0]);
  });

  it('filters products by name', () => {
    renderGrid({ search: 'Espresso' });
    expect(screen.getByText('Espresso Beans')).toBeInTheDocument();
    expect(screen.queryByText('Latte Cup')).not.toBeInTheDocument();
    expect(screen.queryByText('Moka Pot')).not.toBeInTheDocument();
  });

  it('filters products by SKU', () => {
    renderGrid({ search: 'LAT-002' });
    expect(screen.getByText('Latte Cup')).toBeInTheDocument();
    expect(screen.queryByText('Espresso Beans')).not.toBeInTheDocument();
  });

  it('shows no products message when filter matches nothing', () => {
    renderGrid({ search: 'xyz' });
    expect(screen.getByText(i18n.t('pos.noProducts'))).toBeInTheDocument();
  });

  it('shows no products message when products array is empty', () => {
    renderGrid({ products: [] });
    expect(screen.getByText(i18n.t('pos.noProducts'))).toBeInTheDocument();
  });
});
