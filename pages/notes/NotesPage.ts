import { type Page, type Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class NotesPage extends BasePage {
  readonly heading: Locator;
  readonly addNoteButton: Locator;
  readonly rows: Locator;
  readonly noteDialog: Locator;
  readonly noteTypeTrigger: Locator;
  readonly refTypeTrigger: Locator;
  readonly refIdInput: Locator;
  readonly contentTextarea: Locator;
  readonly saveButton: Locator;
  readonly closeButton: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Notes', level: 1 });
    this.addNoteButton = page.getByRole('button', { name: 'Add Note' });
    this.rows = page.locator('table tbody tr');
    this.noteDialog = page.getByRole('dialog').filter({ has: page.getByRole('heading', { name: 'Create New Note' }) });
    this.noteTypeTrigger = this.noteDialog.locator('button[role="combobox"]').nth(0);
    this.refTypeTrigger = this.noteDialog.locator('button[role="combobox"]').nth(1);
    this.refIdInput = this.noteDialog.locator('input[name="raceRefID"]');
    this.contentTextarea = this.noteDialog.locator('textarea[name="raceContent"]');
    this.saveButton = this.noteDialog.getByRole('button', { name: 'Save' });
    this.closeButton = this.noteDialog.getByRole('button', { name: 'Close', exact: true }).first();
  }

  async goto() {
    await super.goto('/notes');
    await this.heading.waitFor();
  }

  async openAddNoteForm() {
    await this.addNoteButton.click();
    await this.noteDialog.waitFor();
  }

  async closeAddNoteForm() {
    await this.closeButton.click();
    await this.noteDialog.waitFor({ state: 'hidden' });
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
}
