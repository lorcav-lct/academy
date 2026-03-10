-- Fix infinite recursion in RLS policies.
-- Admin policies were querying public.profiles from within a profiles policy,
-- causing infinite recursion. Replace with a SECURITY DEFINER function
-- that bypasses RLS when checking the current user's role.

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
CREATE POLICY "Admins can read all profiles" ON public.profiles FOR SELECT
  USING (public.get_user_role() IN ('admin', 'staff'));

DROP POLICY IF EXISTS "Admins can read all orders" ON public.orders;
CREATE POLICY "Admins can read all orders" ON public.orders FOR SELECT
  USING (public.get_user_role() IN ('admin', 'staff'));

DROP POLICY IF EXISTS "Staff can read all tickets" ON public.tickets;
CREATE POLICY "Staff can read all tickets" ON public.tickets FOR SELECT
  USING (public.get_user_role() IN ('admin', 'staff'));

DROP POLICY IF EXISTS "Staff can update tickets" ON public.tickets;
CREATE POLICY "Staff can update tickets" ON public.tickets FOR UPDATE
  USING (public.get_user_role() IN ('admin', 'staff'));

DROP POLICY IF EXISTS "Staff can manage attendance" ON public.attendance;
CREATE POLICY "Staff can manage attendance" ON public.attendance FOR ALL
  USING (public.get_user_role() IN ('admin', 'staff'));
