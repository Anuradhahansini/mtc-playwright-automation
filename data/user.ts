import type { Role } from '../pages/common/RoleSelector';

// Sourced from the current TEST_ENV's .env file (see playwright.config.ts),
// falling back to the known UAT admin login if unset.
export const VALID_USERNAME = process.env.UAT_ADMIN_USERNAME || 'mtc_anuradha';
export const VALID_PASSWORD = process.env.UAT_ADMIN_PASSWORD || '12345';

// Additional roles can be exercised the same way once credentials exist for
// them. Populate these env vars (e.g. in .env.uat) to enable the extra role
// coverage below.
export const ROLE_CREDENTIALS: Partial<Record<Role, { username: string; password: string }>> = {
  Admin: { username: VALID_USERNAME, password: VALID_PASSWORD },
  ...(process.env.TRAINER_USERNAME && process.env.TRAINER_PASSWORD
    ? { Trainer: { username: process.env.TRAINER_USERNAME, password: process.env.TRAINER_PASSWORD } }
    : {}),
  ...(process.env.TIPSTER_USERNAME && process.env.TIPSTER_PASSWORD
    ? { Tipster: { username: process.env.TIPSTER_USERNAME, password: process.env.TIPSTER_PASSWORD } }
    : {}),
};
