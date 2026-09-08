import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from '../BasePage';
import { RoleSelector, type Role } from '../common/RoleSelector';

export type { Role };

export class LoginPage extends BasePage {
  readonly roleSelector: RoleSelector;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorAlert: Locator;
  readonly usernameFieldError: Locator;
  readonly passwordFieldError: Locator;

  constructor(page: Page) {
    super(page);
    this.roleSelector = new RoleSelector(page);
    this.usernameInput = page.getByPlaceholder('Your username');
    this.passwordInput = page.getByPlaceholder('Your password');
    this.submitButton = page.getByRole('button', { name: /sign in|log in/i });
    this.errorAlert = page.getByRole('alert').filter({ hasText: 'Invalid username or password' });
    this.usernameFieldError = page.getByText('Username is required');
    this.passwordFieldError = page.getByText('Password is required.');
  }

  async selectRole(role: Role) {
    await this.roleSelector.selectRole(role);
    await this.usernameInput.waitFor();
  }

  async fillCredentials(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
  }

  async submit() {
    await this.submitButton.click();
  }

  async login(role: Role, username: string, password: string) {
    await this.goto('/');
    await this.selectRole(role);
    await this.fillCredentials(username, password);
    await this.submit();
  }

  async expectInvalidCredentialsError() {
    await expect(this.errorAlert).toBeVisible();
  }
}
