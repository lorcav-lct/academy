-- Configurable QR access limits per static product slug.
-- Tickets remain stable; each scan writes a ticket_checkins row.

CREATE TABLE IF NOT EXISTS public.product_access_rules (
  product_slug TEXT PRIMARY KEY,
  product_type TEXT NOT NULL CHECK (product_type IN ('bundle', 'workshop')),
  label TEXT NOT NULL,
  max_entries INT CHECK (max_entries IS NULL OR max_entries > 0),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ticket_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  product_slug TEXT NOT NULL,
  scanned_by UUID REFERENCES public.profiles(id),
  event_id UUID REFERENCES public.calendar_events(id),
  scanned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_ticket_checkins_ticket
  ON public.ticket_checkins(ticket_id, scanned_at DESC);

CREATE INDEX IF NOT EXISTS idx_ticket_checkins_product
  ON public.ticket_checkins(product_slug, scanned_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_ticket_checkins_ticket_event
  ON public.ticket_checkins(ticket_id, event_id)
  WHERE event_id IS NOT NULL;

ALTER TABLE public.product_access_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_checkins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can read access rules" ON public.product_access_rules;
CREATE POLICY "Staff can read access rules"
  ON public.product_access_rules FOR SELECT
  USING (public.get_user_role() IN ('admin', 'staff'));

DROP POLICY IF EXISTS "Admins can manage access rules" ON public.product_access_rules;
CREATE POLICY "Admins can manage access rules"
  ON public.product_access_rules FOR ALL
  USING (public.get_user_role() = 'admin')
  WITH CHECK (public.get_user_role() = 'admin');

DROP POLICY IF EXISTS "Staff can manage ticket checkins" ON public.ticket_checkins;
CREATE POLICY "Staff can manage ticket checkins"
  ON public.ticket_checkins FOR ALL
  USING (public.get_user_role() IN ('admin', 'staff'))
  WITH CHECK (public.get_user_role() IN ('admin', 'staff'));

DROP POLICY IF EXISTS "Users can read own ticket checkins" ON public.ticket_checkins;
CREATE POLICY "Users can read own ticket checkins"
  ON public.ticket_checkins FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tickets
      WHERE tickets.id = ticket_checkins.ticket_id
        AND tickets.user_id = auth.uid()
    )
  );

INSERT INTO public.product_access_rules
  (product_slug, product_type, label, max_entries, active)
VALUES
  ('start', 'bundle', 'START', 6, TRUE),
  ('pro', 'bundle', 'PRO', 6, TRUE),
  ('elite', 'bundle', 'ELITE', 6, TRUE),
  ('master-functional-bulgarian', 'workshop', 'Masterclass Functional Movement & Bulgarian', 1, TRUE),
  ('master-strength', 'workshop', 'Masterclass Strength', 1, TRUE),
  ('master-calcio', 'workshop', 'Masterclass Calcio', 1, TRUE),
  ('master-volley', 'workshop', 'Masterclass Pallavolo', 1, TRUE),
  ('master-hyrox', 'workshop', 'Masterclass Hyrox', 1, TRUE),
  ('master-rugby', 'workshop', 'Masterclass Rugby', 1, TRUE),
  ('master-running', 'workshop', 'Masterclass Running', 1, TRUE),
  ('master-sport-combattimento', 'workshop', 'Masterclass Sport da Combattimento', 1, TRUE),
  ('master-nuoto', 'workshop', 'Masterclass Nuoto', 1, TRUE)
ON CONFLICT (product_slug) DO NOTHING;
