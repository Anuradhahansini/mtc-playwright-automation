import { type Page, type Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class WebsiteUsersPage extends BasePage {
  readonly heading: Locator;
  readonly table: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Website Users', level: 1 });
    this.table = page.locator('table');
  }

  async goto() {
    await super.goto('/website-users');
    await this.heading.waitFor();
  }
}
