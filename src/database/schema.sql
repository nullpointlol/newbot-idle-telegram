-- ==============================================================================
-- Schema Relacional PostgreSQL / Supabase para Idle Telegram Ecosystem
-- v1.0.0 - Cumplimiento TCK-0091-C1-01
-- ==============================================================================

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    telegram_id BIGINT UNIQUE NOT NULL,
    username VARCHAR(255),
    first_name VARCHAR(255),
    balance NUMERIC(38, 2) NOT NULL DEFAULT 0.00,
    lifetime_earnings NUMERIC(38, 2) NOT NULL DEFAULT 0.00,
    prestige_points BIGINT NOT NULL DEFAULT 0,
    last_active_timestamp BIGINT NOT NULL,
    version BIGINT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assets (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    asset_type VARCHAR(64) NOT NULL,
    level INTEGER NOT NULL DEFAULT 0,
    multiplier NUMERIC(10, 2) NOT NULL DEFAULT 1.00,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_asset UNIQUE (user_id, asset_type)
);

CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(32) NOT NULL,
    amount NUMERIC(38, 2) NOT NULL,
    telegram_payment_charge_id VARCHAR(255) UNIQUE,
    provider_payment_charge_id VARCHAR(255),
    status VARCHAR(32) NOT NULL DEFAULT 'COMPLETED',
    payload_hash VARCHAR(128),
    metadata TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    task_type VARCHAR(64) NOT NULL,
    target_id VARCHAR(255),
    reward_multiplier NUMERIC(10, 2) NOT NULL DEFAULT 2.00,
    multiplier_duration_seconds INTEGER NOT NULL DEFAULT 14400,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    expires_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS referrals (
    id TEXT PRIMARY KEY,
    referrer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referee_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    bonus_credited BOOLEAN NOT NULL DEFAULT FALSE,
    referrer_bonus NUMERIC(38, 2) NOT NULL DEFAULT 500.00,
    referee_bonus NUMERIC(38, 2) NOT NULL DEFAULT 500.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices de alto rendimiento para cálculo offline masivo (<30ms)
CREATE INDEX IF NOT EXISTS idx_user_offline ON users(id, last_active_timestamp);
CREATE INDEX IF NOT EXISTS idx_asset_user ON assets(user_id);
CREATE INDEX IF NOT EXISTS idx_tx_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_task_user ON tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_referral_referee ON referrals(referee_id);
