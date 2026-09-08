import { test, expect } from '@playwright/test';
import { PreRaceRunnerPage } from '../../pages/prerace/PreRaceRunnerPage';

// Runs in the 'chromium-authenticated' project (see playwright.config.ts),
// reusing the session saved by tests/auth.setup.ts.
//
// Uses meeting 487 / race 386, which has two known existing runners
// (IDITAROD TRAIL, ARLINGTONS REVENGE). Avoids adding a real runner -
// see prerace-race.spec.ts for why creating records here isn't safe
// without a verified cleanup step.
test.describe('Pre-Race - Runner', () => {
  const MEETING_ID = '487';
  const RACE_ID = '386';
  const EXISTING_RUNNER_NAME = 'IDITAROD TRAIL';

  test('loads the runners for a race', async ({ page }) => {
    const runnerPage = new PreRaceRunnerPage(page);
    await runnerPage.goto(MEETING_ID, RACE_ID);
    await expect(runnerPage.heading).toBeVisible();
    // The horse name renders inside an editable grid cell (an <input>), so
    // its text lives in the value attribute rather than as visible text.
    await expect(page.locator(`input[value*="${EXISTING_RUNNER_NAME}"]`)).toBeVisible();
  });

  test('disables Save until a horse is selected', async ({ page }) => {
    const runnerPage = new PreRaceRunnerPage(page);
    await runnerPage.goto(MEETING_ID, RACE_ID);
    // The horse name renders inside an editable grid cell (an <input>), so
    // its text lives in the value attribute rather than as visible text.
    await expect(page.locator(`input[value*="${EXISTING_RUNNER_NAME}"]`)).toBeVisible();
    const rowCountBefore = await runnerPage.runnerRows.count();

    await runnerPage.openAddRunnerForm();
    await expect(runnerPage.saveButton).toBeDisabled();

    await runnerPage.closeAddRunnerForm();
    await expect(runnerPage.runnerRows).toHaveCount(rowCountBefore);
  });

  test('does not filter already-assigned horses out of the Race Horse picker', async ({ page }) => {
    // Documents a real gap: a horse already running in this race is still
    // offered when adding another runner, so nothing stops a duplicate entry.
    const runnerPage = new PreRaceRunnerPage(page);
    await runnerPage.goto(MEETING_ID, RACE_ID);
    // The horse name renders inside an editable grid cell (an <input>), so
    // its text lives in the value attribute rather than as visible text.
    await expect(page.locator(`input[value*="${EXISTING_RUNNER_NAME}"]`)).toBeVisible();

    await runnerPage.openAddRunnerForm();
    const options = await runnerPage.getRaceHorseOptionTexts();
    expect(options.some((o) => o.includes(EXISTING_RUNNER_NAME))).toBe(true);

    await runnerPage.closeAddRunnerForm();
  });
});
