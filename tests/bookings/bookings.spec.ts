import { test, expect, type APIRequestContext } from '@playwright/test';

const booking = {
  firstname: 'Jim',
  lastname: 'Brown',
  totalprice: 111,
  depositpaid: true,
  bookingdates: { checkin: '2026-01-01', checkout: '2026-01-02' },
  additionalneeds: 'Breakfast',
};

async function getToken(request: APIRequestContext): Promise<string> {
  const response = await request.post('auth', { data: { username: 'admin', password: 'password123' } });
  expect(response.status()).toBe(200);
  const body = await response.json();
  return body.token;
}

async function createBooking(request: APIRequestContext, data: typeof booking = booking): Promise<number> {
  const response = await request.post('booking', { data });
  expect(response.status()).toBe(200);
  const body = await response.json();
  return body.bookingid;
}

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
        const token = await getToken(request);
        const bookingId = await createBooking(request);

        const deleteResponse = await request.delete(`booking/${bookingId}`, {
          headers: { Cookie: `token=${token}` },
        });
        expect(deleteResponse.status()).toBe(201);

        const getResponse = await request.get(`booking/${bookingId}`);
        expect(getResponse.status()).toBe(404);
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
        const bookingId = await createBooking(request);
        const update = { additionalneeds: 'Lunch' };

        const staleResponse = await request.patch(`booking/${bookingId}`, {
          headers: { Cookie: 'token=stale-token' },
          data: update,
        });
        expect(staleResponse.status()).toBe(403);

        const newToken = await getToken(request);
        const retryResponse = await request.patch(`booking/${bookingId}`, {
          headers: { Cookie: `token=${newToken}` },
          data: update,
        });
        expect(retryResponse.status()).toBe(200);

        const getResponse = await request.get(`booking/${bookingId}`);
        const saved = await getResponse.json();
        expect(saved.additionalneeds).toBe('Lunch');
      }
    );

    // ============================================================
    // TC-BOOKING-003: Creating a booking with special characters in
    // text fields saves them unchanged
    // ============================================================
    test(
      '[TC-BOOKING-003] special characters in booking fields are saved unchanged',
      {
        annotation: [{ type: 'test-case', description: 'TC-BOOKING-003' }],
        tag: ['@positive'],
      },
      async ({ request }) => {
        const specialBooking = {
          ...booking,
          firstname: 'José',
          lastname: "O'Brien & Sons/李",
          additionalneeds: 'Breakfast?=#%',
        };

        const bookingId = await createBooking(request, specialBooking);

        const response = await request.get(`booking/${bookingId}`);
        expect(response.status()).toBe(200);

        const saved = await response.json();
        expect(saved.firstname).toBe(specialBooking.firstname);
        expect(saved.lastname).toBe(specialBooking.lastname);
        expect(saved.additionalneeds).toBe(specialBooking.additionalneeds);
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
        const bookingId = await createBooking(request);

        const start = Date.now();
        const response = await request.get(`booking/${bookingId}`);
        const durationMs = Date.now() - start;

        expect(response.status()).toBe(200);
        expect(durationMs).toBeLessThan(3000);
      }
    );
  }
);
