import { test, expect } from '@playwright/test';
import { RaceDayControlPage } from '../../pages/raceday/RaceDayControlPage';
import { formatAppDate } from '../dateFormat';

// Runs in the 'chromium-authenticated' project (see playwright.config.ts),
// reusing the session saved by tests/auth.setup.ts. Read-only.
test.describe('Race Day Control', () => {
  test('loads with the documented access rule', async ({ page }) => {
    const raceDayPage = new RaceDayControlPage(page);
    await raceDayPage.goto();
    await expect(raceDayPage.heading).toBeVisible();
    await expect(raceDayPage.ruleText).toBeVisible();
  });

  test('only lists meetings dated today', async ({ page }) => {
    const raceDayPage = new RaceDayControlPage(page);
    await raceDayPage.goto();

    const today = formatAppDate(new Date());
    const rowCount = await raceDayPage.rows.count();
    expect(rowCount).toBeGreaterThan(0);

    for (let i = 0; i < rowCount; i++) {
      await expect(raceDayPage.dateInputForRow(raceDayPage.rows.nth(i))).toHaveValue(today);
    }
  });

  test('BUG: lists a meeting whose Status is not Final, despite the stated rule', async ({ page }) => {
    // The page states: "Only meetings with Meeting Stage: Acceptance and
    // Status: Final are displayed." Today's meeting is Stage: Acceptances
    // (matches) but Status: DRAFT (does not match) - and it's shown anyway.
    const raceDayPage = new RaceDayControlPage(page);
    await raceDayPage.goto();
    const firstRow = raceDayPage.rows.first();
    await expect(firstRow.getByText('Acceptances', { exact: true })).toBeVisible();
    await expect(firstRow.getByText('DRAFT', { exact: true })).toBeVisible();
  });

  test('opens today\'s races for a listed meeting', async ({ page }) => {
    const raceDayPage = new RaceDayControlPage(page);
    await raceDayPage.goto();
    const firstRow = raceDayPage.rows.first();

    await raceDayPage.racesButtonForRow(firstRow).click();

    await expect(page).toHaveURL(/\/raceday-race\?meetingid=\d+/);
    await expect(page.getByRole('heading', { name: 'Race Day Races' })).toBeVisible();
  });
});
