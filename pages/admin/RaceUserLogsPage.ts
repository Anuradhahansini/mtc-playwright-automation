import { type Page, type Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class RaceUserLogsPage extends BasePage {
  readonly heading: Locator;
  readonly table: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Race User Logs', level: 1 });
    this.table = page.locator('table');
  }

  async goto() {
    await super.goto('/user-logs');
    await this.heading.waitFor();
  }
}
