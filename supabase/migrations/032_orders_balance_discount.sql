-- Negotiated pricing on the balance of a deposit (caparra).
--
-- Stripe forbids stacking discounts: once a Checkout Session carries the -500€
-- deposit credit in `discounts`, the customer can no longer type a promo code
-- (the field isn't even rendered). So a commercial deal like "PRO at 2000€
-- instead of 4900€, paid as 500€ deposit + 1500€ balance" could not be settled
-- online — it had to go through manual activation.
--
-- The balance flow now folds every discount into ONE combined coupon
-- (deposit credit + commercial discount) and applies that. These columns hold
-- the inputs and the resulting code, all on the DEPOSIT order.

ALTER TABLE public.orders
  -- Total price agreed with the customer for the whole pack, in cents, set by
  -- an admin from /admin/orders. When present it wins over any code: the
  -- balance becomes agreed_total_cents - 50000 (the deposit already paid).
  ADD COLUMN IF NOT EXISTS agreed_total_cents INT,
  -- Commercial promotion code (a Stripe promotion code created from
  -- /admin/contenuti/coupon) the customer applied to their balance. Recorded to
  -- cap reuse: our combined coupon is what actually gets redeemed on Stripe, so
  -- the original code's times_redeemed never moves.
  ADD COLUMN IF NOT EXISTS commercial_promo_code TEXT,
  -- Total discount folded into the combined balance coupon, in cents
  -- (>= 50000: always includes the deposit credit).
  ADD COLUMN IF NOT EXISTS balance_discount_cents INT,
  -- Stripe promotion code id of that combined coupon. Reused across clicks and
  -- reissued whenever the expected discount changes. NEVER given a
  -- max_redemptions: open Checkout Sessions reserve redemptions and Stripe does
  -- not release them on expiry, which permanently locks the customer out.
  ADD COLUMN IF NOT EXISTS balance_discount_promotion_code_id TEXT;

COMMENT ON COLUMN public.orders.agreed_total_cents IS
  'Negotiated total price for the pack, in cents (deposit orders only).';
