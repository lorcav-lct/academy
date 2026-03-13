-- ── 009_teaser_leads.sql ────────────────────────────────────────────────────
-- Teaser landing page leads (Chapter II waitlist)

CREATE TABLE IF NOT EXISTS teaser_leads (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT        NOT NULL,
  email      TEXT        NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Case-insensitive unique constraint on email
CREATE UNIQUE INDEX IF NOT EXISTS teaser_leads_email_idx
  ON teaser_leads (LOWER(email));

-- RLS: enabled, service role only (no public access)
ALTER TABLE teaser_leads ENABLE ROW LEVEL SECURITY;
