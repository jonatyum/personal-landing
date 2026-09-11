import { defineConfig, devices } from '@playwright/test';

const port = 4322;
const base = (process.env.BASE_PATH ?? '').replace(/\/+$/, '');

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${port}${base}/`,
    // Locally reuse the installed Google Chrome; CI installs Playwright's Chromium.
    ...(process.env.CI ? {} : { channel: 'chrome' }),
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // Tests run against the production build: run `npm run build` first.
  webServer: {
    command: `npm run preview -- --port ${port}`,
    url: `http://localhost:${port}${base}/`,
    reuseExistingServer: !process.env.CI,
  },
});
