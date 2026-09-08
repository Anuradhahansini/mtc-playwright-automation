import { type Page, type Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class PostRaceMeetingPage extends BasePage {
  readonly heading: Locator;
  readonly missingInfoToggle: Locator;
  readonly rows: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Post-Race Meeting Information', level: 1 });
    // Switch order on this page: Show Filters, Missing Info, Admin Functions, Show Delete.
    this.missingInfoToggle = page.getByRole('switch').nth(1);
    this.rows = page.locator('table tbody tr');
  }

  async goto() {
    await super.goto('/postrace');
    await this.heading.waitFor();
  }

  completenessBadgeForRow(row: Locator): Locator {
    return row.getByRole('button', { name: /Data (Completely|Partially) Missing/ });
  }

  racesButtonForRow(row: Locator): Locator {
    return row.getByRole('button', { name: 'Races', exact: true });
  }
}
