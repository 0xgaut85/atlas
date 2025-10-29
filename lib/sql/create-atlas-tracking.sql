-- Enable extensions required for UUID generation and JSON operations
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS atlas_services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  endpoint TEXT,
  merchant_address TEXT,
  category TEXT,
  network TEXT,
  price_amount TEXT,
  price_currency TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS atlas_payments (
  tx_hash TEXT PRIMARY KEY,
  user_address TEXT,
  merchant_address TEXT,
  network TEXT NOT NULL,
  amount_micro BIGINT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USDC',
  category TEXT NOT NULL,
  service TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_atlas_payments_network_created_at
  ON atlas_payments (network, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_atlas_payments_user_address
  ON atlas_payments (user_address);

CREATE TABLE IF NOT EXISTS atlas_user_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_address TEXT NOT NULL,
  event_type TEXT NOT NULL,
  network TEXT,
  reference_id TEXT,
  amount_micro BIGINT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_atlas_user_events_user_created_at
  ON atlas_user_events (user_address, created_at DESC);

