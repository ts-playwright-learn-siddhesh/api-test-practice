import { test, expect } from '@playwright/test';

test.describe(
  'Authentication — Access',
  {
    tag: ['@authentication'],
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
      async ({ request }) => {
        const response = await test.step('Request current user without authorization header', async () =>
          request.get('auth/me')
        );

        await test.step('Verify request is rejected with 401', async () => {
          expect(response.status()).toBe(401);

          const body = await response.json();
          expect(body.message).toBe('Access Token is required');
          expect(body.id).toBeUndefined();
        });
      }
    );
  }
);
