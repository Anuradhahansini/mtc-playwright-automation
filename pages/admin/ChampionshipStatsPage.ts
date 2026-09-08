import { type Page, type Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export type ScoringTab = 'Horse' | 'Trainer' | 'Jockey' | 'Stable';

export class ChampionshipStatsPage extends BasePage {
  readonly heading: Locator;
  readonly tableHeaderRow: Locator;
  readonly rows: Locator;
  readonly exportButton: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Championship Stats', level: 1 });
    this.tableHeaderRow = page.locator('table thead');
    this.rows = page.locator('table tbody tr');
    this.exportButton = page.getByRole('button', { name: /^Export/ });
  }

  async goto() {
    await super.goto('/championship-stats');
    await this.heading.waitFor();
    await this.rows.first().waitFor();
  }

  scoringTab(name: ScoringTab): Locator {
    return this.page.getByRole('tab', { name, exact: true });
  }

  sortByColumn(name: string): Locator {
    return this.tableHeaderRow.locator('th', { hasText: name }).getByRole('button');
  }

  /** The first data row's horse-name cell (2nd column, after the rank/Scoring cell). */
  firstRowHorseName(): Locator {
    return this.rows.first().locator('td').nth(1);
  }
}
