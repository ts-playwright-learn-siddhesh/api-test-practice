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

export function buildBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    firstname: 'Jim',
    lastname: 'Brown',
    totalprice: 111,
    depositpaid: true,
    bookingdates: { checkin: '2026-01-01', checkout: '2026-01-02' },
    additionalneeds: 'Breakfast',
    ...overrides,
  };
}
