import { test, expect } from '../apiFixtures';
import { COURSE_NAME, MEETING_STAGES } from '../../common/constants';
import { RACE_CLIENT_ID } from '../../data/client';

// Runs in the 'api' project (see playwright.config.ts). Covers the small,
// mostly-static reference/config GET endpoints - course list, meeting
// stage labels, client config, release notes, DB stats and environment.
test.describe('API - Reference data', () => {
  test('GET /Course/GetCourses lists the configured course', async ({ api }) => {
    const res = await api.get('/api/Course/GetCourses');
    expect(res.status()).toBe(200);
    const courses = await res.json();
    expect(Array.isArray(courses)).toBe(true);
    expect(courses.some((c: { CrsDisplayName: string }) => COURSE_NAME.includes(c.CrsDisplayName))).toBe(true);
  });

  test('GET /RaceMeeting/GetMStage returns the documented meeting stages', async ({ api }) => {
    const res = await api.get('/api/RaceMeeting/GetMStage');
    expect(res.status()).toBe(200);
    const stages = await res.json();
    expect(stages.map((s: { label: string }) => s.label)).toEqual([...MEETING_STAGES]);
  });

  test('GET /RaceClientConfig/GetRaceClientConfigs includes the MTC client', async ({ api }) => {
    const res = await api.get('/api/RaceClientConfig/GetRaceClientConfigs');
    expect(res.status()).toBe(200);
    const configs = await res.json();
    const mtc = configs.find((c: { raceClient: number }) => c.raceClient === RACE_CLIENT_ID);
    expect(mtc).toBeTruthy();
    expect(mtc.raceClientName).toContain('Mauritius Turf Club');
  });

  test('GET /RaceClient lists at least one client', async ({ api }) => {
    const res = await api.get('/api/RaceClient');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.clients)).toBe(true);
    expect(body.clients.length).toBeGreaterThan(0);
  });

  test('GET /RaceDayControl/GetRaceStatusConfig returns statuses for the MTC client', async ({ api }) => {
    const res = await api.get('/api/RaceDayControl/GetRaceStatusConfig', { clientId: RACE_CLIENT_ID });
    expect(res.status()).toBe(200);
    const statuses = await res.json();
    expect(Array.isArray(statuses)).toBe(true);
    expect(statuses.every((s: { RaceClientID: number }) => s.RaceClientID === RACE_CLIENT_ID)).toBe(true);
  });

  test('GET /ReleaseNotes/Latest matches the version shown in the app', async ({ api }) => {
    const res = await api.get('/api/ReleaseNotes/Latest');
    expect(res.status()).toBe(200);
    const note = await res.json();
    expect(note.version).toBe('1.12.2'); // shown in the sidebar as "VERSION 1.12.2"
  });

  test('GET /Stats/DbStats returns non-negative record counts', async ({ api }) => {
    const res = await api.get('/api/Stats/DbStats');
    expect(res.status()).toBe(200);
    const stats = await res.json();
    for (const key of ['racehorseCount', 'racemeetingCount', 'raceraceCount', 'racerunnerCount']) {
      expect(stats[key]).toBeGreaterThanOrEqual(0);
    }
  });

  test('GET /System/GetEnvironment reports which environment this is', async ({ api }) => {
    const res = await api.get('/api/System/GetEnvironment');
    expect(res.status()).toBe(200);
    const text = await res.text();
    expect(text).toContain('Environment variable:');
  });
});
