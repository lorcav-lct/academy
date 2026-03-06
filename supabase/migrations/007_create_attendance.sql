CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id),
  calendar_event_id UUID NOT NULL REFERENCES public.calendar_events(id),
  checked_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  checked_in_by UUID REFERENCES public.profiles(id),
  UNIQUE(ticket_id, calendar_event_id)
);
