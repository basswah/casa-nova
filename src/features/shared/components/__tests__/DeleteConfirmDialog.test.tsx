import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/i18n';
import { DeleteConfirmDialog } from '../DeleteConfirmDialog';

describe('DeleteConfirmDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders when open', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <DeleteConfirmDialog
          open={true}
          title="Delete Item"
          message="Are you sure?"
          onConfirm={vi.fn()}
          onClose={vi.fn()}
        />
      </I18nextProvider>
    );

    expect(screen.getByText('Delete Item')).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <DeleteConfirmDialog
          open={false}
          title="Delete Item"
          message="Are you sure?"
          onConfirm={vi.fn()}
          onClose={vi.fn()}
        />
      </I18nextProvider>
    );

    expect(screen.queryByText('Delete Item')).not.toBeInTheDocument();
  });

  it('calls onConfirm when confirm button is clicked', async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();
    render(
      <I18nextProvider i18n={i18n}>
        <DeleteConfirmDialog
          open={true}
          title="Delete Item"
          message="Are you sure?"
          onConfirm={onConfirm}
          onClose={vi.fn()}
        />
      </I18nextProvider>
    );

    const confirmButton = screen.getByRole('button', { name: /delete/i });
    await user.click(confirmButton);

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when cancel button is clicked', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <I18nextProvider i18n={i18n}>
        <DeleteConfirmDialog
          open={true}
          title="Delete Item"
          message="Are you sure?"
          onConfirm={vi.fn()}
          onClose={onClose}
        />
      </I18nextProvider>
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});