# Product & Architectural Specification

> **Primary Authority**: `DOCUMENTO_MAESTRO.md` and `PLANIFICACION_UNICA.md` are the ultimate source of truth. All features, mathematical models, security controls, and schemas defined below reflect the 100% consensus of SociocrAI.

## 1. Overview & Objective
An incremental ecosystem on Telegram designed to capitalize on user attention and time through idle mechanics (Adventure Capitalist loop), rewarded ads (Adsgram), and Telegram Stars microtransactions. Includes Telegram Bot + Telegram Mini App (TMA), server-authoritative offline earnings calculation, deep-linking virality, automated channel subscription tasks, and rate-limited mass notifications.

## 2. Core Features & Mathematical Engine
- **Idle Progression Engine (Adventure Capitalist loop)**:
  - Asset Cost Formula: $Cost(n) = \text{BaseCost} \times (r)^n$, where $r \in [1.07, 1.15]$ per asset tier.
  - Asset Revenue: $\text{CPS}_{i} = \text{BaseCPS}_{i} \times \text{Level}_{i} \times \text{AssetMultipliers}$.
  - Total Income: $\text{Total CPS} = \sum \text{CPS}_{i} \times \text{GlobalPrestigeMultiplier} \times \text{AdBoostMultiplier}$.
  - Prestige Reset: Resets asset levels and active balance in exchange for Prestige Units.
    - Formula: $\text{PrestigeClaimable} = \lfloor 150 \times \sqrt{\text{LifetimeEarnings} / 10^{12}} \rfloor - \text{PrestigeClaimed}$.
    - Bonus: $+2\%$ permanent CPS per active prestige unit.
- **Server-Authoritative Offline Calculation**:
  - Offline delta: $\Delta t = \min(T_{\text{server\_now}} - T_{\text{last\_sync}}, \text{MAX\_OFFLINE\_SECONDS})$.
  - Offline earnings: $\text{Earned} = \Delta t \times \text{Total CPS}$.
  - Client timestamps are strictly ignored for financial calculation.
- **Monetization Mechanics**:
  - **Adsgram Rewarded Ads**: Webhook and SDK verification via HMAC-SHA256 signature; grants temporary boost (2x for 4 hours).
  - **Telegram Stars**: Microtransactions for permanent cosmetic items & boost bundles with idempotent `telegram_payment_charge_id` tracking.
- **Virality & Social Tasks**:
  - Deep link format: `https://t.me/BotName?start=ref_<telegram_id>`. Bilateral bonus allocated upon join.
  - Channel subscription verification: Async check via Telegram Bot API `getChatMember` with Redis caching (15-min TTL) to protect Telegram API rate limits.
- **Broadcast Re-engagement Engine**:
  - BullMQ queue processing inactive user notifications (24h/48h inactivity) capped at $\le 25\text{ msgs/s}$ to guarantee zero 429 Too Many Requests errors.

## 3. Data Models & Entity Schemas
- `users`: `id`, `telegram_id` (UNIQUE), `username`, `balance`, `lifetime_earnings`, `prestige_points`, `last_active_timestamp`, `version`, `created_at`, `updated_at`.
- `assets`: `id`, `user_id`, `asset_type`, `level`, `purchased_at`, `updated_at`.
- `transactions`: `id`, `user_id`, `type` (STARS, ADSGRAM, REFERRAL), `amount`, `telegram_payment_charge_id` (UNIQUE), `status` (PENDING, COMPLETED, FAILED), `payload_hash`, `created_at`.
- `tasks`: `id`, `user_id`, `task_type` (CHANNEL_SUBSCRIBE, DAILY_SURVEY), `status` (PENDING, CLAIMED), `reward_multiplier`, `expires_at`, `completed_at`.
- `referrals`: `id`, `referrer_id`, `referee_id` (UNIQUE), `reward_granted`, `created_at`.

## 4. Phase 1: MVP Core Scope & Acceptance Criteria
- [ ] **TCK-0091-C1-01**: PostgreSQL DDL schema & Redis session/state synchronization with compare-and-swap (optimistic versioning).
- [ ] **TCK-0091-C1-02**: Idle math progression engine & server-authoritative offline earnings calculation with geometric series.
- [ ] **TCK-0091-C1-03**: Adsgram SDK signature verification & Telegram Stars payment flow with strict uniqueness control.
- [ ] **TCK-0091-C1-04**: Deep-link referral module & automated channel membership verification with Telegram Bot API mocks.
