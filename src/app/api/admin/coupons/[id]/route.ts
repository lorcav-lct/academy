/**
 * PATCH  /api/admin/coupons/[id]  → attiva/disattiva un promotion code
 * DELETE /api/admin/coupons/[id]  → disattiva il code + archivia il coupon Stripe
 *
 * Nota: Stripe non permette di cancellare i promotion code, solo di
 * disattivarli (`active: false`). Il DELETE qui disattiva il code e archivia
 * il coupon sottostante, rendendolo definitivamente non spendibile.
 */
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/client";
import type Stripe from "stripe";

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
  if (typeof body?.active !== "boolean") {
    return NextResponse.json({ error: "active richiesto" }, { status: 400 });
  }

  try {
    await getStripe().promotionCodes.update(id, { active: body.active });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Stripe coupon update error:", err);
    const message = err instanceof Error ? err.message : "sconosciuto";
    return NextResponse.json(
      { error: "Errore Stripe: " + message },
      { status: 500 },
    );
  }
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

  const stripe = getStripe();
  try {
    const pc = await stripe.promotionCodes.retrieve(id);
    // Disattiva il code (i promotion code non sono cancellabili).
    await stripe.promotionCodes.update(id, { active: false });
    // Archivia il coupon sottostante → non più spendibile.
    const couponId =
      typeof pc.coupon === "string"
        ? pc.coupon
        : (pc.coupon as Stripe.Coupon)?.id;
    if (couponId) {
      await stripe.coupons.del(couponId).catch(() => {});
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Stripe coupon delete error:", err);
    const message = err instanceof Error ? err.message : "sconosciuto";
    return NextResponse.json(
      { error: "Errore Stripe: " + message },
      { status: 500 },
    );
  }
}
