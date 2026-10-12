import { test, expect } from '@playwright/test';

test.describe(
  'Users — API',
  {
    tag: ['@users'],
  },
  () => {
    // ============================================================
    // TC-USERS-001: Fetching an existing user by id returns 200 with
    // JSON content and that user's id, email and name
    // ============================================================
    test(
      '[TC-USERS-001] fetching an existing user returns that user',
      {
        annotation: [{ type: 'test-case', description: 'TC-USERS-001' }],
        tag: ['@smoke', '@positive'],
      },
      async ({ request }) => {
        const response = await request.get('users/2');

        expect(response.status()).toBe(200);
        expect(response.headers()['content-type']).toContain('application/json');

        const body = await response.json();
        expect(body.data.id).toBe(2);
        expect(body.data.email).toBe('janet.weaver@reqres.in');
        expect(body.data.first_name).toBe('Janet');
        expect(body.data.last_name).toBe('Weaver');
      }
    );

    // ============================================================
    // TC-USERS-002: Listing users for a page returns 200 with matching
    // pagination info, and every user in the list has a numeric id,
    // a reqres.in email and a non-empty first name
    // ============================================================
    test(
      '[TC-USERS-002] listing users returns a page of well-formed users',
      {
        annotation: [{ type: 'test-case', description: 'TC-USERS-002' }],
        tag: ['@positive'],
      },
      async ({ request }) => {
        const response = await request.get('users', { params: { page: 2 } });

        expect(response.status()).toBe(200);

        const body = await response.json();
        expect(body.page).toBe(2);
        expect(body.per_page).toBe(6);
        expect(body.data.length).toBe(body.per_page);

        const users: Array<{ id: unknown; email: unknown; first_name: unknown }> = body.data;
        const allUsersValid = users.every(
          (user) =>
            typeof user.id === 'number' &&
            typeof user.email === 'string' &&
            user.email.endsWith('@reqres.in') &&
            typeof user.first_name === 'string' &&
            user.first_name.length > 0
        );
        expect(allUsersValid).toBe(true);
      }
    );

    // ============================================================
    // TC-USERS-003: Creating a user with valid name and job returns
    // 201 with the sent data, a new id and a createdAt timestamp
    // ============================================================
    test(
      '[TC-USERS-003] creating a user returns 201 with sent data and new id',
      {
        annotation: [{ type: 'test-case', description: 'TC-USERS-003' }],
        tag: ['@smoke', '@positive'],
      },
      async ({ request }) => {
        const newUser = { name: 'morpheus', job: 'leader' };

        const response = await request.post('users', { data: newUser });

        expect(response.status()).toBe(201);

        const body = await response.json();
        expect(body.name).toBe(newUser.name);
        expect(body.job).toBe(newUser.job);
        expect(typeof body.id).toBe('string');
        expect(body.id.length).toBeGreaterThan(0);
        expect(Number.isNaN(Date.parse(body.createdAt))).toBe(false);
      }
    );

    // ============================================================
    // TC-USERS-004: Replacing a user with PUT returns 200 with the new
    // name and job and an updatedAt timestamp
    // ============================================================
    test(
      '[TC-USERS-004] replacing a user returns the new name and job',
      {
        annotation: [{ type: 'test-case', description: 'TC-USERS-004' }],
        tag: ['@positive'],
      },
      async ({ request }) => {
        const replacement = { name: 'morpheus', job: 'zion resident' };

        const response = await request.put('users/2', { data: replacement });

        expect(response.status()).toBe(200);

        const body = await response.json();
        expect(body.name).toBe(replacement.name);
        expect(body.job).toBe(replacement.job);
        expect(Number.isNaN(Date.parse(body.updatedAt))).toBe(false);
      }
    );

    // ============================================================
    // TC-USERS-005: Updating only the job with PATCH returns 200 with
    // the new job, no name field and an updatedAt timestamp
    // ============================================================
    test(
      '[TC-USERS-005] partially updating a user changes only the sent field',
      {
        annotation: [{ type: 'test-case', description: 'TC-USERS-005' }],
        tag: ['@positive'],
      },
      async ({ request }) => {
        const response = await request.patch('users/2', { data: { job: 'captain' } });

        expect(response.status()).toBe(200);

        const body = await response.json();
        expect(body.job).toBe('captain');
        expect(body.name).toBeUndefined();
        expect(Number.isNaN(Date.parse(body.updatedAt))).toBe(false);
      }
    );

    // ============================================================
    // TC-USERS-006: Deleting a user returns 204 with an empty body
    // ============================================================
    test(
      '[TC-USERS-006] deleting a user returns 204 with empty body',
      {
        annotation: [{ type: 'test-case', description: 'TC-USERS-006' }],
        tag: ['@positive'],
      },
      async ({ request }) => {
        const response = await request.delete('users/2');

        expect(response.status()).toBe(204);
        expect(await response.text()).toBe('');
      }
    );

    // ============================================================
    // TC-USERS-007: Creating a user with Content-Type text/plain
    // returns 201 but the name and job sent in the body are not saved
    // ============================================================
    test(
      '[TC-USERS-007] creating a user with text/plain content type does not save sent fields',
      {
        annotation: [{ type: 'test-case', description: 'TC-USERS-007' }],
        tag: ['@negative'],
      },
      async ({ request }) => {
        const response = await request.post('users', {
          headers: { 'Content-Type': 'text/plain' },
          data: JSON.stringify({ name: 'morpheus', job: 'leader' }),
        });

        expect(response.status()).toBe(201);

        const body = await response.json();
        expect(typeof body.id).toBe('string');
        expect(body.name).toBeUndefined();
        expect(body.job).toBeUndefined();
      }
    );

    // ============================================================
    // TC-USERS-008: Requesting a user with an invalid API key is
    // rejected with 403, an invalid_api_key error and no user data
    // ============================================================
    test(
      '[TC-USERS-008] request with invalid API key is rejected with 403',
      {
        annotation: [{ type: 'test-case', description: 'TC-USERS-008' }],
        tag: ['@negative'],
      },
      async ({ request }) => {
        const response = await request.get('users/2', { headers: { 'x-api-key': 'invalid-key' } });

        expect(response.status()).toBe(403);
        expect(response.headers()['content-type']).toContain('application/json');

        const body = await response.json();
        expect(body.error).toBe('invalid_api_key');
        expect(body.data).toBeUndefined();
      }
    );

    // ============================================================
    // TC-USERS-009: Requesting a user id that does not exist returns
    // 404 with no user data
    // ============================================================
    test(
      '[TC-USERS-009] fetching a non-existent user returns 404',
      {
        annotation: [{ type: 'test-case', description: 'TC-USERS-009' }],
        tag: ['@negative'],
      },
      async ({ request }) => {
        const response = await request.get('users/23');

        expect(response.status()).toBe(404);

        const body = await response.json();
        expect(body.data?.id).toBeUndefined();
        expect(body.data?.email ?? null).toBeNull();
      }
    );
  }
);
