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
import { getStripe } from "@/lib/stripe/client";
import {
  ensureDepositPromotionCode,
  WrongStripeEnvError,
} from "@/lib/stripe/deposit";
import {
  BalanceDiscountError,
  ensureBalanceDiscountCode,
  resolveBalanceDiscount,
} from "@/lib/stripe/balance-discount";
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

    const { orderId, discountCode } = await request.json();
    if (!orderId) {
      return NextResponse.json({ error: "orderId mancante" }, { status: 400 });
    }

    // Fetch the deposit order (must belong to this user and await its balance)
    const { data: deposit } = await supabase
      .from("orders")
      .select(
        "id, pack_id, status, payment_plan, balance_order_id, settled_externally, deposit_promotion_code_id, selected_workshop_ids, is_test, agreed_total_cents, commercial_promo_code, balance_discount_cents, balance_discount_promotion_code_id",
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
    const stripe = getStripe();

    // How much comes off the list price: the 500€ credit alone, or a combined
    // discount when the pack price was negotiated / a commercial code applies.
    // Stripe can't stack discounts, so everything lands in a single coupon.
    let discount;
    try {
      discount = await resolveBalanceDiscount({
        deposit,
        pack,
        commercialCode: typeof discountCode === "string" ? discountCode : null,
      });
    } catch (err) {
      if (err instanceof BalanceDiscountError) {
        return NextResponse.json({ error: err.message }, { status: 400 });
      }
      throw err;
    }

    // Reuse the balance checkout the customer already has open, instead of
    // opening a new one on every click. Each session applies the discount code
    // and holds a redemption on it, so piling them up is what used to burn the
    // code out and lock the customer out of the balance for good. Only reuse a
    // session that carries the same discount we just resolved.
    const { data: pendingBalance } = await supabase
      .from("orders")
      .select("id, stripe_checkout_session_id")
      .eq("user_id", user.id)
      .eq("pack_id", pack.slug)
      .eq("payment_plan", "full")
      .eq("status", "pending")
      .not("stripe_checkout_session_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (pendingBalance?.stripe_checkout_session_id) {
      try {
        const existing = await stripe.checkout.sessions.retrieve(
          pendingBalance.stripe_checkout_session_id,
        );
        if (existing.status === "open") {
          const sameDiscount =
            (existing.total_details?.amount_discount ?? 0) ===
            discount.amountOffCents;
          if (sameDiscount && existing.url) {
            return NextResponse.json({ url: existing.url });
          }
          // Stale discount (deal or code changed): close it so it can't be paid
          // at the old price and release whatever it was holding.
          await stripe.checkout.sessions
            .expire(existing.id)
            .catch(() => undefined);
        }
      } catch (err) {
        console.error("Balance session reuse error:", err);
      }
    }

    // Plain deposit credit → the standard code (self-healed if missing or no
    // longer usable, so a customer is never locked out). Anything else needs a
    // combined coupon carrying the deposit credit plus the negotiated discount.
    let promotionCodeId: string;
    try {
      promotionCodeId =
        discount.source === "deposit"
          ? await ensureDepositPromotionCode({
              orderId: deposit.id,
              packSlug: deposit.pack_id,
              promotionCodeId: deposit.deposit_promotion_code_id as
                | string
                | null,
              orderIsTest: deposit.is_test,
            })
          : await ensureBalanceDiscountCode({ deposit, discount });
    } catch (err) {
      if (err instanceof WrongStripeEnvError) {
        return NextResponse.json(
          {
            error:
              "Questo ordine appartiene a un altro ambiente di pagamento. Contatta l'assistenza.",
          },
          { status: 409 },
        );
      }
      throw err;
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

    let session;
    try {
      session = await createCheckoutSession({
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
    } catch (err) {
      // Don't leave an orphan pending order behind on a failed checkout.
      await admin.from("orders").delete().eq("id", newOrder.id);
      throw err;
    }

    await admin
      .from("orders")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", newOrder.id);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Complete deposit error:", error);
    return NextResponse.json(
      {
        error:
          "Non siamo riusciti ad aprire il pagamento del saldo. Riprova tra qualche minuto: se il problema persiste scrivici a academy@lacertosus.com indicando il tuo ordine.",
      },
      { status: 500 },
    );
  }
}
