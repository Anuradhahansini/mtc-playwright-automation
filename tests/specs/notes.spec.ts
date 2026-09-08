import { test, expect } from '@playwright/test';
import { NotesPage } from '../../pages/notes/NotesPage';

// Runs in the 'chromium-authenticated' project (see playwright.config.ts),
// reusing the session saved by tests/auth.setup.ts. Read-only: the Add Note
// form is only ever opened/closed, never saved, to avoid writing real data.
test.describe('Notes', () => {
  test('loads with existing notes', async ({ page }) => {
    const notesPage = new NotesPage(page);
    await notesPage.goto();
    await expect(notesPage.heading).toBeVisible();
    expect(await notesPage.rows.count()).toBeGreaterThan(0);
  });

  test('disables Save until required fields are filled', async ({ page }) => {
    const notesPage = new NotesPage(page);
    await notesPage.goto();
    await notesPage.openAddNoteForm();

    await expect(notesPage.saveButton).toBeDisabled();

    await notesPage.closeAddNoteForm();
  });

  test('offers the documented note types', async ({ page }) => {
    const notesPage = new NotesPage(page);
    await notesPage.goto();
    await notesPage.openAddNoteForm();

    const noteTypes = await notesPage.getDropdownOptionTexts(notesPage.noteTypeTrigger);
    expect(noteTypes).toEqual(['Horse', 'Stewards', 'PreRace', 'PostRace', 'InRunning', 'Other']);

    await notesPage.closeAddNoteForm();
  });

  test('offers the documented reference types', async ({ page }) => {
    const notesPage = new NotesPage(page);
    await notesPage.goto();
    await notesPage.openAddNoteForm();

    const refTypes = await notesPage.getDropdownOptionTexts(notesPage.refTypeTrigger);
    expect(refTypes).toEqual(['Horse', 'Jockey', 'Trainer', 'RASRace', 'Race', 'Meeting', 'Other']);

    await notesPage.closeAddNoteForm();
  });
});
