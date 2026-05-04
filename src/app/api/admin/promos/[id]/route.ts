/**
 * PATCH  /api/admin/promos/[id]   → aggiorna (con Stripe sync intelligente)
 * DELETE /api/admin/promos/[id]   → archivia coupon su Stripe + delete row
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
  return { user };
}

async function createStripeCoupon(
  row: Pick<
    PromoRow,
    | "product_type"
    | "slug"
    | "name"
    | "discount_type"
    | "discount_value"
    | "ends_at"
    | "max_redemptions"
  >,
): Promise<{ couponId: string; productId: string | null } | { error: string }> {
  const params: Stripe.CouponCreateParams = {
    name: row.name,
    duration: "once",
    metadata: {
      product_type: row.product_type,
      slug: row.slug ?? "",
      source: "academy-admin",
    },
  };
  if (row.discount_type === "amount") {
    params.amount_off = row.discount_value;
    params.currency = "eur";
  } else {
    params.percent_off = row.discount_value;
  }
  if (row.ends_at) {
    params.redeem_by = Math.floor(new Date(row.ends_at).getTime() / 1000);
  }
  if (row.max_redemptions) {
    params.max_redemptions = row.max_redemptions;
  }

  let productId: string | null = null;
  if (row.slug) {
    productId = await findStripeProductBySlug(row.slug);
    if (!productId) {
      return { error: `Prodotto Stripe non trovato per slug "${row.slug}".` };
    }
    params.applies_to = { products: [productId] };
  }

  const coupon = await getStripe().coupons.create(params);
  return { couponId: coupon.id, productId };
}

/** Campi che, se cambiano, richiedono ricreazione del coupon Stripe */
const IMMUTABLE_KEYS = [
  "discount_type",
  "discount_value",
  "ends_at",
  "max_redemptions",
  "product_type",
  "slug",
] as const;

export async function PATCH(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const auth = await requireAdmin();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const admin = createAdminClient();

  const { data: existing, error: loadErr } = await admin
    .from("promos")
    .select("*")
    .eq("id", id)
    .single();
  if (loadErr || !existing) {
    return NextResponse.json({ error: "Promo non trovata" }, { status: 404 });
  }
  const current = existing as unknown as PromoRow;

  // Normalizza slug nullabile
  const incoming = body as Partial<PromoRow>;
  if ("slug" in incoming) {
    incoming.slug =
      typeof incoming.slug === "string" && incoming.slug.trim()
        ? incoming.slug.trim()
        : null;
  }

  const next: PromoRow = { ...current, ...incoming };

  if (next.discount_type === "percent" && next.discount_value > 100) {
    return NextResponse.json({ error: "percent max 100" }, { status: 400 });
  }
  if (!next.discount_value || next.discount_value <= 0) {
    return NextResponse.json(
      { error: "discount_value non valido" },
      { status: 400 },
    );
  }

  const wasActive = current.active;
  const willBeActive = next.active;
  const immutableChanged = IMMUTABLE_KEYS.some((k) => current[k] !== next[k]);

  let stripeCouponId = current.stripe_coupon_id;
  let stripeProductId = current.stripe_product_id;
  const nameChanged = current.name !== next.name;

  // Archivia il vecchio coupon se non più valido
  if (
    wasActive &&
    current.stripe_coupon_id &&
    (immutableChanged || !willBeActive)
  ) {
    try {
      await getStripe().coupons.del(current.stripe_coupon_id);
    } catch {
      // già archiviato → ignora
    }
    stripeCouponId = null;
    stripeProductId = null;
  }

  if (willBeActive && !stripeCouponId) {
    // Disattiva conflitti (stesso product_type + slug)
    const q = admin
      .from("promos")
      .update({ active: false })
      .eq("product_type", next.product_type)
      .eq("active", true)
      .neq("id", id);
    if (next.slug) {
      q.eq("slug", next.slug);
    } else {
      q.is("slug", null);
    }
    await q;

    const created = await createStripeCoupon(next);
    if ("error" in created) {
      return NextResponse.json({ error: created.error }, { status: 400 });
    }
    stripeCouponId = created.couponId;
    stripeProductId = created.productId;
  } else if (willBeActive && stripeCouponId && nameChanged) {
    try {
      await getStripe().coupons.update(stripeCouponId, {
        name: next.name,
        metadata: {
          product_type: next.product_type,
          slug: next.slug ?? "",
          source: "academy-admin",
        },
      });
    } catch (err) {
      console.error("Stripe coupon update error:", err);
    }
  }

  const { data, error } = await admin
    .from("promos")
    .update({
      product_type: next.product_type,
      slug: next.slug,
      active: !!willBeActive,
      name: next.name,
      headline: next.headline || null,
      subtitle: next.subtitle || null,
      discount_type: next.discount_type,
      discount_value: next.discount_value,
      starts_at: next.starts_at || null,
      ends_at: next.ends_at || null,
      max_redemptions: next.max_redemptions || null,
      stripe_coupon_id: stripeCouponId,
      stripe_product_id: stripeProductId,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ promo: data });
}

export async function DELETE(
  _request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const auth = await requireAdmin();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const admin = createAdminClient();
  const { data: row } = await admin
    .from("promos")
    .select("stripe_coupon_id")
    .eq("id", id)
    .single();

  if (row?.stripe_coupon_id) {
    try {
      await getStripe().coupons.del(row.stripe_coupon_id);
    } catch {
      // già archiviato
    }
  }

  const { error } = await admin.from("promos").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
