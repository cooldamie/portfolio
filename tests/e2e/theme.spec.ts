import { expect, test } from '@playwright/test';

const LIGHT_BG = 'rgb(244, 246, 249)';
const DARK_BG = 'rgb(10, 15, 25)';

const bodyBackground = (page: import('@playwright/test').Page) =>
  page.evaluate(() => getComputedStyle(document.body).backgroundColor);

// E2E-05 (the toggle itself arrives in Phase 1)
test('follows the system colour scheme when nothing is saved', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  await expect(page.locator('html')).not.toHaveAttribute('data-theme', /.+/);
  expect(await bodyBackground(page)).toBe(DARK_BG);

  await page.emulateMedia({ colorScheme: 'light' });
  expect(await bodyBackground(page)).toBe(LIGHT_BG);
});

test('a saved choice wins over the system setting before first paint', async ({ page }) => {
  await page.addInitScript(() => window.localStorage.setItem('theme', 'light'));
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  expect(await bodyBackground(page)).toBe(LIGHT_BG);
});

test('an invalid saved value is ignored', async ({ page }) => {
  await page.addInitScript(() => window.localStorage.setItem('theme', 'purple'));
  await page.goto('/');
  await expect(page.locator('html')).not.toHaveAttribute('data-theme', /.+/);
});
