import { type APIRequestContext, type APIResponse } from '@playwright/test';

/** Thin authenticated wrapper for the RACEhorses API (see /swagger). */
export class RaceApiClient {
  constructor(
    private readonly request: APIRequestContext,
    readonly accessToken: string,
  ) {}

  private get headers() {
    return { Authorization: `Bearer ${this.accessToken}` };
  }

  get(path: string, params?: Record<string, string | number>): Promise<APIResponse> {
    const stringParams = params
      ? Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]))
      : undefined;
    return this.request.get(path, { headers: this.headers, params: stringParams });
  }

  post(path: string, data?: unknown): Promise<APIResponse> {
    return this.request.post(path, { headers: this.headers, data });
  }

  delete(path: string, params?: Record<string, string | number>): Promise<APIResponse> {
    const stringParams = params
      ? Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]))
      : undefined;
    return this.request.delete(path, { headers: this.headers, params: stringParams });
  }
}
