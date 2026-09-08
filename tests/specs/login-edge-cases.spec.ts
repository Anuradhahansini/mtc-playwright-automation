import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/user/LoginPage';
import { VALID_USERNAME, VALID_PASSWORD } from '../../data/user';

test.describe('Login flow - edge cases', () => {
  test('safely rejects a SQL injection attempt in the username field', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login('Admin', `' OR '1'='1' --`, VALID_PASSWORD);
    await loginPage.expectInvalidCredentialsError();
    // The app should still be functional afterwards, not crashed by the payload.
    await expect(loginPage.submitButton).toBeEnabled();
  });

  test('safely rejects a SQL injection attempt in the password field', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login('Admin', VALID_USERNAME, `' OR '1'='1`);
    await loginPage.expectInvalidCredentialsError();
  });

  test('handles a very long username/password without crashing', async ({ page }) => {
    const longString = 'a'.repeat(5000);
    const loginPage = new LoginPage(page);
    await loginPage.login('Admin', longString, longString);
    await loginPage.expectInvalidCredentialsError();
  });

  test('handles special characters in credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login('Admin', `<script>alert(1)</script>`, `!@#$%^&*()_+-=[]{}|;':",./<>?`);
    await loginPage.expectInvalidCredentialsError();
  });

  test('rejects whitespace-only credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login('Admin', '   ', '   ');
    await loginPage.expectInvalidCredentialsError();
  });
});
