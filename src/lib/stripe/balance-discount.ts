/**
 * Combined discount for the balance of a deposit (caparra).
 *
 * Stripe never stacks discounts: a Checkout Session carrying the -500€ deposit
 * credit in `discounts` cannot also accept a typed promo code (the field isn't
 * rendered at all). To honour a commercial deal — "PRO at 2000€ instead of
 * 4900€, as 500€ deposit + 1500€ balance" — everything is folded into ONE
 * coupon: deposit credit + commercial discount.
 *
 * Two inputs, in priority order:
 *  1. `agreed_total_cents` on the deposit order (set by an admin): the whole
 *     pack price is negotiated, the balance is `agreed_total - 500€`.
 *  2. a commercial promotion code typed by the customer (created from
 *     /admin/contenuti/coupon): percentages apply to the LIST price, so the
 *     deal is the same whether or not a deposit was paid.
 *
 * Like the plain deposit code, the generated promotion code carries NO
 * `max_redemptions`: open sessions reserve redemptions and Stripe never
 * releases them, which is what used to lock customers out for good.
 */
import type Stripe from "stripe";
import { getStripe } from "./client";
import { findStripeProductBySlug } from "./products";
import { assertSameStripeEnv, balanceDeadlineUnix } from "./deposit";
import {
  DEPOSIT_PRICE_CENTS,
  getBundles,
  type AcademyProduct,
} from "@/lib/constants/packs";
import { createAdminClient } from "@/lib/supabase/admin";

const SOURCE = "academy-balance-discount";
/** Stripe rejects tiny charges; also keeps a balance from landing on zero. */
export const MIN_BALANCE_CENTS = 100;
/** Only codes issued from /admin/contenuti/coupon are accepted here. */
const ADMIN_CODE_SOURCE = "academy-admin-code";

/** Minimal shape of the deposit order this module needs. */
export interface DepositOrderRef {
  id: string;
  pack_id: string;
  is_test: boolean | null;
  agreed_total_cents: number | null;
  commercial_promo_code: string | null;
  balance_discount_cents: number | null;
  balance_discount_promotion_code_id: string | null;
}

export interface BalanceDiscount {
  /** Total amount taken off the list price, deposit credit included. */
  amountOffCents: number;
  /** What the customer still has to pay. */
  balanceCents: number;
  /** Commercial code folded in, if any (normalized). */
  commercialCode: string | null;
  source: "deposit" | "agreed_total" | "commercial_code";
}

export class BalanceDiscountError extends Error {}

/**
 * How much to take off the balance, given the deal on the order and/or a code
 * the customer just typed. Throws `BalanceDiscountError` with a customer-facing
 * message when the code can't be honoured.
 */
export async function resolveBalanceDiscount(params: {
  deposit: DepositOrderRef;
  pack: AcademyProduct;
  /** Raw code typed by the customer, if any. */
  commercialCode?: string | null;
}): Promise<BalanceDiscount> {
  const { deposit, pack } = params;
  const listPrice = pack.priceCents;
  const maxDiscount = listPrice - MIN_BALANCE_CENTS;

  const build = (
    amountOffCents: number,
    source: BalanceDiscount["source"],
    commercialCode: string | null,
  ): BalanceDiscount => ({
    amountOffCents,
    balanceCents: listPrice - amountOffCents,
    commercialCode,
    source,
  });

  // 1. Admin-negotiated total wins: no code can move it.
  if (deposit.agreed_total_cents != null) {
    const agreed = deposit.agreed_total_cents;
    if (
      agreed < DEPOSIT_PRICE_CENTS + MIN_BALANCE_CENTS ||
      agreed > listPrice
    ) {
      throw new BalanceDiscountError(
        "Il prezzo concordato per questo ordine non è valido. Contatta l'assistenza.",
      );
    }
    return build(listPrice - agreed, "agreed_total", null);
  }

  const typed = (params.commercialCode ?? "").trim();
  // 2. No code typed → plain deposit credit, the standard path.
  if (!typed) return build(DEPOSIT_PRICE_CENTS, "deposit", null);

  const stripe = getStripe();
  const { data } = await stripe.promotionCodes.list({
    code: typed,
    active: true,
    limit: 1,
  });
  const promo = data[0];
  if (!promo) throw new BalanceDiscountError("Codice non valido o scaduto.");

  const coupon = promo.coupon;
  if (!coupon.valid) throw new BalanceDiscountError("Codice non più valido.");
  if (promo.expires_at && promo.expires_at * 1000 < Date.now()) {
    throw new BalanceDiscountError("Codice scaduto.");
  }
  if (
    promo.max_redemptions != null &&
    promo.times_redeemed >= promo.max_redemptions
  ) {
    throw new BalanceDiscountError("Codice esaurito.");
  }
  if (coupon.metadata?.source !== ADMIN_CODE_SOURCE) {
    throw new BalanceDiscountError(
      "Questo codice non è utilizzabile sul saldo della caparra.",
    );
  }

  // Product restriction on the coupon must cover the pack being settled.
  const restrictedTo = coupon.applies_to?.products ?? null;
  if (restrictedTo) {
    const packProductId = await findStripeProductBySlug(pack.slug);
    if (!packProductId || !restrictedTo.includes(packProductId)) {
      throw new BalanceDiscountError(
        `Questo codice non è valido sul ${pack.name}.`,
      );
    }
  }

  // Our combined coupon is what Stripe actually redeems, so the original code's
  // `times_redeemed` never moves — enforce its usage cap ourselves.
  if (promo.max_redemptions != null) {
    const { count } = await createAdminClient()
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("commercial_promo_code", promo.code)
      .not("balance_order_id", "is", null);
    if ((count ?? 0) >= promo.max_redemptions) {
      throw new BalanceDiscountError("Codice esaurito.");
    }
  }

  let extra: number;
  if (coupon.percent_off) {
    // Percentages apply to the LIST price: the deal doesn't change depending on
    // whether a deposit was already paid.
    extra = Math.round((listPrice * coupon.percent_off) / 100);
  } else if (coupon.amount_off) {
    if (coupon.currency && coupon.currency.toLowerCase() !== "eur") {
      throw new BalanceDiscountError("Codice in valuta non supportata.");
    }
    extra = coupon.amount_off;
  } else {
    throw new BalanceDiscountError("Codice senza sconto associato.");
  }

  const amountOff = Math.min(DEPOSIT_PRICE_CENTS + extra, maxDiscount);
  return build(amountOff, "commercial_code", promo.code);
}

