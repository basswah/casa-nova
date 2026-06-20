import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/i18n';
import { EmptyState } from '../EmptyState';

describe('EmptyState', () => {
  it('renders with title', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <EmptyState title="No items found" />
      </I18nextProvider>
    );

    expect(screen.getByText('No items found')).toBeInTheDocument();
  });

  it('renders with action button', () => {
    const onClick = () => {};
    render(
      <I18nextProvider i18n={i18n}>
        <EmptyState 
          title="No items" 
          action={{ label: 'Add Item', onClick }} 
        />
      </I18nextProvider>
    );

    expect(screen.getByText('Add Item')).toBeInTheDocument();
  });
});