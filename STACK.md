# Technical Baseline & Stack Configuration

## Runtime & Languages
- **Runtime**: Node.js v24.18.0 (Active LTS / Modern)
- **Language**: TypeScript / Node.js ES Modules
- **Package Manager**: npm 11.16.0
- **Database & Persistence**: PostgreSQL / Supabase SQL schema with migrations, Redis (ioredis / BullMQ) for sessions, Redlock, and message dispatch.
- **Testing Framework**: Node.js Native Test Runner (`node:test`, `node:assert`) with high-speed execution and zero external runtime footprint.

## Terminal Verification Commands
- **Install**: `npm install`
- **Lint / Typecheck**: `npm run check`
- **Test Suite**: `npm test`
- **Build**: `npm run build`

## Directory Layout & Architecture Boundaries
```text
newbot/
├── src/
│   ├── config/              # Environment config and schema validation
│   ├── database/            # PostgreSQL DDL, migrations, and seed scripts
│   ├── cache/               # Redis connection, Lua scripts, and atomic locks
│   ├── math/                # Adventure Capitalist idle loop, CPS & prestige formulas
│   ├── security/            # Telegram initData HMAC validation & Adsgram crypto
│   ├── services/
│   │   ├── offline.js       # Offline earnings calculator (Unix diff)
│   │   ├── referral.js      # Deep linking & bilateral reward system
│   │   ├── tasks.js         # Channel subscription verification (Telegram Bot API)
│   │   └── monetization.js  # Adsgram rewarded ads & Telegram Stars ledger
│   ├── queue/               # BullMQ dispatch queues with <= 30 msg/s rate limit
│   └── api/                 # REST endpoints & webhook handlers
├── tests/
│   ├── math.test.js         # Idle progression, geometric cost, prestige math tests
│   ├── offline.test.js      # Offline sync and server-authoritative timestamp tests
│   ├── security.test.js     # HMAC initData verification and anti-cheat tests
│   ├── monetization.test.js # Telegram Stars idempotency & Adsgram tests
│   └── referral.test.js     # Referral & task validation tests
├── webapp/                  # Telegram Mini App client (HTML5/React lightweight UI)
├── RULES.md                 # Operational boundaries & rules
├── STACK.md                 # Technical baseline
├── SPEC.md                  # Source of truth specifications
└── TASK.md                  # Atomic execution checklist
```
