import { test, expect } from '@playwright/test';
import { EmailsPage } from '../../pages/emails/EmailsPage';

// Runs in the 'chromium-authenticated' project (see playwright.config.ts),
// reusing the session saved by tests/auth.setup.ts.
//
// This page can send a real advisory email to real recipients. These tests
// never click Send Email - they only verify it starts disabled and that
// picking a template updates the compose body, without ever getting the
// send button into a clickable state.
test.describe('Emails', () => {
  test('loads today\'s meeting data and starts with Send Email disabled', async ({ page }) => {
    const emailsPage = new EmailsPage(page);
    await emailsPage.goto();
    await expect(emailsPage.heading).toBeVisible();
    await expect(emailsPage.dataLoadedText).toBeVisible();
    await expect(emailsPage.sendEmailButton).toBeDisabled();
  });

  test('selecting a template fills in the compose body', async ({ page }) => {
    const emailsPage = new EmailsPage(page);
    await emailsPage.goto();

    await emailsPage.templateOption('Scratched Runner').click();
    await expect(emailsPage.editor).toContainText('{ScratchedRunner}');

    await emailsPage.templateOption('Vision - RCN - Issue').click();
    await expect(emailsPage.editor).not.toContainText('{ScratchedRunner}');
  });
});
