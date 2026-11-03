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

## Adding a new service

1. Add its base URL to `Environment` in `environments.ts` if the API is new.
2. Create `tests/<resource>/<resource>-service.ts` with a class extending `ApiClient`, plus interfaces for its bodies.
3. Register it in `tests/fixtures.ts`.
4. Write `tests/<resource>/<resource>.spec.ts` importing `test` and `expect` from `../fixtures`.
