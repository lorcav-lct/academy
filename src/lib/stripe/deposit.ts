/**
 * Deposit balance coupon — issued when a 500€ caparra is paid.
 *
 * Creates a single-use Stripe coupon (-500€) + promotion code that the customer
 * applies (auto-applied by the account flow) to pay the balance as a normal pack
 * purchase. Restricted to the bundle products so it can't be spent on a cheaper
 * item, single redemption, and expiring at the balance deadline.
 *
 * Source of truth: Stripe. The code is persisted on the deposit order so the
 * account can surface it and the complete-deposit flow can re-apply it.
 */
import type Stripe from "stripe";
import { getStripe } from "./client";
import { findStripeProductBySlug } from "./products";
import {
  DEPOSIT_PRICE_CENTS,
  DEPOSIT_BALANCE_DEADLINE,
  getBundles,
} from "@/lib/constants/packs";

const SOURCE = "academy-deposit-balance";

/** Unix timestamp (seconds) for end-of-day at the balance deadline. */
function deadlineUnix(): number {
  // Local Europe/Rome end of day; precision here is non-critical.
  return Math.floor(
    new Date(`${DEPOSIT_BALANCE_DEADLINE}T23:59:59`).getTime() / 1000,
  );
}

export interface DepositBalanceCoupon {
  /** Human-readable promotion code (e.g. "SALDO-XXXX"). */
  code: string;
  /** Stripe promotion code id (`promo_...`). */
  promotionCodeId: string;
}

/**
 * Issue the -500€ balance coupon for a paid deposit.
 * @param packSlug the bundle the deposit was placed on (for metadata only —
 *   the coupon is valid on any bundle so a customer who switches tier isn't blocked)
 * @param orderId the deposit order id (stored in metadata for traceability)
 */
export async function createDepositBalanceCoupon(
  packSlug: string,
  orderId: string,
): Promise<DepositBalanceCoupon> {
  const stripe = getStripe();

  // Restrict to bundle products only (not the 49€ masterclasses).
  const bundleProductIds = (
    await Promise.all(getBundles().map((b) => findStripeProductBySlug(b.slug)))
  ).filter((id): id is string => Boolean(id));

  const couponParams: Stripe.CouponCreateParams = {
    amount_off: DEPOSIT_PRICE_CENTS,
    currency: "eur",
    duration: "once",
    name: "Caparra versata",
    metadata: { source: SOURCE, order_id: orderId, pack_slug: packSlug },
  };
  if (bundleProductIds.length > 0) {
    couponParams.applies_to = { products: bundleProductIds };
  }

  const coupon = await stripe.coupons.create(couponParams);

  const promotionCode = await stripe.promotionCodes.create({
    coupon: coupon.id,
    max_redemptions: 1,
    expires_at: deadlineUnix(),
    metadata: { source: SOURCE, order_id: orderId, pack_slug: packSlug },
  });

  return { code: promotionCode.code, promotionCodeId: promotionCode.id };
}
