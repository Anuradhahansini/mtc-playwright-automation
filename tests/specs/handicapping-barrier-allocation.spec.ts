import { test, expect } from '@playwright/test';
import { BarrierAllocationPage } from '../../pages/handicapping/BarrierAllocationPage';

// Runs in the 'chromium-authenticated' project (see playwright.config.ts),
// reusing the session saved by tests/auth.setup.ts. Read-only: only ever
// navigates and reads state, never creates/edits/deletes a record.
test.describe('Handicapping - Barrier Allocation', () => {
  test('loads with the documented access rule', async ({ page }) => {
    const barrierPage = new BarrierAllocationPage(page);
    await barrierPage.goto();
    await expect(barrierPage.heading).toBeVisible();
    await expect(barrierPage.ruleText).toBeVisible();
  });

  test('BUG: disables "Barriers" for a meeting that IS at the Acceptances stage', async ({ page }) => {
    // The page states: "Only meetings with Meeting Stage: Acceptance can
    // access the Barrier Allocation numbers page." Every row on this page is
    // already filtered to Stage=Acceptances (it's the only stage shown here),
    // so by that rule the Barriers button should be enabled for all of them.
    // It's disabled instead - its title attribute reveals why: the button's
    // real check requires the stage to be "Weight", not "Acceptance" -
    // looks like the Weight Allocation page's condition was copy-pasted here
    // without updating the stage it checks for.
    const barrierPage = new BarrierAllocationPage(page);
    await barrierPage.goto();
    const firstRow = barrierPage.rows.first();
    await expect(firstRow.getByText('Acceptances', { exact: true })).toBeVisible();

    const barriersButton = barrierPage.barriersButtonForRow(firstRow);
    await expect(barriersButton).toBeDisabled();
    await expect(barriersButton).toHaveAttribute('title', /requires the meeting stage to be Weight/i);
  });
});
