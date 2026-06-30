/**
 * Complete the balance of a paid caparra.
 *
 * Invoked from /account/orders on a deposit order awaiting its balance. Opens a
 * full-price pack checkout with the dedicated -500€ promotion code auto-applied
 * (and no other discount possible — Stripe forbids stacking once `discounts` is
 * set). On payment the webhook generates tickets and closes the deposit order.
 */
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createCheckoutSession } from "@/lib/stripe/checkout";
import { createDepositBalanceCoupon } from "@/lib/stripe/deposit";
import { getProductBySlug, resolveStripePriceId } from "@/lib/constants/packs";
import { resolvePublicWorkshops } from "@/lib/constants/workshops";
import { getMasterclassVisibility } from "@/lib/settings/masterclass-visibility";
import { getDeadlines, isPastDeadline } from "@/lib/settings/deadlines";

function normalizeSlugList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return Array.from(
    new Set(
      value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const { orderId } = await request.json();
    if (!orderId) {
      return NextResponse.json({ error: "orderId mancante" }, { status: 400 });
    }

    // Fetch the deposit order (must belong to this user and await its balance)
    const { data: deposit } = await supabase
      .from("orders")
      .select(
        "id, pack_id, status, payment_plan, balance_order_id, settled_externally, deposit_promotion_code_id, selected_workshop_ids",
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

    const { depositBalance } = await getDeadlines(createAdminClient());
    if (isPastDeadline(depositBalance)) {
      return NextResponse.json(
        { error: "Il termine per saldare la caparra è scaduto" },
        { status: 410 },
      );
    }

    const pack = getProductBySlug(deposit.pack_id);
    if (!pack) {
      return NextResponse.json(
        { error: "Prodotto non trovato" },
        { status: 404 },
      );
    }

    const priceId = resolveStripePriceId(pack);
    if (!priceId) {
      return NextResponse.json(
        { error: "Prodotto non disponibile in questa modalità" },
        { status: 400 },
      );
    }

    const selectedMasterclassIds = normalizeSlugList(
      deposit.selected_workshop_ids,
    );
    const requiredMasterclasses =
      pack.type === "bundle" ? (pack.masterclassSelectionCount ?? 0) : 0;

    if (requiredMasterclasses > 0) {
      const visibility = await getMasterclassVisibility(createAdminClient());
      const workshopSlugs = new Set(
        resolvePublicWorkshops(visibility).map((w) => w.slug),
      );
      const invalidSelection =
        selectedMasterclassIds.length !== requiredMasterclasses ||
        selectedMasterclassIds.some((slug) => !workshopSlugs.has(slug));
      if (invalidSelection) {
        return NextResponse.json(
          {
            error:
              "Selezione masterclass mancante o non valida. Contatta l'assistenza.",
          },
          { status: 400 },
        );
      }
    }

    const admin = createAdminClient();

    // The -500€ coupon is normally issued by the webhook on deposit payment.
    // Self-heal: if it's missing (webhook miss/error), create it now so the
    // customer is never blocked from completing the balance.
    let promotionCodeId = deposit.deposit_promotion_code_id as string | null;
    if (!promotionCodeId) {
      const { code, promotionCodeId: newId } = await createDepositBalanceCoupon(
        deposit.pack_id,
        deposit.id,
      );
      promotionCodeId = newId;
      await admin
        .from("orders")
        .update({
          deposit_promo_code: code,
          deposit_promotion_code_id: newId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", deposit.id);
    }

    // Create the full-price balance order
    const { data: newOrder, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        pack_id: pack.slug,
        selected_workshop_ids: [],
        status: "pending",
        payment_plan: "full",
        amount_cents: 0,
        billing_email: user.email,
        is_test: process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_") ?? false,
      })
      .select()
      .single();

    if (orderError || !newOrder) {
      return NextResponse.json(
        { error: "Errore creazione ordine" },
        { status: 500 },
      );
    }

    const session = await createCheckoutSession({
      priceId,
      customerEmail: user.email!,
      orderId: newOrder.id,
      packId: pack.slug,
      workshopIds: [],
      masterclassIds: selectedMasterclassIds,
      // -500€ auto-applied; allow_promotion_codes stays off → no further discount.
      promotionCodeId,
      depositOrderId: deposit.id,
    });

    await admin
      .from("orders")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", newOrder.id);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Complete deposit error:", error);
    return NextResponse.json(
      { error: "Errore durante il saldo" },
      { status: 500 },
    );
  }
}
