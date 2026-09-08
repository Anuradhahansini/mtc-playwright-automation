import { test, expect } from '@playwright/test';
import { WorkoutsListPage } from '../../pages/workouts/WorkoutsListPage';
import { WorkoutRunnersPage } from '../../pages/workouts/WorkoutRunnersPage';

// Runs in the 'chromium-authenticated' project (see playwright.config.ts),
// reusing the session saved by tests/auth.setup.ts. Read-only.
//
// Workout/Trial meetings aren't created here - they're created from Racing
// Schedule's Add Meeting form by setting Type to WORKOUT or TRIAL (see
// racing-schedule.spec.ts). This page just lists and manages them.
test.describe('Workouts', () => {
  test('lists workout/trial meetings', async ({ page }) => {
    const workoutsPage = new WorkoutsListPage(page);
    await workoutsPage.goto();
    await expect(workoutsPage.heading).toBeVisible();
    expect(await workoutsPage.rows.count()).toBeGreaterThan(0);
  });

  test('every listed meeting is a Workout or Trial type', async ({ page }) => {
    const workoutsPage = new WorkoutsListPage(page);
    await workoutsPage.goto();
    const rowCount = await workoutsPage.rows.count();

    for (let i = 0; i < rowCount; i++) {
      const type = workoutsPage.typeForRow(workoutsPage.rows.nth(i));
      await expect(type).toHaveText(/^(WORKOUT|TRIAL)$/);
    }
  });

  test('opens the runner grid for a listed meeting', async ({ page }) => {
    const workoutsPage = new WorkoutsListPage(page);
    await workoutsPage.goto();
    const firstRow = workoutsPage.rows.first();

    await workoutsPage.actionButtonForRow(firstRow).click();

    await expect(page).toHaveURL(/\/workouts\?meetingid=\d+/);
    const runnersPage = new WorkoutRunnersPage(page);
    await expect(runnersPage.heading).toBeVisible();
    await expect(runnersPage.backToWorkoutsButton).toBeVisible();
  });
});
