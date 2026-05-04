-- Promos table — gestione coupon dall'admin.
-- Una promo è category-wide: o si applica a TUTTI i pack, o a TUTTE le
-- masterclass. La logica di applicazione del coupon Stripe è gestita
-- server-side dall'endpoint /api/checkout/session in base al tipo di
-- prodotto acquistato.

CREATE TYPE promo_product_type AS ENUM ('pack', 'masterclass');
CREATE TYPE promo_discount_type AS ENUM ('amount', 'percent');

CREATE TABLE public.promos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_type promo_product_type NOT NULL,
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

  -- Validità lato sito
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  max_redemptions INT,

  -- Riferimento Stripe
  stripe_coupon_id TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Massimo una promo ATTIVA per categoria (pack/masterclass).
-- Più "draft" possibili sulla stessa categoria.
CREATE UNIQUE INDEX idx_promos_active_per_type ON public.promos (product_type) WHERE active;
CREATE INDEX idx_promos_product_type ON public.promos (product_type);
CREATE INDEX idx_promos_active ON public.promos (active);

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
