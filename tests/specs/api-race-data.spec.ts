import { test, expect } from '../apiFixtures';
import { MEETINGS } from '../../data/meeting';
import { RUNNERS } from '../../data/runner';

// Runs in the 'api' project (see playwright.config.ts). Covers the larger
// reference datasets - horses, jockeys, trainers, meetings, workouts -
// cross-checking a few known records rather than asserting on full payload
// size (these datasets grow over time).
test.describe('API - Race data', () => {
  test('GET /RaceHorses/GetRaceHorses includes a known horse', async ({ api }) => {
    const res = await api.get('/api/RaceHorses/GetRaceHorses');
    expect(res.status()).toBe(200);
    const horses = await res.json();
    const iditarod = horses.find((h: { raceHorseID: number }) => h.raceHorseID === Number(RUNNERS.iditarodTrail.horseId));
    expect(iditarod).toBeTruthy();
    expect(iditarod.raceHorseName).toBe(RUNNERS.iditarodTrail.horseName);
  });

  test('GET /RaceJockys/GetRaceJockeys returns jockeys for the MTC client', async ({ api }) => {
    const res = await api.get('/api/RaceJockys/GetRaceJockeys');
    expect(res.status()).toBe(200);
    const jockeys = await res.json();
    expect(Array.isArray(jockeys)).toBe(true);
    expect(jockeys.length).toBeGreaterThan(0);
  });

  test('GET /RaceTrainers/GetRaceTrainers includes the known trainer', async ({ api }) => {
    const res = await api.get('/api/RaceTrainers/GetRaceTrainers');
    expect(res.status()).toBe(200);
    const trainers = await res.json();
    const sewdyal = trainers.find((t: { raceTrainerNameEN: string }) => t.raceTrainerNameEN.includes('SEWDYAL'));
    expect(sewdyal).toBeTruthy();
  });

  test('GET /RaceMeeting/GetPreRaceMeetings includes the known meeting', async ({ api }) => {
    const res = await api.get('/api/RaceMeeting/GetPreRaceMeetings');
    expect(res.status()).toBe(200);
    const meetings = await res.json();
    const known = meetings.find((m: { RACEMeetingID: number }) => m.RACEMeetingID === Number(MEETINGS.princessMargaretCu.id));
    expect(known).toBeTruthy();
    expect(known.RACEMeetingName).toBe(MEETINGS.princessMargaretCu.name);
  });

  test('GET /Workouts/GetWorkouts requires a client ID', async ({ api }) => {
    const res = await api.get('/api/Workouts/GetWorkouts');
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/client id/i);
  });

  test('GET /Workouts/GetWorkouts?clientId also requires at least one more filter', async ({ api }) => {
    // Documents actual behavior: clientId alone isn't enough - the endpoint
    // needs at least one additional optional param (date range, horse, etc.)
    const res = await api.get('/api/Workouts/GetWorkouts', { clientId: 1 });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/at least one optional parameter/i);
  });

  test('GET /Workouts/GetWorkouts?clientId&meetingId returns the known workout meeting', async ({ api }) => {
    const res = await api.get('/api/Workouts/GetWorkouts', { clientId: 1, meetingId: 491 });
    expect(res.status()).toBe(200);
    const workouts = await res.json();
    expect(Array.isArray(workouts)).toBe(true);
    expect(workouts.length).toBeGreaterThan(0);
    expect(workouts[0].RACEMType).toBe('WORKOUT');
  });
});
