import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

test.describe('home page', () => {
  // E2E-01
  test('shows name, positioning and both paths without scrolling', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    page.on('pageerror', (error) => errors.push(error.message));

    await page.goto('/');

    await expect(page).toHaveTitle(/Damilola Iranloye/);
    await expect(page.getByText('Damilola Iranloye', { exact: false }).first()).toBeInViewport();
    await expect(page.getByRole('heading', { level: 1 })).toBeInViewport();
    await expect(page.getByRole('link', { name: /Work with me/ })).toBeInViewport();
    await expect(page.getByRole('link', { name: /Hire me/ })).toBeInViewport();
    // Catches CSP violations too, which browsers report as console errors.
    expect(errors).toEqual([]);
  });

  test('skip link moves focus to the main content', async ({ page, browserName, isMobile }) => {
    test.skip(isMobile, 'Keyboard navigation is checked on desktop projects.');
    await page.goto('/');
    // WebKit only tabs to links with Option held, matching Safari's default.
    await page.keyboard.press(browserName === 'webkit' ? 'Alt+Tab' : 'Tab');
    await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#main$/);
    await expect(page.locator('#main')).toBeFocused();
  });
});

test.describe('accessibility', () => {
  for (const path of ['/', '/this-page-does-not-exist']) {
    test(`no WCAG 2.2 AA violations on ${path}`, async ({ page }) => {
      await page.goto(path);
      const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
      expect(results.violations).toEqual([]);
    });
  }
});

// E2E-09
test('unknown URLs return the 404 page with a 404 status', async ({ page }) => {
  const response = await page.goto('/this-page-does-not-exist');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText("This page doesn't exist.");
  await expect(page.getByRole('link', { name: 'Go to the home page' })).toBeVisible();
});
