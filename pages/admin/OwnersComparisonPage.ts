import { type Page, type Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class OwnersComparisonPage extends BasePage {
  readonly heading: Locator;
  readonly compareButton: Locator;
  readonly historyText: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Owners Comparison', level: 1 });
    this.compareButton = page.getByRole('button', { name: 'Compare Owners' });
    this.historyText = page.getByText(/^History \(\d+\)$/);
  }

  async goto() {
    await super.goto('/owners-comparison');
    await this.heading.waitFor();
  }
}
