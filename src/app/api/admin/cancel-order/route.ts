import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe/client";
import { sendEmail } from "@/lib/email/client";
import { OrderCancelledEmail } from "@/lib/email/templates/order-cancelled";
import { PRODUCTS } from "@/lib/constants/packs";
import React from "react";

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || !["admin", "staff"].includes(profile.role)) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }

  const { orderId } = await request.json();
  if (!orderId)
    return NextResponse.json({ error: "orderId mancante" }, { status: 400 });

  const admin = createAdminClient();

  // Fetch order before cancelling (need customer info for email)
  const { data: order } = await admin
    .from("orders")
    .select("*, profiles(*)")
    .eq("id", orderId)
    .single();

  const { error } = await admin
    .from("orders")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", orderId);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  // Invalidate all tickets belonging to this order
  await admin.from("tickets").update({ is_used: true }).eq("order_id", orderId);

  // If this is a deposit order, void its -500€ balance coupon so it can no
  // longer be redeemed (a cancelled caparra is forfeited).
  const promotionCodeId = order?.deposit_promotion_code_id as string | null;
  if (promotionCodeId) {
    try {
      const stripe = getStripe();
      const pc = await stripe.promotionCodes.update(promotionCodeId, {
        active: false,
      });
      const couponId =
        typeof pc.coupon === "string" ? pc.coupon : pc.coupon?.id;
      if (couponId) await stripe.coupons.del(couponId).catch(() => {});
    } catch (err) {
      console.error("Deposit coupon void error:", err);
    }
  }

  // Send cancellation email only for orders that were actually paid (a paid
  // caparra counts). A `pending` order is an abandoned checkout the customer
  // never paid — cancel it silently, no email.
  if (order && order.status === "paid") {
    const customerEmail =
      (order.profiles as { email?: string } | null)?.email ||
      order.billing_email;
    if (customerEmail) {
      const appUrl = "https://academy.lacertosus.com";
      const isDeposit = order.payment_plan === "deposit";
      const baseName =
        PRODUCTS.find((p) => p.slug === order.pack_id)?.name ||
        (order.pack_id as string)?.toUpperCase() ||
        "Prodotto";
      const packName = isDeposit ? `Caparra · ${baseName}` : baseName;
      await sendEmail({
        to: customerEmail,
        subject: `Ordine annullato — ${packName}`,
        react: React.createElement(OrderCancelledEmail, {
          userName:
            (order.profiles as { full_name?: string } | null)?.full_name ||
            order.billing_name ||
            "Cliente",
          packName,
          orderId: order.id,
          appUrl,
          isDeposit,
        }),
      }).catch(console.error);
    }
  }

  return NextResponse.json({ ok: true });
}
