-- Aggiunge la categoria "fipe" alle promo automatiche, così da poter creare
-- sconti dedicati al Personal Trainer FIPE (slug: fipe-personal-trainer).
-- Il valore non viene usato in questa migration → nessun problema di transazione.

ALTER TYPE promo_product_type ADD VALUE IF NOT EXISTS 'fipe';
