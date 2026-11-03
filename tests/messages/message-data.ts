import { faker } from '@faker-js/faker';

export interface Message {
  name: string;
  email: string;
  phone: string;
  subject: string;
  description: string;
}

export function buildMessage(overrides: Partial<Message> = {}): Message {
  return {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.string.numeric(11),
    subject: `Enquiry ${faker.string.alphanumeric(10)}`,
    description: faker.lorem.sentences(2),
    ...overrides,
  };
}
