/**
 * Set (or clear) the negotiated total price of a deposit order.
 *
 * Commercial deals like "PRO at 2000€ instead of 4900€" can't be expressed with
 * a promo code once the -500€ deposit credit is in play (Stripe never stacks
 * discounts). The admin records the agreed TOTAL here and the balance flow folds
 * everything into a single coupon: the customer pays `agreed_total - 500€`.
 *
 * POST { orderId, agreedTotalCents }  — `null` clears the deal.
 */
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe/client";
import { getProductBySlug, DEPOSIT_PRICE_CENTS } from "@/lib/constants/packs";
import { MIN_BALANCE_CENTS } from "@/lib/stripe/balance-discount";

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

  const { orderId, agreedTotalCents } = await request.json();
  if (!orderId)
    return NextResponse.json({ error: "orderId mancante" }, { status: 400 });

  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select(
      "id, pack_id, payment_plan, status, balance_order_id, settled_externally, balance_discount_promotion_code_id",
    )
    .eq("id", orderId)
    .single();

  if (!order)
    return NextResponse.json({ error: "Ordine non trovato" }, { status: 404 });
  if (order.payment_plan !== "deposit") {
    return NextResponse.json(
      { error: "Il prezzo concordato si imposta solo su un ordine caparra" },
      { status: 400 },
    );
  }
  if (order.balance_order_id || order.settled_externally) {
    return NextResponse.json(
      { error: "Saldo già completato: prezzo non modificabile" },
      { status: 409 },
    );
  }

  const clearing = agreedTotalCents === null || agreedTotalCents === undefined;
  let value: number | null = null;

  if (!clearing) {
    if (
      typeof agreedTotalCents !== "number" ||
      !Number.isFinite(agreedTotalCents)
    ) {
      return NextResponse.json(
        { error: "Importo non valido" },
        { status: 400 },
      );
    }
    value = Math.round(agreedTotalCents);

    const pack = getProductBySlug(order.pack_id);
    if (!pack) {
      return NextResponse.json(
        { error: "Prodotto non trovato" },
        { status: 404 },
      );
    }
    const min = DEPOSIT_PRICE_CENTS + MIN_BALANCE_CENTS;
    if (value < min || value > pack.priceCents) {
      return NextResponse.json(
        {
          error: `Il totale concordato deve essere tra ${(min / 100).toFixed(2)}€ e ${(pack.priceCents / 100).toFixed(0)}€ (prezzo di listino).`,
        },
        { status: 400 },
      );
    }
  }

  // Any coupon already issued for this deposit reflects the previous deal:
  // retire it so an open checkout link can't be paid at the stale price. The
  // balance flow reissues one on the next click.
  if (order.balance_discount_promotion_code_id) {
    await getStripe()
      .promotionCodes.update(order.balance_discount_promotion_code_id, {
        active: false,
      })
      .catch((err) =>
        console.error("Stale balance coupon deactivation error:", err),
      );
  }

  const { error } = await admin
    .from("orders")
    .update({
      agreed_total_cents: value,
      balance_discount_cents: null,
      balance_discount_promotion_code_id: null,
      commercial_promo_code: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    ok: true,
    agreedTotalCents: value,
    balanceCents: value === null ? null : value - DEPOSIT_PRICE_CENTS,
  });
}
