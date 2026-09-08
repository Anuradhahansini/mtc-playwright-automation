import { type Page, type Locator } from '@playwright/test';

export type Role = 'Admin' | 'Trainer' | 'Tipster';

// The "Choose your role" screen shown before the actual sign-in form.
// It's reused wherever a fresh, unauthenticated session lands on '/'.
export class RoleSelector {
  readonly page: Page;
  readonly heading: Locator;
  readonly adminCard: Locator;
  readonly trainerCard: Locator;
  readonly tipsterCard: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Choose your role' });
    this.adminCard = page.getByRole('button').filter({ hasText: 'Admin' });
    this.trainerCard = page.getByRole('button').filter({ hasText: 'Trainer' });
    this.tipsterCard = page.getByRole('button').filter({ hasText: 'Tipster' });
  }

  private cardFor(role: Role): Locator {
    return { Admin: this.adminCard, Trainer: this.trainerCard, Tipster: this.tipsterCard }[role];
  }

  async selectRole(role: Role) {
    await this.heading.waitFor();
    await this.cardFor(role).click();
  }
}
