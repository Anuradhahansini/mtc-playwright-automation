import { test, expect } from '@playwright/test';
import { PreRaceRacePage } from '../../pages/prerace/PreRaceRacePage';

// Runs in the 'chromium-authenticated' project (see playwright.config.ts),
// reusing the session saved by tests/auth.setup.ts.
//
// Uses meeting 487, which has exactly one known existing race
// ("champ de mars new"). These tests avoid creating a real race: while
// exploring this page manually, submitting a duplicate race number was
// NOT rejected by the app (unlike duplicate meetings) - it silently
// created a second race, which had to be cleaned up by hand via the
// "Show Delete" admin toggle. That's worth a bug report, but not
// something to lock in as expected behavior in an automated test.
test.describe('Pre-Race - Race', () => {
  const MEETING_ID = '487';
  const EXISTING_RACE_NAME = 'champ de mars new';

  test('loads the races for a meeting', async ({ page }) => {
    const racePage = new PreRaceRacePage(page);
    await racePage.goto(MEETING_ID);
    await expect(racePage.heading).toBeVisible();
    // The race name renders inside an editable grid cell (an <input>), so its
    // text lives in the value attribute rather than as visible text content.
    await expect(page.locator(`input[value="${EXISTING_RACE_NAME}"]`)).toBeVisible();
  });

  test('shows an error and adds no race when the race number is missing', async ({ page }) => {
    const racePage = new PreRaceRacePage(page);
    await racePage.goto(MEETING_ID);
    // The race name renders inside an editable grid cell (an <input>), so its
    // text lives in the value attribute rather than as visible text content.
    await expect(page.locator(`input[value="${EXISTING_RACE_NAME}"]`)).toBeVisible();
    const rowCountBefore = await racePage.raceRows.count();

    await racePage.openAddRaceForm();
    await racePage.save();

    await expect(racePage.formAlert).toContainText('Race No is required');
    await racePage.closeAddRaceForm();
    await expect(racePage.raceRows).toHaveCount(rowCountBefore);
  });

  test('returns to the meeting list from "Back To Meeting"', async ({ page }) => {
    const racePage = new PreRaceRacePage(page);
    await racePage.goto(MEETING_ID);
    await racePage.backToMeetingButton.click();
    await expect(page).toHaveURL(/\/prerace$/);
  });
});