/**
 * Promotion code id for a combined balance discount, reusing the one already
 * issued for this deposit when it still matches the expected amount (the deal
 * or the typed code may have changed since) and is still usable.
 */
export async function ensureBalanceDiscountCode(params: {
  deposit: DepositOrderRef;
  discount: BalanceDiscount;
}): Promise<string> {
  const { deposit, discount } = params;
  const stripe = getStripe();
  const existingId = deposit.balance_discount_promotion_code_id;

  if (
    existingId &&
    deposit.balance_discount_cents === discount.amountOffCents
  ) {
    try {
      const pc = await stripe.promotionCodes.retrieve(existingId, {
        expand: ["coupon"],
      });
      const coupon = typeof pc.coupon === "string" ? null : pc.coupon;
      const stillGood =
        pc.active &&
        (!pc.expires_at || pc.expires_at * 1000 > Date.now()) &&
        coupon?.valid &&
        coupon.amount_off === discount.amountOffCents;
      if (stillGood) return existingId;
    } catch {
      // fall through and reissue
    }
  }

  // Shared DB across envs: never mint a test coupon onto a live order.
  assertSameStripeEnv(deposit.is_test);

  const bundles = getBundles();
  const bundleProductIds = (
    await Promise.all(bundles.map((b) => findStripeProductBySlug(b.slug)))
  ).filter((id): id is string => Boolean(id));

  const couponParams: Stripe.CouponCreateParams = {
    amount_off: discount.amountOffCents,
    currency: "eur",
    duration: "once",
    name: "Saldo Academy",
    metadata: {
      source: SOURCE,
      order_id: deposit.id,
      pack_slug: deposit.pack_id,
      discount_source: discount.source,
      commercial_code: discount.commercialCode ?? "",
    },
  };
  if (bundleProductIds.length === bundles.length) {
    couponParams.applies_to = { products: bundleProductIds };
  } else {
    console.error(
      `[balance-discount] product lookup incomplete (${bundleProductIds.length}/${bundles.length}) — coupon for order ${deposit.id} issued WITHOUT applies_to`,
    );
  }

  const coupon = await stripe.coupons.create(couponParams);
  const promotionCode = await stripe.promotionCodes.create({
    coupon: coupon.id,
    expires_at: await balanceDeadlineUnix(),
    metadata: {
      source: SOURCE,
      order_id: deposit.id,
      pack_slug: deposit.pack_id,
    },
  });

  // Retire the superseded code so an older, possibly larger discount can't be
  // spent from a checkout link the customer still has open.
  if (existingId && existingId !== promotionCode.id) {
    await stripe.promotionCodes
      .update(existingId, { active: false })
      .catch(() => {});
  }

  await createAdminClient()
    .from("orders")
    .update({
      balance_discount_cents: discount.amountOffCents,
      balance_discount_promotion_code_id: promotionCode.id,
      commercial_promo_code: discount.commercialCode,
      updated_at: new Date().toISOString(),
    })
    .eq("id", deposit.id);

  return promotionCode.id;
}
