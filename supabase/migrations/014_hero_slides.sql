-- ── 014_hero_slides.sql ───────────────────────────────────────────────────
-- Hero section slides — managed from admin panel

CREATE TABLE IF NOT EXISTS public.hero_slides (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title_white  TEXT        NOT NULL DEFAULT '',
  title_orange TEXT        NOT NULL DEFAULT '',
  description  TEXT        NOT NULL DEFAULT '',
  cta_label    TEXT,
  cta_href     TEXT,
  bg_image_url TEXT,
  sort_order   INTEGER     NOT NULL DEFAULT 0,
  active       BOOLEAN     NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Default slides
INSERT INTO public.hero_slides (title_white, title_orange, description, sort_order) VALUES
  (
    'NON FORMIAMO',
    'ISTRUTTORI.',
    'Formiamo professionisti completi e imprenditori del fitness. 9 mesi di formazione progressiva, 100% in presenza.',
    0
  ),
  (
    'UN PERCORSO',
    'UNICO.',
    'Tre blocchi formativi progressivi: FUNCTION, STRENGTH, SCIENCE. Dal fondamento tecnico all''eccellenza imprenditoriale.',
    1
  ),
  (
    'CERTIFICAZIONE',
    'FIPE × LACERTOSUS.',
    'L''unica certificazione che combina riconoscimento federale e metodologia Lacertosus. Inclusa nel percorso completo.',
    2
  );

-- RLS
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

-- Public: read only active slides
CREATE POLICY "public_read_active_hero_slides"
  ON public.hero_slides FOR SELECT
  USING (active = true);

-- Admin: full access (requires role = 'admin' in profiles)
CREATE POLICY "admin_all_hero_slides"
  ON public.hero_slides FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_hero_slides_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER hero_slides_updated_at
  BEFORE UPDATE ON public.hero_slides
  FOR EACH ROW EXECUTE FUNCTION update_hero_slides_updated_at();
