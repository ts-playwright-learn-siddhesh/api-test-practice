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

const prod: Environment = {
  reqresUrl: 'https://reqres.in/api/',
  dummyjsonUrl: 'https://dummyjson.com/',
  bookerUrl: 'https://restful-booker.herokuapp.com/',
  platformUrl: 'https://automationintesting.online/',
};

const environments: Record<string, Environment> = {
  prod,
  // Restful Booker running locally: docker run -p 3001:3001 mwinteringham/restfulbooker
  local: { ...prod, bookerUrl: 'http://localhost:3001/' },
};

const name = process.env.TEST_ENV ?? 'prod';
const selected = environments[name];
if (!selected) {
  throw new Error(`Unknown TEST_ENV "${name}". Use one of: ${Object.keys(environments).join(', ')}`);
}

export const env = selected;
