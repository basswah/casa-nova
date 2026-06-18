import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/i18n';
import { LanguageSwitcher } from '../LanguageSwitcher';

describe('LanguageSwitcher', () => {
  it('shows AR when language is English', () => {
    i18n.language = 'en';
    render(
      <I18nextProvider i18n={i18n}>
        <LanguageSwitcher />
      </I18nextProvider>
    );
    expect(screen.getByText('AR')).toBeInTheDocument();
  });

  it('shows EN when language is Arabic', () => {
    i18n.language = 'ar';
    render(
      <I18nextProvider i18n={i18n}>
        <LanguageSwitcher />
      </I18nextProvider>
    );
    expect(screen.getByText('EN')).toBeInTheDocument();
  });

  it('has correct aria-label in English', () => {
    i18n.language = 'en';
    render(
      <I18nextProvider i18n={i18n}>
        <LanguageSwitcher />
      </I18nextProvider>
    );
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'التبديل إلى العربية');
  });

  it('has correct aria-label in Arabic', () => {
    i18n.language = 'ar';
    render(
      <I18nextProvider i18n={i18n}>
        <LanguageSwitcher />
      </I18nextProvider>
    );
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Switch to English');
  });
});
