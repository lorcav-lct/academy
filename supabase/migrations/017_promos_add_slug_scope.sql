-- Aggiunge supporto promo product-specific alla tabella promos.
-- Una promo può ora essere:
--   - category-wide (slug IS NULL)        → si applica a tutti i prodotti della categoria
--   - product-specific (slug = 'master-…') → si applica solo a quel singolo slug

ALTER TABLE public.promos
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS stripe_product_id TEXT;

-- Sostituisco il vecchio unique index "1 promo attiva per categoria"
-- con due partial indexes: uno per category-wide, uno per product-specific.
DROP INDEX IF EXISTS public.idx_promos_active_per_type;

CREATE UNIQUE INDEX IF NOT EXISTS idx_promos_active_category_wide
  ON public.promos (product_type)
  WHERE active AND slug IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_promos_active_per_slug
  ON public.promos (product_type, slug)
  WHERE active AND slug IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_promos_slug
  ON public.promos (slug)
  WHERE slug IS NOT NULL;
