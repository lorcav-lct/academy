/**
 * Preview the balance of a deposit before opening the checkout.
 *
 * POST { orderId, discountCode? } → { balanceCents, amountOffCents, source }
 *
 * Read-only: it resolves the discount with the exact same engine the checkout
 * uses (`resolveBalanceDiscount`) but creates nothing on Stripe, so the amount
 * shown in /account/orders can never drift from the amount actually charged.
 */
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getProductBySlug } from "@/lib/constants/packs";
import {
  BalanceDiscountError,
  resolveBalanceDiscount,
} from "@/lib/stripe/balance-discount";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const { orderId, discountCode } = await request.json();
    if (!orderId) {
      return NextResponse.json({ error: "orderId mancante" }, { status: 400 });
    }

    const { data: deposit } = await supabase
      .from("orders")
      .select(
        "id, pack_id, status, payment_plan, balance_order_id, settled_externally, agreed_total_cents, commercial_promo_code, balance_discount_cents, balance_discount_promotion_code_id",
      )
      .eq("id", orderId)
      .eq("user_id", user.id)
      .single();

    if (
      !deposit ||
      deposit.payment_plan !== "deposit" ||
      deposit.status !== "paid" ||
      deposit.balance_order_id ||
      deposit.settled_externally
    ) {
      return NextResponse.json(
        { error: "Caparra non trovata o saldo già completato" },
        { status: 404 },
      );
    }

    const pack = getProductBySlug(deposit.pack_id);
    if (!pack) {
      return NextResponse.json(
        { error: "Prodotto non trovato" },
        { status: 404 },
      );
    }

    const discount = await resolveBalanceDiscount({
      deposit,
      pack,
      commercialCode: typeof discountCode === "string" ? discountCode : null,
    });

    return NextResponse.json({
      balanceCents: discount.balanceCents,
      amountOffCents: discount.amountOffCents,
      commercialCode: discount.commercialCode,
      source: discount.source,
    });
  } catch (error) {
    if (error instanceof BalanceDiscountError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Balance preview error:", error);
    return NextResponse.json(
      { error: "Errore di validazione, riprova." },
      { status: 500 },
    );
  }
}
