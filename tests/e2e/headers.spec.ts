import { expect, test } from '@playwright/test';

// Security headers come from staticwebapp.config.json, which only Azure Static Web Apps applies,
// so this runs against a deployed URL (BASE_URL) and is skipped locally.
test.skip(!process.env.BASE_URL, 'Runs against a deployed Azure Static Web Apps URL only.');

// E2E-12
test('responses carry the security headers', async ({ request }) => {
  const response = await request.get('/');
  expect(response.ok()).toBe(true);
  const headers = response.headers();
  expect(headers['content-security-policy']).toContain("default-src 'self'");
  expect(headers['content-security-policy']).toContain("frame-ancestors 'none'");
  expect(headers['strict-transport-security']).toMatch(/max-age=\d+/);
  expect(headers['x-content-type-options']).toBe('nosniff');
  expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
});

// Azure marks preview environments `X-Robots-Tag: none`. Production must never carry it,
// or the live site would vanish from search results.
test('only previews are hidden from search engines', async ({ request }) => {
  const robots = (await request.get('/')).headers()['x-robots-tag'] ?? '';
  if (process.env.PREVIEW === 'true') {
    expect(robots).toMatch(/none|noindex/);
  } else {
    expect(robots).not.toMatch(/none|noindex/);
  }
});

test('hashed assets are cached for a year', async ({ page, request }) => {
  await page.goto('/');
  const stylesheet = await page
    .locator('link[rel="stylesheet"][href^="/_astro/"]')
    .first()
    .getAttribute('href');
  expect(stylesheet).toBeTruthy();
  const response = await request.get(stylesheet!);
  expect(response.headers()['cache-control']).toContain('immutable');
});
