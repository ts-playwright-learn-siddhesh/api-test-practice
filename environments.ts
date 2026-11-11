import { existsSync } from 'node:fs';

if (existsSync('.env')) {
  process.loadEnvFile('.env');
}

export interface Environment {
  reqresUrl: string;
  dummyjsonUrl: string;
  bookerUrl: string;
  platformUrl: string;
}

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable "${key}". Add it to .env`);
  }
  return value;
}

const prod: Environment = {
  reqresUrl: requireEnv('REQRES_URL'),
  dummyjsonUrl: requireEnv('DUMMYJSON_URL'),
  bookerUrl: requireEnv('BOOKER_URL'),
  platformUrl: requireEnv('PLATFORM_URL'),
};

const environments: Record<string, Environment> = {
  prod,
  // Restful Booker running locally: docker run -p 3001:3001 mwinteringham/restfulbooker
  local: { ...prod, bookerUrl: process.env.LOCAL_BOOKER_URL ?? 'http://localhost:3001/' },
};

const name = process.env.TEST_ENV ?? 'prod';
const selected = environments[name];
if (!selected) {
  throw new Error(`Unknown TEST_ENV "${name}". Use one of: ${Object.keys(environments).join(', ')}`);
}

export const env = selected;
