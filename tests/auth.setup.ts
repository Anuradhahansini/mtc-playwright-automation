import { test as setup } from '@playwright/test';
import { LoginPage } from '../pages/user/LoginPage';
import { DashboardPage } from '../pages/home/DashboardPage';
import { VALID_USERNAME, VALID_PASSWORD } from './login.data';

const authFile = 'playwright/.auth/user.json';

setup('authenticate as Admin', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.login('Admin', VALID_USERNAME, VALID_PASSWORD);

  const dashboardPage = new DashboardPage(page);
  await dashboardPage.expectLoaded();

  await page.context().storageState({ path: authFile });
});
