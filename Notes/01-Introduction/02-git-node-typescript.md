# Pre-Project Installations — Part 2 of 5: Git, Node.js and TypeScript

---

## 3. Git (Version Control)

**Why:** Tracks changes to the code and lets you push it to GitHub.

**Download:** https://git-scm.com/downloads

**Install steps (Windows):**
1. Download **Git for Windows**.
2. Run the installer. The default options are fine.
3. When asked for the default editor, you can choose **Visual Studio Code**.

**Check it's installed:**
```bash
git --version
```

**One-time setup (your identity for commits):**
```bash
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```

---

## 4. Node.js (JavaScript Runtime) + npm

**Why:** Playwright runs on Node.js. Installing Node.js also installs **npm** (Node Package Manager), which we use to install Playwright and other packages.

**Download:** https://nodejs.org/en/download

> Always choose the **LTS (Long Term Support)** version. It is stable and supported for longer. The "Current" version has the newest features but can be less stable.

> **Playwright requirement:** Playwright supports the latest Node.js **22.x, 24.x or 26.x** (source: https://playwright.dev/docs/intro).

**Install steps (Windows):**
1. Download the **Windows Installer (.msi)** for the LTS version.
2. Run the installer and keep the default options. Make sure **"Add to PATH"** is selected.
3. Finish the installation.
4. **Close and reopen** any open terminals or VS Code so they pick up the new PATH.

**Check it's installed:**
```bash
node -v
npm -v
```
Both commands should print a version number.

---

## 5. TypeScript

**Why:** TypeScript adds types to JavaScript, which catches mistakes while you write the code instead of when you run it. Our tests are written in `.ts` files.

**Install (globally, so `tsc` works in any folder):**
```bash
npm install -g typescript
```

**Check it's installed:**
```bash
tsc -v
```

> **Note:** Playwright can run `.ts` test files directly without `tsc`. The global install is for compiling or checking TypeScript yourself (for example, `tsc --noEmit` to check types).

---

**Previous:** [Part 1 — VS Code and Extensions](01-vscode-and-extensions.md) | **Next:** [Part 3 — Postman](03-postman.md)
