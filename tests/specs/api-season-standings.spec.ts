import { test, expect } from '../apiFixtures';
import { RACE_CLIENT_ID } from '../../data/client';

// Runs in the 'api' project (see playwright.config.ts). Covers the
// season-standings and ratings endpoints behind the Championship Stats
// admin page and the Handicapping trainer-rating groups view.
test.describe('API - Season standings', () => {
  test('GET /RaceHorses/GetSeasonStandings requires a client ID', async ({ api }) => {
    const res = await api.get('/api/RaceHorses/GetSeasonStandings');
    expect(res.status()).toBe(400);
  });

  test('GET /RaceHorses/GetSeasonStandings returns horse standings for 2026', async ({ api }) => {
    const res = await api.get('/api/RaceHorses/GetSeasonStandings', { clientId: RACE_CLIENT_ID, year: 2026 });
    expect(res.status()).toBe(200);
    const standings = await res.json();
    expect(Array.isArray(standings)).toBe(true);
    expect(standings.length).toBeGreaterThan(0);
  });

  test('GET /RaceJockys/GetSeasonStandings requires clientId and year', async ({ api }) => {
    const missingBoth = await api.get('/api/RaceJockys/GetSeasonStandings');
    expect(missingBoth.status()).toBe(400);

    const missingYear = await api.get('/api/RaceJockys/GetSeasonStandings', { clientId: RACE_CLIENT_ID });
    expect(missingYear.status()).toBe(400);
  });

  test('GET /RaceJockys/GetSeasonStandings returns jockey standings for 2026', async ({ api }) => {
    const res = await api.get('/api/RaceJockys/GetSeasonStandings', { clientId: RACE_CLIENT_ID, year: 2026 });
    expect(res.status()).toBe(200);
    const standings = await res.json();
    expect(Array.isArray(standings)).toBe(true);
    expect(standings.length).toBeGreaterThan(0);
    expect(standings[0]).toHaveProperty('RACEJockeyName');
  });

  test('GET /RaceTrainers/GetSeasonStandings returns trainer standings for 2026', async ({ api }) => {
    const res = await api.get('/api/RaceTrainers/GetSeasonStandings', { clientId: RACE_CLIENT_ID, year: 2026 });
    expect(res.status()).toBe(200);
    const standings = await res.json();
    expect(Array.isArray(standings)).toBe(true);
    expect(standings.length).toBeGreaterThan(0);
    expect(standings[0]).toHaveProperty('RACETrainerNameEN');
  });

  test('GET /RaceTrainers/GetStablesChampionship requires clientId and year', async ({ api }) => {
    const res = await api.get('/api/RaceTrainers/GetStablesChampionship');
    expect(res.status()).toBe(400);
  });

  test('GET /RaceTrainers/GetStablesChampionship returns stable standings', async ({ api }) => {
    const res = await api.get('/api/RaceTrainers/GetStablesChampionship', { clientId: RACE_CLIENT_ID, year: 2026 });
    expect(res.status()).toBe(200);
    const standings = await res.json();
    expect(Array.isArray(standings)).toBe(true);
    expect(standings.length).toBeGreaterThan(0);
  });

  test('GET /RaceHorses/GetTrainerRatingGroups groups horses by trainer', async ({ api }) => {
    const res = await api.get('/api/RaceHorses/GetTrainerRatingGroups');
    expect(res.status()).toBe(200);
    const groups = await res.json();
    expect(Array.isArray(groups)).toBe(true);
    expect(groups[0]).toHaveProperty('trainerName');
    expect(Array.isArray(groups[0].ratings)).toBe(true);
  });
});
