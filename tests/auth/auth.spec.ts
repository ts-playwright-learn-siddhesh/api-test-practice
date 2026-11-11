import { faker } from '@faker-js/faker';
import { test, expect } from '../fixtures';

test.describe(
  'Authentication — Access',
  {
    tag: ['@authentication', '@regression'],
  },
  () => {
    // ============================================================
    // TC-AUTH-001: Requesting the current user without an
    // Authorization header is rejected with 401 and an
    // "Access Token is required" message
    // ============================================================
    test(
      '[TC-AUTH-001] request without authorization header is rejected with 401',
      {
        annotation: [{ type: 'test-case', description: 'TC-AUTH-001' }],
        tag: ['@smoke', '@negative'],
      },
      async ({ authService }) => {
        const response = await test.step('Request current user without authorization header', async () =>
          authService.me()
        );

        await test.step('Verify request is rejected with 401', async () => {
          expect(response.status()).toBe(401);

          const body = await response.json();
          expect(body.message).toBe('Access Token is required');
          expect(body.id).toBeUndefined();
        });
      }
    );

    // ============================================================
    // TC-AUTH-002: Logging in with a valid username and a wrong
    // password is rejected with 400, an "Invalid credentials"
    // message and no access token
    // ============================================================
    test(
      '[TC-AUTH-002] login with a wrong password is rejected with 400',
      {
        annotation: [{ type: 'test-case', description: 'TC-AUTH-002' }],
        tag: ['@negative'],
      },
      async ({ authService }) => {
        const response = await test.step('Log in with a wrong password', async () =>
          authService.login(process.env.DUMMYJSON_USERNAME ?? '', faker.internet.password())
        );

        await test.step('Verify login is rejected with 400 and no access token', async () => {
          expect(response.status()).toBe(400);

          const body = await response.json();
          expect(body.message).toBe('Invalid credentials');
          expect(body.accessToken).toBeUndefined();
        });
      }
    );
  }
);
