import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/i18n';
import { TopProductsTable } from '../TopProductsTable';
import type { TopProduct } from '@/types/reports';

const mockProducts: TopProduct[] = [
  { productId: '1', productName: 'Espresso Beans', sku: 'ESP-001', quantitySold: 50, totalUsd: 1250.00, totalSyp: 15625000 },
  { productId: '2', productName: 'Latte Cup', sku: 'LAT-002', quantitySold: 30, totalUsd: 300.00, totalSyp: 3750000 },
];

describe('TopProductsTable', () => {
  const renderTable = (props = {}) => {
    return render(
      <I18nextProvider i18n={i18n}>
        <TopProductsTable loading={false} {...props} />
      </I18nextProvider>
    );
  };

  it('shows loading state', () => {
    renderTable({ loading: true });
    expect(screen.getByText(i18n.t('common.loading'))).toBeInTheDocument();
  });

  it('shows no sales when data is empty', () => {
    renderTable({ data: [] });
    expect(screen.getByText(i18n.t('reports.noSales'))).toBeInTheDocument();
  });

  it('shows no sales when data is undefined', () => {
    renderTable({ data: undefined });
    expect(screen.getByText(i18n.t('reports.noSales'))).toBeInTheDocument();
  });

  it('renders table headers', () => {
    renderTable({ data: mockProducts });
    expect(screen.getByText(i18n.t('reports.product'))).toBeInTheDocument();
    expect(screen.getByText(i18n.t('reports.sold'))).toBeInTheDocument();
  });

  it('displays product names', () => {
    renderTable({ data: mockProducts });
    expect(screen.getByText('Espresso Beans')).toBeInTheDocument();
    expect(screen.getByText('Latte Cup')).toBeInTheDocument();
  });

  it('displays rank numbers', () => {
    renderTable({ data: mockProducts });
    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('#2')).toBeInTheDocument();
  });

  it('displays quantities and totals', () => {
    renderTable({ data: mockProducts });
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
  });
});
