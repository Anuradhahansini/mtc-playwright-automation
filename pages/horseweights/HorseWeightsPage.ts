import { type Page, type Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class HorseWeightsPage extends BasePage {
  readonly heading: Locator;
  readonly rows: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Horse Weight Management', level: 1 });
    this.rows = page.locator('table tbody tr');
  }

  async goto() {
    await super.goto('/horse-weight');
    await this.heading.waitFor();
  }

  raceIdText(): Locator {
    return this.page.getByText(/^Race ID: \d+$/);
  }

  /** The race-number tab buttons (e.g. "1", "2") above the weight grid. */
  raceTab(raceNo: number): Locator {
    return this.page.locator('button.bg-blue-500', { hasText: new RegExp(`^${raceNo}$`) });
  }
}
