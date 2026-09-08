import { type APIRequestContext } from '@playwright/test';

export interface LoginRequest {
  username: string;
  password: string;
  portal?: string;
}

/** Thin wrapper around the RACEhorses API's Auth endpoints (see /swagger). */
export class AuthApiClient {
  constructor(private readonly request: APIRequestContext) {}

  async login(body: LoginRequest) {
    return this.request.post('/api/Auth/login', { data: body });
  }

  async me(accessToken: string) {
    return this.request.get('/api/Auth/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }

  async logout(accessToken: string) {
    return this.request.post('/api/Auth/logout', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }
}
