# Pre-Project Installations — Part 4 of 5: Playwright (TypeScript)

---

## 7. Playwright

**Why:** Playwright is the test framework we use to write and run automated API tests in TypeScript.

**Official docs:** https://playwright.dev/docs/intro

**Requirements:**
- Node.js: latest **22.x, 24.x or 26.x**
- Windows 11+, Windows Server 2019+ or WSL

### Install

1. Create the project folder and open it in VS Code:
   ```bash
   mkdir api-test-practice
   cd api-test-practice
   code .
   ```
2. Open the VS Code terminal (**`` Ctrl + ` ``**) and run:
   ```bash
   npm init playwright@latest
   ```
   (yarn: `yarn create playwright` · pnpm: `pnpm create playwright`)
3. If npm asks `Ok to proceed? (y)`, type **`y`** and press Enter.

### Setup Options

The command asks 4 questions. Use the **arrow keys** to choose and **Enter** to confirm.

| # | Question | Default | Choose | What it means |
|---|----------|---------|--------|---------------|
| 1 | TypeScript or JavaScript? | TypeScript | **TypeScript** | Language of the tests and config file (`.ts` files). |
| 2 | Name of your tests folder | `tests` (or `e2e` if `tests` already exists) | **`tests`** | Folder where Playwright looks for test files. |
| 3 | Add a GitHub Actions workflow? | — (recommended for CI) | **Yes** if the project will be on GitHub | Creates `.github/workflows/playwright.yml` to run tests automatically on GitHub. |
| 4 | Install Playwright browsers? | Yes | **Yes** | Downloads Chromium, Firefox and WebKit. API tests don't need a browser, but the example test does. |

### What Gets Created

- `playwright.config.ts` — Playwright settings
- `package.json` / `package-lock.json` — project packages (`@playwright/test`)
- `tests/example.spec.ts` — a sample test
- `.github/workflows/playwright.yml` — only if you chose Yes for question 3
- `.gitignore` entries for `node_modules/`, `test-results/`, `playwright-report/`, etc.

### Check it's installed

```bash
npx playwright --version
npx playwright test
npx playwright show-report
```
The first prints the version, the second runs the example test, the third opens the HTML report.

### Cloned an existing project?

`node_modules/` is not stored in Git, so install the packages first:
```bash
npm install
npx playwright install
```

> If you run `npx playwright ...` **before** `npm install`, npx downloads a separate copy of Playwright instead of using the project's version.

---

**Previous:** [Part 3 — Postman](03-postman.md) | **Next:** [Part 5 — Final Checklist and Common Issues](05-checklist-and-common-issues.md)
