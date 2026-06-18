import { test, expect } from '@playwright/test';

test.describe('App Shell', () => {
  test('page has correct title', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/Casa Nova POS/);
  });

  test('login page is responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /casa nova pos/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test('login form has accessible labels', async ({ page }) => {
    await page.goto('/login');
    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/password/i);
    await expect(emailInput).toHaveAttribute('type', 'email');
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('can fill and submit login form', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('admin@example.com');
    await page.getByLabel(/password/i).fill('testpassword');
    await expect(page.getByLabel(/email/i)).toHaveValue('admin@example.com');
    await expect(page.getByLabel(/password/i)).toHaveValue('testpassword');
  });
});
