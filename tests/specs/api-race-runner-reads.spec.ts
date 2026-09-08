import { test, expect } from '../apiFixtures';
import { RACE_CLIENT_ID } from '../../data/client';
import { MEETINGS } from '../../data/meeting';
import { RACES } from '../../data/race';
import { RUNNERS } from '../../data/runner';

// Runs in the 'api' project (see playwright.config.ts). Covers the
// remaining read-only RaceRunner/RaceRace/RaceSession/RaceNote/
// OwnersComparison endpoints behind Pre-Race Runner, Race Day and the
// admin session/notes views.
test.describe('API - Race/Runner reads', () => {
  test('GET /RaceRunner/GetRaceRunnersByRace returns the meeting, race and its runners', async ({ api }) => {
    const res = await api.get('/api/RaceRunner/GetRaceRunnersByRace', {
      meetingId: MEETINGS.princessMargaretCu.id,
      raceId: RACES.champDeMarsNew.id,
      clientId: RACE_CLIENT_ID,
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.meeting.RACEMeetingID).toBe(Number(MEETINGS.princessMargaretCu.id));
    expect(body.race.RACERaceID).toBe(Number(RACES.champDeMarsNew.id));
  });

  test('GET /RaceRunner/GetRunnersByDate finds runners for the meeting date', async ({ api }) => {
    const res = await api.get('/api/RaceRunner/GetRunnersByDate', {
      date: MEETINGS.princessMargaretCu.dateIso,
      clientId: RACE_CLIENT_ID,
    });
    expect(res.status()).toBe(200);
    const runners = await res.json();
    expect(Array.isArray(runners)).toBe(true);
    const iditarod = runners.find((r: { raceRunnerID: number }) => r.raceRunnerID === Number(RUNNERS.iditarodTrail.id));
    expect(iditarod).toBeTruthy();
    expect(iditarod.runnerName).toBe(RUNNERS.iditarodTrail.horseName);
    expect(iditarod.horseID).toBe(Number(RUNNERS.iditarodTrail.horseId));
  });

  test('GET /RaceRunner/GetUnassignedRunners returns an array', async ({ api }) => {
    // All runners on this meeting are already assigned to races, so an
    // empty array is the expected/correct result, not a failure.
    const res = await api.get('/api/RaceRunner/GetUnassignedRunners', {
      meetingId: MEETINGS.princessMargaretCu.id,
      clientId: RACE_CLIENT_ID,
    });
    expect(res.status()).toBe(200);
    const runners = await res.json();
    expect(Array.isArray(runners)).toBe(true);
  });

  test('GET /RaceRunner/GetUniqueGears returns the known gear codes', async ({ api }) => {
    const res = await api.get('/api/RaceRunner/GetUniqueGears', { clientId: RACE_CLIENT_ID });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
  });

  test('GET /RaceRunner/ValidateRunnerEligibility confirms an eligible horse', async ({ api }) => {
    const res = await api.get('/api/RaceRunner/ValidateRunnerEligibility', {
      raceId: RACES.champDeMarsNew.id,
      raceHorseId: RUNNERS.iditarodTrail.horseId,
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.isValid).toBe(true);
  });

  test('GET /RaceRunner/ValidateRunnerEligibility rejects a local runner id (wrong ID namespace)', async ({ api }) => {
    const res = await api.get('/api/RaceRunner/ValidateRunnerEligibility', {
      raceId: RACES.champDeMarsNew.id,
      raceHorseId: RUNNERS.iditarodTrail.id,
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.isValid).toBe(false);
    expect(body.messages).toContain('Selected horse could not be found.');
  });

  test('GET /RaceRace/GetRaceDetailsByMeeting returns the meeting and its races', async ({ api }) => {
    const res = await api.get('/api/RaceRace/GetRaceDetailsByMeeting', {
      meetingId: MEETINGS.princessMargaretCu.id,
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.meeting.RACEMeetingID).toBe(Number(MEETINGS.princessMargaretCu.id));
    expect(Array.isArray(body.races)).toBe(true);
    expect(body.races.some((r: { RACERaceID: number }) => r.RACERaceID === Number(RACES.champDeMarsNew.id))).toBe(true);
  });

  test('GET /RaceSession/GetSessions returns an array with no filters', async ({ api }) => {
    const res = await api.get('/api/RaceSession/GetSessions');
    expect(res.status()).toBe(200);
    const sessions = await res.json();
    expect(Array.isArray(sessions)).toBe(true);
  });

  test('BUG: GET /RaceSession/{id} always fails with a raw SQL error', async ({ api }) => {
    // Any id (even a non-existent one) hits the same broken query - the
    // endpoint is unusable regardless of what session is requested.
    const res = await api.get('/api/RaceSession/1');
    expect(res.status()).toBe(500);
    const body = await res.json();
    expect(body.message).toBe('Failed to retrieve session.');
    expect(body.error).toContain("Unknown column 't.AdminUserName'");
  });

  test('GET /RaceNote/GetNotes requires a client ID', async ({ api }) => {
    const res = await api.get('/api/RaceNote/GetNotes');
    expect(res.status()).toBe(400);
    const body = await res.text();
    expect(body).toContain('ClientId is required');
  });

  test('GET /RaceNote/GetRaceListByDate requires a date', async ({ api }) => {
    const res = await api.get('/api/RaceNote/GetRaceListByDate');
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.errors.date[0]).toMatch(/date field is required/i);
  });

  test('GET /RaceNote/GetRaceListByDate lists races for the meeting date', async ({ api }) => {
    const res = await api.get('/api/RaceNote/GetRaceListByDate', {
      date: MEETINGS.princessMargaretCu.dateIso,
      clientId: RACE_CLIENT_ID,
    });
    expect(res.status()).toBe(200);
    const races = await res.json();
    expect(Array.isArray(races)).toBe(true);
    expect(races.some((r: { RACERaceID: number }) => r.RACERaceID === Number(RACES.champDeMarsNew.id))).toBe(true);
  });

  test('GET /RaceNote/{client}/{id} returns an array for a meeting with no notes', async ({ api }) => {
    const res = await api.get(`/api/RaceNote/${RACE_CLIENT_ID}/${MEETINGS.princessMargaretCu.id}`);
    expect(res.status()).toBe(200);
    const notes = await res.json();
    expect(Array.isArray(notes)).toBe(true);
  });

  test('GET /OwnersComparison/{id} returns a comparison for a valid id', async ({ api }) => {
    const res = await api.get('/api/OwnersComparison/1');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.summary).toBeTruthy();
    expect(Array.isArray(body.rows)).toBe(true);
  });

  test('GET /OwnersComparison/{id} returns 404 for an unknown id', async ({ api }) => {
    const res = await api.get('/api/OwnersComparison/999999');
    expect(res.status()).toBe(404);
  });
});
