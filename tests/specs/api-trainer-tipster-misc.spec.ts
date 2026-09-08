import { test, expect } from '../apiFixtures';
import { RACE_CLIENT_ID } from '../../data/client';
import { MEETINGS } from '../../data/meeting';
import { RACES } from '../../data/race';
import { RUNNERS } from '../../data/runner';
import { TRAINERS } from '../../data/trainer';

// Runs in the 'api' project (see playwright.config.ts). Covers the
// remaining trainer-detail reads, the personal Tipster endpoints (as the
// logged-in admin's own tips, not the Tipster module itself), and a grab
// bag of reference/admin reads.
//
// NOT covered: RaceWebUser/forgot-password. It's a GET, but it's a genuine
// forgot-password trigger for a real account - calling it would send a real
// reset email/token, which is the same kind of hidden side effect as the
// RaceDayControl XML endpoints skipped in api-race-meeting-reads.spec.ts.
test.describe('API - Trainer detail', () => {
  test('GET /RaceTrainers/GetHorsesByTrainer lists the trainer\'s horses', async ({ api }) => {
    const res = await api.get('/api/RaceTrainers/GetHorsesByTrainer', {
      trainerId: TRAINERS.sewdyal.id,
      clientId: RACE_CLIENT_ID,
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.trainerId).toBe(Number(TRAINERS.sewdyal.id));
    expect(Array.isArray(body.horses)).toBe(true);
    expect(body.totalHorses).toBeGreaterThan(0);
  });

  test('GET /RaceTrainers/GetTrainerByUsername returns 404 for a non-trainer-portal username', async ({ api }) => {
    // mtc_anuradha is an admin-portal login, not a trainer-portal one - this
    // endpoint looks up the separate trainer-web-user table.
    const res = await api.get('/api/RaceTrainers/GetTrainerByUsername', {
      username: 'mtc_anuradha',
      raceClient: RACE_CLIENT_ID,
    });
    expect(res.status()).toBe(404);
  });

  test('GET /RaceTrainers/GetTrainerHorsePastRuns lists past runs for the trainer', async ({ api }) => {
    const res = await api.get('/api/RaceTrainers/GetTrainerHorsePastRuns', {
      trainerId: TRAINERS.sewdyal.id,
      clientId: RACE_CLIENT_ID,
    });
    expect(res.status()).toBe(200);
    const runs = await res.json();
    expect(Array.isArray(runs)).toBe(true);
    expect(runs.length).toBeGreaterThan(0);
  });

  test('GET /RaceTrainers/GetTrainerLatestRuns respects the limit parameter', async ({ api }) => {
    const res = await api.get('/api/RaceTrainers/GetTrainerLatestRuns', {
      trainerId: TRAINERS.sewdyal.id,
      clientId: RACE_CLIENT_ID,
      limit: 5,
    });
    expect(res.status()).toBe(200);
    const runs = await res.json();
    expect(Array.isArray(runs)).toBe(true);
    expect(runs.length).toBeLessThanOrEqual(5);
  });

  test('GET /RaceTrainers/GetTrainerStats returns season stats for the trainer', async ({ api }) => {
    const res = await api.get('/api/RaceTrainers/GetTrainerStats', {
      trainerId: TRAINERS.sewdyal.id,
      clientId: RACE_CLIENT_ID,
      year: 2026,
    });
    expect(res.status()).toBe(200);
    const stats = await res.json();
    expect(stats[0].RACETrainerNameEN).toBe(TRAINERS.sewdyal.name);
    expect(stats[0].Starts).toBeGreaterThan(0);
  });
});

test.describe('API - Race web user', () => {
  test('GET /RaceWebUser/email-exists returns false for an email that is not registered', async ({ api }) => {
    const res = await api.get('/api/RaceWebUser/email-exists', { email: 'nonexistent12345@example.com' });
    expect(res.status()).toBe(200);
    expect(await res.json()).toBe(false);
  });

  test('GET /RaceWebUser/reset/{token} returns false for an invalid token', async ({ api }) => {
    const res = await api.get('/api/RaceWebUser/reset/invalid-token-xyz');
    expect(res.status()).toBe(200);
    expect(await res.json()).toBe(false);
  });
});

test.describe('API - Tipster (personal)', () => {
  test('GET /Tipster/MeetingTips requires both a meeting id and a user id', async ({ api }) => {
    const res = await api.get('/api/Tipster/MeetingTips', { meetingId: MEETINGS.princessMargaretCu.id });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.message).toMatch(/meeting id and user id are required/i);
  });

  test('GET /Tipster/MeetingTips returns an array once both ids are given', async ({ api }) => {
    const meRes = await api.get('/api/Auth/me');
    const { data: me } = await meRes.json();
    const res = await api.get('/api/Tipster/MeetingTips', {
      meetingId: MEETINGS.princessMargaretCu.id,
      userId: me.userId,
    });
    expect(res.status()).toBe(200);
    expect(Array.isArray(await res.json())).toBe(true);
  });

  test('GET /Tipster/MyMeetingTips, MyResults and MyTips return arrays for the logged-in user', async ({ api }) => {
    const [meetingTips, myResults, myTips] = await Promise.all([
      api.get('/api/Tipster/MyMeetingTips', { meetingId: MEETINGS.princessMargaretCu.id }),
      api.get('/api/Tipster/MyResults'),
      api.get('/api/Tipster/MyTips', { meetingId: MEETINGS.princessMargaretCu.id }),
    ]);
    expect(meetingTips.status()).toBe(200);
    expect(myResults.status()).toBe(200);
    expect(myTips.status()).toBe(200);
    expect(Array.isArray(await meetingTips.json())).toBe(true);
    expect(Array.isArray(await myResults.json())).toBe(true);
    expect(Array.isArray(await myTips.json())).toBe(true);
  });

  test('GET /Tipster/WeeklyReport/Export returns a CSV export', async ({ api }) => {
    const res = await api.get('/api/Tipster/WeeklyReport/Export', { meetingId: MEETINGS.princessMargaretCu.id });
    expect(res.status()).toBe(200);
    const csv = await res.text();
    expect(csv).toContain('Rank,Tipster,Total,Trifectas,Bankers,RacesTipped');
  });
});

