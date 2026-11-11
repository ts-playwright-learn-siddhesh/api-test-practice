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

## Data-driven tests and schemas

- `tests/carts/products-search.spec.ts`: one test template run for 10 search cases (TC-SEARCH-001..010) - case,
  partial word, two words, empty query, no match and special characters.
- zod schemas: booking, user, cart, product and error bodies. A schema failure means the response shape changed.
  If the change is intended (API release notes or the team agrees), update the schema in the same PR as the code
  that needs it. If not, raise it as a bug instead of editing the schema to make the test pass.

## CI

| Trigger | What runs | Why |
|---|---|---|
| Pull request to `main` | `@smoke` tests | Fast feedback before merge |
| Push to `main`, nightly at 02:00 UTC, manual run | Full suite (`@regression`) | Full coverage without slowing PRs |

- Tags: every test has `@regression`, core flows also have `@smoke`. Locally: `npm run test:smoke` or `npm test`.
- Secrets (credentials) come from GitHub secrets, base URLs are set in the workflow `env`.
- The HTML report is uploaded as the `playwright-report` artifact on every run (kept 30 days).

### Classifying a failed run

| Type | How it looks | Example from this suite |
|---|---|---|
| Test | Assertion fails with a clear expected vs received | Search for "smart watch" expected results, received 0 - wrong test data, fixed in the test |
| Environment | The API answers, but not normally (rate limit, 5xx, wrong data) | reqres.in returned 429 Too Many Requests on repeated runs |
| Infrastructure | No answer at all (connection reset, timeout, DNS, runner problem) | `read ECONNRESET` from dummyjson.com and reqres.in |

Test failures need a code fix. Environment and infrastructure failures are checked by re-running the job and
looking at whether other tests against the same API also failed.

## Adding a new service

1. Add its base URL to `Environment` in `environments.ts` if the API is new.
2. Create `tests/<resource>/<resource>-service.ts` with a class extending `ApiClient`, plus interfaces for its bodies.
3. Register it in `tests/fixtures.ts`.
4. Write `tests/<resource>/<resource>.spec.ts` importing `test` and `expect` from `../fixtures`.
