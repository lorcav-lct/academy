-- Access rule for standalone FIPE Personal Trainer certification.
-- 3 weekend × 2 days = 6 check-in entries.

INSERT INTO public.product_access_rules
  (product_slug, product_type, label, max_entries, active)
VALUES
  ('fipe-personal-trainer', 'workshop', 'Personal Elite Trainer FIPE', 6, TRUE)
ON CONFLICT (product_slug) DO NOTHING;
