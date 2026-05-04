import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/client";

/**
 * Valida un codice promozionale Stripe.
 * POST { code: string } → { valid, id?, code?, label?, error? }
 *
 * `id` è il promotion_code id (`promo_...`) da passare poi al checkout.
 * `label` è una stringa human-readable (es. "−15% · EARLYBIRD") da mostrare in UI.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const code = String(body?.code ?? "").trim();

    if (!code) {
      return NextResponse.json(
        { valid: false, error: "Inserisci un codice." },
        { status: 400 },
      );
    }

    const stripe = getStripe();

    // List by exact code (case-sensitive on Stripe)
    const list = await stripe.promotionCodes.list({
      code,
      active: true,
      limit: 1,
    });
    const promo = list.data[0];

    if (!promo) {
      return NextResponse.json(
        { valid: false, error: "Codice non valido o scaduto." },
        { status: 200 },
      );
    }

    // Coupon-level checks (expiration, redeem limit)
    const coupon = promo.coupon;
    if (!coupon.valid) {
      return NextResponse.json(
        { valid: false, error: "Codice non più valido." },
        { status: 200 },
      );
    }

    // Promotion-code-level expiration / max redemptions
    if (promo.expires_at && promo.expires_at * 1000 < Date.now()) {
      return NextResponse.json(
        { valid: false, error: "Codice scaduto." },
        { status: 200 },
      );
    }
    if (
      promo.max_redemptions != null &&
      promo.times_redeemed >= promo.max_redemptions
    ) {
      return NextResponse.json(
        { valid: false, error: "Codice esaurito." },
        { status: 200 },
      );
    }

    // Build user-facing label
    let label = "";
    if (coupon.percent_off) {
      label = `−${coupon.percent_off}%`;
    } else if (coupon.amount_off && coupon.currency) {
      const amount = new Intl.NumberFormat("it-IT", {
        style: "currency",
        currency: coupon.currency.toUpperCase(),
        maximumFractionDigits: 0,
      }).format(coupon.amount_off / 100);
      label = `−${amount}`;
    } else {
      label = "Sconto applicato";
    }

    return NextResponse.json({
      valid: true,
      id: promo.id,
      code: promo.code,
      label,
      percentOff: coupon.percent_off ?? null,
      amountOffCents: coupon.amount_off ?? null,
      currency: coupon.currency ?? null,
    });
  } catch (err) {
    console.error("Promo validation error:", err);
    return NextResponse.json(
      { valid: false, error: "Errore di validazione, riprova." },
      { status: 500 },
    );
  }
}
