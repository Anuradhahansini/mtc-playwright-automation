import { test, expect } from '../apiFixtures';
import { RACE_CLIENT_ID } from '../../data/client';

// Runs in the 'api' project (see playwright.config.ts). Covers the admin
// user/role/permission endpoints behind the Admin > Users and Admin > Roles
// pages. Several of these share a systemic backend bug: a query referencing
// an "AdminRoleID" column that no longer exists on the users table.
test.describe('API - Race user (admin)', () => {
  test('GET /RaceUser/GetAll returns the full role/permission matrix', async ({ api }) => {
    const res = await api.get('/api/RaceUser/GetAll');
    expect(res.status()).toBe(200);
    const permissions = await res.json();
    expect(Array.isArray(permissions)).toBe(true);
    expect(permissions.length).toBeGreaterThan(0);
    expect(permissions[0]).toHaveProperty('roleID');
  });

  test('GET /RaceUser/GetByRole/{roleId} returns permissions for role 1, empty for an unknown role', async ({ api }) => {
    const known = await api.get('/api/RaceUser/GetByRole/1');
    expect(known.status()).toBe(200);
    const permissions = await known.json();
    expect(permissions.length).toBeGreaterThan(0);
    expect(permissions.every((p: { roleID: number }) => p.roleID === 1)).toBe(true);

    const unknown = await api.get('/api/RaceUser/GetByRole/999999');
    expect(unknown.status()).toBe(200);
    expect(await unknown.json()).toEqual([]);
  });

  test('GET /RaceUser/GetRaceUsers lists client-side (portal) users', async ({ api }) => {
    const res = await api.get('/api/RaceUser/GetRaceUsers', { clientID: RACE_CLIENT_ID });
    expect(res.status()).toBe(200);
    const users = await res.json();
    expect(Array.isArray(users)).toBe(true);
    expect(users.length).toBeGreaterThan(0);
    expect(users.every((u: { clientID: number }) => u.clientID === RACE_CLIENT_ID)).toBe(true);
    // Not asserting on userPassword/userResetPasswordToken values - the
    // response includes them, which is worth flagging separately, but a
    // test shouldn't capture or print real credential material.
  });

  test('GET /RaceUser/GetRoles lists admin roles, optionally filtered by name', async ({ api }) => {
    const all = await api.get('/api/RaceUser/GetRoles');
    expect(all.status()).toBe(200);
    const roles = await all.json();
    expect(roles.length).toBeGreaterThan(0);

    const filtered = await api.get('/api/RaceUser/GetRoles', { name: 'Admin' });
    expect(filtered.status()).toBe(200);
    const filteredRoles = await filtered.json();
    expect(filteredRoles.every((r: { AdminRoleName: string }) => r.AdminRoleName.toLowerCase().includes('admin'))).toBe(true);
  });

  test('GET /RaceUser/GetUserLogs requires an admin user id', async ({ api }) => {
    // id=0 (the default when omitted) resolves to no such user.
    const res = await api.get('/api/RaceUser/GetUserLogs');
    expect(res.status()).toBe(404);
  });

  test('GET /RaceUser/GetUserLogs returns activity logs for the logged-in admin', async ({ api }) => {
    const meRes = await api.get('/api/Auth/me');
    const { data: me } = await meRes.json();

    const res = await api.get('/api/RaceUser/GetUserLogs', { id: me.userId });
    expect(res.status()).toBe(200);
    const logs = await res.json();
    expect(Array.isArray(logs)).toBe(true);
    expect(logs.length).toBeGreaterThan(0);
    expect(logs.every((l: { raceUserID: number }) => l.raceUserID === me.userId)).toBe(true);
  });

  test('GET /RaceUser/GetUsers returns the admin-portal user list', async ({ api }) => {
    const res = await api.get('/api/RaceUser/GetUsers');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.users)).toBe(true);
    expect(body.users.length).toBeGreaterThan(0);
    expect(body.users[0]).toHaveProperty('adminUserName');
  });

  test('GET /RaceUser/GetUsersWithRoles requires a client id', async ({ api }) => {
    const res = await api.get('/api/RaceUser/GetUsersWithRoles');
    expect(res.status()).toBe(400);
    const body = await res.text();
    expect(body).toContain('Invalid clientId');
  });

  test('GET /RaceUser/GetUsersWithRoles lists users with their roles for a client', async ({ api }) => {
    const res = await api.get('/api/RaceUser/GetUsersWithRoles', { clientId: RACE_CLIENT_ID });
    expect(res.status()).toBe(200);
    const users = await res.json();
    expect(Array.isArray(users)).toBe(true);
    expect(users.length).toBeGreaterThan(0);
    expect(Array.isArray(users[0].roles)).toBe(true);
  });

  test('BUG: GET /RaceUser/by-client/{clientId} 500s on a missing AdminRoleID column', async ({ api }) => {
    const res = await api.get(`/api/RaceUser/by-client/${RACE_CLIENT_ID}`);
    expect(res.status()).toBe(500);
    const body = await res.json();
    expect(body.error).toContain("required column 'AdminRoleID'");
  });

  test('BUG: GET /RaceUser/{id} 500s on an unknown AdminRoleID column', async ({ api }) => {
    const res = await api.get('/api/RaceUser/304');
    expect(res.status()).toBe(500);
    const body = await res.json();
    expect(body.error).toContain("Unknown column 'm.AdminRoleID'");
  });
});
