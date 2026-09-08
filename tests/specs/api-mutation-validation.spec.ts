import { test, expect } from '../apiFixtures';

// Runs in the 'api' project (see playwright.config.ts).
//
// Scope: validation-only coverage of the POST/PUT/DELETE surface. Every
// request here uses a deliberately fake/empty payload chosen so the server
// rejects it (missing-required-field 400, or a not-found/broken-query error
// for a nonexistent id like 999999) before any real row is touched. Nothing
// in this file is expected to ever succeed in creating, updating, emailing
// or deleting real data - see api-race-*-reads.spec.ts's DbStats check
// (racemeetingCount, racehorseCount etc.) for confirmation these probes
// don't move those counts.
//
// Deliberately NOT covered by this file, even for validation-only checks -
// documented here instead of silently omitted:
// - Auth/logout(-all), refresh-token, verify-login-mfa, confirm/request-mfa-
//   reset, ResetPassword, update-user: session/account endpoints where even
//   a validation failure path risks touching a real session.
// - RaceAdvisoryEmail/SendEmail, ResendEmail, RaceNominationEmail/Send*,
//   RaceEmail/SubmitBooking: send real emails to real recipients.
// - Query/Execute, RASARP/run-task, RaceDayControl/UpdateRaceStatustoTrader:
//   arbitrary query execution / external task trigger / live trading
//   integration - unclear blast radius even on a validation failure.
// - The RaceMeeting/RaceRace/RaceRunner/RaceHorses/RaceJockys/RaceTrainers/
//   RaceUser/RaceClient/RaceSession "CreateOrUpdate"/"Save"/"Create" family:
//   this is the exact class of endpoint that corrupted meeting 487 during
//   UI inline-edit testing (an upsert-by-matching-field-values, not
//   update-by-id). Given that precedent, an empty/garbage body isn't
//   trusted to be rejected before writing - these need a human-reviewed,
//   case-by-case test with a real cleanup plan, not a blanket probe.
test.describe('API - Mutation validation (delete/toggle with a nonexistent id)', () => {
  test('BUG: DELETE /RaceClient/{id} on a nonexistent id 500s on a broken existence check', async ({ api }) => {
    // Same root cause as RaceUser/{id}: the existence-check query itself is
    // broken, so this 500s rather than a clean 404 - but the broken query
    // fails before any DELETE executes, and client 1 (the only real
    // client) is confirmed unaffected by this test run (see the
    // RaceClient/{id} read test in api-race-client-advisory-email.spec.ts).
    const res = await api.delete('/api/RaceClient/999999');
    expect(res.status()).toBe(500);
    const body = await res.json();
    expect(body.message).toBe('Client deletion failed.');
    expect(body.error).toContain("Unknown column 't.Value'");
  });

  test('BUG: DELETE /RaceUser/{id} on a nonexistent id 500s on a broken existence check', async ({ api }) => {
    const res = await api.delete('/api/RaceUser/999999');
    expect(res.status()).toBe(500);
    const body = await res.json();
    expect(body.message).toBe('User deletion failed.');
    expect(body.error).toContain("Unknown column 't.Value'");
  });

  test('DELETE /RaceWebUser/{id} on a nonexistent id returns a clean 404', async ({ api }) => {
    const res = await api.delete('/api/RaceWebUser/999999');
    expect(res.status()).toBe(404);
    const body = await res.text();
    expect(body).toContain('User not found');
  });

  test('DELETE /Workouts/{id} on a nonexistent id returns a clean 404', async ({ api }) => {
    const res = await api.delete('/api/Workouts/999999');
    expect(res.status()).toBe(404);
  });

  test('DELETE /Query/{id} on a nonexistent id returns a clean 404', async ({ api }) => {
    const res = await api.delete('/api/Query/999999');
    expect(res.status()).toBe(404);
    const body = await res.text();
    expect(body).toContain('Query not found');
  });

  test('BUG: POST /RaceClient/{id}/toggle-status on a nonexistent id 500s on a broken existence check', async ({ api }) => {
    const res = await api.post('/api/RaceClient/999999/toggle-status');
    expect(res.status()).toBe(500);
    const body = await res.json();
    expect(body.error).toContain("Unknown column 't.Value'");
  });

  test('BUG: POST /RaceUser/{id}/toggle-status on a nonexistent id 500s on a broken existence check', async ({ api }) => {
    const res = await api.post('/api/RaceUser/999999/toggle-status');
    expect(res.status()).toBe(500);
    const body = await res.json();
    expect(body.error).toContain("Unknown column 't.Value'");
  });

  test('POST /RaceUser/{id}/change-password requires both password fields before touching any user', async ({ api }) => {
    const res = await api.post('/api/RaceUser/999999/change-password', {});
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.errors.NewPassword[0]).toMatch(/required/i);
    expect(body.errors.CurrentPassword[0]).toMatch(/required/i);
  });

  test('BUG: PUT /RaceSession/{id}/deactivate on a nonexistent id 500s on a broken query (same AdminUserName bug as the GET)', async ({ api }) => {
    const res = await api.put('/api/RaceSession/999999/deactivate', {});
    expect(res.status()).toBe(500);
    const body = await res.json();
    expect(body.error).toContain("Unknown column 't.AdminUserName'");
  });
});

test.describe('API - Mutation validation (required-field checks, no real account touched)', () => {
  test('POST /RaceWebUser/login requires email and password', async ({ api }) => {
    const res = await api.post('/api/RaceWebUser/login', {});
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.errors.UserEmail[0]).toMatch(/required/i);
    expect(body.errors.UserPassword[0]).toMatch(/required/i);
  });

  test('POST /RaceWebUser/register requires the account fields', async ({ api }) => {
    const res = await api.post('/api/RaceWebUser/register', {});
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.errors.UserEmail[0]).toMatch(/required/i);
  });

  test('POST /RaceWebUser/reset-password requires a token and new password', async ({ api }) => {
    const res = await api.post('/api/RaceWebUser/reset-password', {});
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.errors.Token[0]).toMatch(/required/i);
    expect(body.errors.NewPassword[0]).toMatch(/required/i);
  });

  test('POST /tipster/login requires a username and password', async ({ api }) => {
    const res = await api.post('/api/tipster/login', {});
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toMatch(/username and password are required/i);
  });

  test('POST /tipster/register requires username, email and password', async ({ api }) => {
    const res = await api.post('/api/tipster/register', {});
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toMatch(/username, email and password are required/i);
  });
});

test.describe('API - POST-verb reads (search endpoints that happen to use POST)', () => {
  // These take an optional filter body via POST but never mutate anything -
  // an empty body is a legitimate "no filter" request, not an edge case.
  test('POST /RaceJockys/select returns the jockey list with no filters', async ({ api }) => {
    const res = await api.post('/api/RaceJockys/select', {});
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
  });

  test('POST /RaceTrainers/select returns the trainer list with no filters', async ({ api }) => {
    const res = await api.post('/api/RaceTrainers/select', {});
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
  });

  test('POST /RaceHorses/GetHorsesWithSelectedFields returns horses with no filters', async ({ api }) => {
    const res = await api.post('/api/RaceHorses/GetHorsesWithSelectedFields', {});
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
  });

  test('POST /Workouts/GetRACEHJT rejects a JSON body (expects form-encoded)', async ({ api }) => {
    const res = await api.post('/api/Workouts/GetRACEHJT', {});
    expect(res.status()).toBe(400);
    const body = await res.text();
    expect(body).toContain('Content-Type header');
  });
});
