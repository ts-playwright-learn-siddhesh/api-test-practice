import { test, expect } from '@playwright/test';
import { z } from 'zod';
import { buildUser, type User } from './user-data';
import { createUser } from './user-utils';

const userSchema = z.object({
  data: z.object({
    id: z.number(),
    email: z.string(),
    first_name: z.string(),
    last_name: z.string(),
    avatar: z.string(),
  }),
});

test.describe(
  'Users — API',
  {
    tag: ['@users'],
  },
  () => {
    // ============================================================
    // TC-USERS-001: Fetching a created user by id returns 200 with
    // JSON content, that user's id and email, and matches the user schema
    // ============================================================
    test(
      '[TC-USERS-001] fetching a created user returns that user',
      {
        annotation: [{ type: 'test-case', description: 'TC-USERS-001' }],
        tag: ['@smoke', '@positive'],
      },
      async ({ request }) => {
        const newUser = { email: process.env.REQRES_EMAIL, password: process.env.REQRES_PASSWORD };

        const createdUser = await test.step('Create user', async () => {
          const createResponse = await request.post('register', { data: newUser });
          expect(createResponse.status()).toBe(200);
          return createResponse.json();
        });

        await test.step('Fetch created user and verify id and email', async () => {
          const response = await request.get(`users/${createdUser.id}`);

          expect(response.status()).toBe(200);
          expect(response.headers()['content-type']).toContain('application/json');

          const body = await response.json();
          expect(body.data.id).toBe(createdUser.id);
          expect(body.data.email).toBe(newUser.email);
          expect(userSchema.safeParse(body).error).toBeUndefined();
        });
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
        const body = await test.step('List users for page 2', async () => {
          const response = await request.get('users', { params: { page: 2 } });
          expect(response.status()).toBe(200);
          return response.json();
        });

        await test.step('Verify pagination info', async () => {
          expect(body.page).toBe(2);
          expect(body.per_page).toBe(6);
          expect(body.data.length).toBe(body.per_page);
          expect(typeof body.total).toBe('number');
          expect(body.total_pages).toBe(Math.ceil(body.total / body.per_page));
        });

        await test.step('Verify every user is well-formed', async () => {
          const users: User[] = body.data;
          const allUsersValid = users.every(
            (user) =>
              typeof user.id === 'number' &&
              typeof user.email === 'string' &&
              user.email.endsWith('@reqres.in') &&
              typeof user.first_name === 'string' &&
              user.first_name.length > 0
          );
          expect(allUsersValid).toBe(true);
        });
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
        const newUser = buildUser();

        const response = await test.step('Create user', async () => request.post('users', { data: newUser }));

        await test.step('Verify sent data, new id and createdAt are returned', async () => {
          expect(response.status()).toBe(201);

          const body = await response.json();
          expect(body.name).toBe(newUser.name);
          expect(body.job).toBe(newUser.job);
          expect(typeof body.id).toBe('string');
          expect(body.id.length).toBeGreaterThan(0);
          expect(Number.isNaN(Date.parse(body.createdAt))).toBe(false);
        });
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
        const replacement = buildUser({ job: 'zion resident' });
        const userId = await test.step('Create user', async () => createUser(request, buildUser()));

        const response = await test.step('Replace user with PUT', async () =>
          request.put(`users/${userId}`, { data: replacement })
        );

        await test.step('Verify new name, job and updatedAt are returned', async () => {
          expect(response.status()).toBe(200);

          const body = await response.json();
          expect(body.name).toBe(replacement.name);
          expect(body.job).toBe(replacement.job);
          expect(Number.isNaN(Date.parse(body.updatedAt))).toBe(false);
        });
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
        const userId = await test.step('Create user', async () => createUser(request, buildUser()));

        const response = await test.step('Update only job with PATCH', async () =>
          request.patch(`users/${userId}`, { data: { job: 'captain' } })
        );

        await test.step('Verify only job is changed', async () => {
          expect(response.status()).toBe(200);

          const body = await response.json();
          expect(body.job).toBe('captain');
          expect(body.name).toBeUndefined();
          expect(Number.isNaN(Date.parse(body.updatedAt))).toBe(false);
        });
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
        const userId = await test.step('Create user', async () => createUser(request, buildUser()));

        const response = await test.step('Delete user', async () => request.delete(`users/${userId}`));

        await test.step('Verify 204 with empty body', async () => {
          expect(response.status()).toBe(204);
          expect(await response.text()).toBe('');
        });
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
        const response = await test.step('Create user with text/plain content type', async () =>
          request.post('users', {
            headers: { 'Content-Type': 'text/plain' },
            data: JSON.stringify({ name: 'morpheus', job: 'leader' }),
          })
        );

        await test.step('Verify sent fields are not saved', async () => {
          expect(response.status()).toBe(201);

          const body = await response.json();
          expect(typeof body.id).toBe('string');
          expect(body.name).toBeUndefined();
          expect(body.job).toBeUndefined();
        });
      }
    );

    // ============================================================
    // TC-USERS-008: Requesting a user id that does not exist returns
    // 404 with no user data
    // ============================================================
    test(
      '[TC-USERS-008] fetching a non-existent user returns 404',
      {
        annotation: [{ type: 'test-case', description: 'TC-USERS-008' }],
        tag: ['@negative'],
      },
      async ({ request }) => {
        const response = await test.step('Fetch non-existent user', async () => request.get('users/23'));

        await test.step('Verify 404 with no user data', async () => {
          expect(response.status()).toBe(404);

          const body = await response.json();
          expect(body.data?.id).toBeUndefined();
          expect(body.data?.email ?? null).toBeNull();
        });
      }
    );
  }
);
