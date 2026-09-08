import { type Page, type Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class EmailsPage extends BasePage {
  readonly heading: Locator;
  readonly dataLoadedText: Locator;
  readonly sendEmailButton: Locator;
  readonly editor: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Send Emails', level: 1 });
    this.dataLoadedText = page.getByText(/^Data loaded for \d{4}-\d{2}-\d{2}/);
    this.sendEmailButton = page.getByRole('button', { name: 'Send Email' });
    this.editor = page.locator('.ql-editor');
  }

  async goto() {
    await super.goto('/send-emails');
    await this.heading.waitFor();
  }

  /** Template names aren't unique across categories, so this targets the first match. */
  templateOption(name: string): Locator {
    return this.page.getByText(name, { exact: true }).first();
  }
}
