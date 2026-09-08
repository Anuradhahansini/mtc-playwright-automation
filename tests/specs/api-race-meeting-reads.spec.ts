import { test, expect } from '../apiFixtures';
import { RACE_CLIENT_ID } from '../../data/client';
import { MEETINGS } from '../../data/meeting';
import { RACES } from '../../data/race';

// Runs in the 'api' project (see playwright.config.ts). Covers RaceMeeting
// fixture/racefield read endpoints and RaceDayControl's status-log read.
//
// NOT covered here: RaceDayControl/GenerateSPS, GetDividendXml and
// GetResultsXml. Despite the GET verb, GetResultsXml/GetDividendXml write
// files to the server (observed: "XML uploaded successfully" writing to
// C:\KXML\...) as a side effect - these are unsafe to call from an
// automated suite that may run repeatedly against the shared UAT server,
// so they're deliberately left untested here rather than risk triggering
// that upload on every run.
test.describe('API - Race meeting fixtures/racefield', () => {
  test('GET /RaceDayControl/GetRaceStatusLogs returns the status change history for a race', async ({ api }) => {
    const res = await api.get('/api/RaceDayControl/GetRaceStatusLogs', { raceId: RACES.champDeMarsNew.id });
    expect(res.status()).toBe(200);
    const logs = await res.json();
    expect(Array.isArray(logs)).toBe(true);
    expect(logs.length).toBeGreaterThan(0);
    expect(String(logs[0].raceID)).toBe(RACES.champDeMarsNew.id);
  });

  test('GET /RaceMeeting/GetAllMeetingRaceRunnersByDate returns meetings with nested races/runners', async ({ api }) => {
    const res = await api.get('/api/RaceMeeting/GetAllMeetingRaceRunnersByDate', {
      meetingDate: MEETINGS.princessMargaretCu.dateIso,
      clientId: RACE_CLIENT_ID,
    });
    expect(res.status()).toBe(200);
    const meetings = await res.json();
    expect(Array.isArray(meetings)).toBe(true);
    const target = meetings.find((m: { meeting: { RACEMeetingID: number } }) => m.meeting.RACEMeetingID === Number(MEETINGS.princessMargaretCu.id));
    expect(target).toBeTruthy();
  });

  test('GET /RaceMeeting/GetFixtures requires a meeting type', async ({ api }) => {
    const res = await api.get('/api/RaceMeeting/GetFixtures', { year: 2026, client: RACE_CLIENT_ID, month: 9 });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.errors.mType[0]).toMatch(/mType field is required/i);
  });

  test('GET /RaceMeeting/GetFixtures returns the season fixture list', async ({ api }) => {
    const res = await api.get('/api/RaceMeeting/GetFixtures', {
      year: 2026, client: RACE_CLIENT_ID, month: 9, mType: 'RACE',
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.season).toBe(2026);
    expect(Array.isArray(body.availableSeasons)).toBe(true);
  });

  test('GET /RaceMeeting/GetFixtures1 returns fixtures with a nested next-race summary', async ({ api }) => {
    const res = await api.get('/api/RaceMeeting/GetFixtures1', {
      year: 2026, raceClient: RACE_CLIENT_ID, month: 9, mType: 'RACE',
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.meetings)).toBe(true);
    expect(body.meetings.some((m: { RACEMeetingID: number }) => m.RACEMeetingID === Number(MEETINGS.princessMargaretCu.id))).toBe(true);
  });

  test('GET /RaceMeeting/print-data/{client}/{id} returns the meeting\'s races', async ({ api }) => {
    const res = await api.get(`/api/RaceMeeting/print-data/${RACE_CLIENT_ID}/${MEETINGS.princessMargaretCu.id}`);
    expect(res.status()).toBe(200);
    const races = await res.json();
    expect(Array.isArray(races)).toBe(true);
    expect(races.some((r: { RACERaceID: number }) => r.RACERaceID === Number(RACES.champDeMarsNew.id))).toBe(true);
  });

  test('GET /RaceMeeting/racefield/{client}/{id}/{doRunners} returns races (legacy shape: a bare array)', async ({ api }) => {
    const res = await api.get(`/api/RaceMeeting/racefield/${RACE_CLIENT_ID}/${MEETINGS.princessMargaretCu.id}/false`);
    expect(res.status()).toBe(200);
    const races = await res.json();
    expect(Array.isArray(races)).toBe(true);
  });

  test('GET /RaceMeeting/v1/racefield/{client}/{id}/{doRunners} wraps meeting+races in an object', async ({ api }) => {
    const res = await api.get(`/api/RaceMeeting/v1/racefield/${RACE_CLIENT_ID}/${MEETINGS.princessMargaretCu.id}/false`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.meeting.RACEMeetingID).toBe(Number(MEETINGS.princessMargaretCu.id));
    expect(Array.isArray(body.races)).toBe(true);
  });

  test('GET /RaceMeeting/v2/racefield/{client}/{id}/{doRunners} matches the v1 response shape', async ({ api }) => {
    const res = await api.get(`/api/RaceMeeting/v2/racefield/${RACE_CLIENT_ID}/${MEETINGS.princessMargaretCu.id}/false`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.meeting.RACEMeetingID).toBe(Number(MEETINGS.princessMargaretCu.id));
    expect(Array.isArray(body.races)).toBe(true);
  });

  test('GET /RaceMeeting/{client}/{id} returns the meeting as a single-item array', async ({ api }) => {
    const res = await api.get(`/api/RaceMeeting/${RACE_CLIENT_ID}/${MEETINGS.princessMargaretCu.id}`);
    expect(res.status()).toBe(200);
    const meetings = await res.json();
    expect(Array.isArray(meetings)).toBe(true);
    expect(meetings[0].RACEMeetingID).toBe(Number(MEETINGS.princessMargaretCu.id));
  });

  test('GET /RaceMeeting/{client}/{id} returns an empty array for an unknown meeting', async ({ api }) => {
    const res = await api.get(`/api/RaceMeeting/${RACE_CLIENT_ID}/999999`);
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual([]);
  });

  test('GET /RaceMeeting/{client}/{year}/{month} lists meetings for that month', async ({ api }) => {
    const res = await api.get(`/api/RaceMeeting/${RACE_CLIENT_ID}/2026/9`);
    expect(res.status()).toBe(200);
    const meetings = await res.json();
    expect(Array.isArray(meetings)).toBe(true);
    expect(meetings.length).toBeGreaterThan(0);
    expect(meetings.every((m: { RACEMeetingDate: string }) => m.RACEMeetingDate.startsWith('2026-09'))).toBe(true);
  });

  test('GET /RaceMeeting/{client}/{year}/{month} returns an empty array for a month with no meetings', async ({ api }) => {
    const res = await api.get(`/api/RaceMeeting/${RACE_CLIENT_ID}/2099/1`);
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual([]);
  });
});
