import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/i18n';
import { ProductList } from '../ProductList';
import type { Product } from '@/types/inventory';

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Test Product 1',
    sku: 'SKU001',
    price_usd: 10.99,
    price_syp: 137375,
    cost_usd: 5.99,
    cost_syp: 74875,
    quantity: 100,
    category_id: '1',
    category: { id: '1', name: 'Electronics', created_at: '2024-01-01' },
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
  },
  {
    id: '2',
    name: 'Test Product 2',
    sku: 'SKU002',
    price_usd: 25.50,
    price_syp: 318750,
    cost_usd: 15.00,
    cost_syp: 187500,
    quantity: 2,
    category_id: '2',
    category: { id: '2', name: 'Clothing', created_at: '2024-01-01' },
    created_at: '2026-01-02',
    updated_at: '2026-01-02',
  },
];

describe('ProductList', () => {
  it('renders products correctly', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <ProductList products={mockProducts} onEdit={vi.fn()} onDelete={vi.fn()} />
      </I18nextProvider>
    );

    expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    expect(screen.getByText('Test Product 2')).toBeInTheDocument();
    expect(screen.getByText('SKU001')).toBeInTheDocument();
    expect(screen.getByText('SKU002')).toBeInTheDocument();
  });

  it('displays product prices correctly', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <ProductList products={mockProducts} onEdit={vi.fn()} onDelete={vi.fn()} />
      </I18nextProvider>
    );

    expect(screen.getByText('$10.99')).toBeInTheDocument();
    expect(screen.getByText('$25.50')).toBeInTheDocument();
  });

  it('shows low stock badge for items with quantity <= 5', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <ProductList products={mockProducts} onEdit={vi.fn()} onDelete={vi.fn()} />
      </I18nextProvider>
    );

    const quantity = screen.getByText('2');
    expect(quantity.closest('[class*="bg-red-900"]')).toBeTruthy();
  });

  it('calls onEdit when edit button is clicked', async () => {
    const onEdit = vi.fn();
    const user = userEvent.setup();
    render(
      <I18nextProvider i18n={i18n}>
        <ProductList products={mockProducts} onEdit={onEdit} onDelete={vi.fn()} />
      </I18nextProvider>
    );

    const editButtons = screen.getAllByText(/edit/i);
    await user.click(editButtons[0]);

    expect(onEdit).toHaveBeenCalledWith(mockProducts[0]);
  });

  it('calls onDelete when delete button is clicked', async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();
    render(
      <I18nextProvider i18n={i18n}>
        <ProductList products={mockProducts} onEdit={vi.fn()} onDelete={onDelete} />
      </I18nextProvider>
    );

    const deleteButtons = screen.getAllByText(/delete/i);
    await user.click(deleteButtons[0]);

    expect(onDelete).toHaveBeenCalledWith(mockProducts[0]);
  });
});