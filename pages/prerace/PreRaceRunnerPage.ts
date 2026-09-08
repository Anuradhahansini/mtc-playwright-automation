import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class PreRaceRunnerPage extends BasePage {
  readonly heading: Locator;
  readonly addRunnerButton: Locator;
  readonly runnerRows: Locator;
  readonly runnerDialog: Locator;
  readonly raceHorseTrigger: Locator;
  readonly saveButton: Locator;
  readonly closeButton: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Pre Race Runners' });
    this.addRunnerButton = page.getByRole('button', { name: 'Add New Runner' });
    this.runnerRows = page.locator('table tbody tr');
    this.runnerDialog = page.getByRole('dialog').filter({ has: page.getByRole('heading', { name: 'Add New Runner' }) });
    this.raceHorseTrigger = this.runnerDialog.locator('button[role="combobox"]').first();
    this.saveButton = this.runnerDialog.getByRole('button', { name: 'Save' });
    this.closeButton = this.runnerDialog.getByRole('button', { name: 'Close', exact: true }).first();
  }

  async goto(meetingId: string, raceId: string) {
    await super.goto(`/prerace-runner?meetingid=${meetingId}&raceid=${raceId}`);
    await this.heading.waitFor();
  }

  async openAddRunnerForm() {
    await this.addRunnerButton.click();
    await this.runnerDialog.waitFor();
  }

  async closeAddRunnerForm() {
    await this.closeButton.click();
    await this.runnerDialog.waitFor({ state: 'hidden' });
  }

  async save() {
    await this.saveButton.click();
  }

  /** Opens the Race Horse dropdown, reads its option labels, then closes it without picking one. */
  async getRaceHorseOptionTexts(): Promise<string[]> {
    await this.raceHorseTrigger.click();
    const searchBox = this.page.getByPlaceholder('Search...');
    await searchBox.waitFor();
    // The full horse list (hundreds of options) populates just after the
    // search box appears; wait for a plausible-sized batch before reading.
    await expect
      .poll(async () => (await this.page.getByRole('option').count()) > 5)
      .toBe(true);
    const options = await this.page.getByRole('option').allTextContents();
    await this.page.keyboard.press('Escape');
    return options;
  }
}
