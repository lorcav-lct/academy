-- Disaccoppia orders e tickets dalle tabelle packs/courses nel DB.
-- I dati di prodotto/corso vengono gestiti dalle costanti TypeScript (SSG).
-- Usiamo slug TEXT al posto di UUID FK verso tabelle vuote.

-- orders.pack_id: UUID FK → TEXT slug
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_pack_id_fkey;
ALTER TABLE public.orders ALTER COLUMN pack_id TYPE TEXT USING pack_id::TEXT;

-- tickets.course_id: UUID FK NOT NULL → TEXT slug nullable
ALTER TABLE public.tickets DROP CONSTRAINT IF EXISTS tickets_course_id_fkey;
ALTER TABLE public.tickets ALTER COLUMN course_id TYPE TEXT USING course_id::TEXT;
ALTER TABLE public.tickets ALTER COLUMN course_id DROP NOT NULL;
