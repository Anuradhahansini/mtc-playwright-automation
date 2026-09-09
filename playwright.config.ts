import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// TEST_ENV picks which .env.<name> file to load (defaults to uat). Values
// already set in the shell (e.g. by CI) take precedence over the file.
const testEnv = process.env.TEST_ENV || 'uat';
dotenv.config({ path: path.resolve(__dirname, `.env.${testEnv}`), quiet: true });

export default defineConfig({
  testDir: './tests',
  // NOTE: timeout/actionTimeout/navigationTimeout below are raised from
  // their original 45000/15000/30000 to give mtc-race.uat.racingandsports.com
  // headroom - its JS bundle is unusually large and was measured downloading
  // at ~79 KB/s (3+ minutes on a cold cache; fast once Chromium's disk
  // cache is warm). See the Stewards' Report's performance finding. Lower
  // these back down once that's fixed on a fast environment.
  timeout: 90000,
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
    actionTimeout: 30000,
    navigationTimeout: 90000,
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
      testIgnore: ['login-*.spec.ts', 'api-*.spec.ts'],
      use: { ...devices['Desktop Chrome'], storageState: 'playwright/.auth/user.json' },
      dependencies: ['setup'],
    },
    {
      // Backend API tests (api-*.spec.ts): hit the API directly via
      // Playwright's `request` fixture, no browser needed. Each test logs
      // in for its own token rather than reusing UI storageState, since
      // the API issues its own JWT independent of the browser session.
      name: 'api',
      testDir: './tests/specs',
      testMatch: 'api-*.spec.ts',
      use: { baseURL: process.env.API_BASE_URL || 'http://192.9.160.206:5071' },
    },
  ],
});
