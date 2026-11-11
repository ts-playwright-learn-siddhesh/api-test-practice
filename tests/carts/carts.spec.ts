import { faker } from '@faker-js/faker';
import type { CurrentUser } from '../auth/auth-service';
import { test, expect } from '../fixtures';

const validItem = { id: 1, quantity: 1 };
const unknownId = 999999;

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

    // ============================================================
    // TC-CARTS-003: Adding a cart without a user id is rejected
    // with 400 and a "User id is required" message
    // ============================================================
    test(
      '[TC-CARTS-003] adding a cart without a user id is rejected with 400',
      {
        annotation: [{ type: 'test-case', description: 'TC-CARTS-003' }],
        tag: ['@negative'],
      },
      async ({ cartService }) => {
        const response = await test.step('Add a cart without a user id', async () =>
          cartService.addRequest({ products: [validItem] })
        );

        await test.step('Verify request is rejected with 400', async () => {
          expect(response.status()).toBe(400);
          expect((await response.json()).message).toBe('User id is required');
        });
      }
    );

    // ============================================================
    // TC-CARTS-004: Adding a cart with a non-numeric user id is
    // rejected with 400 and an "Invalid user id" message
    // ============================================================
    test(
      '[TC-CARTS-004] adding a cart with a non-numeric user id is rejected with 400',
      {
        annotation: [{ type: 'test-case', description: 'TC-CARTS-004' }],
        tag: ['@negative'],
      },
      async ({ cartService }) => {
        const response = await test.step('Add a cart with user id "abc"', async () =>
          cartService.addRequest({ userId: 'abc', products: [validItem] })
        );

        await test.step('Verify request is rejected with 400', async () => {
          expect(response.status()).toBe(400);
          expect((await response.json()).message).toBe("Invalid user id 'abc'");
        });
      }
    );

    // ============================================================
    // TC-CARTS-005: Adding a cart on the authenticated route without
    // an access token is rejected with 401
    // ============================================================
    test(
      '[TC-CARTS-005] adding a cart without an access token is rejected with 401',
      {
        annotation: [{ type: 'test-case', description: 'TC-CARTS-005' }],
        tag: ['@negative'],
      },
      async ({ cartService }) => {
        const response = await test.step('Add a cart on the authenticated route without a token', async () =>
          cartService.addAuthenticated({ userId: 1, products: [validItem] })
        );

        await test.step('Verify request is rejected with 401', async () => {
          expect(response.status()).toBe(401);
          expect((await response.json()).message).toBe('Access Token is required');
        });
      }
    );

    // ============================================================
    // TC-CARTS-006: A cart cannot be added for a user that does not
    // exist; the request is rejected with 404
    // ============================================================
    test(
      '[TC-CARTS-006] adding a cart for a non-existent user is rejected with 404',
      {
        annotation: [{ type: 'test-case', description: 'TC-CARTS-006' }],
        tag: ['@negative'],
      },
      async ({ cartService }) => {
        const response = await test.step('Add a cart for a non-existent user', async () =>
          cartService.addRequest({ userId: unknownId, products: [validItem] })
        );

        await test.step('Verify request is rejected with 404', async () => {
          expect(response.status()).toBe(404);
          expect((await response.json()).message).toBe(`User with id '${unknownId}' not found`);
        });
      }
    );

    // ============================================================
    // TC-CARTS-007: Adding the same product twice does not create
    // duplicate cart lines; quantities are merged into one line
    // ============================================================
    test(
      '[TC-CARTS-007] duplicate products are merged into one cart line',
      {
        annotation: [{ type: 'test-case', description: 'TC-CARTS-007' }],
        tag: ['@negative'],
      },
      async ({ cartService }) => {
        const cart = await test.step('Add the same product twice', async () =>
          cartService.add(1, [
            { id: validItem.id, quantity: 1 },
            { id: validItem.id, quantity: 2 },
          ])
        );

        await test.step('Verify there is one line with the summed quantity', async () => {
          expect(cart.products).toHaveLength(1);
          expect(cart.products[0].quantity).toBe(3);
          expect(cart.totalQuantity).toBe(3);
        });
      }
    );

    // ============================================================
    // TC-CARTS-008: Adding a valid and a non-existent product in one
    // request partially succeeds; only the valid product is added
    // ============================================================
    test(
      '[TC-CARTS-008] bulk add with one invalid product adds only the valid product',
      {
        annotation: [{ type: 'test-case', description: 'TC-CARTS-008' }],
        tag: ['@negative'],
      },
      async ({ cartService }) => {
        const cart = await test.step('Add a valid and a non-existent product', async () =>
          cartService.add(1, [validItem, { id: unknownId, quantity: 1 }])
        );

        await test.step('Verify only the valid product is in the cart', async () => {
          expect(cart.products.map((line) => line.id)).toEqual([validItem.id]);
          expect(cart.totalProducts).toBe(1);
          expect(cart.total).toBeCloseTo(cart.products[0].total, 2);
        });
      }
    );
  }
);
