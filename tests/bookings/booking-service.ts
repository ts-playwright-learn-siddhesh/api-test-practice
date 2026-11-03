import type { APIResponse } from '@playwright/test';
import { ApiClient } from '../api-client';
import type { Booking } from './booking-data';

interface AuthResponse {
  token: string;
}

interface BookingId {
  bookingid: number;
}

export class BookingService extends ApiClient {
  private readonly bookingEndpoint = 'booking';

  protected authHeaders(token: string) {
    return { Cookie: `token=${token}` };
  }

  private bookingUrl(id: number): string {
    return this.url(`${this.bookingEndpoint}/${id}`);
  }

  async auth(): Promise<string> {
    const response = await this.request.post(this.url('auth'), {
      data: { username: process.env.BOOKER_USERNAME, password: process.env.BOOKER_PASSWORD },
    });
    const body = await this.parse<AuthResponse>(response, 200);
    this.token = body.token;
    return this.token;
  }

  async create(data: Booking): Promise<number> {
    const response = await this.request.post(this.url(this.bookingEndpoint), { data });
    const body = await this.parse<BookingId>(response, 200);
    return body.bookingid;
  }

  get(id: number): Promise<APIResponse> {
    return this.request.get(this.bookingUrl(id));
  }

  async findByName(firstname: string, lastname: string): Promise<BookingId[]> {
    const response = await this.request.get(this.url(this.bookingEndpoint), { params: { firstname, lastname } });
    return this.parse<BookingId[]>(response, 200);
  }

  update(id: number, data: Booking, token = this.token): Promise<APIResponse> {
    return this.request.put(this.bookingUrl(id), { headers: this.authHeaders(token), data });
  }

  patch(id: number, data: Partial<Booking>, token = this.token): Promise<APIResponse> {
    return this.request.patch(this.bookingUrl(id), { headers: this.authHeaders(token), data });
  }

  delete(id: number, token = this.token): Promise<APIResponse> {
    return this.request.delete(this.bookingUrl(id), { headers: this.authHeaders(token) });
  }
}
