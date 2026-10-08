# Operational Rules & Guardrails

## 1. Test Integrity
- Never edit, delete, or comment out test files, test cases, or assertions to force passes.
- Tests are immutable sources of truth for behavior. If a test fails, fix the implementation, not the test.

## 2. Git Checkpointing & Restore Points
- Create a git checkpoint commit before starting work on any task item:
  ```bash
  git commit -am "checkpoint: <task-identifier>"
  ```
- If build, lint, or test errors persist after two consecutive attempts, revert changes immediately:
  ```bash
  git reset --hard HEAD
  ```

## 3. Dependency & Utility Control
- Never install unauthorized third-party libraries.
- Never generate duplicate utilities or helper scripts. Check existing modules first.
- Maintain a lean memory footprint (< 25MB RAM in Node.js backend baseline).

## 4. Boundary Isolation & Security
- Restrict code changes strictly to the active module under development.
- Enforce strict OWASP compliance: HMAC-SHA256 validation for Telegram `initData` and Adsgram webhooks, parameterized SQL queries, zero plain-text secrets.
- Server-authoritative state: Never trust client-provided timestamps or arbitrary balance mutations.

## 5. Strict Verification & Progress Tracking
- Mark progress in `TASK.md` only after automated tests and verification commands return exit code 0.
- Never mark a task complete based on assumptions.
