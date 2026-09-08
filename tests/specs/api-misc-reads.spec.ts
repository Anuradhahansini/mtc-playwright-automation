import { test, expect } from '../apiFixtures';
import { RACE_CLIENT_ID } from '../../data/client';

// Runs in the 'api' project (see playwright.config.ts). A grab-bag of the
// remaining safe, read-only endpoints: saved queries, owners comparison
// history, advisory email templates/logs, admin grid column definitions,
// tipster reports, and per-stage counts.
test.describe('API - Miscellaneous reads', () => {
  test('GET /Query/GetUsers/{client} lists admin users for the MTC client', async ({ api }) => {
    const res = await api.get(`/api/Query/GetUsers/${RACE_CLIENT_ID}`);
    expect(res.status()).toBe(200);
    const users = await res.json();
    expect(Array.isArray(users)).toBe(true);
    expect(users.length).toBeGreaterThan(0);
  });

  test('GET /Query/GetQueries/{userid} returns a list for the logged-in user', async ({ api }) => {
    const meRes = await api.get('/api/Auth/me');
    const { data: me } = await meRes.json();

    const res = await api.get(`/api/Query/GetQueries/${me.userId}`);
    expect(res.status()).toBe(200);
    const queries = await res.json();
    expect(Array.isArray(queries)).toBe(true);
  });

  test('GET /OwnersComparison/OwnersComparisonHistory returns past comparisons', async ({ api }) => {
    const res = await api.get('/api/OwnersComparison/OwnersComparisonHistory');
    expect(res.status()).toBe(200);
    const history = await res.json();
    expect(Array.isArray(history)).toBe(true);
    expect(history.length).toBeGreaterThan(0); // the UI showed "History (9)"
  });

  test('GET /RaceAdvisoryEmail/GetRaceAdvisoryEmailTemplate lists categories that have templates', async ({ api }) => {
    // The UI's Email Templates panel shows 10 category headers (including
    // Abandoned and Deductions), but this endpoint only returns categories
    // that actually have at least one saved template - those two currently
    // have none, so they're legitimately absent here.
    const res = await api.get('/api/RaceAdvisoryEmail/GetRaceAdvisoryEmailTemplate');
    expect(res.status()).toBe(200);
    const templates = await res.json();
    const categories = new Set(templates.map((t: { CategoryHeader: string }) => t.CategoryHeader));
    expect(categories).toEqual(
      new Set(['Delay', 'Scratchings', 'Change Advisories', 'Other', 'Results', 'Vision', 'Price Feed Issues', 'Re-Instated Runner']),
    );
  });

  test('GET /RaceAdvisoryEmail/GetActiveEmailProvider returns the configured provider', async ({ api }) => {
    const res = await api.get('/api/RaceAdvisoryEmail/GetActiveEmailProvider');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(['sendinblue', 'sendgrid']).toContain(body.provider);
  });

  test('GET /RaceUser/GetMeetingRaceRunnerColumns describes the meeting/race/runner tables', async ({ api }) => {
    const res = await api.get('/api/RaceUser/GetMeetingRaceRunnerColumns');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.tblracemeeting).toContain('RACEMeetingName');
  });

  test('GET /RaceUser/GetMasterTablesColumns describes the master horse table', async ({ api }) => {
    const res = await api.get('/api/RaceUser/GetMasterTablesColumns');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.tblracehorse).toContain('RACEHorseName');
  });

  test('GET /Tipster/OverallReport succeeds with no filters', async ({ api }) => {
    const res = await api.get('/api/Tipster/OverallReport');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test('GET /Tipster/WeeklyReport requires a meeting ID', async ({ api }) => {
    const res = await api.get('/api/Tipster/WeeklyReport');
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.message).toMatch(/meeting id is required/i);
  });

  test('GET /Stats/GetStagewiseMeetingRaceRunnerCount returns a success envelope', async ({ api }) => {
    const res = await api.get('/api/Stats/GetStagewiseMeetingRaceRunnerCount');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('GET /MtcResultsFiles/list is forbidden for this admin user', async ({ api }) => {
    // Documents actual behavior: this admin login can't list results files -
    // presumably gated to a narrower role/permission than Admin holds.
    const res = await api.get('/api/MtcResultsFiles/list');
    expect(res.status()).toBe(403);
  });
});
