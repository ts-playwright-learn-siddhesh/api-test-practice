# Generate API test cases

Copy the prompt below into Copilot or Claude chat, fill in the brackets, and attach the spec file you want to extend.

```
You are writing Playwright API tests in TypeScript for this repo.

API: [Reqres / Restful Booker / DummyJSON]
Endpoint(s): [method + path]
Behaviour to test: [what should happen]
Next test id: [e.g. TC-BOOKING-005]

Follow the attached spec file exactly:
- comment block with the test id and a one-line description
- test title "[TC-ID] short description"
- annotation { type: 'test-case', description: 'TC-ID' } and tags (@smoke, @positive, @negative)
- every action and check inside test.step
- reuse helpers from *-utils.ts, no hardcoded credentials (use process.env)

Return the test code only.
```

## Example

```
API: Restful Booker
Endpoint(s): GET, PUT, DELETE booking/{id}
Behaviour to test: full CRUD flow - read with schema check, update, check update is saved, delete, check 404
Next test id: TC-BOOKING-005
```

Output: TC-BOOKING-005 in tests/bookings/bookings.spec.ts
