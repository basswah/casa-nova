import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/i18n';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DashboardPage } from '../DashboardPage';
import * as useDashboardModule from '@/features/dashboard/hooks/useDashboard';

vi.mock('@/features/dashboard/hooks/useDashboard');

const mockUseDashboard = vi.mocked(useDashboardModule.useDashboard);

const mockData = {
  todaySalesUsd: 1250.50,
  todaySalesSyp: 15631250,
  todaySalesCount: 15,
  totalProducts: 42,
  lowStockCount: 3,
  recentSales: [
    { id: '1', total_usd: 50.00, total_syp: 625000, status: 'completed' },
    { id: '2', total_usd: 75.25, total_syp: 940625, status: 'completed' },
  ],
      recentPurchaseOrders: [
        { id: 'po-id-001', status: 'pending' },
        { id: 'po-id-002', status: 'received' },
      ],
};

describe('DashboardPage', () => {
  beforeEach(() => {
    mockUseDashboard.mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
    } as ReturnType<typeof useDashboardModule.useDashboard>);

    vi.clearAllMocks();
  });

  const renderPage = () => {
    const queryClient = new QueryClient();
    return render(
      <QueryClientProvider client={queryClient}>
        <I18nextProvider i18n={i18n}>
          <DashboardPage />
        </I18nextProvider>
      </QueryClientProvider>
    );
  };

  it('renders dashboard title', () => {
    renderPage();
    expect(screen.getByText(i18n.t('dashboard.title'))).toBeInTheDocument();
  });

  it('displays today sales in USD', () => {
    renderPage();
    expect(screen.getByText('$1250.50')).toBeInTheDocument();
  });

  it('displays today sales in SYP', () => {
    renderPage();
    expect(screen.getByText('15,631,250 SYP')).toBeInTheDocument();
  });

  it('displays total products count', () => {
    renderPage();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('displays low stock items count', () => {
    renderPage();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('displays recent sales', () => {
    renderPage();
    expect(screen.getByText('$50.00')).toBeInTheDocument();
    expect(screen.getByText('$75.25')).toBeInTheDocument();
  });

  it('displays recent purchase orders', () => {
    renderPage();
    expect(screen.getByText('pending')).toBeInTheDocument();
    expect(screen.getByText('received')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockUseDashboard.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    } as unknown as ReturnType<typeof useDashboardModule.useDashboard>);

    renderPage();

    const skeletonElements = document.querySelectorAll('.animate-pulse');
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  it('shows error state', () => {
    mockUseDashboard.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Failed to load'),
    } as unknown as ReturnType<typeof useDashboardModule.useDashboard>);

    renderPage();

    expect(screen.getByText(i18n.t('common.error'))).toBeInTheDocument();
  });
});