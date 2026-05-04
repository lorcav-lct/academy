/**
 * PATCH  /api/admin/promos/[id]   → aggiorna (con Stripe sync intelligente)
 * DELETE /api/admin/promos/[id]   → archivia coupon su Stripe + delete row
 */
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe/client";
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
    | "name"
    | "discount_type"
    | "discount_value"
    | "ends_at"
    | "max_redemptions"
  >,
): Promise<string> {
  const params: Stripe.CouponCreateParams = {
    name: row.name,
    duration: "once",
    metadata: { product_type: row.product_type, source: "academy-admin" },
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
  const coupon = await getStripe().coupons.create(params);
  return coupon.id;
}

/** Campi che, se cambiano, richiedono ricreazione del coupon Stripe */
const IMMUTABLE_KEYS = [
  "discount_type",
  "discount_value",
  "ends_at",
  "max_redemptions",
  "product_type",
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

  const next: PromoRow = {
    ...current,
    ...(body as Partial<PromoRow>),
  };

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
  const nameChanged = current.name !== next.name;

  // Archivia il vecchio coupon se non più valido (deactivate o immutable changed)
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
  }

  if (willBeActive && !stripeCouponId) {
    // Disattiva altre promo attive sulla stessa categoria
    await admin
      .from("promos")
      .update({ active: false })
      .eq("product_type", next.product_type)
      .eq("active", true)
      .neq("id", id);

    try {
      stripeCouponId = await createStripeCoupon(next);
    } catch (err) {
      return NextResponse.json(
        {
          error:
            "Errore Stripe: " +
            (err instanceof Error ? err.message : "sconosciuto"),
        },
        { status: 500 },
      );
    }
  } else if (willBeActive && stripeCouponId && nameChanged) {
    try {
      await getStripe().coupons.update(stripeCouponId, {
        name: next.name,
        metadata: {
          product_type: next.product_type,
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
