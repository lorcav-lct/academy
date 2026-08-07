-- Rename Masterclass Running → Triathlon Swim Bike Run
-- Slug invariato (master-running): ticket, ordini e price Stripe restano validi.
UPDATE public.product_access_rules
  SET label = 'Masterclass Triathlon — Swim Bike & Run'
  WHERE product_slug = 'master-running';
