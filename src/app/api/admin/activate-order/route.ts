/**
 * Manually activate an order settled outside Stripe.
 *
 * Used for custom commercial deals: the customer paid the 500€ caparra online,
 * then settled the balance by bank transfer / Scalapay / cash, so no webhook
 * fires. An admin activates the order here — tickets/QR are generated and the
 * confirmation email is sent (unless `silent`), exactly as the webhook would.
 *
 * Also handles a plain `pending` order paid externally. Idempotent: an order
 * already fulfilled (fulfilled_at) or already settled online (balance_order_id)
 * is rejected so access is never granted twice.
 */
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe/client";
import { fulfillOrder } from "@/lib/orders/fulfill";
import { getProductBySlug } from "@/lib/constants/packs";

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

  const { orderId, silent, paymentMethod, amountCents } = await request.json();
  if (!orderId)
    return NextResponse.json({ error: "orderId mancante" }, { status: 400 });

  const admin = createAdminClient();

  const { data: order } = await admin
    .from("orders")
    .select("*, profiles(*)")
    .eq("id", orderId)
    .single();

  if (!order)
    return NextResponse.json({ error: "Ordine non trovato" }, { status: 404 });

  if (order.fulfilled_at || order.balance_order_id) {
    return NextResponse.json({ error: "Ordine già attivato" }, { status: 409 });
  }
  if (order.status === "cancelled" || order.status === "refunded") {
    return NextResponse.json(
      { error: "Ordine annullato: non attivabile" },
      { status: 409 },
    );
  }

  const isDeposit = order.payment_plan === "deposit";

  const method =
    typeof paymentMethod === "string" && paymentMethod.trim()
      ? paymentMethod.trim().slice(0, 60)
      : null;
  const cents =
    typeof amountCents === "number" &&
    Number.isFinite(amountCents) &&
    amountCents > 0
      ? Math.round(amountCents)
      : null;

  const { error: updateError } = await admin
    .from("orders")
    .update({
      status: "paid",
      settled_externally: isDeposit
        ? true
        : (order.settled_externally ?? false),
      fulfilled_at: new Date().toISOString(),
      external_payment_method: method,
      external_payment_cents: cents,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (updateError)
    return NextResponse.json({ error: updateError.message }, { status: 500 });

  // The deposit's -500€ coupon was for the online balance flow only. Settled
  // externally → void it so it can never be redeemed on top of the deal.
  const promotionCodeId = order.deposit_promotion_code_id as string | null;
  if (isDeposit && promotionCodeId) {
    try {
      const stripe = getStripe();
      const pc = await stripe.promotionCodes.update(promotionCodeId, {
        active: false,
      });
      const couponId =
        typeof pc.coupon === "string" ? pc.coupon : pc.coupon?.id;
      if (couponId) await stripe.coupons.del(couponId).catch(() => {});
    } catch (err) {
      console.error("Activate-order coupon void error:", err);
    }
  }

  // Email total: prefer the amount the admin recorded, else the full pack price
  // for a deposit (the deposit row's amount_cents is just the 500€ caparra).
  const pack = getProductBySlug(order.pack_id ?? "");
  const fallbackTotal = isDeposit
    ? (pack?.priceCents ?? order.amount_cents ?? 0)
    : (order.amount_cents ?? 0);

  const { ticketCount, createdCount } = await fulfillOrder(admin, order, {
    sendConfirmationEmail: !silent,
    emailTotalCents: cents ?? fallbackTotal,
  });

  return NextResponse.json({ ok: true, ticketCount, createdCount });
}
