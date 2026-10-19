import { expect, type APIRequestContext, type APIResponse } from '@playwright/test';

export async function toJson(response: APIResponse) {
  return response.json();
}

export async function getToken(request: APIRequestContext): Promise<string> {
  const response = await request.post('auth', {
    data: { username: process.env.BOOKER_USERNAME, password: process.env.BOOKER_PASSWORD },
  });
  expect(response.status()).toBe(200);
  const body = await toJson(response);
  return body.token;
}

export async function createBooking(request: APIRequestContext, data: object): Promise<number> {
  const response = await request.post('booking', { data });
  expect(response.status()).toBe(200);
  const body = await toJson(response);
  return body.bookingid;
}
