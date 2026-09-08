import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/user/LoginPage';
import { VALID_USERNAME, VALID_PASSWORD } from '../../data/user';

test.describe('Login flow - negative cases', () => {
  test('rejects a wrong password for a valid username', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login('Admin', VALID_USERNAME, 'wrong-password-123');
    await loginPage.expectInvalidCredentialsError();
    await expect(page).toHaveURL(/\/auth\/signin/);
  });

  test('rejects a wrong username with a valid password', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login('Admin', 'not_a_real_user', VALID_PASSWORD);
    await loginPage.expectInvalidCredentialsError();
    await expect(page).toHaveURL(/\/auth\/signin/);
  });

  test('shows required-field validation when both fields are empty', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.selectRole('Admin');
    await loginPage.submit();
    await expect(loginPage.usernameFieldError).toBeVisible();
    await expect(loginPage.passwordFieldError).toBeVisible();
  });

  test('shows required-field validation when username is empty', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.selectRole('Admin');
    await loginPage.fillCredentials('', VALID_PASSWORD);
    await loginPage.submit();
    await expect(loginPage.usernameFieldError).toBeVisible();
  });

  test('shows required-field validation when password is empty', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.selectRole('Admin');
    await loginPage.fillCredentials(VALID_USERNAME, '');
    await loginPage.submit();
    await expect(loginPage.passwordFieldError).toBeVisible();
  });

  test('rejects an invalid-email-format username', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login('Admin', 'not-an-email@@example', VALID_PASSWORD);
    await loginPage.expectInvalidCredentialsError();
  });
});
