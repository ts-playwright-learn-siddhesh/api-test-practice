# Pre-Project Installations — Part 5 of 5: Final Checklist and Common Issues

---

## 8. Final Checklist

Open a **new** terminal and run each command. If each one prints a version number (or a list, for extensions), you are ready to start the project.

```bash
code --version
code --list-extensions
git --version
node -v
npm -v
tsc -v
npx playwright --version
```

**Postman:** Open **Postman** from the Start menu and confirm the app starts (it has no terminal command).

---

## 9. Common Issues

**`'node' / 'npm' / 'tsc' / 'code' is not recognized...`**
- The terminal was opened before the install finished. Close it and open a new terminal (or restart VS Code).
- If that doesn't fix it, check that the tool's folder is in the system **PATH**.

**PowerShell: `tsc.ps1 cannot be loaded because running scripts is disabled on this system`**
- Windows blocks scripts in PowerShell by default. Run this once in PowerShell:
  ```powershell
  Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
  ```
- Or use **Command Prompt** or **Git Bash** in the VS Code terminal instead.

**Icons didn't change after installing Material Icon Theme**
- The theme is installed but not turned on. Press `Ctrl + Shift + P` → run **Material Icons: Activate Icon Theme**.

---

**Previous:** [Part 4 — Playwright](04-playwright-installation.md)
