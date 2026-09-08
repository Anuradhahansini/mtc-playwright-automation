import { test } from '@playwright/test';
import { DashboardPage } from '../../pages/home/DashboardPage';

// Runs in the 'chromium-authenticated' project, which starts from the
// storageState saved by tests/auth.setup.ts - no login steps needed here.
test.describe('Dashboard (authenticated session)', () => {
  test('shows the dashboard immediately for an already signed-in session', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.goto('/');
    await dashboardPage.expectLoaded();
  });
});
