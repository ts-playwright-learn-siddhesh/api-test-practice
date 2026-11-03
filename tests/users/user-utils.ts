import { expect, type APIRequestContext } from '@playwright/test';
import type { NewUser } from './user-data';

export async function createUser(request: APIRequestContext, data: NewUser): Promise<string> {
  const response = await request.post('users', { data });
  expect(response.status()).toBe(201);
  const body = await response.json();
  return body.id;
}
