-- Promos table — gestione coupon dall'admin.
-- Una promo può essere:
--   - category-wide (slug IS NULL)        → si applica a tutti i pack o tutte le masterclass
--   - product-specific (slug = 'master-calcio') → si applica solo a quel prodotto
-- La logica di applicazione (specific > category) è gestita server-side
-- da /api/checkout/session.

CREATE TYPE promo_product_type AS ENUM ('pack', 'masterclass');
CREATE TYPE promo_discount_type AS ENUM ('amount', 'percent');

CREATE TABLE public.promos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_type promo_product_type NOT NULL,
  -- Se NULL → category-wide (tutti i prodotti della categoria).
  -- Se valorizzato → si applica solo a quel singolo slug.
  slug TEXT,
  active BOOLEAN NOT NULL DEFAULT false,

  -- Marketing
  name TEXT NOT NULL,                     -- es. "LANCIO PACK"
  headline TEXT,                          -- es. "Sconto di lancio attivo"
  subtitle TEXT,                          -- es. "fino al 30 giugno"

  -- Discount (immutabili dopo creazione coupon Stripe)
  discount_type promo_discount_type NOT NULL,
  -- Per amount: cents (es. 80000 = €800)
  -- Per percent: 1..100
  discount_value INT NOT NULL CHECK (discount_value > 0),

  -- Validità
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  max_redemptions INT,

  -- Riferimenti Stripe
  stripe_coupon_id TEXT,
  stripe_product_id TEXT,                 -- popolato solo per promo product-specific

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Massimo una promo ATTIVA category-wide per ciascun product_type.
CREATE UNIQUE INDEX idx_promos_active_category_wide
  ON public.promos (product_type)
  WHERE active AND slug IS NULL;

-- Massimo una promo ATTIVA product-specific per ciascuno slug.
CREATE UNIQUE INDEX idx_promos_active_per_slug
  ON public.promos (product_type, slug)
  WHERE active AND slug IS NOT NULL;

CREATE INDEX idx_promos_product_type ON public.promos (product_type);
CREATE INDEX idx_promos_active ON public.promos (active);
CREATE INDEX idx_promos_slug ON public.promos (slug) WHERE slug IS NOT NULL;

-- ─── RLS ─────────────────────────────────────────────────────────────
ALTER TABLE public.promos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active promos" ON public.promos
  FOR SELECT USING (active = true);

CREATE POLICY "Admins manage promos" ON public.promos
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'staff')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'staff')));

-- ─── Trigger updated_at ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER promos_set_updated_at
  BEFORE UPDATE ON public.promos
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
