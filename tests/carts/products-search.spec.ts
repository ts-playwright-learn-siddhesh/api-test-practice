import { z } from 'zod';
import { test, expect } from '../fixtures';

const productSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  price: z.number(),
});

const searchCases = [
  { id: 'TC-SEARCH-001', name: 'lowercase word', query: 'phone', found: true },
  { id: 'TC-SEARCH-002', name: 'uppercase word', query: 'PHONE', found: true },
  { id: 'TC-SEARCH-003', name: 'mixed case word', query: 'LaPtOp', found: true },
  { id: 'TC-SEARCH-004', name: 'partial word', query: 'lapt', found: true },
  { id: 'TC-SEARCH-005', name: 'word matching one product', query: 'mascara', found: true },
  { id: 'TC-SEARCH-006', name: 'two words', query: 'lash princess', found: true },
  { id: 'TC-SEARCH-007', name: 'empty query', query: '', found: true },
  { id: 'TC-SEARCH-008', name: 'word with no match', query: 'zzzqqqxx', found: false },
  { id: 'TC-SEARCH-009', name: 'special characters', query: '&%', found: false },
  { id: 'TC-SEARCH-010', name: 'number with no match', query: '0000000', found: false },
];

test.describe(
  'Products — Search',
  {
    tag: ['@products', '@regression'],
  },
  () => {
    // ============================================================
    // TC-SEARCH-001..010: Searching products returns only products
    // whose title or description contains the query (case-insensitive),
    // and an empty list when nothing matches; every product matches
    // the product schema
    // ============================================================
    for (const { id, name, query, found } of searchCases) {
      test(
        `[${id}] search with ${name} "${query}" ${found ? 'returns matching products' : 'returns no products'}`,
        {
          annotation: [{ type: 'test-case', description: id }],
          tag: [found ? '@positive' : '@negative'],
        },
        async ({ productService }) => {
          const products = await test.step(`Search products for "${query}"`, async () => productService.search(query));

          await test.step('Verify every product matches the product schema', async () => {
            expect(z.array(productSchema).safeParse(products).error).toBeUndefined();
          });

          await test.step(found ? 'Verify every product contains the query' : 'Verify no products are returned', async () => {
            if (!found) {
              expect(products).toHaveLength(0);
              return;
            }
            expect(products.length).toBeGreaterThan(0);
            const allMatch = products.every((product) =>
              `${product.title} ${product.description}`.toLowerCase().includes(query.toLowerCase())
            );
            expect(allMatch).toBe(true);
          });
        }
      );
    }
  }
);
