-- Promos table — gestione coupon pack/masterclass dall'admin.
-- I coupon Stripe vengono creati/archiviati dal backend, l'ID viene
-- salvato in stripe_coupon_id. La row qui è la fonte di verità per
-- name/headline/subtitle (campi marketing) e per il flag active.

CREATE TYPE promo_product_type AS ENUM ('pack', 'masterclass');
CREATE TYPE promo_discount_type AS ENUM ('amount', 'percent');

CREATE TABLE public.promos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Slug del prodotto target (es. "start", "pro", "elite", "master-calcio").
  -- Allineato con src/lib/constants/packs.ts.
  slug TEXT NOT NULL,
  product_type promo_product_type NOT NULL,
  active BOOLEAN NOT NULL DEFAULT false,

  -- Campi marketing (mostrati a sito + admin)
  name TEXT NOT NULL,                     -- es. "LANCIO PACK"
  headline TEXT,                          -- es. "Sconto di lancio attivo"
  subtitle TEXT,                          -- es. "fino al 30 giugno"

  -- Discount (immutabili dopo creazione coupon Stripe)
  discount_type promo_discount_type NOT NULL,
  -- Per amount: cents (es. 80000 = €800)
  -- Per percent: 1..100
  discount_value INT NOT NULL CHECK (discount_value > 0),

  -- Date di validità lato sito (Stripe usa solo ends_at come redeem_by)
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  max_redemptions INT,

  -- Riferimenti Stripe
  stripe_coupon_id TEXT,
  stripe_product_id TEXT,                 -- prodotto Stripe target (denormalizzato per sync)

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Massimo una promo ATTIVA per slug (auto-deactivate altre via app o trigger).
-- Usiamo un partial unique index così possiamo avere più promo "draft" per lo stesso slug.
CREATE UNIQUE INDEX idx_promos_active_per_slug ON public.promos (slug) WHERE active;

CREATE INDEX idx_promos_slug ON public.promos (slug);
CREATE INDEX idx_promos_active ON public.promos (active);

-- ─── RLS ─────────────────────────────────────────────────────────────
ALTER TABLE public.promos ENABLE ROW LEVEL SECURITY;

-- Lettura pubblica delle promo attive (per visualizzazione sito senza login)
CREATE POLICY "Anyone can read active promos" ON public.promos
  FOR SELECT USING (active = true);

-- Admin/staff: tutto
CREATE POLICY "Admins manage promos" ON public.promos
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'staff')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'staff')));

-- Trigger updated_at
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
