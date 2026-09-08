import { test, expect } from '@playwright/test';
import { PostRaceMeetingPage } from '../../pages/postrace/PostRaceMeetingPage';

// Runs in the 'chromium-authenticated' project (see playwright.config.ts),
// reusing the session saved by tests/auth.setup.ts. Read-only.
test.describe('Post-Race - Meeting', () => {
  test('loads the meeting list', async ({ page }) => {
    const postRacePage = new PostRaceMeetingPage(page);
    await postRacePage.goto();
    await expect(postRacePage.heading).toBeVisible();
    expect(await postRacePage.rows.count()).toBeGreaterThan(0);
  });

  test('flags each meeting\'s data-completeness status', async ({ page }) => {
    const postRacePage = new PostRaceMeetingPage(page);
    await postRacePage.goto();
    const firstRow = postRacePage.rows.first();
    await expect(postRacePage.completenessBadgeForRow(firstRow)).toBeVisible();
  });

  test('the Missing Info toggle switches on', async ({ page }) => {
    const postRacePage = new PostRaceMeetingPage(page);
    await postRacePage.goto();
    await expect(postRacePage.missingInfoToggle).toHaveAttribute('aria-checked', 'false');

    await postRacePage.missingInfoToggle.click();
    await expect(postRacePage.missingInfoToggle).toHaveAttribute('aria-checked', 'true');
  });

  test('opens the races for a listed meeting', async ({ page }) => {
    const postRacePage = new PostRaceMeetingPage(page);
    await postRacePage.goto();
    const firstRow = postRacePage.rows.first();

    await postRacePage.racesButtonForRow(firstRow).click();

    await expect(page).toHaveURL(/\/postrace-race\?meetingid=\d+/);
    await expect(page.getByRole('heading', { name: 'Post-Race Information', level: 1 })).toBeVisible();
  });
});
