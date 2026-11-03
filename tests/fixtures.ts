import { test as base } from '@playwright/test';
import { env } from '../environments';
import { AuthService } from './auth/auth-service';
import { BookingService } from './bookings/booking-service';
import { CartService } from './carts/cart-service';
import { ProductService } from './carts/product-service';
import { MessageService } from './messages/message-service';

interface Services {
  authService: AuthService;
  bookingService: BookingService;
  cartService: CartService;
  productService: ProductService;
  messageService: MessageService;
}

export const test = base.extend<Services>({
  authService: async ({ request }, use) => use(new AuthService(request, env.dummyjsonUrl)),
  // Already authenticated, so tests can call protected endpoints directly
  bookingService: async ({ request }, use) => {
    const service = new BookingService(request, env.bookerUrl);
    await service.auth();
    await use(service);
  },
  cartService: async ({ request }, use) => use(new CartService(request, env.dummyjsonUrl)),
  productService: async ({ request }, use) => use(new ProductService(request, env.dummyjsonUrl)),
  messageService: async ({ request }, use) => use(new MessageService(request, env.platformUrl)),
});

export { expect } from '@playwright/test';
