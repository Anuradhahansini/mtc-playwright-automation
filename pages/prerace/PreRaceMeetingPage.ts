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

  // --- Inline-edit grid fields (Meeting Name column of the list, not the
  // Add Meeting dialog). Each editable cell is an <input> plus a lock/unlock
  // icon button right after it: locked (readonly) by default, click to
  // unlock, edit, then Enter *or* clicking away both save immediately to
  // the server (no confirmation), and Escape cancels without saving. ---

  gridMeetingNameInputForRow(row: Locator): Locator {
    return row.locator('input[data-field-name="RACEMeetingName"]');
  }

  /**
   * Targets a meeting's grid input by its actual meeting ID rather than row
   * position - the list can reorder (e.g. if a sort key like the name
   * itself changes), so "row.first()" is not a stable way to re-find the
   * same meeting across a goto() reload.
   */
  gridMeetingNameInputById(meetingId: string): Locator {
    return this.page.locator(`input[data-field-name="RACEMeetingName"][data-id="${meetingId}"]`);
  }

  /**
   * The Date column's grid input. While locked it's a plain text field
   * showing e.g. "01-Sept-2026". Unlocking it swaps it for a *native*
   * <input type="date">, but the app pre-fills that native input's value as
   * "2026-Sept-01" - not valid ISO (YYYY-MM-DD), so the browser rejects it
   * and the date picker opens blank instead of showing the current date.
   */
  gridDateInputById(meetingId: string): Locator {
    return this.page.locator(`input[data-field-name="date"][data-id="${meetingId}"]`);
  }

  gridFieldLockButton(input: Locator): Locator {
    return input.locator('xpath=following-sibling::button[1]');
  }

  async unlockGridField(input: Locator) {
    await this.gridFieldLockButton(input).click();
    await expect(input).not.toHaveAttribute('readonly', '');
  }

  /**
   * Commits an inline-grid edit by pressing Enter, then gives the save
   * request time to actually reach the server before returning. Without
   * this, navigating away (e.g. a goto() to verify/clean up) immediately
   * afterward can abort the in-flight save request - confirmed by
   * reproducing it directly: the same edit succeeds every time when this
   * settle wait is present, and intermittently fails without it.
   */
  async commitGridEdit(input: Locator) {
    await input.press('Enter');
    await expect(input).toHaveAttribute('readonly', '');
    await this.page.waitForTimeout(1000);
  }
}
