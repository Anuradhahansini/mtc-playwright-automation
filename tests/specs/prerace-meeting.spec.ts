import { test, expect } from '@playwright/test';
import { PreRaceMeetingPage } from '../../pages/prerace/PreRaceMeetingPage';
import { MEETINGS } from '../../data/meeting';
import { COURSE_NAME, MEETING_STAGES, MEETING_STATUSES } from '../../common/constants';

// Runs in the 'chromium-authenticated' project (see playwright.config.ts),
// reusing the session saved by tests/auth.setup.ts.
//
// These tests deliberately avoid creating a real meeting: this instance has no
// verified delete/cleanup flow, and creating one would leave permanent test
// data behind. Every scenario here either gets rejected by the app (duplicate,
// missing fields) or is closed without saving.
test.describe('Pre-Race - Meeting', () => {
  // A known existing meeting to attempt a duplicate against.
  const existingMeeting = MEETINGS.princessMargaretCu;

  test('rejects creating a meeting with the same date and name as an existing one', async ({ page }) => {
    const meetingPage = new PreRaceMeetingPage(page);
    await meetingPage.goto();
    await expect(meetingPage.heading).toBeVisible();
    const rowCountBefore = await meetingPage.meetingRows.count();

    await meetingPage.openAddMeetingForm();
    await meetingPage.fillMeetingForm({
      course: COURSE_NAME,
      date: existingMeeting.dateIso,
      type: 'Race',
      meetingName: existingMeeting.name,
    });
    await meetingPage.save();

    await expect(meetingPage.formAlert).toContainText('Meeting Already Exists');
    await meetingPage.closeAddMeetingForm();
    await expect(meetingPage.meetingRows).toHaveCount(rowCountBefore);
  });

  test('shows an error instead of silently saving when required fields are missing', async ({ page }) => {
    const meetingPage = new PreRaceMeetingPage(page);
    await meetingPage.goto();
    await expect(meetingPage.heading).toBeVisible();
    const rowCountBefore = await meetingPage.meetingRows.count();

    await meetingPage.openAddMeetingForm();
    await meetingPage.save();

    await expect(meetingPage.formAlert).toBeVisible();
    await meetingPage.closeAddMeetingForm();
    await expect(meetingPage.meetingRows).toHaveCount(rowCountBefore);
  });

  test('offers the documented meeting stages in order', async ({ page }) => {
    const meetingPage = new PreRaceMeetingPage(page);
    await meetingPage.goto();
    await meetingPage.openAddMeetingForm();

    const stages = await meetingPage.getDropdownOptionTexts(meetingPage.stageTrigger);
    expect(stages).toEqual([...MEETING_STAGES]);

    await meetingPage.closeAddMeetingForm();
  });

  test('offers the documented meeting statuses in order', async ({ page }) => {
    const meetingPage = new PreRaceMeetingPage(page);
    await meetingPage.goto();
    await meetingPage.openAddMeetingForm();

    const statuses = await meetingPage.getDropdownOptionTexts(meetingPage.statusTrigger);
    expect(statuses).toEqual([...MEETING_STATUSES]);

    await meetingPage.closeAddMeetingForm();
  });

  test('defaults a new meeting to the Nominations stage and DRAFT status', async ({ page }) => {
    const meetingPage = new PreRaceMeetingPage(page);
    await meetingPage.goto();
    await meetingPage.openAddMeetingForm();

    await expect(meetingPage.stageTrigger).toHaveText('Nominations');
    await expect(meetingPage.statusTrigger).toHaveText('DRAFT');

    await meetingPage.closeAddMeetingForm();
  });

  test('only offers a single course to choose from', async ({ page }) => {
    const meetingPage = new PreRaceMeetingPage(page);
    await meetingPage.goto();
    await meetingPage.openAddMeetingForm();

    const courses = await meetingPage.getDropdownOptionTexts(meetingPage.courseTrigger);
    expect(courses).toEqual([COURSE_NAME]);

    await meetingPage.closeAddMeetingForm();
  });
});
