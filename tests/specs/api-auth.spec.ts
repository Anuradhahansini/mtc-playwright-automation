import { test, expect } from '@playwright/test';
import { AuthApiClient } from '../../api/AuthApiClient';
import { VALID_USERNAME, VALID_PASSWORD } from '../../data/user';

// Runs in the 'api' project (see playwright.config.ts) - hits the backend
// API directly via Playwright's `request` fixture, no browser involved.
// Base URL: API_BASE_URL (http://192.9.160.206:5071), documented at
// /swagger/index.html. Every response here follows the same envelope:
// { success, message, data }.
test.describe('API - Auth', () => {
  test('logs in with valid credentials', async ({ request }) => {
    const auth = new AuthApiClient(request);
    const res = await auth.login({ username: VALID_USERNAME, password: VALID_PASSWORD, portal: 'admin' });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.username).toBe(VALID_USERNAME);
    expect(body.data.accessToken).toBeTruthy();
    expect(body.data.refreshToken).toBeTruthy();
  });

  test('rejects a wrong password', async ({ request }) => {
    const auth = new AuthApiClient(request);
    const res = await auth.login({ username: VALID_USERNAME, password: 'wrong-password-123', portal: 'admin' });

    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toMatch(/invalid username or password/i);
    expect(body.data).toBeNull();
  });

  test('rejects a wrong username', async ({ request }) => {
    const auth = new AuthApiClient(request);
    const res = await auth.login({ username: 'not_a_real_user', password: VALID_PASSWORD, portal: 'admin' });

    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  test('rejects empty credentials', async ({ request }) => {
    const auth = new AuthApiClient(request);
    const res = await auth.login({ username: '', password: '', portal: 'admin' });

    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toMatch(/username and password are required/i);
  });

  test('the portal field is optional', async ({ request }) => {
    // Documents actual behavior: the login DTO includes a "portal" field,
    // but omitting it doesn't block login.
    const auth = new AuthApiClient(request);
    const res = await auth.login({ username: VALID_USERNAME, password: VALID_PASSWORD });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  test('/me returns the authenticated user with a valid token', async ({ request }) => {
    const auth = new AuthApiClient(request);
    const loginRes = await auth.login({ username: VALID_USERNAME, password: VALID_PASSWORD, portal: 'admin' });
    const { data } = await loginRes.json();

    const meRes = await auth.me(data.accessToken);

    expect(meRes.status()).toBe(200);
    const meBody = await meRes.json();
    expect(meBody.success).toBe(true);
    expect(meBody.data.username).toBe(VALID_USERNAME);
    expect(meBody.data.userId).toBe(data.userId);
  });

  test('/me rejects a request with no token', async ({ request }) => {
    const auth = new AuthApiClient(request);
    const res = await auth.me('');

    expect(res.status()).toBe(401);
  });

  test('/me rejects a malformed token', async ({ request }) => {
    const auth = new AuthApiClient(request);
    const res = await auth.me('garbage.invalid.token');

    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.message).toMatch(/invalid or expired access token/i);
  });
});
