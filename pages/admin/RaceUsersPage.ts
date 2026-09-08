import { type Page, type Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class RaceUsersPage extends BasePage {
  readonly heading: Locator;
  readonly addNewUserButton: Locator;
  readonly userDialog: Locator;
  readonly firstNameLabel: Locator;
  readonly lastNameLabel: Locator;
  readonly closeButton: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Race Users', level: 1 });
    this.addNewUserButton = page.getByRole('button', { name: 'Add New User' });
    this.userDialog = page.getByRole('dialog').filter({ has: page.getByRole('heading', { name: 'Add New User' }) });
    this.firstNameLabel = this.userDialog.getByText('First Name', { exact: false });
    this.lastNameLabel = this.userDialog.getByText('Last Name', { exact: false });
    this.closeButton = this.userDialog.getByRole('button', { name: 'Close', exact: true }).first();
  }

  async goto() {
    await super.goto('/race-users');
    await this.heading.waitFor();
  }

  async openAddUserForm() {
    await this.addNewUserButton.click();
    await this.userDialog.waitFor();
  }

  async closeAddUserForm() {
    await this.closeButton.click();
    await this.userDialog.waitFor({ state: 'hidden' });
  }
}
