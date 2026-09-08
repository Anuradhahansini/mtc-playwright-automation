import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class DashboardPage extends BasePage {
  readonly heading: Locator;
  readonly signOutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Race Administration Control Environment Dashboard' });
    this.signOutButton = page.getByRole('button', { name: 'Sign Out' });
  }

  async expectLoaded() {
    await expect(this.heading).toBeVisible();
    await expect(this.signOutButton).toBeVisible();
  }

  async signOut() {
    await this.signOutButton.click();
  }
}
