import { existsSync } from 'node:fs';
import { defineConfig } from '@playwright/test';

if (existsSync('.env')) {
  process.loadEnvFile('.env');
}

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
      use: { baseURL: 'https://reqres.in/api/' },
    },
    {
      name: 'dummyjson',
      testDir: './tests/auth',
      use: { baseURL: 'https://dummyjson.com/' },
    },
    {
      name: 'restful-booker',
      testDir: './tests/bookings',
      use: { baseURL: 'https://restful-booker.herokuapp.com/' },
    },
  ],
});
