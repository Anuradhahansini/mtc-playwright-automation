import { type Page, type Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class WorkoutsListPage extends BasePage {
  readonly heading: Locator;
  readonly rows: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Workouts / Trials', level: 1 });
    this.rows = page.locator('table tbody tr');
  }

  async goto() {
    await super.goto('/workouts');
    await this.heading.waitFor();
  }

  typeForRow(row: Locator): Locator {
    return row.locator('button[role="combobox"]').first();
  }

  actionButtonForRow(row: Locator): Locator {
    // The last button in the row opens the meeting's runner grid; its label
    // matches the meeting's Type (e.g. "WORKOUT" or "TRIAL").
    return row.locator('button').last();
  }
}
