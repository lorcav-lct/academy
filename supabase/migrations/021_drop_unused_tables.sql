-- Drop tabelle morte rimaste dalla v0:
-- - packs/courses: contenuti spostati in src/lib/constants/*.ts (SSG).
--   FK già rimosse da migration 010_orders_use_slug.sql.
-- - attendance: sostituita da ticket_checkins (migration 019).
--
-- calendar_events viene mantenuta perché ticket_checkins.event_id la referenzia
-- come hook futuro (scanner per evento). Rimuoviamo solo la sua FK obsoleta
-- verso courses.

-- 1) Rimuovi FK calendar_events -> courses (il course_id resta come UUID nullable orfano)
ALTER TABLE public.calendar_events
  DROP CONSTRAINT IF EXISTS calendar_events_course_id_fkey;

-- Opzionale: liberiamo anche la colonna course_id, è inutile senza la FK e
-- senza dati. Se preferisci tenerla per riferimento, commenta la riga.
ALTER TABLE public.calendar_events
  DROP COLUMN IF EXISTS course_id;

-- 2) Drop attendance (mai usata in runtime)
DROP TABLE IF EXISTS public.attendance;

-- 3) Drop packs e courses
DROP TABLE IF EXISTS public.packs;
DROP TABLE IF EXISTS public.courses;
