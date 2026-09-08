import { type Page, type Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class PreRaceRacePage extends BasePage {
  readonly heading: Locator;
  readonly addRaceButton: Locator;
  readonly raceRows: Locator;
  readonly raceDialog: Locator;
  readonly raceNoInput: Locator;
  readonly saveButton: Locator;
  readonly closeButton: Locator;
  readonly formAlert: Locator;
  readonly backToMeetingButton: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Pre Race Races' });
    this.addRaceButton = page.getByRole('button', { name: 'Create A Race' });
    this.raceRows = page.locator('table tbody tr');
    this.raceDialog = page.getByRole('dialog').filter({ has: page.getByRole('heading', { name: 'Create Races' }) });
    this.raceNoInput = this.raceDialog.getByPlaceholder('Enter race number');
    this.saveButton = this.raceDialog.getByRole('button', { name: 'Save' });
    this.closeButton = this.raceDialog.getByRole('button', { name: 'Close', exact: true }).first();
    this.formAlert = this.raceDialog.getByRole('alert');
    this.backToMeetingButton = page.getByRole('button', { name: 'Back To Meeting' });
  }

  async goto(meetingId: string) {
    await super.goto(`/prerace-race?meetingid=${meetingId}`);
    await this.heading.waitFor();
  }

  async openAddRaceForm() {
    await this.addRaceButton.click();
    await this.raceDialog.waitFor();
  }

  async closeAddRaceForm() {
    await this.closeButton.click();
    await this.raceDialog.waitFor({ state: 'hidden' });
  }

  async save() {
    await this.saveButton.click();
  }
}
