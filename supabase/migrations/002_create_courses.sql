CREATE TYPE course_type AS ENUM ('block', 'fipe_session', 'workshop');

CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  type course_type NOT NULL,
  block_number INT,
  area TEXT,
  duration TEXT,
  objective TEXT,
  curriculum JSONB,
  image_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
