import { expect, type APIRequestContext, type APIResponse } from '@playwright/test';

export abstract class ApiClient {
  protected token = '';

  constructor(
    protected readonly request: APIRequestContext,
    private readonly baseURL: string
  ) {}

  protected url(path: string): string {
    return `${this.baseURL}${path}`;
  }

  protected authHeaders(token: string): Record<string, string> {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  protected async parse<T>(response: APIResponse, status: number): Promise<T> {
    expect(response.status(), await response.text()).toBe(status);
    return response.json();
  }
}
