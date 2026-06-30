-- Manual / external fulfillment on orders.
--
-- Custom commercial deals are common: a customer pays the 500€ caparra to lock a
-- seat, gets a personalized discount, then settles the balance OUTSIDE the site
-- (bank transfer, Scalapay, cash) — so the Stripe webhook never fires to grant
-- access. Admins activate such orders by hand from /admin/orders: tickets/QR are
-- generated and the confirmation email is sent, exactly as the webhook would.
--
-- These columns record that an order was settled/activated manually and how.

ALTER TABLE public.orders
  -- Set on a deposit order activated by hand: its balance was paid outside
  -- Stripe, so it's closed even though balance_order_id stays NULL.
  ADD COLUMN IF NOT EXISTS settled_externally BOOLEAN NOT NULL DEFAULT false,
  -- When an admin manually activated the order (generated tickets/access).
  -- Also acts as the "already fulfilled" guard against double activation.
  ADD COLUMN IF NOT EXISTS fulfilled_at TIMESTAMPTZ,
  -- Free-form external payment method recorded by the admin (e.g. 'bonifico',
  -- 'scalapay', 'contanti'). NULL for orders settled through Stripe.
  ADD COLUMN IF NOT EXISTS external_payment_method TEXT,
  -- Amount actually collected outside Stripe, in cents (for bookkeeping).
  ADD COLUMN IF NOT EXISTS external_payment_cents INT;
