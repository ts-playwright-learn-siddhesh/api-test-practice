# Pre-Project Installations — Part 1 of 5: VS Code and Extensions

The tools to install on your machine **before** starting a Playwright + TypeScript API testing project (Windows).

## Overview

Install them in this order:

| # | Tool | Why | Download | Check command | Notes |
|---|------|-----|----------|---------------|-------|
| 1 | VS Code | Code editor | https://code.visualstudio.com/download | `code --version` | This file |
| 2 | VS Code Extensions | Editor add-ons for Playwright/TypeScript | Inside VS Code (`Ctrl + Shift + X`) | `code --list-extensions` | This file |
| 3 | Git | Version control | https://git-scm.com/downloads | `git --version` | [Part 2](02-git-node-typescript.md) |
| 4 | Node.js (LTS) + npm | Runs Playwright, installs packages | https://nodejs.org/en/download | `node -v` / `npm -v` | [Part 2](02-git-node-typescript.md) |
| 5 | TypeScript | Language the tests are written in | Installed via npm | `tsc -v` | [Part 2](02-git-node-typescript.md) |
| 6 | Postman | Send API requests by hand before automating them | https://www.postman.com/downloads/ | Open the app | [Part 3](03-postman.md) |
| 7 | Playwright | Test framework for API tests | `npm init playwright@latest` | `npx playwright --version` | [Part 4](04-playwright-installation.md) |

After installing everything, use the [Final Checklist and Common Issues (Part 5)](05-checklist-and-common-issues.md).

---

## 1. VS Code (Code Editor)

**Why:** The editor where we write, run and debug test code.

**Download:** https://code.visualstudio.com/download

**Install steps (Windows):**
1. Download the **Windows → User Installer (x64)**.
2. Run the installer and accept the license.
3. On the "Select Additional Tasks" screen, tick:
   - ✅ Add "Open with Code" action to Windows Explorer file context menu
   - ✅ Add "Open with Code" action to Windows Explorer directory context menu
   - ✅ Add to PATH (lets you open VS Code from the terminal with `code .`)
4. Finish the installation.

**Check it's installed** (open a new terminal):
```bash
code --version
```

---

## 2. VS Code Extensions

**How to install:** Open VS Code, go to **Extensions** (`Ctrl + Shift + X`), search for the extension name or ID and click **Install**.

| Extension | Publisher | ID | Why | Need |
|-----------|-----------|----|-----|------|
| **Playwright Test for VSCode** | Microsoft | `ms-playwright.playwright` | Run, debug and pick tests from the Testing sidebar | Required |
| **Open In Default Browser** | peakchen90 | `peakchen90.open-html-in-browser` | Opens HTML/XML/PDF files (e.g. the Playwright HTML report) in the default browser | Required |
| **Material Icon Theme** | Philipp Kief | `PKief.material-icon-theme` | File/folder icons in the Explorer so file types are easy to spot | Required |
| **ESLint** | Microsoft | `dbaeumer.vscode-eslint` | Highlights code problems as you type | Recommended |
| **Prettier - Code formatter** | Prettier | `esbenp.prettier-vscode` | Formats code consistently on save | Recommended |
| **DotENV** | mikestead | `mikestead.dotenv` | Syntax highlighting for `.env` files (base URLs, tokens) | Optional |
| **REST Client** | Huachao Mao | `humao.rest-client` | Send API requests from a `.http` file to try an API before writing tests | Optional (pick one) — Postman already covers this |
| **Thunder Client** | Ranga Vadhineni | `rangav.vscode-thunder-client` | Postman-like API client inside VS Code | Optional (pick one) — Postman already covers this |
| **Error Lens** | Alexander | `usernamehw.errorlens` | Shows errors and warnings inline on the same line | Optional |
| **GitLens** | GitKraken | `eamodio.gitlens` | Git history and blame inside the editor | Optional |

> **Note:** The ESLint and Prettier extensions only work fully once the project has ESLint/Prettier set up (packages + config files). This project does not have them yet.

### Required extensions in detail

**Playwright Test for VSCode** (`ms-playwright.playwright`)
- **What it does:**
  - Run one test or many with a single click, from the editor (green ▶ next to each test) or the **Testing** sidebar.
  - **Watch mode:** re-runs tests automatically when you save changes.
  - **Show browser:** watch the browser while tests run.
  - **Debug:** step through tests with breakpoints and inspect values.
  - **Trace viewer:** see a full recording of what happened during a test.
  - **Pick locator / Record new:** select elements on a page to get locators, or record browser actions into a new test.
  - Finds Playwright projects automatically and lets you choose which projects/browsers to run.
- **How to use:** Open the **Testing** sidebar (flask icon) to see and run tests.
- **Prerequisite:** The project must have Playwright **v1.38 or newer** installed. A fresh `npm init playwright@latest` installs a much newer version (e.g. `^1.63.0`).

**Open In Default Browser** (`peakchen90.open-html-in-browser`)
- **What it does:** Opens **HTML, XML and PDF** files in your system's default browser. Useful for opening the Playwright HTML report (`playwright-report/index.html`).
- **How to use:**
  - Right-click the file in the Explorer or editor → **Open In Default Browser**, or
  - Press **`Ctrl + 1`** (Windows) / **`Cmd + 1`** (Mac) with the file open.
- **Setting:** By default it serves the file through a local HTTP server (`openInDefaultBrowser.run.openWithLocalHttpServer` = `true`). Set it to `false` to open the file directly.
- **Note:** The Marketplace has several extensions with similar names. Install the one with the exact name **"Open In Default Browser"** by **peakchen90**.

**Material Icon Theme** (`PKief.material-icon-theme`)
- **What it does:** Replaces the file and folder icons in the Explorer with Material Design icons, so file types (`.ts`, `.json`, `.env`, the `tests/` folder, etc.) are easy to tell apart.
- **How to use:** After installing, press `Ctrl + Shift + P` → run **Material Icons: Activate Icon Theme**.

**Install from the terminal (optional shortcut):**
```bash
code --install-extension ms-playwright.playwright
code --install-extension peakchen90.open-html-in-browser
code --install-extension PKief.material-icon-theme
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
```

**Check what's installed:**
```bash
code --list-extensions
```

---

**Next:** [Part 2 — Git, Node.js and TypeScript](02-git-node-typescript.md)
