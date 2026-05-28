-- ── 026_fair_leads.sql ───────────────────────────────────────────────────────
-- Lead raccolti in fiera o eventi fisici — utenti "semi-registrati"
-- Non collegati a auth.users: sono contatti pre-registrazione

CREATE TABLE IF NOT EXISTS fair_leads (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name  TEXT        NOT NULL,
  last_name   TEXT        NOT NULL,
  email       TEXT        NOT NULL,
  phone       TEXT,
  source      TEXT        NOT NULL DEFAULT 'fiera',
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Case-insensitive unique constraint on email per source
CREATE UNIQUE INDEX IF NOT EXISTS fair_leads_email_source_idx
  ON fair_leads (LOWER(email), source);

-- RLS: enabled, service role only (admin access only)
ALTER TABLE fair_leads ENABLE ROW LEVEL SECURITY;
