-- Store selected masterclass/workshop references as product slugs.
-- The project catalog lives in TypeScript constants, so this legacy column
-- must not remain UUID[] in clean database setups.

ALTER TABLE public.orders
  ALTER COLUMN selected_workshop_ids TYPE TEXT[]
  USING selected_workshop_ids::TEXT[];
