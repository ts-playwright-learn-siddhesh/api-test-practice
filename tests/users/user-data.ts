export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string;
}

export interface NewUser {
  name: string;
  job: string;
}

export function buildUser(overrides: Partial<NewUser> = {}): NewUser {
  return {
    name: 'morpheus',
    job: 'leader',
    ...overrides,
  };
}
