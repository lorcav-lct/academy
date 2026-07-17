-- Aggiunge la categoria "masterclass_international" alle promo automatiche.
-- Le Masterclass International hanno offerte gestite separatamente rispetto
-- alle Masterclass standard: una promo "tutte le masterclass" NON deve
-- applicarsi alle International, e viceversa.
-- Mapping slug → categoria: src/lib/promos/types.ts (getPromoTypeForSlug).
-- Il valore non viene usato in questa migration → nessun problema di transazione.

ALTER TYPE promo_product_type ADD VALUE IF NOT EXISTS 'masterclass_international';
