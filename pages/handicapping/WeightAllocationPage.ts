import { type Page, type Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class WeightAllocationPage extends BasePage {
  readonly heading: Locator;
  readonly ruleText: Locator;
  readonly rows: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Weight Allocation', level: 1 });
    this.ruleText = page.getByText(/Only meetings with Meeting Stage: Weight and Status: Final/i);
    this.rows = page.locator('table tbody tr');
  }

  async goto() {
    await super.goto('/weight');
    await this.heading.waitFor();
  }

  racesButtonForRow(row: Locator): Locator {
    return row.getByRole('button', { name: 'Races', exact: true });
  }
}
