import { test, expect } from '../apiFixtures';
import { MEETINGS } from '../../data/meeting';

// Runs in the 'api' project (see playwright.config.ts).
test.describe('API - Race Results', () => {
  test('BUG: GET /RaceResults/GetMeetingRaceResults returns a raw 500', async ({ api }) => {
    // Meeting 487 hasn't reached the Results stage (it's Nominations), so
    // some result-only column is presumably still NULL - the controller
    // doesn't guard against that and lets the DBNull cast exception bubble
    // straight to the client as an unhandled 500.
    const res = await api.get('/api/RaceResults/GetMeetingRaceResults', { meetingId: MEETINGS.princessMargaretCu.id });

    expect(res.status()).toBe(500);
    const text = await res.text();
    expect(text).toContain('System.InvalidCastException');
    expect(text).toContain('Object cannot be cast from DBNull');
    expect(text).toContain('RaceResultsController.GetMeetingRaceResults');
  });

  test('GET /RaceResults/GetRacesByDate requires a valid date', async ({ api }) => {
    const res = await api.get('/api/RaceResults/GetRacesByDate', { date: '2026-09-01' });
    // "date" isn't the right param name (it's raceDate) - documents the
    // real validation error rather than assuming success.
    expect(res.status()).toBe(400);
  });
});
