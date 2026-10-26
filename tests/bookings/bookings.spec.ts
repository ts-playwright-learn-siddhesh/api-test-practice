import { test, expect } from '@playwright/test';
import { z } from 'zod';
import { BookingClient } from './booking-client';
import { buildBooking } from './booking-data';

const booking = buildBooking();

const bookingSchema = z.object({
  firstname: z.string(),
  lastname: z.string(),
  totalprice: z.number(),
  depositpaid: z.boolean(),
  bookingdates: z.object({ checkin: z.string(), checkout: z.string() }),
  additionalneeds: z.string().optional(),
});

test.describe(
  'Bookings — API',
  {
    tag: ['@bookings'],
  },
  () => {
    let client: BookingClient;
    let bookingId: number;

    test.beforeEach('Authenticate and create a booking for the test', async ({ request }) => {
      client = new BookingClient(request);
      await client.auth();
      bookingId = await client.create(booking);
    });

    test.afterEach('Delete the booking created for the test', async () => {
      await client.delete(bookingId);
    });

    // ============================================================
    // TC-BOOKING-001: Deleting a booking with a valid token removes
    // it, and fetching the same booking afterwards returns 404
    // ============================================================
    test(
      '[TC-BOOKING-001] fetching the deleted booking should return not found (404)',
      {
        annotation: [{ type: 'test-case', description: 'TC-BOOKING-001' }],
        tag: ['@smoke', '@positive'],
      },
      async () => {
        await test.step('Verify booking was created', async () => {
          const createdResponse = await client.get(bookingId);
          expect(createdResponse.status()).toBe(200);
        });

        await test.step('Delete booking', async () => {
          const deleteResponse = await client.delete(bookingId);
          expect(deleteResponse.status()).toBe(201);
        });

        await test.step('Verify deleted booking returns 404', async () => {
          const getResponse = await client.get(bookingId);
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
      async () => {
        const update = { additionalneeds: 'Lunch' };

        await test.step('Update with stale token is rejected', async () => {
          const staleResponse = await client.patch(bookingId, update, 'stale-token');
          expect(staleResponse.status()).toBe(403);
        });

        await test.step('Retry update with new token', async () => {
          await client.auth();
          const retryResponse = await client.patch(bookingId, update);
          expect(retryResponse.status()).toBe(200);
        });

        await test.step('Verify change is saved', async () => {
          const getResponse = await client.get(bookingId);
          const saved = await getResponse.json();
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
      async () => {
        const specialBooking = buildBooking({
          firstname: 'José',
          lastname: "O'Brien & Sons/李",
        });

        const bookingId = await test.step('Create booking with special characters', async () =>
          client.create(specialBooking)
        );

        await test.step('Verify first and last name are saved unchanged', async () => {
          const response = await client.get(bookingId);
          expect(response.status()).toBe(200);

          const saved = await response.json();
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
      async () => {
        await test.step('Fetch booking within 3 seconds', async () => {
          const start = Date.now();
          const response = await client.get(bookingId);
          const durationMs = Date.now() - start;

          expect(response.status()).toBe(200);
          expect(durationMs).toBeLessThan(3000);
        });
      }
    );

    // ============================================================
    // TC-BOOKING-005a: A created booking is read with a valid schema
    // ============================================================
    test(
      '[TC-BOOKING-005a] reading a booking returns a valid schema',
      {
        annotation: [{ type: 'test-case', description: 'TC-BOOKING-005a' }],
        tag: ['@smoke', '@positive'],
      },
      async () => {
        await test.step('Read booking and verify schema', async () => {
          const response = await client.get(bookingId);
          expect(response.status()).toBe(200);

          const body = await response.json();
          expect(bookingSchema.safeParse(body).error).toBeUndefined();
          expect(body.firstname).toBe(booking.firstname);
        });
      }
    );

    // ============================================================
    // TC-BOOKING-005b: Updating a booking with PUT saves the update
    // ============================================================
    test(
      '[TC-BOOKING-005b] updating a booking with PUT saves the update',
      {
        annotation: [{ type: 'test-case', description: 'TC-BOOKING-005b' }],
        tag: ['@smoke', '@positive'],
      },
      async () => {
        const updated = buildBooking({ firstname: 'James', totalprice: 222 });

        await test.step('Update booking with PUT', async () => {
          const response = await client.update(bookingId, updated);
          expect(response.status()).toBe(200);
        });

        await test.step('Verify update is saved', async () => {
          const saved = await (await client.get(bookingId)).json();
          expect(saved.firstname).toBe(updated.firstname);
          expect(saved.totalprice).toBe(updated.totalprice);
        });
      }
    );

    // ============================================================
    // TC-BOOKING-006: Updating and deleting a second booking does
    // not change the booking created in beforeEach
    // ============================================================
    test(
      '[TC-BOOKING-006] updating and deleting a second booking does not change the booking created in beforeEach',
      {
        annotation: [{ type: 'test-case', description: 'TC-BOOKING-006' }],
        tag: ['@positive'],
      },
      async () => {
        const secondBookingId = await test.step('Create a second booking', async () => client.create(booking));

        await test.step('Update and delete the second booking', async () => {
          const updateResponse = await client.patch(secondBookingId, { firstname: 'Changed' });
          expect(updateResponse.status()).toBe(200);

          const deleteResponse = await client.delete(secondBookingId);
          expect(deleteResponse.status()).toBe(201);
        });

        await test.step('Verify the booking created in beforeEach is unchanged', async () => {
          const response = await client.get(bookingId);
          expect(response.status()).toBe(200);

          const saved = await response.json();
          expect(saved.firstname).toBe(booking.firstname);
          expect(saved.additionalneeds).toBe(booking.additionalneeds);
        });
      }
    );
  }
);
