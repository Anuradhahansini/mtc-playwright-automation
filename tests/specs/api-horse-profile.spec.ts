import { test, expect } from '../apiFixtures';
import { RUNNERS } from '../../data/runner';

// Runs in the 'api' project (see playwright.config.ts). Covers the horse
// profile/detail endpoints behind the Handicapping and Horse Profile admin
// pages. Note the ID namespace: "id"/"raceHorseId" here refer to the master
// horse key (RUNNERS.iditarodTrail.horseId), NOT the local runner record id
// (RUNNERS.iditarodTrail.id) used by RaceRunner/RaceHorses grid endpoints -
// see api-race-data.spec.ts for that distinction.
test.describe('API - Horse profile', () => {
  test('GET /RaceHorses/GetHorseProfile requires a valid id', async ({ api }) => {
    const res = await api.get('/api/RaceHorses/GetHorseProfile');
    expect(res.status()).toBe(400);
    const body = await res.text();
    expect(body).toContain('Invalid horse ID');
  });

  test('GET /RaceHorses/GetHorseProfile returns a bio profile for a valid id', async ({ api }) => {
    // This "id" is a further, separate master-horse key space from
    // HUniqueID/raceHorseRefID seen elsewhere - id=321 here resolves to a
    // different horse ("HEART OF THE WEST") than RUNNERS.iditarodTrail, so
    // only the shape/echo is asserted, not a specific horse name.
    const res = await api.get('/api/RaceHorses/GetHorseProfile', { id: 321 });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.HUniqueID).toBe(321);
    expect(typeof body.HHorse).toBe('string');
  });

  test('BUG: GET /RaceHorses/GetHorseProfileCareerStats fails to reach its external API', async ({ api }) => {
    const res = await api.get('/api/RaceHorses/GetHorseProfileCareerStats', { id: 321 });
    expect(res.status()).toBe(404);
    const body = await res.text();
    expect(body).toContain('Failed to retrieve horse career stats from external API');
  });

  test('BUG: GET /RaceHorses/GetHorseProfileDetailedCareerStats fails parsing its external API response', async ({ api }) => {
    const res = await api.get('/api/RaceHorses/GetHorseProfileDetailedCareerStats', { id: 321 });
    expect(res.status()).toBe(500);
    const body = await res.text();
    expect(body).toContain('Error parsing API response');
  });

  test('GET /RaceHorses/GetRaceHorseDetailsById returns details for a known horse', async ({ api }) => {
    const res = await api.get('/api/RaceHorses/GetRaceHorseDetailsById', {
      raceHorseId: RUNNERS.iditarodTrail.horseId,
    });
    expect(res.status()).toBe(200);
    const details = await res.json();
    expect(Array.isArray(details)).toBe(true);
    expect(details.length).toBeGreaterThan(0);
    expect(details[0].HHorse).toBe(RUNNERS.iditarodTrail.horseName);
  });

  test('GET /RaceHorses/GetRaceHorseDetailsById returns an empty array for an unrelated id', async ({ api }) => {
    // The local runner record id is not accepted here - documents the ID
    // namespace mismatch rather than assuming it works.
    const res = await api.get('/api/RaceHorses/GetRaceHorseDetailsById', {
      raceHorseId: RUNNERS.iditarodTrail.id,
    });
    expect(res.status()).toBe(200);
    const details = await res.json();
    expect(details).toEqual([]);
  });

  test('GET /RaceHorses/GetRaceHorseRacesById returns past race history', async ({ api }) => {
    const res = await api.get('/api/RaceHorses/GetRaceHorseRacesById', {
      raceHorseId: RUNNERS.iditarodTrail.horseId,
    });
    expect(res.status()).toBe(200);
    const races = await res.json();
    expect(Array.isArray(races)).toBe(true);
    expect(races.length).toBeGreaterThan(0);
    expect(races[0]).toHaveProperty('jockey');
    expect(races[0]).toHaveProperty('trainer');
  });
});
