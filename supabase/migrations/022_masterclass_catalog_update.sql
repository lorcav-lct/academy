-- Catalog update — Masterclass roster aligned with docenti spreadsheet:
--   • add master-tennis (Piatti Tennis Center)
--   • disable master-hyrox e master-sport-combattimento (rimossi dal catalogo)
--   • aggiorna le label di master-strength, master-calcio, master-volley, master-running
--     con i titoli ufficiali degli interventi.

INSERT INTO public.product_access_rules
  (product_slug, product_type, label, max_entries, active)
VALUES
  ('master-tennis', 'workshop', 'Masterclass Tennis', 1, TRUE)
ON CONFLICT (product_slug) DO UPDATE
  SET product_type = EXCLUDED.product_type,
      label = EXCLUDED.label,
      max_entries = EXCLUDED.max_entries,
      active = EXCLUDED.active;

UPDATE public.product_access_rules
  SET active = FALSE
  WHERE product_slug IN ('master-hyrox', 'master-sport-combattimento');

UPDATE public.product_access_rules
  SET label = 'Masterclass Strength — Advanced Strength Programming'
  WHERE product_slug = 'master-strength';

UPDATE public.product_access_rules
  SET label = 'Masterclass Calcio — Elite Football Rehab Master'
  WHERE product_slug = 'master-calcio';

UPDATE public.product_access_rules
  SET label = 'Masterclass Pallavolo — Jump Higher, Play Stronger'
  WHERE product_slug = 'master-volley';

UPDATE public.product_access_rules
  SET label = 'Masterclass Running — Running Science Master'
  WHERE product_slug = 'master-running';
