import { test as base, expect } from '@playwright/test';
import { AuthApiClient } from '../api/AuthApiClient';
import { RaceApiClient } from '../api/RaceApiClient';
import { VALID_USERNAME, VALID_PASSWORD } from '../data/user';

/** Extends the base `request` fixture with a pre-authenticated RaceApiClient. */
export const test = base.extend<{ api: RaceApiClient }>({
  api: async ({ request }, use) => {
    const auth = new AuthApiClient(request);
    const res = await auth.login({ username: VALID_USERNAME, password: VALID_PASSWORD, portal: 'admin' });
    const body = await res.json();
    if (!body.success) {
      throw new Error(`API fixture login failed: ${body.message}`);
    }
    await use(new RaceApiClient(request, body.data.accessToken));
  },
});

export { expect };
