import { test } from '@playwright/test';
import { LoginPage, type Role } from '../../pages/user/LoginPage';
import { DashboardPage } from '../../pages/home/DashboardPage';
import { VALID_USERNAME, VALID_PASSWORD, ROLE_CREDENTIALS } from '../../data/user';

test.describe('Login flow - positive cases', () => {
  test('logs in successfully with valid Admin credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login('Admin', VALID_USERNAME, VALID_PASSWORD);
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.expectLoaded();
  });

  for (const role of Object.keys(ROLE_CREDENTIALS) as Role[]) {
    test(`logs in successfully as ${role}`, async ({ page }) => {
      const creds = ROLE_CREDENTIALS[role]!;
      const loginPage = new LoginPage(page);
      await loginPage.login(role, creds.username, creds.password);
      const dashboardPage = new DashboardPage(page);
      await dashboardPage.expectLoaded();
    });
  }
});
