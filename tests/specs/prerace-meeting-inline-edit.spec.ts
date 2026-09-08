import { test, expect } from '@playwright/test';
import { PreRaceMeetingPage } from '../../pages/prerace/PreRaceMeetingPage';
import { MEETINGS } from '../../data/meeting';

// Runs in the 'chromium-authenticated' project (see playwright.config.ts),
// reusing the session saved by tests/auth.setup.ts.
//
// These tests exercise the grid's inline lock/unlock edit fields, which
// were previously untested. Investigated first with a throwaway script
// (never committed) using a separate browser session to confirm what
// actually reaches the server, since these fields have no visible Save
// button:
//   - Enter commits the edit and saves it immediately (no confirmation).
//   - Clicking away (blur) ALSO commits and saves immediately - the same
//     as Enter. There is no "are you sure" step either way.
//   - Escape cancels the pending edit without saving.
// Because Enter/blur both write real data, every test that triggers a save
// reverts the field back to its original value before finishing, verified
// via a fresh navigation (not just the in-page state) - in a try/finally so
// a mid-test assertion failure still can't leave the row mutated.
//
// Two lessons learned the hard way while building this, both left the real
// meeting 487 mutated on the server until caught and fixed by hand:
//   1. Target the field by the meeting's own ID (gridMeetingNameInputById),
//      never by row position - the list re-sorts by name, so editing the
//      name can move the row and "first row" cleanup logic can silently
//      patch the wrong meeting.
//   2. After Enter/blur, wait for the save request to actually land
//      (commitGridEdit does this) before navigating away. Navigating right
//      after Enter can abort the in-flight save request, so a cleanup step
//      that "commits" and then immediately reloads can look like it worked
//      while the server never received the write - confirmed by
//      reproducing it directly outside the test runner.
//   3. Run these tests serially (test.describe.serial), not in parallel.
//      With fullyParallel on, two tests in this file both editing meeting
//      487's Meeting Name field can run concurrently in different workers -
//      the data self-healed once both finished, but one test's own
//      before/after comparison saw the other test's in-flight value and
//      failed a real assertion over a false positive.
//   4. No retries here (configured below), even though the rest of the
//      suite retries once. A flaky failure mid-edit, retried while the
//      grid's own row/name-matching state was already disturbed, once
//      left meeting 487's Name permanently changed AND spawned an entirely
//      separate duplicate meeting (a new ID, matching the *intended*
//      revert name) - the inline-edit save appears to fall back to
//      creating a new record when it can't match the edited row by its
//      current field values. Both had to be found and fixed by hand via
//      the API's SaveMeeting/DeleteMeeting endpoints. Failing once and
//      stopping is safer than retrying into an already-disturbed state.
test.describe.configure({ retries: 0 });
test.describe.serial('Pre-Race - Meeting inline edit', () => {
  const meeting = MEETINGS.princessMargaretCu;
  const MEETING_ID = meeting.id;

  test('Enter commits an inline edit to the server', async ({ page }) => {
    const meetingPage = new PreRaceMeetingPage(page);
    await meetingPage.goto();
    const nameInput = meetingPage.gridMeetingNameInputById(MEETING_ID);
    const originalValue = await nameInput.inputValue();

    try {
      await meetingPage.unlockGridField(nameInput);
      await nameInput.fill(`${originalValue} EDITED`);
      await meetingPage.commitGridEdit(nameInput);

      await meetingPage.goto();
      const reloadedInput = meetingPage.gridMeetingNameInputById(MEETING_ID);
      await expect(reloadedInput).toHaveValue(`${originalValue} EDITED`);
    } finally {
      await meetingPage.goto();
      const cleanupInput = meetingPage.gridMeetingNameInputById(MEETING_ID);
      if ((await cleanupInput.inputValue()) !== originalValue) {
        await meetingPage.unlockGridField(cleanupInput);
        await cleanupInput.fill(originalValue);
        await meetingPage.commitGridEdit(cleanupInput);
      }
    }

    await meetingPage.goto();
    const finalInput = meetingPage.gridMeetingNameInputById(MEETING_ID);
    await expect(finalInput).toHaveValue(originalValue);
  });

  test('clicking away also commits the edit, same as Enter', async ({ page }) => {
    const meetingPage = new PreRaceMeetingPage(page);
    await meetingPage.goto();
    const nameInput = meetingPage.gridMeetingNameInputById(MEETING_ID);
    const originalValue = await nameInput.inputValue();

    try {
      await meetingPage.unlockGridField(nameInput);
      await nameInput.fill(`${originalValue} BLUREDIT`);
      await meetingPage.heading.click(); // click elsewhere to blur, no Enter
      await expect(nameInput).toHaveAttribute('readonly', '');
      await page.waitForTimeout(1000); // let the save request actually land

      await meetingPage.goto();
      const reloadedInput = meetingPage.gridMeetingNameInputById(MEETING_ID);
      await expect(reloadedInput).toHaveValue(`${originalValue} BLUREDIT`);
    } finally {
      await meetingPage.goto();
      const cleanupInput = meetingPage.gridMeetingNameInputById(MEETING_ID);
      if ((await cleanupInput.inputValue()) !== originalValue) {
        await meetingPage.unlockGridField(cleanupInput);
        await cleanupInput.fill(originalValue);
        await meetingPage.commitGridEdit(cleanupInput);
      }
    }

    await meetingPage.goto();
    const finalInput = meetingPage.gridMeetingNameInputById(MEETING_ID);
    await expect(finalInput).toHaveValue(originalValue);
  });

  test('Escape cancels the edit without saving', async ({ page }) => {
    const meetingPage = new PreRaceMeetingPage(page);
    await meetingPage.goto();
    const nameInput = meetingPage.gridMeetingNameInputById(MEETING_ID);
    const originalValue = await nameInput.inputValue();

    await meetingPage.unlockGridField(nameInput);
    await nameInput.fill(`${originalValue} SHOULD-NOT-SAVE`);
    await nameInput.press('Escape');
    await page.waitForTimeout(1000);

    // Nothing should have reached the server - confirm with a fresh load.
    await meetingPage.goto();
    const reloadedInput = meetingPage.gridMeetingNameInputById(MEETING_ID);
    await expect(reloadedInput).toHaveValue(originalValue);
  });

  test('BUG: unlocking the Date field shows a blank date picker instead of the current date', async ({ page }) => {
    const meetingPage = new PreRaceMeetingPage(page);
    await meetingPage.goto();
    const dateInput = meetingPage.gridDateInputById(MEETING_ID);
    const originalValue = await dateInput.inputValue(); // e.g. "01-Sept-2026"

    await meetingPage.unlockGridField(dateInput);

    // Unlocking swaps the field for a native <input type="date">. A correct
    // implementation would pre-fill it with the current date; instead the
    // value the app writes ("2026-Sept-01") isn't valid ISO format for a
    // date input, so the browser silently discards it and the picker opens
    // empty. Confirmed separately that this is a display-only bug - saving
    // a *correctly*-formatted date still works (see the next test) - so the
    // failure is specifically in how the current value gets prefilled.
    await expect(dateInput).toHaveAttribute('type', 'date');
    await expect(dateInput).toHaveValue('');

    // Cancel rather than save, since the picker has nothing valid to submit.
    await dateInput.press('Escape');
    await page.waitForTimeout(500);

    await meetingPage.goto();
    const reloadedInput = meetingPage.gridDateInputById(MEETING_ID);
    await expect(reloadedInput).toHaveValue(originalValue);
  });

  test('saves a correctly-formatted date edit to the server', async ({ page }) => {
    // Confirms the save mechanism itself works once the native date input
    // gets a valid ISO value - isolating the bug above to the prefill step,
    // not the save. Edits to the *same* date in ISO form, so there is
    // nothing to revert if this passes; the finally block only covers the
    // case where the assertion fails partway through.
    const meetingPage = new PreRaceMeetingPage(page);
    await meetingPage.goto();
    const dateInput = meetingPage.gridDateInputById(MEETING_ID);
    const originalValue = await dateInput.inputValue(); // e.g. "01-Sept-2026"
    const isoValue = ddMonYyyyToIso(originalValue);

    try {
      await meetingPage.unlockGridField(dateInput);
      await dateInput.fill(isoValue);
      await meetingPage.commitGridEdit(dateInput);

      await meetingPage.goto();
      const reloadedInput = meetingPage.gridDateInputById(MEETING_ID);
      await expect(reloadedInput).toHaveValue(originalValue);
    } finally {
      await meetingPage.goto();
      const cleanupInput = meetingPage.gridDateInputById(MEETING_ID);
      if ((await cleanupInput.inputValue()) !== originalValue) {
        await meetingPage.unlockGridField(cleanupInput);
        await cleanupInput.fill(isoValue);
        await meetingPage.commitGridEdit(cleanupInput);
      }
    }
  });
});

const MONTH_INDEX: Record<string, string> = {
  Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
  Jul: '07', Aug: '08', Sept: '09', Oct: '10', Nov: '11', Dec: '12',
};

/** Converts this app's grid display format ("01-Sept-2026") to ISO ("2026-09-01"). */
function ddMonYyyyToIso(value: string): string {
  const [day, mon, year] = value.split('-');
  return `${year}-${MONTH_INDEX[mon]}-${day}`;
}
