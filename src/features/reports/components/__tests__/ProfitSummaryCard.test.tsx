import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/i18n';
import { ProfitSummaryCard } from '../ProfitSummaryCard';

describe('ProfitSummaryCard', () => {
  const renderCard = (props = {}) => {
    return render(
      <I18nextProvider i18n={i18n}>
        <ProfitSummaryCard loading={false} {...props} />
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

  it('displays positive profit in green', () => {
    renderCard({ data: { profitUsd: 500.00, profitSyp: 6250000 } });
    const usdEl = screen.getByText('$500.00');
    expect(usdEl).toHaveClass('text-green-400');
    const sypEl = screen.getByText('6,250,000 SYP');
    expect(sypEl).toHaveClass('text-green-400');
  });

  it('displays negative profit in red', () => {
    renderCard({ data: { profitUsd: -100.00, profitSyp: -1250000 } });
    const usdEl = screen.getByText(/100\.00/);
    expect(usdEl).toHaveClass('text-red-400');
    const sypEl = screen.getByText(/1,250,000/);
    expect(sypEl).toHaveClass('text-red-400');
  });

  it('displays card title', () => {
    renderCard();
    expect(screen.getByText(i18n.t('reports.profitSummary'))).toBeInTheDocument();
  });
});
