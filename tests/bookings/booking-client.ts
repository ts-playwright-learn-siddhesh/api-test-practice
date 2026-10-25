import { expect, type APIRequestContext, type APIResponse } from '@playwright/test';
import type { Booking } from './booking-data';

async function expectStatus(response: APIResponse, status: number) {
  expect(response.status(), await response.text()).toBe(status);
}

export class BookingClient {
  private token = '';

  constructor(private readonly request: APIRequestContext) {}

  async auth(): Promise<string> {
    const response = await this.request.post('auth', {
      data: { username: process.env.BOOKER_USERNAME, password: process.env.BOOKER_PASSWORD },
    });
    await expectStatus(response, 200);
    const body = await response.json();
    this.token = body.token;
    return this.token;
  }

  async create(data: Booking): Promise<number> {
    const response = await this.request.post('booking', { data });
    await expectStatus(response, 200);
    const body = await response.json();
    return body.bookingid;
  }

  get(id: number): Promise<APIResponse> {
    return this.request.get(`booking/${id}`);
  }

  update(id: number, data: Booking, token = this.token): Promise<APIResponse> {
    return this.request.put(`booking/${id}`, { headers: { Cookie: `token=${token}` }, data });
  }

  patch(id: number, data: Partial<Booking>, token = this.token): Promise<APIResponse> {
    return this.request.patch(`booking/${id}`, { headers: { Cookie: `token=${token}` }, data });
  }

  delete(id: number, token = this.token): Promise<APIResponse> {
    return this.request.delete(`booking/${id}`, { headers: { Cookie: `token=${token}` } });
  }
}
