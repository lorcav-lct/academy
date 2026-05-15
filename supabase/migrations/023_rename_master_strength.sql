-- Rename Masterclass Strength → Strength Avanzato
UPDATE public.product_access_rules
  SET label = 'Masterclass Strength Avanzato — Advanced Strength Programming'
  WHERE product_slug = 'master-strength';
