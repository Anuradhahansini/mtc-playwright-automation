import { type Page, type Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class BarrierAllocationPage extends BasePage {
  readonly heading: Locator;
  readonly ruleText: Locator;
  readonly rows: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Barrier Allocation', level: 1 });
    this.ruleText = page.getByText(/Only meetings with Meeting Stage: Acceptance/i);
    this.rows = page.locator('table tbody tr');
  }

  async goto() {
    await super.goto('/barrier');
    await this.heading.waitFor();
  }

  barriersButtonForRow(row: Locator): Locator {
    return row.getByRole('button', { name: 'Barriers' });
  }
}
