import type { APIResponse } from '@playwright/test';
import { ApiClient } from '../api-client';

export interface LoginResponse {
  id: number;
  username: string;
  accessToken: string;
}

export interface CurrentUser {
  id: number;
  username: string;
  email: string;
}

export class AuthService extends ApiClient {
  login(username: string, password: string): Promise<APIResponse> {
    return this.request.post(this.url('auth/login'), { data: { username, password } });
  }

  async auth(): Promise<LoginResponse> {
    const response = await this.login(process.env.DUMMYJSON_USERNAME ?? '', process.env.DUMMYJSON_PASSWORD ?? '');
    const body = await this.parse<LoginResponse>(response, 200);
    this.token = body.accessToken;
    return body;
  }

  me(): Promise<APIResponse> {
    return this.request.get(this.url('auth/me'), { headers: this.authHeaders(this.token) });
  }
}
