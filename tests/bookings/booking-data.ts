import { faker } from '@faker-js/faker';

export interface BookingDates {
  checkin: string;
  checkout: string;
}

export interface Booking {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: BookingDates;
  additionalneeds?: string;
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function buildBookingDates(): BookingDates {
  const checkin = faker.date.soon({ days: 30 });
  const checkout = faker.date.soon({ days: 7, refDate: checkin.getTime() + ONE_DAY_MS });
  return { checkin: toDateString(checkin), checkout: toDateString(checkout) };
}

export function buildBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
    totalprice: 111,
    depositpaid: true,
    bookingdates: buildBookingDates(),
    additionalneeds: 'Breakfast',
    ...overrides,
  };
}
