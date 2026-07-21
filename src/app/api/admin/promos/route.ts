/**
 * Admin promo CRUD.
 *
 * GET  /api/admin/promos        → lista tutte le promo
 * POST /api/admin/promos        → crea nuova promo (+ Stripe coupon se active)
 *
 * Una promo può essere:
 *   - category-wide (slug = null)        → coupon Stripe senza applies_to
 *   - product-specific (slug = "X")       → coupon Stripe con applies_to.products = [productId]
 */
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe/client";
import { findStripeProductBySlug } from "@/lib/stripe/products";
import type Stripe from "stripe";
import type { PromoRow } from "@/lib/promos/types";

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
  return { user, supabase };
}

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { data, error } = await auth.supabase
    .from("promos")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ promos: data as unknown as PromoRow[] });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const {
    product_type,
    slug,
    name,
    headline,
    subtitle,
    discount_type,
    discount_value,
    starts_at,
    ends_at,
    max_redemptions,
    active,
  } = body ?? {};

  // Validation
  if (
    !["pack", "masterclass", "masterclass_international", "fipe"].includes(
      product_type,
    )
  ) {
    return NextResponse.json(
      { error: "product_type non valido" },
      { status: 400 },
    );
  }
  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "name richiesto" }, { status: 400 });
  }
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
    typeof slug === "string" && slug.trim() ? slug.trim() : null;

  const admin = createAdminClient();

  // Disattiva eventuale conflitto attivo (stesso product_type + stesso slug NULL/valorizzato)
  if (active) {
    const q = admin
      .from("promos")
      .update({ active: false })
      .eq("product_type", product_type)
      .eq("active", true);
    if (normalizedSlug) {
      q.eq("slug", normalizedSlug);
    } else {
      q.is("slug", null);
    }
    await q;
  }

  // Crea coupon Stripe se attiva
  let stripeCouponId: string | null = null;
  let stripeProductId: string | null = null;

  if (active) {
    try {
      const couponParams: Stripe.CouponCreateParams = {
        name,
        duration: "once",
        metadata: {
          product_type,
          slug: normalizedSlug ?? "",
          source: "academy-admin",
        },
      };
      if (discount_type === "amount") {
        couponParams.amount_off = discount_value;
        couponParams.currency = "eur";
      } else {
        couponParams.percent_off = discount_value;
      }
      if (ends_at) {
        couponParams.redeem_by = Math.floor(new Date(ends_at).getTime() / 1000);
      }
      if (typeof max_redemptions === "number" && max_redemptions > 0) {
        couponParams.max_redemptions = max_redemptions;
      }
      // Restrizione Stripe a singolo product solo se product-specific
      if (normalizedSlug) {
        const productId = await findStripeProductBySlug(normalizedSlug);
        if (!productId) {
          return NextResponse.json(
            {
              error: `Prodotto Stripe non trovato per slug "${normalizedSlug}". Crealo prima via setup-stripe-*.mjs.`,
            },
            { status: 400 },
          );
        }
        stripeProductId = productId;
        couponParams.applies_to = { products: [productId] };
      }

      const coupon = await getStripe().coupons.create(couponParams);
      stripeCouponId = coupon.id;
    } catch (err) {
      console.error("Stripe coupon create error:", err);
      return NextResponse.json(
        {
          error:
            "Errore Stripe: " +
            (err instanceof Error ? err.message : "sconosciuto"),
        },
        { status: 500 },
      );
    }
  }

  const { data, error } = await admin
    .from("promos")
    .insert({
      product_type,
      slug: normalizedSlug,
      active: !!active,
      name,
      headline: headline || null,
      subtitle: subtitle || null,
      discount_type,
      discount_value,
      starts_at: starts_at || null,
      ends_at: ends_at || null,
      max_redemptions: max_redemptions || null,
      stripe_coupon_id: stripeCouponId,
      stripe_product_id: stripeProductId,
    })
    .select()
    .single();

  if (error) {
    if (stripeCouponId) {
      await getStripe()
        .coupons.del(stripeCouponId)
        .catch(() => {});
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ promo: data });
}
