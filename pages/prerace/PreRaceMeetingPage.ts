import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

// The "Add/Edit Meeting" dialog's Course/Type/Stage/Status fields are custom
// Radix Select widgets (a button[role=combobox] plus a listbox of options),
// not native <select> elements - they need click-trigger-then-click-option.
export class PreRaceMeetingPage extends BasePage {
  readonly heading: Locator;
  readonly addMeetingButton: Locator;
  readonly meetingRows: Locator;
  readonly meetingDialog: Locator;
  readonly courseTrigger: Locator;
  readonly dateInput: Locator;
  readonly typeTrigger: Locator;
  readonly meetingNumberInput: Locator;
  readonly meetingNameInput: Locator;
  readonly meetingNameAltInput: Locator;
  readonly stageTrigger: Locator;
  readonly statusTrigger: Locator;
  readonly saveButton: Locator;
  readonly closeButton: Locator;
  readonly formAlert: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Pre-Race Meeting Information' });
    this.addMeetingButton = page.getByRole('button', { name: 'Add Meeting', exact: true });
    this.meetingRows = page.locator('table tbody tr');
    this.meetingDialog = page.getByRole('dialog').filter({ has: page.getByRole('heading', { name: 'Add Meeting' }) });
    this.courseTrigger = this.meetingDialog.locator('button[role="combobox"]').nth(0);
    this.dateInput = this.meetingDialog.locator('input[name="date"]');
    this.typeTrigger = this.meetingDialog.locator('button[role="combobox"]').nth(1);
    this.meetingNumberInput = this.meetingDialog.locator('input[name="RACEMeetingNumber"]');
    this.meetingNameInput = this.meetingDialog.locator('input[name="RACEMeetingName"]');
    this.meetingNameAltInput = this.meetingDialog.locator('input[name="RACEMeetingNameAlt"]');
    this.stageTrigger = this.meetingDialog.locator('button[role="combobox"]').nth(2);
    this.statusTrigger = this.meetingDialog.locator('button[role="combobox"]').nth(3);
    this.saveButton = this.meetingDialog.getByRole('button', { name: 'Save' });
    this.closeButton = this.meetingDialog.getByRole('button', { name: 'Close', exact: true }).first();
    this.formAlert = this.meetingDialog.getByRole('alert');
  }

  async goto() {
    await super.goto('/prerace');
    // The meeting table loads asynchronously after the page shell renders
    // (a single skeleton row shows first), so wait for the fetch to settle
    // before callers count rows or interact with the "Add Meeting" button.
    await this.heading.waitFor();
    // A single skeleton row renders first; wait until the real rows replace it
    // so callers don't count/interact with the table before data arrives.
    await expect(this.meetingRows).not.toHaveCount(1);
  }

  async openAddMeetingForm() {
    await this.addMeetingButton.click();
    await this.meetingDialog.waitFor();
  }

  async closeAddMeetingForm() {
    await this.closeButton.click();
    await this.meetingDialog.waitFor({ state: 'hidden' });
  }

  async selectDropdownOption(trigger: Locator, optionText: string) {
    await trigger.click();
    await this.page.getByRole('option', { name: optionText, exact: true }).click();
  }

  /** Opens a dropdown, reads its option labels, then closes it without picking one. */
  async getDropdownOptionTexts(trigger: Locator): Promise<string[]> {
    await trigger.click();
    const firstOption = this.page.getByRole('option').first();
    await firstOption.waitFor();
    const options = await this.page.getByRole('option').allTextContents();
    await this.page.keyboard.press('Escape');
    return options;
  }

  async fillMeetingForm(opts: { course?: string; date?: string; type?: string; meetingName?: string }) {
    if (opts.course) await this.selectDropdownOption(this.courseTrigger, opts.course);
    if (opts.date) await this.dateInput.fill(opts.date);
    if (opts.type) await this.selectDropdownOption(this.typeTrigger, opts.type);
    if (opts.meetingName) await this.meetingNameInput.fill(opts.meetingName);
  }

  async save() {
    await this.saveButton.click();
  }
}
