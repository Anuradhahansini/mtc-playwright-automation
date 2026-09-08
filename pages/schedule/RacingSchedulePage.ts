import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class RacingSchedulePage extends BasePage {
  readonly heading: Locator;
  readonly monthHeading: Locator;
  readonly previousButton: Locator;
  readonly nextButton: Locator;
  readonly weekdayHeaders: Locator;
  readonly meetingLinks: Locator;
  readonly addMeetingButtons: Locator;
  readonly meetingDialog: Locator;
  readonly meetingDialogSaveButton: Locator;
  readonly meetingDialogCloseButton: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Racing Schedule', level: 1 });
    this.monthHeading = page.getByRole('heading', { name: /^[A-Z][a-z]+ \d{4}$/ });
    this.previousButton = page.getByRole('button', { name: '< Previous' });
    this.nextButton = page.getByRole('button', { name: 'Next >' });
    this.weekdayHeaders = page.getByText(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)$/);
    this.meetingLinks = page.locator('a[href*="meetingid="]');
    this.addMeetingButtons = page.getByRole('button', { name: '[+]' });
    this.meetingDialog = page.getByRole('dialog').filter({ has: page.getByRole('heading', { name: 'Meeting' }) });
    this.meetingDialogSaveButton = this.meetingDialog.getByRole('button', { name: 'Save' });
    this.meetingDialogCloseButton = this.meetingDialog.getByRole('button', { name: 'Close', exact: true }).first();
  }

  async goto() {
    await super.goto('/racing-schedule');
  }

  async goToNextMonth() {
    await this.nextButton.click();
  }

  async goToPreviousMonth() {
    await this.previousButton.click();
  }

  async openAddMeetingForm(index = 0) {
    await this.addMeetingButtons.nth(index).click();
    await this.meetingDialog.waitFor();
  }

  async closeAddMeetingForm() {
    await this.meetingDialogCloseButton.click();
    await this.meetingDialog.waitFor({ state: 'hidden' });
  }

  async expectLoaded() {
    await expect(this.heading).toBeVisible();
    await expect(this.monthHeading).toBeVisible();
  }
}
