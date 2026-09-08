import { test, expect } from '@playwright/test';
import { ChampionshipStatsPage } from '../../pages/admin/ChampionshipStatsPage';

// Runs in the 'chromium-authenticated' project (see playwright.config.ts),
// reusing the session saved by tests/auth.setup.ts. Read-only.
test.describe('Admin - Championship Stats', () => {
  test('loads season standings, defaulting to the Horse scoring tab', async ({ page }) => {
    const statsPage = new ChampionshipStatsPage(page);
    await statsPage.goto();
    await expect(statsPage.heading).toBeVisible();
    await expect(statsPage.scoringTab('Horse')).toHaveAttribute('aria-selected', 'true');
    await expect(statsPage.tableHeaderRow).toContainText('Horse Name');
    expect(await statsPage.rows.count()).toBeGreaterThan(0);
  });

  test('switching scoring tabs loads that category\'s standings', async ({ page }) => {
    const statsPage = new ChampionshipStatsPage(page);
    await statsPage.goto();

    await statsPage.scoringTab('Trainer').click();

    await expect(statsPage.scoringTab('Trainer')).toHaveAttribute('aria-selected', 'true');
    await expect(statsPage.scoringTab('Horse')).toHaveAttribute('aria-selected', 'false');
    await expect(statsPage.tableHeaderRow).not.toContainText('Horse Name');
    await expect(statsPage.exportButton).toHaveText(/Trainer/);
  });

  test('sorting by a column reorders the standings', async ({ page }) => {
    const statsPage = new ChampionshipStatsPage(page);
    await statsPage.goto();

    const topHorseBefore = await statsPage.firstRowHorseName().textContent();

    await statsPage.sortByColumn('Wins').click();

    await expect(statsPage.firstRowHorseName()).not.toHaveText(topHorseBefore ?? '');
  });
});
