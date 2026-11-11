# API Test Practice

## Architecture

Layers: **HTTP client** (`tests/api-client.ts`) → **service** (`tests/<resource>/<resource>-service.ts`) → **test**.

- `ApiClient`: base URL (`url()`), auth headers (`authHeaders()`, Bearer by default) and typed response parsing
  with a status check (`parse()`)
- Services: one typed method per endpoint (`BookingService`, `AuthService`, `CartService`, `ProductService`,
  `MessageService`)
- `tests/fixtures.ts`: one fixture per service; `bookingService` is already authenticated
- `environments.ts`: base URLs per environment and `.env` loading

## Environments

`TEST_ENV` picks the base URLs: `prod` (default, public APIs) or `local` (Restful Booker in Docker on port 3001).

```
set TEST_ENV=local&& npm test
```

Credentials come from `.env` locally and from GitHub secrets in CI.

## Negative and edge cases

- `POST carts/add` (DummyJSON) covers the 5 negative categories in one place: missing field (TC-CARTS-003),
  invalid format (TC-CARTS-004), no access token (TC-CARTS-005), business rule - cart for a user that does not
  exist (TC-CARTS-006), and duplicate data - the same product twice is merged into one line (TC-CARTS-007).
- Bulk partial failure: one request with a valid and a non-existent product adds only the valid one (TC-CARTS-008).
- Boundaries for `limit`, `skip` and product id (TC-PRODUCTS-001..003): min, max, max + 1 and -1. The max is read
  from the API `total`, so the tests do not break when the product count changes.
- Error structure: 5 DummyJSON endpoints return the same `{ message }` body for 400, 401 and 404 (TC-ERRORS-001).
- Polling: none of the practice APIs have a real async job, so TC-BOOKING-008 polls the booking search with
  `expect.poll` until the new booking is returned.

DummyJSON was picked because it returns a clear status and message for each invalid input.

Stability check: `npx playwright test --repeat-each=3`

## Adding a new service

1. Add its base URL to `Environment` in `environments.ts` if the API is new.
2. Create `tests/<resource>/<resource>-service.ts` with a class extending `ApiClient`, plus interfaces for its bodies.
3. Register it in `tests/fixtures.ts`.
4. Write `tests/<resource>/<resource>.spec.ts` importing `test` and `expect` from `../fixtures`.
