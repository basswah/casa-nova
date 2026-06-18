import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test('shows login form when not authenticated', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /casa nova pos/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /login/i })).toBeVisible();
  });

  test('shows hint text', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText(/supabase credentials/i)).toBeVisible();
  });

  test('requires email and password', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /login/i }).click();
    const emailInput = page.getByLabel(/email/i);
    await expect(emailInput).toHaveAttribute('required', '');
  });

  test('redirects unauthenticated user from / to /login', async ({ page }) => {
    await page.goto('/');
    await page.waitForURL('**/login');
    await expect(page).toHaveURL(/\/login/);
  });
});
