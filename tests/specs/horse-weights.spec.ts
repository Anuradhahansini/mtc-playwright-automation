import { test, expect } from '@playwright/test';
import { HorseWeightsPage } from '../../pages/horseweights/HorseWeightsPage';
import { formatDisplayDate } from '../dateFormat';

// Runs in the 'chromium-authenticated' project (see playwright.config.ts),
// reusing the session saved by tests/auth.setup.ts. Read-only.
//
// Like Race Day Control, this page is scoped to today's meeting rather than
// a picked date/meeting.
test.describe('Horse Weights', () => {
  test('loads today\'s meeting with its horse weight grid', async ({ page }) => {
    const horseWeightsPage = new HorseWeightsPage(page);
    await horseWeightsPage.goto();
    await expect(horseWeightsPage.heading).toBeVisible();
    await expect(page.getByText(formatDisplayDate(new Date()))).toBeVisible();
    await expect(horseWeightsPage.raceIdText()).toBeVisible();
    expect(await horseWeightsPage.rows.count()).toBeGreaterThan(0);
  });

  test('switching race tabs loads that race\'s weights', async ({ page }) => {
    const horseWeightsPage = new HorseWeightsPage(page);
    await horseWeightsPage.goto();

    const raceIdBefore = await horseWeightsPage.raceIdText().textContent();

    await horseWeightsPage.raceTab(2).click();

    await expect(horseWeightsPage.raceIdText()).not.toHaveText(raceIdBefore ?? '');
  });
});
