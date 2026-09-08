import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 45000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 2,
  reporter: [['html', { open: 'never' }]],
  expect: {
    timeout: 15000,
  },
  use: {
    baseURL: process.env.BASE_URL || 'http://192.9.160.206:5070',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },
  projects: [
    {
      name: 'setup',
      testMatch: 'auth.setup.ts',
    },
    {
      // Login flow tests need to start unauthenticated, so they get no storageState.
      // Everything else needs an authenticated session, so this project only
      // covers the login-*.spec.ts files; new authenticated specs need no
      // config change - they just run under 'chromium-authenticated' below.
      name: 'chromium',
      testDir: './tests/specs',
      testMatch: 'login-*.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      // Reuses the session saved by auth.setup.ts instead of logging in per test.
      name: 'chromium-authenticated',
      testDir: './tests/specs',
      testIgnore: 'login-*.spec.ts',
      use: { ...devices['Desktop Chrome'], storageState: 'playwright/.auth/user.json' },
      dependencies: ['setup'],
    },
  ],
});
