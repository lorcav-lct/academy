-- Flag to distinguish test-mode Stripe orders from live ones.
-- Populated by the Stripe webhook from session.livemode (false = test).
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS is_test BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_orders_is_test ON public.orders(is_test);
