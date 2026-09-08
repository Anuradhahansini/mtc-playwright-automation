import { test, expect } from '@playwright/test';
import { WeightAllocationPage } from '../../pages/handicapping/WeightAllocationPage';

// Runs in the 'chromium-authenticated' project (see playwright.config.ts),
// reusing the session saved by tests/auth.setup.ts. Read-only: only ever
// navigates and reads state, never creates/edits/deletes a record.
test.describe('Handicapping - Weight Allocation', () => {
  test('loads with the documented access rule', async ({ page }) => {
    const weightPage = new WeightAllocationPage(page);
    await weightPage.goto();
    await expect(weightPage.heading).toBeVisible();
    await expect(weightPage.ruleText).toBeVisible();
  });

  test('BUG: does not disable "Races" for a meeting that is not Weight/Final', async ({ page }) => {
    // The page states: "Only meetings with Meeting Stage: Weight and Status:
    // Final can access the Weight Allocation runners page. Meetings that do
    // not meet both conditions will have the Races button disabled." The
    // first seeded row is Stage=Weights, Status=DRAFT - by that rule its
    // Races button should be disabled. It isn't, and clicking it does
    // navigate through, so the stated restriction isn't actually enforced.
    const weightPage = new WeightAllocationPage(page);
    await weightPage.goto();
    const firstRow = weightPage.rows.first();
    await expect(firstRow.getByText('DRAFT', { exact: true })).toBeVisible();

    const racesButton = weightPage.racesButtonForRow(firstRow);
    await expect(racesButton).toBeEnabled();

    await racesButton.click();
    await expect(page).toHaveURL(/\/weight-race\?meetingid=\d+/);
  });
});
