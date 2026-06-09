/**
 * Admin coupon-code CRUD — Stripe promotion codes (codici digitabili al checkout).
 *
 * GET  /api/admin/coupons  → lista i promotion code gestiti dall'admin
 * POST /api/admin/coupons  → crea coupon Stripe + promotion code (codice custom o auto)
 *
 * Fonte di verità: Stripe. Nessuna tabella DB — Stripe traccia usi/scadenza/stato.
 * Un coupon può applicarsi a:
 *   - qualsiasi prodotto (product_slug = null/"all") → coupon senza applies_to
 *   - un prodotto specifico (product_slug = "X")     → coupon con applies_to.products
 */
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/client";
import { findStripeProductBySlug } from "@/lib/stripe/products";
import type Stripe from "stripe";
import type { CouponCodeRow } from "@/lib/coupons/types";

const SOURCE = "academy-admin-code";

async function requireAdmin() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non autenticato", status: 401 as const };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || !["admin", "staff"].includes(profile.role)) {
    return { error: "Non autorizzato", status: 403 as const };
  }
  return { user };
}

/** Normalizza un promotion code Stripe (coupon espanso) in CouponCodeRow */
function toRow(pc: Stripe.PromotionCode): CouponCodeRow {
  const coupon = pc.coupon as Stripe.Coupon;
  const isPercent = coupon.percent_off != null;
  return {
    id: pc.id,
    code: pc.code,
    active: pc.active,
    discount_type: isPercent ? "percent" : "amount",
    discount_value: isPercent
      ? (coupon.percent_off ?? 0)
      : (coupon.amount_off ?? 0),
    currency: coupon.currency ?? null,
    max_redemptions: pc.max_redemptions ?? null,
    times_redeemed: pc.times_redeemed ?? 0,
    expires_at: pc.expires_at
      ? new Date(pc.expires_at * 1000).toISOString()
      : null,
    product_slug: pc.metadata?.product_slug || null,
    created_at: new Date(pc.created * 1000).toISOString(),
  };
}

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const list = await getStripe().promotionCodes.list({
      limit: 100,
      expand: ["data.coupon"],
    });
    const rows = list.data
      .filter((pc) => (pc.coupon as Stripe.Coupon).metadata?.source === SOURCE)
      .map(toRow);
    return NextResponse.json({ coupons: rows });
  } catch (err) {
    console.error("Stripe coupon list error:", err);
    return NextResponse.json(
      { error: "Errore nel recupero dei coupon da Stripe" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const {
    code,
    discount_type,
    discount_value,
    max_redemptions,
    expires_at,
    product_slug,
  } = body ?? {};

  // Validation
  if (!["amount", "percent"].includes(discount_type)) {
    return NextResponse.json(
      { error: "discount_type non valido" },
      { status: 400 },
    );
  }
  if (typeof discount_value !== "number" || discount_value <= 0) {
    return NextResponse.json(
      { error: "discount_value non valido" },
      { status: 400 },
    );
  }
  if (discount_type === "percent" && discount_value > 100) {
    return NextResponse.json({ error: "percent max 100" }, { status: 400 });
  }

  const normalizedSlug =
    typeof product_slug === "string" &&
    product_slug.trim() &&
    product_slug.trim() !== "all"
      ? product_slug.trim()
      : null;

  const normalizedCode =
    typeof code === "string" && code.trim()
      ? code.trim().toUpperCase().replace(/\s+/g, "")
      : null;

  try {
    // 1) Coupon (duration: once) — porta lo sconto e l'eventuale restrizione prodotto.
    const couponParams: Stripe.CouponCreateParams = {
      duration: "once",
      metadata: {
        source: SOURCE,
        product_slug: normalizedSlug ?? "",
      },
    };
    if (discount_type === "amount") {
      couponParams.amount_off = discount_value;
      couponParams.currency = "eur";
    } else {
      couponParams.percent_off = discount_value;
    }
    if (normalizedSlug) {
      const productId = await findStripeProductBySlug(normalizedSlug);
      if (!productId) {
        return NextResponse.json(
          {
            error: `Prodotto Stripe non trovato per slug "${normalizedSlug}".`,
          },
          { status: 400 },
        );
      }
      couponParams.applies_to = { products: [productId] };
    }

    const coupon = await getStripe().coupons.create(couponParams);

    // 2) Promotion code — il codice digitabile. Scadenza e max usi vivono qui.
    const pcParams: Stripe.PromotionCodeCreateParams = {
      coupon: coupon.id,
      metadata: {
        source: SOURCE,
        product_slug: normalizedSlug ?? "",
      },
    };
    if (normalizedCode) pcParams.code = normalizedCode;
    if (typeof max_redemptions === "number" && max_redemptions > 0) {
      pcParams.max_redemptions = max_redemptions;
    }
    if (expires_at) {
      pcParams.expires_at = Math.floor(new Date(expires_at).getTime() / 1000);
    }

    const promotionCode = await getStripe().promotionCodes.create(pcParams);

    // Ricarico col coupon espanso per costruire la row coerente con la lista.
    const full = await getStripe().promotionCodes.retrieve(promotionCode.id, {
      expand: ["coupon"],
    });
    return NextResponse.json({ coupon: toRow(full) });
  } catch (err) {
    console.error("Stripe coupon create error:", err);
    const message = err instanceof Error ? err.message : "sconosciuto";
    return NextResponse.json(
      { error: "Errore Stripe: " + message },
      { status: 500 },
    );
  }
}
