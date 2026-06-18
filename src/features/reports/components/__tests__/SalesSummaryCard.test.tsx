import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/i18n';
import { SalesSummaryCard } from '../SalesSummaryCard';

describe('SalesSummaryCard', () => {
  const renderCard = (props = {}) => {
    return render(
      <I18nextProvider i18n={i18n}>
        <SalesSummaryCard loading={false} {...props} />
      </I18nextProvider>
    );
  };

  it('shows loading state', () => {
    renderCard({ loading: true });
    expect(screen.getByText(i18n.t('common.loading'))).toBeInTheDocument();
  });

  it('shows no data when data is undefined', () => {
    renderCard({ data: undefined });
    expect(screen.getByText(i18n.t('common.noData'))).toBeInTheDocument();
  });

  it('displays sales totals', () => {
    renderCard({
      data: { totalSalesUsd: 1250.50, totalSalesSyp: 15631250, transactionCount: 42 },
    });
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.queryByText(i18n.t('common.noData'))).not.toBeInTheDocument();
  });

  it('displays transaction count', () => {
    renderCard({
      data: { totalSalesUsd: 100, totalSalesSyp: 1250000, transactionCount: 5 },
    });
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('displays card title', () => {
    renderCard();
    expect(screen.getByText(i18n.t('reports.salesSummary'))).toBeInTheDocument();
  });
});
