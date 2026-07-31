/**
 * Deposit balance coupon — issued when a 500€ caparra is paid.
 *
 * Creates a Stripe coupon (-500€) + promotion code that the customer applies
 * (auto-applied by the account flow) to pay the balance as a normal pack
 * purchase. Restricted to the bundle products so it can't be spent on a cheaper
 * item, and expiring at the balance deadline.
 *
 * NO `max_redemptions`: every visit to the checkout creates a new Checkout
 * Session that reserves a redemption, and Stripe never releases it when the
 * session expires — a capped code burns out after a couple of abandoned
 * checkouts and locks the customer out for good (`promotion_code_used_up`).
 * Reuse is prevented at the application level instead: the code is deactivated
 * as soon as the balance is collected (webhook), the order is activated
 * manually, or the deposit is cancelled.
 *
 * Source of truth: Stripe. The code is persisted on the deposit order so the
 * account can surface it and the complete-deposit flow can re-apply it.
 */
import type Stripe from "stripe";
import { getStripe } from "./client";
import { findStripeProductBySlug } from "./products";
import { DEPOSIT_PRICE_CENTS, getBundles } from "@/lib/constants/packs";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDeadlines } from "@/lib/settings/deadlines";

const SOURCE = "academy-deposit-balance";

/** Unix timestamp (seconds) for end-of-day at the configured balance deadline. */
export async function balanceDeadlineUnix(): Promise<number> {
  const { depositBalance } = await getDeadlines(createAdminClient());
  // Local Europe/Rome end of day; precision here is non-critical.
  return Math.floor(new Date(`${depositBalance}T23:59:59`).getTime() / 1000);
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

  // Restrict to bundle products only (not the 490€ masterclasses).
  const bundles = getBundles();
  const bundleProductIds = (
    await Promise.all(bundles.map((b) => findStripeProductBySlug(b.slug)))
  ).filter((id): id is string => Boolean(id));

  const couponParams: Stripe.CouponCreateParams = {
    amount_off: DEPOSIT_PRICE_CENTS,
    currency: "eur",
    duration: "once",
    name: "Caparra versata",
    metadata: { source: SOURCE, order_id: orderId, pack_slug: packSlug },
  };
  if (bundleProductIds.length === bundles.length) {
    couponParams.applies_to = { products: bundleProductIds };
  } else {
    // Without `applies_to` the -500€ is spendable on ANY product (a 490€
    // masterclass would come out free). Never fail the deposit over it, but
    // make the gap loud instead of silently issuing an unrestricted coupon.
    console.error(
      `[deposit] product lookup incomplete (${bundleProductIds.length}/${bundles.length}) — coupon for order ${orderId} issued WITHOUT applies_to`,
    );
  }

  const coupon = await stripe.coupons.create(couponParams);

  const promotionCode = await stripe.promotionCodes.create({
    coupon: coupon.id,
    expires_at: await balanceDeadlineUnix(),
    metadata: { source: SOURCE, order_id: orderId, pack_slug: packSlug },
  });

  return { code: promotionCode.code, promotionCodeId: promotionCode.id };
}

/**
 * Whether a promotion code can still be applied to a Checkout Session.
 * A code that Stripe has deactivated (or that expired, or burnt through a
 * legacy `max_redemptions: 1`) makes session creation throw, which is what
 * used to leave customers stuck on "Completa il saldo".
 */
export async function isDepositPromotionCodeUsable(
  promotionCodeId: string,
): Promise<boolean> {
  try {
    const pc = await getStripe().promotionCodes.retrieve(promotionCodeId);
    if (!pc.active) return false;
    if (pc.expires_at && pc.expires_at * 1000 <= Date.now()) return false;
    if (pc.max_redemptions && pc.times_redeemed >= pc.max_redemptions)
      return false;
    const coupon = typeof pc.coupon === "string" ? null : pc.coupon;
    return coupon ? coupon.valid : true;
  } catch {
    // Unknown/deleted code in this environment → treat as unusable so the
    // caller reissues one rather than blowing up at session creation.
    return false;
  }
}

/**
 * Guard for the shared Supabase project: staging talks to Stripe **test** while
 * production talks to **live**, so a live promotion code simply doesn't exist
 * for a test key. Without this check, opening a live customer's balance from
 * staging would "self-heal" their working code into a test one and overwrite it
 * on the live order.
 */
export class WrongStripeEnvError extends Error {
  constructor() {
    super(
      "Ordine di un altro ambiente Stripe: impossibile emettere il codice qui.",
    );
  }
}

function isStripeTestMode(): boolean {
  return process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_") ?? false;
}

/** Throws when the order and the active Stripe key belong to different envs. */
export function assertSameStripeEnv(orderIsTest: boolean | null | undefined) {
  if ((orderIsTest ?? false) !== isStripeTestMode()) {
    throw new WrongStripeEnvError();
  }
}

/**
 * Return a promotion code id that is guaranteed usable for this deposit,
 * reissuing (and persisting) a fresh one when the current is missing or spent.
 * Self-heal: the customer is never locked out of settling their balance.
 */
export async function ensureDepositPromotionCode(params: {
  orderId: string;
  packSlug: string;
  promotionCodeId: string | null;
  /** `orders.is_test` — reissuing across environments would corrupt the order. */
  orderIsTest: boolean | null;
}): Promise<string> {
  const { orderId, packSlug, promotionCodeId } = params;

  if (
    promotionCodeId &&
    (await isDepositPromotionCodeUsable(promotionCodeId))
  ) {
    return promotionCodeId;
  }

  assertSameStripeEnv(params.orderIsTest);

  const { code, promotionCodeId: newId } = await createDepositBalanceCoupon(
    packSlug,
    orderId,
  );
  await createAdminClient()
    .from("orders")
    .update({
      deposit_promo_code: code,
      deposit_promotion_code_id: newId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (promotionCodeId) {
    console.warn(
      `[deposit] promotion code ${promotionCodeId} unusable for order ${orderId} — reissued as ${newId}`,
    );
  }
  return newId;
}

/**
 * Deactivate the -500€ code once it has served its purpose (balance collected).
 * Replaces the old `max_redemptions: 1` as the anti-reuse guard. The coupon
 * itself is left alone: it stays attached to the paid session for the records.
 */
export async function deactivateDepositPromotionCode(
  promotionCodeId: string,
): Promise<void> {
  try {
    await getStripe().promotionCodes.update(promotionCodeId, { active: false });
  } catch (err) {
    console.error("Deposit promotion code deactivation error:", err);
  }
}
