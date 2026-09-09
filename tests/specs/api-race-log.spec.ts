import { test, expect } from '../apiFixtures';

// Runs in the 'api' project (see playwright.config.ts).
test.describe('API - Race Log', () => {
  test('GET /RaceLog/GetLogs returns session logs', async ({ api }) => {
    const res = await api.get('/api/RaceLog/GetLogs');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.logs)).toBe(true);
  });

  test('GET /RaceLog/GetSessions returns a list of session GUIDs', async ({ api }) => {
    const res = await api.get('/api/RaceLog/GetSessions');
    expect(res.status()).toBe(200);
    const sessions = await res.json();
    expect(Array.isArray(sessions)).toBe(true);
    expect(sessions.length).toBeGreaterThan(0);
  });

  test('GET /RaceLog/GetClients returns the MTC client', async ({ api }) => {
    const res = await api.get('/api/RaceLog/GetClients');
    expect(res.status()).toBe(200);
    const clients = await res.json();
    expect(clients).toEqual([1]);
  });

  test('BUG: GET /RaceLog/GetUsers returns a raw 500 instead of user data', async ({ api }) => {
    // This is the endpoint the Race User Logs page (Admin) presumably calls;
    // it errors server-side with an EF Core SQL/DTO mismatch (an
    // InvalidOperationException over a missing 'DisplayName' column,
    // confirmed against http://192.9.160.206:5071). Matches what the Race
    // User Logs page shows in the UI (always "No results found") - the
    // backend simply can't serve this data. Some deployments (e.g. the
    // mtcapi.uat.racingandsports.com environment) suppress the exception
    // text in the response body - only the 500 itself is asserted here so
    // this test isn't tied to one environment's error-detail verbosity.
    const res = await api.get('/api/RaceLog/GetUsers');
    expect(res.status()).toBe(500);
  });
});
