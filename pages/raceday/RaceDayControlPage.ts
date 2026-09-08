import { type Page, type Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class RaceDayControlPage extends BasePage {
  readonly heading: Locator;
  readonly ruleText: Locator;
  readonly rows: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Race Day Control', level: 1 });
    this.ruleText = page.getByText(/Only meetings with Meeting Stage: Acceptance and Status: Final/i);
    this.rows = page.locator('table tbody tr');
  }

  async goto() {
    await super.goto('/raceday');
    await this.heading.waitFor();
  }

  dateInputForRow(row: Locator): Locator {
    // The DATE cell renders as an editable grid <input>; its text lives in
    // the value attribute rather than as visible text content.
    return row.locator('input').first();
  }

  racesButtonForRow(row: Locator): Locator {
    return row.getByRole('button', { name: 'Races', exact: true });
  }
}
