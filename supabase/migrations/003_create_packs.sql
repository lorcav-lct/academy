CREATE TABLE public.packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price_cents INT NOT NULL DEFAULT 0,
  includes_blocks INT[] NOT NULL DEFAULT '{}',
  includes_fipe BOOLEAN NOT NULL DEFAULT FALSE,
  includes_certification BOOLEAN NOT NULL DEFAULT FALSE,
  workshop_count INT NOT NULL DEFAULT 0,
  includes_accommodation BOOLEAN NOT NULL DEFAULT FALSE,
  includes_transport BOOLEAN NOT NULL DEFAULT FALSE,
  features JSONB,
  stripe_price_id TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
