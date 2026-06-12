-- Caparra (deposit) support on orders.
--
-- Flow: a customer can secure a bundle seat by paying a 500€ non-refundable
-- deposit instead of the full price. The deposit order does NOT generate
-- tickets/QR. On payment the webhook issues a dedicated -500€ Stripe coupon
-- (promotion code) and stores it here. The balance is paid later as a normal
-- pack purchase with that coupon auto-applied; that balance order is linked
-- back via balance_order_id and the deposit order is closed.

ALTER TABLE public.orders
  -- 'full'  = paid (or paying) the whole price in one go
  -- 'deposit' = this order is a 500€ caparra awaiting its balance
  ADD COLUMN IF NOT EXISTS payment_plan TEXT NOT NULL DEFAULT 'full'
    CHECK (payment_plan IN ('full', 'deposit')),
  -- Human-readable -500€ promotion code surfaced to the customer.
  ADD COLUMN IF NOT EXISTS deposit_promo_code TEXT,
  -- Stripe promotion code id (`promo_...`) backing deposit_promo_code.
  ADD COLUMN IF NOT EXISTS deposit_promotion_code_id TEXT,
  -- Set on a deposit order once its balance has been paid: points at the
  -- full-price order that completed the purchase.
  ADD COLUMN IF NOT EXISTS balance_order_id UUID REFERENCES public.orders(id);

-- Fast lookup of open deposit orders awaiting their balance.
CREATE INDEX IF NOT EXISTS idx_orders_payment_plan ON public.orders(payment_plan);
