import { defineConfig, devices } from '@playwright/test';
import { env } from './environments';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    extraHTTPHeaders: {
      Accept: 'application/json',
    },
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'reqres',
      testDir: './tests/users',
      use: { baseURL: env.reqresUrl },
    },
    {
      name: 'dummyjson',
      testMatch: ['auth/**/*.spec.ts', 'carts/**/*.spec.ts'],
    },
    {
      name: 'restful-booker',
      testDir: './tests/bookings',
    },
    {
      name: 'platform-ui',
      testDir: './tests/messages',
      // Browser pages need the default Accept header, not the JSON-only one
      use: { ...devices['Desktop Chrome'], baseURL: env.platformUrl, extraHTTPHeaders: {} },
    },
  ],
});
