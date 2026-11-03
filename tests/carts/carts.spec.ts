import { faker } from '@faker-js/faker';
import type { CurrentUser } from '../auth/auth-service';
import { test, expect } from '../fixtures';

test.describe(
  'Carts — API',
  {
    tag: ['@carts'],
  },
  () => {
    // ============================================================
    // TC-CARTS-001: A logged-in user finds a product by search and
    // adds it to a cart; the cart belongs to that user and holds the
    // product with the searched price and the requested quantity
    // ============================================================
    test(
      '[TC-CARTS-001] logged-in user can add a searched product to their own cart',
      {
        annotation: [{ type: 'test-case', description: 'TC-CARTS-001' }],
        tag: ['@smoke', '@positive'],
      },
      async ({ authService, productService, cartService }) => {
        const quantity = faker.number.int({ min: 1, max: 5 });

        await test.step('Log in', async () => authService.auth());

        const user: CurrentUser = await test.step('Fetch the logged-in user with the access token', async () => {
          const response = await authService.me();
          expect(response.status()).toBe(200);
          return response.json();
        });

        const [product] = await test.step('Search for a product', async () => {
          const products = await productService.search('phone');
          expect(products.length).toBeGreaterThan(0);
          return products;
        });

        const cart = await test.step('Add the product to a cart for the logged-in user', async () =>
          cartService.add(user.id, [{ id: product.id, quantity }])
        );

        await test.step('Verify the cart belongs to the user and holds the product', async () => {
          expect(cart.userId).toBe(user.id);
          expect(cart.products).toHaveLength(1);
          expect(cart.products[0].id).toBe(product.id);
          expect(cart.products[0].price).toBe(product.price);
          expect(cart.products[0].quantity).toBe(quantity);
        });
      }
    );

    // ============================================================
    // TC-CARTS-002: Cart totals follow the pricing rule: each line
    // total is price x quantity, the cart total is the sum of line
    // totals, and the discounted total is not above the cart total
    // ============================================================
    test(
      '[TC-CARTS-002] cart totals are calculated from product prices and quantities',
      {
        annotation: [{ type: 'test-case', description: 'TC-CARTS-002' }],
        tag: ['@positive'],
      },
      async ({ authService, productService, cartService }) => {
        const { id: userId } = await test.step('Log in', async () => authService.auth());

        const items = await test.step('Pick two products with random quantities', async () => {
          const products = await productService.search('phone');
          expect(products.length).toBeGreaterThanOrEqual(2);
          return products.slice(0, 2).map((product) => ({
            id: product.id,
            quantity: faker.number.int({ min: 1, max: 5 }),
          }));
        });

        const cart = await test.step('Add the products to a cart', async () => cartService.add(userId, items));

        await test.step('Verify every line total is price x quantity', async () => {
          for (const line of cart.products) {
            expect(line.total).toBeCloseTo(line.price * line.quantity, 2);
          }
        });

        await test.step('Verify cart totals', async () => {
          const linesTotal = cart.products.reduce((sum, line) => sum + line.total, 0);
          const quantityTotal = items.reduce((sum, item) => sum + item.quantity, 0);

          expect(cart.total).toBeCloseTo(linesTotal, 2);
          expect(cart.totalProducts).toBe(items.length);
          expect(cart.totalQuantity).toBe(quantityTotal);
          expect(cart.discountedTotal).toBeLessThanOrEqual(cart.total);
        });
      }
    );
  }
);
