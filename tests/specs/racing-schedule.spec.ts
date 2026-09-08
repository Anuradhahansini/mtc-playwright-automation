import { test, expect } from '@playwright/test';
import { RacingSchedulePage } from '../../pages/schedule/RacingSchedulePage';

// Runs in the 'chromium-authenticated' project (see playwright.config.ts),
// reusing the session saved by tests/auth.setup.ts.
test.describe('Racing Schedule', () => {
  test('loads the calendar for the current month', async ({ page }) => {
    const schedulePage = new RacingSchedulePage(page);
    await schedulePage.goto();
    await schedulePage.expectLoaded();
    await expect(schedulePage.weekdayHeaders).toHaveCount(7);
  });

  test('navigates to the next month and back with Previous/Next', async ({ page }) => {
    const schedulePage = new RacingSchedulePage(page);
    await schedulePage.goto();
    await schedulePage.expectLoaded();

    const startingMonth = await schedulePage.monthHeading.textContent();

    await schedulePage.goToNextMonth();
    await expect(schedulePage.monthHeading).not.toHaveText(startingMonth ?? '');

    await schedulePage.goToPreviousMonth();
    await expect(schedulePage.monthHeading).toHaveText(startingMonth ?? '');
  });

  test('shows race meetings as links that open the meeting detail page', async ({ page }) => {
    const schedulePage = new RacingSchedulePage(page);
    await schedulePage.goto();
    await schedulePage.expectLoaded();

    // Meeting data loads asynchronously after the calendar shell renders.
    await expect(schedulePage.meetingLinks.first()).toBeVisible();

    await schedulePage.meetingLinks.first().click();
    await expect(page).toHaveURL(/meetingid=\d+/);
  });

  test('opens and closes the add-meeting form without creating a meeting', async ({ page }) => {
    const schedulePage = new RacingSchedulePage(page);
    await schedulePage.goto();
    await schedulePage.expectLoaded();

    await expect(schedulePage.meetingLinks.first()).toBeVisible();
    const meetingCountBefore = await schedulePage.meetingLinks.count();

    await schedulePage.openAddMeetingForm();
    await expect(schedulePage.meetingDialog).toBeVisible();

    await schedulePage.closeAddMeetingForm();
    await expect(schedulePage.meetingDialog).toBeHidden();
    await expect(schedulePage.meetingLinks).toHaveCount(meetingCountBefore);
  });
});
