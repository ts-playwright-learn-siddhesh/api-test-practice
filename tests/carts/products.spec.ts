import { test, expect } from '../fixtures';
import type { ProductList, ProductService } from './product-service';

async function productTotal(productService: ProductService): Promise<number> {
  const response = await productService.list({ limit: 1 });
  expect(response.status()).toBe(200);
  const body: ProductList = await response.json();
  return body.total;
}

test.describe(
  'Products — Boundaries',
  {
    tag: ['@products', '@regression'],
  },
  () => {
    // ============================================================
    // TC-PRODUCTS-001: The limit parameter returns 1 product at the
    // minimum, all products at and above the total, and rejects -1
    // ============================================================
    test(
      '[TC-PRODUCTS-001] limit boundaries return the expected number of products',
      {
        annotation: [{ type: 'test-case', description: 'TC-PRODUCTS-001' }],
        tag: ['@positive', '@negative'],
      },
      async ({ productService }) => {
        const total = await test.step('Get the total number of products', async () => productTotal(productService));

        for (const { limit, expected } of [
          { limit: 1, expected: 1 },
          { limit: total, expected: total },
          { limit: total + 1, expected: total },
        ]) {
          await test.step(`Verify limit=${limit} returns ${expected} products`, async () => {
            const response = await productService.list({ limit });
            expect(response.status()).toBe(200);
            expect((await response.json()).products).toHaveLength(expected);
          });
        }

        await test.step('Verify limit=-1 is rejected with 400', async () => {
          const response = await productService.list({ limit: -1 });
          expect(response.status()).toBe(400);
          expect((await response.json()).message).toBe("Invalid 'limit' - should be a positive number");
        });
      }
    );

    // ============================================================
    // TC-PRODUCTS-002: The skip parameter returns the first product
    // at 0, the last product at total - 1, nothing at total, and
    // rejects -1
    // ============================================================
    test(
      '[TC-PRODUCTS-002] skip boundaries return the expected products',
      {
        annotation: [{ type: 'test-case', description: 'TC-PRODUCTS-002' }],
        tag: ['@positive', '@negative'],
      },
      async ({ productService }) => {
        const total = await test.step('Get the total number of products', async () => productTotal(productService));

        for (const { skip, expectedIds } of [
          { skip: 0, expectedIds: [1] },
          { skip: total - 1, expectedIds: [total] },
          { skip: total, expectedIds: [] },
        ]) {
          await test.step(`Verify skip=${skip} returns ids [${expectedIds}]`, async () => {
            const response = await productService.list({ skip, limit: 1 });
            expect(response.status()).toBe(200);
            const body: ProductList = await response.json();
            expect(body.products.map((product) => product.id)).toEqual(expectedIds);
          });
        }

        await test.step('Verify skip=-1 is rejected with 400', async () => {
          const response = await productService.list({ skip: -1 });
          expect(response.status()).toBe(400);
          expect((await response.json()).message).toBe("Invalid 'skip' - should be a positive number");
        });
      }
    );

    // ============================================================
    // TC-PRODUCTS-003: Product ids 1 and total exist, while 0 and
    // total + 1 return 404
    // ============================================================
    test(
      '[TC-PRODUCTS-003] product id boundaries return the product or 404',
      {
        annotation: [{ type: 'test-case', description: 'TC-PRODUCTS-003' }],
        tag: ['@positive', '@negative'],
      },
      async ({ productService }) => {
        const total = await test.step('Get the total number of products', async () => productTotal(productService));

        for (const { id, status } of [
          { id: 0, status: 404 },
          { id: 1, status: 200 },
          { id: total, status: 200 },
          { id: total + 1, status: 404 },
        ]) {
          await test.step(`Verify product id ${id} returns ${status}`, async () => {
            const response = await productService.get(id);
            expect(response.status()).toBe(status);
          });
        }
      }
    );
  }
);
