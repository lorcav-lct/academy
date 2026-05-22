-- Rename FIPE access rule label: drop "Elite" qualifier from displayed name.
-- Affects /admin/scanner display and any UI reading product_access_rules.label.

UPDATE public.product_access_rules
SET label = 'Personal Trainer FIPE',
    updated_at = NOW()
WHERE product_slug = 'fipe-personal-trainer';
