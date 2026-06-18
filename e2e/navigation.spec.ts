import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('nav links are visible when authenticated', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /login/i }).click();

    await page.waitForURL('**/', { timeout: 10000 }).catch(() => {});

    const navLinks = page.locator('nav a');
    await expect(navLinks).toHaveCount(7);
  });

  test('theme switcher toggles theme', async ({ page }) => {
    await page.goto('/login');

    const themeBtn = page.getByRole('button', { name: /switch to/i });
    if (await themeBtn.isVisible()) {
      const initialTheme = await page.evaluate(() => document.documentElement.dataset.theme);
      await themeBtn.click();
      const newTheme = await page.evaluate(() => document.documentElement.dataset.theme);
      expect(newTheme).not.toBe(initialTheme);
    }
  });

  test('language switcher toggles language', async ({ page }) => {
    await page.goto('/login');

    const langBtn = page.getByRole('button', { name: /التبديل|switch to/i });
    if (await langBtn.isVisible()) {
      const initialText = await langBtn.textContent();
      await langBtn.click();
      const newText = await langBtn.textContent();
      expect(newText).not.toBe(initialText);
    }
  });
});
