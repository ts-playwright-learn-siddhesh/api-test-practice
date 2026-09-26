# Project Setup — Part 3 of 3: package.json

`package.json` describes the project and lists the packages it needs. npm reads it when you run `npm install`.

Official docs: https://docs.npmjs.com/cli/configuring-npm/package-json

---

## 1. Generated `package.json`

Example of the `package.json` after installation. The `name` is your folder name, and the version numbers depend on when you install.

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {},
  "repository": {
    "type": "git",
    "url": "git+https://github.com/<user>/my-project.git"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "commonjs",
  "bugs": {
    "url": "https://github.com/<user>/my-project/issues"
  },
  "homepage": "https://github.com/<user>/my-project#readme",
  "devDependencies": {
    "@playwright/test": "^1.63.0",
    "@types/node": "^26.6.3"
  }
}
```

> `repository`, `bugs` and `homepage` only appear when the folder is already a Git repository with a GitHub remote (`origin`). npm fills them in from the remote URL.

---

## 2. Each Field Explained

| Field | Value | What it means |
|-------|-------|---------------|
| `name` | `"my-project"` | The project's name (defaults to the folder name). Lowercase, no spaces. |
| `version` | `"1.0.0"` | The project's version (format: `major.minor.patch`). |
| `description` | `""` (empty) | A short description of the project. |
| `main` | `"index.js"` | The entry point file when the project is used as a package. Not used by Playwright tests (no `index.js` is created). |
| `scripts` | `{}` (empty) | Shortcut commands you run with `npm run <name>`. None defined yet. |
| `repository` | `{ type, url }` | Where the source code lives (the Git remote). Only if the folder has a Git remote. |
| `keywords` | `[]` (empty) | Words that help people find the package on npm. |
| `author` | `""` (empty) | Who made the project. |
| `license` | `"ISC"` | The license (npm's default). |
| `type` | `"commonjs"` | How Node.js treats `.js` files: `"commonjs"` = CommonJS (`require`), `"module"` = ES modules (`import`). |
| `bugs` | `{ url }` | Where to report issues (the GitHub Issues page). Only if the folder has a Git remote. |
| `homepage` | URL | The project's home page (the GitHub README). Only if the folder has a Git remote. |
| `devDependencies` | see below | Packages needed only during development/testing. |

---

## 3. `devDependencies`

| Package | Example version | What it is |
|---------|-----------------|------------|
| `@playwright/test` | `^1.63.0` | The Playwright test runner: `test`, `expect`, the `request` fixture and the `npx playwright` commands. |
| `@types/node` | `^26.6.3` | TypeScript type definitions for Node.js (e.g. `process.env`), so VS Code understands Node.js code. |

**`dependencies` vs `devDependencies`:**
- `dependencies` — packages the app needs to **run** in production.
- `devDependencies` — tools needed only for **development and testing** (test runners, types). Installed with `npm install -D <package>`.

**What `^` means:** `^1.63.0` allows updates that don't change the leftmost non-zero number. So `1.64.0` or `1.70.2` can be installed, but not `2.0.0`.

---

## 4. `package-lock.json`

- Created and updated automatically by npm. **Don't edit it by hand.**
- Records the **exact** version of every installed package (including packages of packages).
- `npm ci` installs exactly what is in this file (used in the GitHub Actions workflow).
- **Commit it** to Git.

---

## 5. Useful npm Commands

| Command | What it does |
|---------|--------------|
| `npm install` | Installs everything listed in `package.json` |
| `npm ci` | Clean install of the exact versions in `package-lock.json` |
| `npm install -D <package>` | Adds a package to `devDependencies` |
| `npm run <script>` | Runs a command from `scripts` |

---

**Previous:** [Part 2 — playwright.config.ts](02-playwright-config.md)
