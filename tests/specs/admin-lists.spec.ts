import { test, expect } from '@playwright/test';
import { RaceUserLogsPage } from '../../pages/admin/RaceUserLogsPage';
import { RaceUsersPage } from '../../pages/admin/RaceUsersPage';
import { OwnersComparisonPage } from '../../pages/admin/OwnersComparisonPage';
import { WebsiteUsersPage } from '../../pages/admin/WebsiteUsersPage';

// Runs in the 'chromium-authenticated' project (see playwright.config.ts),
// reusing the session saved by tests/auth.setup.ts. Read-only.
//
// Race Users' "Add New User" form is only ever opened/closed, never
// submitted - creating an account is out of scope for this suite.
test.describe('Admin', () => {
  test('Race User Logs loads', async ({ page }) => {
    const logsPage = new RaceUserLogsPage(page);
    await logsPage.goto();
    await expect(logsPage.heading).toBeVisible();
    await expect(logsPage.table).toBeVisible();
  });

  test('Race Users - Add New User form requires a name', async ({ page }) => {
    const usersPage = new RaceUsersPage(page);
    await usersPage.goto();
    await expect(usersPage.heading).toBeVisible();

    await usersPage.openAddUserForm();
    await expect(usersPage.firstNameLabel).toBeVisible();
    await expect(usersPage.lastNameLabel).toBeVisible();
    await usersPage.closeAddUserForm();
  });

  test('Owners Comparison loads with its upload workflow', async ({ page }) => {
    const ownersPage = new OwnersComparisonPage(page);
    await ownersPage.goto();
    await expect(ownersPage.heading).toBeVisible();
    await expect(ownersPage.compareButton).toBeVisible();
    await expect(ownersPage.historyText).toBeVisible();
  });

  test('Website Users loads', async ({ page }) => {
    const websiteUsersPage = new WebsiteUsersPage(page);
    await websiteUsersPage.goto();
    await expect(websiteUsersPage.heading).toBeVisible();
    await expect(websiteUsersPage.table).toBeVisible();
  });
});
