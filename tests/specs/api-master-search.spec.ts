import { test, expect } from '../apiFixtures';
import { RUNNERS } from '../../data/runner';
import { TRAINERS } from '../../data/trainer';

// Runs in the 'api' project (see playwright.config.ts). These search
// endpoints back the "Select Race Horse" / jockey / trainer pickers seen in
// the UI - all require their name query param, and 400 without it.
test.describe('API - Master data search', () => {
  test('GET /MasterHorses/GetMasterHorse requires horseName', async ({ api }) => {
    const res = await api.get('/api/MasterHorses/GetMasterHorse');
    expect(res.status()).toBe(400);
  });

  test('GET /MasterHorses/GetMasterHorse finds a known horse', async ({ api }) => {
    const res = await api.get('/api/MasterHorses/GetMasterHorse', { horseName: RUNNERS.iditarodTrail.horseName });
    expect(res.status()).toBe(200);
    const horses = await res.json();
    expect(horses.some((h: { hHorse: string }) => h.hHorse === RUNNERS.iditarodTrail.horseName)).toBe(true);
  });

  test('GET /MasterJockeys/GetJockeySearch requires jockeyName', async ({ api }) => {
    const res = await api.get('/api/MasterJockeys/GetJockeySearch');
    expect(res.status()).toBe(400);
  });

  test('GET /MasterJockeys/GetJockeySearch finds jockeys by partial name', async ({ api }) => {
    const res = await api.get('/api/MasterJockeys/GetJockeySearch', { jockeyName: 'Ally' });
    expect(res.status()).toBe(200);
    const jockeys = await res.json();
    expect(Array.isArray(jockeys)).toBe(true);
    expect(jockeys.length).toBeGreaterThan(0);
    expect(jockeys.every((j: { jockeyName: string }) => j.jockeyName.toUpperCase().includes('ALLY'))).toBe(true);
  });

  test('GET /MasterTrainers/GetTrainerSearch requires trainerName', async ({ api }) => {
    const res = await api.get('/api/MasterTrainers/GetTrainerSearch');
    expect(res.status()).toBe(400);
  });

  test('GET /MasterTrainers/GetTrainerSearch finds the known trainer', async ({ api }) => {
    const res = await api.get('/api/MasterTrainers/GetTrainerSearch', { trainerName: 'Sewdyal' });
    expect(res.status()).toBe(200);
    const trainers = await res.json();
    expect(trainers.some((t: { trainerName: string }) => t.trainerName === TRAINERS.sewdyal.name)).toBe(true);
  });
});
