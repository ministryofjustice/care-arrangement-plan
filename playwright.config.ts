import { defineConfig, devices } from '@playwright/test';

const allBrowsers = [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  { name: 'webkit', use: { ...devices['Desktop Safari'] } },
];

export default defineConfig({
  testDir: './e2e-tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 4, // Run with 1 worker in CI to prevent server overload
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'playwright-results.xml' }],
    ['list'],
  ],
  use: {
    baseURL: 'http://localhost:8001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: allBrowsers,
  webServer: {
    command: 'npm run build && ENV_FILE_OPTION="--env-file=.env.test" npm start',
    url: 'http://localhost:8001/health',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
