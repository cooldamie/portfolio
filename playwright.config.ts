import { defineConfig, devices } from '@playwright/test';

// BASE_URL is set in CI to the Azure Static Web Apps preview or production URL.
// Locally, tests run against `astro preview` of the built site.
const remote = Boolean(process.env.BASE_URL);
const baseURL = process.env.BASE_URL ?? 'http://localhost:4321';

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'pixel-7', use: { ...devices['Pixel 7'] } },
    { name: 'iphone-15', use: { ...devices['iPhone 15'] } },
  ],
  ...(remote
    ? {}
    : {
        webServer: {
          // --ignore-lock keeps Astro 7's preview in the foreground; without it Astro moves the
          // server to the background when it detects an AI agent, and Playwright sees it exit.
          command: 'npx astro preview --port 4321 --ignore-lock',
          url: baseURL,
          reuseExistingServer: !process.env.CI,
          timeout: 60_000,
        },
      }),
});
