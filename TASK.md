# Atomic Execution Task Checklist

> **Rule**: Check off items (`[x]`) ONLY after the specified terminal verification command runs with exit code 0.

## Active Milestone: Phase 1 - MVP Core

- [x] **Task 1: [Data & Persistence] TCK-0091-C1-01 - PostgreSQL Schema & Redis Sync**
  - **Boundary**: `src/database/`, `src/cache/`
  - **Description**: Implement PostgreSQL relational schema (`users` with `version`, `assets`, `transactions`, `tasks`, `referrals`) and Redis balance caching with atomic compare-and-swap persistence.
  - **Verification Command**: `node --test tests/database_and_cache.test.js`
  - **Status**: Completed (Exit code 0)

- [x] **Task 2: [Math Engine] TCK-0091-C1-02 - Idle Math & Offline Progression**
  - **Boundary**: `src/math/`, `src/services/offline.js`
  - **Description**: Implement Adventure Capitalist geometric cost progression, CPS summation, prestige formula, and server-authoritative offline earnings calculator.
  - **Verification Command**: `node --test tests/math.test.js`
  - **Status**: Completed (Exit code 0)

- [ ] **Task 3: [Monetization] TCK-0091-C1-03 - Adsgram SDK & Telegram Stars Gateway**
  - **Boundary**: `src/services/adsgram.js`, `src/services/stars.js`, `src/security/`
  - **Description**: Implement HMAC-SHA256 signature verification for Adsgram reward webhooks and idempotent Telegram Stars transaction ledger with unique charge IDs.
  - **Verification Command**: `node --test tests/monetization.test.js`
  - **Status**: Pending

- [ ] **Task 4: [Virality & Tasks] TCK-0091-C1-04 - Deep Linking & Channel Verification**
  - **Boundary**: `src/services/referral.js`, `src/services/tasks.js`
  - **Description**: Implement viral referral attribution with deep links, bilateral bonus granting, and Telegram Bot API `getChatMember` subscription verification with Redis caching.
  - **Verification Command**: `node --test tests/referral_and_tasks.test.js`
  - **Status**: Pending

- [ ] **Task 5: [Integration & TMA Foundation] Phase 1 Core Integration & Baseline TMA**
  - **Boundary**: `src/api/`, `webapp/`, `package.json`
  - **Description**: Set up unified Express/Node application bootstrap, Telegram WebApp client scaffold, and run complete test suite.
  - **Verification Command**: `npm test`
  - **Status**: Pending

---

## Upcoming Milestones
- **Phase 2**: Resilience & Security (`TCK-0091-C2-01` to `TCK-0091-C2-04`)
- **Phase 3**: Billing & Support Operations (`TCK-0091-C3-01` to `TCK-0091-C3-03`)
- **Phase 4**: Scale & Performance (`TCK-0091-C4-01` to `TCK-0091-C4-03`)
- **Phase 5+**: Continuous Evolution Cycles (`TCK-0091-C5-01` onwards)

---

## Completed Tasks Archive
<!-- Completed tasks moved here once verified -->
