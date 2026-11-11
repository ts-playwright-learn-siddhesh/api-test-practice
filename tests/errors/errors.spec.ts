import { z } from 'zod';
import { test, expect } from '../fixtures';

const errorSchema = z.object({ message: z.string().min(1) }).strict();

test.describe(
  'Errors — Consistency',
  {
    tag: ['@errors', '@regression'],
  },
  () => {
    // ============================================================
    // TC-ERRORS-001: Error responses from products, carts, cart add,
    // login and current user all have the same { message } structure
    // ============================================================
    test(
      '[TC-ERRORS-001] error responses have the same structure across endpoints',
      {
        annotation: [{ type: 'test-case', description: 'TC-ERRORS-001' }],
        tag: ['@negative'],
      },
      async ({ productService, cartService, authService }) => {
        const errors = [
          { endpoint: 'GET products/0', status: 404, send: () => productService.get(0) },
          { endpoint: 'GET carts/0', status: 404, send: () => cartService.get(0) },
          { endpoint: 'POST carts/add', status: 400, send: () => cartService.addRequest({}) },
          { endpoint: 'POST auth/login', status: 400, send: () => authService.login('', '') },
          { endpoint: 'GET auth/me', status: 401, send: () => authService.me() },
        ];

        for (const { endpoint, status, send } of errors) {
          await test.step(`Verify ${endpoint} returns ${status} with only a message`, async () => {
            const response = await send();
            expect(response.status()).toBe(status);
            expect(response.headers()['content-type']).toContain('application/json');
            expect(errorSchema.safeParse(await response.json()).error).toBeUndefined();
          });
        }
      }
    );
  }
);