test.describe('API - Reference/admin misc', () => {
  test('BUG: GET /MasterHorses/GetHorseFromAdmin fails parsing its external API response', async ({ api }) => {
    const res = await api.get('/api/MasterHorses/GetHorseFromAdmin', { horseId: RUNNERS.iditarodTrail.horseId });
    expect(res.status()).toBe(500);
    const body = await res.json();
    expect(body.message).toBe('Search failed.');
    expect(body.error).toContain('Unexpected character encountered while parsing value');
  });

  test('GET /RaceLog/GetRaceStatusHistory returns a human-readable status log for a race', async ({ api }) => {
    const res = await api.get('/api/RaceLog/GetRaceStatusHistory', { raceId: RACES.champDeMarsNew.id });
    expect(res.status()).toBe(200);
    const history = await res.json();
    expect(Array.isArray(history)).toBe(true);
    expect(history.length).toBeGreaterThan(0);
    expect(history[0]).toHaveProperty('clickedBy');
  });

  test('GET /ReleaseNotes lists past releases including the current version', async ({ api }) => {
    const res = await api.get('/api/ReleaseNotes');
    expect(res.status()).toBe(200);
    const notes = await res.json();
    expect(Array.isArray(notes)).toBe(true);
    expect(notes.some((n: { version: string }) => n.version === '1.12.2')).toBe(true);
  });

  test('GET /Stats/GetStagewiseMeetingRaceRunnerCountByTrainer breaks counts down by stage', async ({ api }) => {
    const res = await api.get('/api/Stats/GetStagewiseMeetingRaceRunnerCountByTrainer', {
      clientId: RACE_CLIENT_ID,
      trainerId: TRAINERS.sewdyal.id,
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
  });

  test('GET /Auth/GetAllUsers lists admin users for a client', async ({ api }) => {
    const res = await api.get('/api/Auth/GetAllUsers', { clientID: RACE_CLIENT_ID });
    expect(res.status()).toBe(200);
    const users = await res.json();
    expect(Array.isArray(users)).toBe(true);
    expect(users.length).toBeGreaterThan(0);
  });

  test('GET /MtcResultsFiles/file is forbidden for this admin user', async ({ api }) => {
    // Consistent with MtcResultsFiles/list (see api-misc-reads.spec.ts) -
    // this admin role doesn't have access to the results-files feature.
    const res = await api.get('/api/MtcResultsFiles/file', { key: 'test' });
    expect(res.status()).toBe(403);
  });

  test('GET /Race/GetRaces requires a meeting date', async ({ api }) => {
    const res = await api.get('/api/Race/GetRaces');
    expect(res.status()).toBe(400);
    const body = await res.text();
    expect(body).toContain('Meeting date is required');
  });
});
