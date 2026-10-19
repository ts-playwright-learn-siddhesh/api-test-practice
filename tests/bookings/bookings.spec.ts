import { test, expect } from '@playwright/test';
import { createBooking, getToken, toJson } from './booking-utils';

const booking = {
  firstname: 'Jim',
  lastname: 'Brown',
  totalprice: 111,
  depositpaid: true,
  bookingdates: { checkin: '2026-01-01', checkout: '2026-01-02' },
  additionalneeds: 'Breakfast',
};

test.describe(
  'Bookings — API',
  {
    tag: ['@bookings'],
  },
  () => {
    // ============================================================
    // TC-BOOKING-001: Deleting a booking with a valid token removes
    // it, and fetching the same booking afterwards returns 404
    // ============================================================
    test(
      '[TC-BOOKING-001] deleted booking can no longer be fetched',
      {
        annotation: [{ type: 'test-case', description: 'TC-BOOKING-001' }],
        tag: ['@smoke', '@positive'],
      },
      async ({ request }) => {
        const token = await test.step('Get auth token', async () => getToken(request));
        const bookingId = await test.step('Create booking', async () => createBooking(request, booking));

        await test.step('Verify booking was created', async () => {
          const createdResponse = await request.get(`booking/${bookingId}`);
          expect(createdResponse.status()).toBe(200);
        });

        await test.step('Delete booking', async () => {
          const deleteResponse = await request.delete(`booking/${bookingId}`, {
            headers: { Cookie: `token=${token}` },
          });
          expect(deleteResponse.status()).toBe(201);
        });

        await test.step('Verify deleted booking returns 404', async () => {
          const getResponse = await request.get(`booking/${bookingId}`);
          expect(getResponse.status()).toBe(404);
        });
      }
    );

    // ============================================================
    // TC-BOOKING-002: Updating a booking with a stale token is
    // rejected with 403; after getting a new token the retried
    // update succeeds and the change is saved
    // ============================================================
    test(
      '[TC-BOOKING-002] update with stale token succeeds after retry with new token',
      {
        annotation: [{ type: 'test-case', description: 'TC-BOOKING-002' }],
        tag: ['@negative'],
      },
      async ({ request }) => {
        const bookingId = await test.step('Create booking', async () => createBooking(request, booking));
        const update = { additionalneeds: 'Lunch' };

        await test.step('Update with stale token is rejected', async () => {
          const staleResponse = await request.patch(`booking/${bookingId}`, {
            headers: { Cookie: 'token=stale-token' },
            data: update,
          });
          expect(staleResponse.status()).toBe(403);
        });

        await test.step('Retry update with new token', async () => {
          const newToken = await getToken(request);
          const retryResponse = await request.patch(`booking/${bookingId}`, {
            headers: { Cookie: `token=${newToken}` },
            data: update,
          });
          expect(retryResponse.status()).toBe(200);
        });

        await test.step('Verify change is saved', async () => {
          const getResponse = await request.get(`booking/${bookingId}`);
          const saved = await toJson(getResponse);
          expect(saved.additionalneeds).toBe('Lunch');
        });
      }
    );

    // ============================================================
    // TC-BOOKING-003: Creating a booking with special characters in
    // first and last name saves them unchanged
    // ============================================================
    test(
      '[TC-BOOKING-003] special characters in first and last name are saved unchanged',
      {
        annotation: [{ type: 'test-case', description: 'TC-BOOKING-003' }],
        tag: ['@positive'],
      },
      async ({ request }) => {
        const specialBooking = {
          ...booking,
          firstname: 'José',
          lastname: "O'Brien & Sons/李",
        };

        const bookingId = await test.step('Create booking with special characters', async () =>
          createBooking(request, specialBooking)
        );

        await test.step('Verify first and last name are saved unchanged', async () => {
          const response = await request.get(`booking/${bookingId}`);
          expect(response.status()).toBe(200);

          const saved = await toJson(response);
          expect(saved.firstname).toBe(specialBooking.firstname);
          expect(saved.lastname).toBe(specialBooking.lastname);
        });
      }
    );

    // ============================================================
    // TC-BOOKING-004: Fetching a booking responds within 3 seconds
    // ============================================================
    test(
      '[TC-BOOKING-004] fetching a booking responds within 3 seconds',
      {
        annotation: [{ type: 'test-case', description: 'TC-BOOKING-004' }],
        tag: ['@positive'],
      },
      async ({ request }) => {
        const bookingId = await test.step('Create booking', async () => createBooking(request, booking));

        await test.step('Fetch booking within 3 seconds', async () => {
          const start = Date.now();
          const response = await request.get(`booking/${bookingId}`);
          const durationMs = Date.now() - start;

          expect(response.status()).toBe(200);
          expect(durationMs).toBeLessThan(3000);
        });
      }
    );
  }
);
