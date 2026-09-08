import { test, expect } from '../apiFixtures';
import { RACE_CLIENT_ID } from '../../data/client';

// Runs in the 'api' project (see playwright.config.ts). Covers RaceClient
// detail/sub-resource reads and the RaceAdvisoryEmail log/recipient
// endpoints behind Admin > Client Settings and the Send Emails page.
test.describe('API - Race client', () => {
  test('GET /RaceClient/{id} returns the client for a valid id', async ({ api }) => {
    const res = await api.get(`/api/RaceClient/${RACE_CLIENT_ID}`);
    expect(res.status()).toBe(200);
    const client = await res.json();
    expect(client.raceClientID).toBe(RACE_CLIENT_ID);
    expect(typeof client.raceClientName).toBe('string');
  });

  test('GET /RaceClient/{id} returns 404 for an unknown id', async ({ api }) => {
    const res = await api.get('/api/RaceClient/999999');
    expect(res.status()).toBe(404);
    const body = await res.text();
    expect(body).toContain('Client not found');
  });

  test('BUG: GET /RaceClient/{id}/users 500s on a missing AdminRoleID column', async ({ api }) => {
    // Same root cause as RaceUser/by-client/{clientId} and RaceUser/{id} -
    // a query across these three endpoints references a column that no
    // longer exists on the users table.
    const res = await api.get(`/api/RaceClient/${RACE_CLIENT_ID}/users`);
    expect(res.status()).toBe(500);
    const body = await res.json();
    expect(body.error).toContain("required column 'AdminRoleID'");
  });
});

test.describe('API - Race advisory email', () => {
  test('GET /RaceAdvisoryEmail/GetEmailLogDetails requires a valid log id', async ({ api }) => {
    const res = await api.get('/api/RaceAdvisoryEmail/GetEmailLogDetails');
    expect(res.status()).toBe(404);
    const body = await res.text();
    expect(body).toContain('Email log not found');
  });

  test('GET /RaceAdvisoryEmail/GetEmailLogs requires a status filter', async ({ api }) => {
    const res = await api.get('/api/RaceAdvisoryEmail/GetEmailLogs');
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.errors.status[0]).toMatch(/status field is required/i);
  });

  test('GET /RaceAdvisoryEmail/GetRecepientsGroups lists the recipient groups for a client', async ({ api }) => {
    const res = await api.get('/api/RaceAdvisoryEmail/GetRecepientsGroups', { raceClientId: RACE_CLIENT_ID });
    expect(res.status()).toBe(200);
    const groups = await res.json();
    expect(Array.isArray(groups)).toBe(true);
    expect(groups.length).toBeGreaterThan(0);
    expect(groups[0]).toHaveProperty('value');
    expect(groups[0]).toHaveProperty('label');
  });

  test('GetRecipientGroups and GetRecipientsGroups return the same data as the canonical GetRecepientsGroups', async ({ api }) => {
    // Three near-identical endpoint names exist for the same data - not a
    // bug, just documenting the redundancy so future coverage doesn't
    // assume they diverge.
    const [canonical, variant1, variant2] = await Promise.all([
      api.get('/api/RaceAdvisoryEmail/GetRecepientsGroups', { raceClientId: RACE_CLIENT_ID }),
      api.get('/api/RaceAdvisoryEmail/GetRecipientGroups', { raceClientId: RACE_CLIENT_ID }),
      api.get('/api/RaceAdvisoryEmail/GetRecipientsGroups', { raceClientId: RACE_CLIENT_ID }),
    ]);
    expect(canonical.status()).toBe(200);
    expect(variant1.status()).toBe(200);
    expect(variant2.status()).toBe(200);
    const [canonicalBody, body1, body2] = await Promise.all([canonical.json(), variant1.json(), variant2.json()]);
    expect(body1).toEqual(canonicalBody);
    expect(body2).toEqual(canonicalBody);
  });

  test('GET /RaceAdvisoryEmail/GetRecipientsByClient lists configured recipients', async ({ api }) => {
    const res = await api.get('/api/RaceAdvisoryEmail/GetRecipientsByClient', { raceClientId: RACE_CLIENT_ID });
    expect(res.status()).toBe(200);
    const recipients = await res.json();
    expect(Array.isArray(recipients)).toBe(true);
    expect(recipients.length).toBeGreaterThan(0);
    expect(recipients[0]).toHaveProperty('Receipients');
  });
});
