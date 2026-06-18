import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/i18n';
import { ThemeSwitcher } from '../ThemeSwitcher';

describe('ThemeSwitcher', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('renders theme toggle button', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <ThemeSwitcher />
      </I18nextProvider>
    );
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('has aria-label', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <ThemeSwitcher />
      </I18nextProvider>
    );
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label');
  });

  it('shows light label when dark, and dark label after toggle', async () => {
    const user = userEvent.setup();
    render(
      <I18nextProvider i18n={i18n}>
        <ThemeSwitcher />
      </I18nextProvider>
    );
    const button = screen.getByRole('button');
    expect(button.textContent).toContain('Light');
    await user.click(button);
    expect(button.textContent).toContain('Dark');
  });
});
