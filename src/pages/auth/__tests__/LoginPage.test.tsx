import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginPage } from '../LoginPage';

const mockSignIn = vi.fn().mockResolvedValue(undefined);
const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('@/store/rootStore', () => ({
  useAppStore: (selector: (s: Record<string, unknown>) => unknown) => {
    const store = {
      user: null,
      loading: false,
      signIn: mockSignIn,
      signOut: vi.fn(),
      setUser: vi.fn(),
    };
    return selector(store);
  },
}));

describe('LoginPage', () => {
  it('renders login form', () => {
    render(<LoginPage />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('has correct document title', () => {
    render(<LoginPage />);

    expect(document.title).toContain('Login');
  });

  it('allows typing in email and password', async () => {
    const user = userEvent.setup({ delay: null });
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');

    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('submits form with correct data', async () => {
    const user = userEvent.setup({ delay: null });
    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), 'admin@example.com');
    await user.type(screen.getByLabelText(/password/i), 'admin123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('admin@example.com', 'admin123');
    });
  });

  it('shows error message on failed login', async () => {
    mockSignIn.mockRejectedValueOnce(new Error('Login failed'));
    const user = userEvent.setup({ delay: null });
    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/login failed/i)).toBeInTheDocument();
    });
  });

  it('navigates to home on successful login', async () => {
    mockSignIn.mockResolvedValueOnce(undefined);
    const user = userEvent.setup({ delay: null });
    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), 'admin@example.com');
    await user.type(screen.getByLabelText(/password/i), 'admin123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
});