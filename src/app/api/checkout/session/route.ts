import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createCheckoutSession } from "@/lib/stripe/checkout";
import { createDepositBalanceCoupon } from "@/lib/stripe/deposit";
import { getActivePromoForProduct } from "@/lib/promos/server";
import {
  getProductBySlug,
  resolveStripePriceId,
  resolveDepositPriceId,
  isDepositEligible,
} from "@/lib/constants/packs";
import { resolvePublicWorkshops } from "@/lib/constants/workshops";
import { getDeadlines, isPastDeadline } from "@/lib/settings/deadlines";
import { getMasterclassVisibility } from "@/lib/settings/masterclass-visibility";

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

    const body = await request.json();
    const { packId, workshopIds, masterclassIds, promotionCodeId } = body;
    const isDeposit = body.paymentPlan === "deposit";

    if (!packId) {
      return NextResponse.json({ error: "Pack non valido" }, { status: 400 });
    }

    const product = getProductBySlug(packId);
    if (!product) {
      return NextResponse.json(
        { error: "Prodotto non valido" },
        { status: 400 },
      );
    }

    if (isDeposit && !isDepositEligible(product)) {
      return NextResponse.json(
        { error: "La caparra è disponibile solo sui pack" },
        { status: 400 },
      );
    }

    const priceId = isDeposit
      ? resolveDepositPriceId()
      : resolveStripePriceId(product);
    if (!priceId) {
      return NextResponse.json(
        { error: "Prodotto non disponibile per l'acquisto in questa modalità" },
        { status: 400 },
      );
    }

    // ── Deadline gating ───────────────────────────────────────────────────
    // Masterclasses (type=workshop) have no deadline. Bundles are bound by the
    // configurable pack/caparra dates; settling an existing caparra is bound by
    // the balance deadline instead of the pack one.
    const deadlines = await getDeadlines(createAdminClient());

    if (isDeposit && isPastDeadline(deadlines.depositPurchase)) {
      return NextResponse.json(
        {
          error:
            "L'acquisto con caparra non è più disponibile. Procedi con il pagamento intero.",
        },
        { status: 403 },
      );
    }

    if (product.type === "bundle") {
      const { data: openDepositGate } = await supabase
        .from("orders")
        .select("id")
        .eq("user_id", user.id)
        .eq("payment_plan", "deposit")
        .eq("status", "paid")
        .is("balance_order_id", null)
        .limit(1)
        .maybeSingle();
      const isSettlement = !isDeposit && Boolean(openDepositGate);

      if (isSettlement) {
        if (isPastDeadline(deadlines.depositBalance)) {
          return NextResponse.json(
            { error: "Il termine per saldare la caparra è scaduto" },
            { status: 403 },
          );
        }
      } else if (isPastDeadline(deadlines.packPurchase)) {
        return NextResponse.json(
          { error: "Le iscrizioni ai pack sono chiuse" },
          { status: 403 },
        );
      }
    }

    const legacyWorkshopIds = normalizeSlugList(workshopIds);
    const selectedMasterclassIds = normalizeSlugList(masterclassIds);
    const selectedAddonSlugs = Array.from(
      new Set([...legacyWorkshopIds, ...selectedMasterclassIds]),
    );
    const visibility = await getMasterclassVisibility(createAdminClient());
    const workshopSlugs = new Set(
      resolvePublicWorkshops(visibility).map((w) => w.slug),
    );
    const requiredMasterclasses =
      product.type === "bundle" ? (product.masterclassSelectionCount ?? 0) : 0;

    if (requiredMasterclasses > 0) {
      if (selectedAddonSlugs.length !== requiredMasterclasses) {
        return NextResponse.json(
          {
            error: `Seleziona ${requiredMasterclasses} masterclass per il pack ${product.name}`,
          },
          { status: 400 },
        );
      }

      if (selectedAddonSlugs.some((slug) => !workshopSlugs.has(slug))) {
        return NextResponse.json(
          { error: "Selezione masterclass non valida" },
          { status: 400 },
        );
      }
    } else if (selectedAddonSlugs.length > 0) {
      return NextResponse.json(
        { error: "Questo prodotto non include masterclass a scelta" },
        { status: 400 },
      );
    }

    // Create order in pending state
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        pack_id: packId,
        // Keep this empty for compatibility with databases that have not yet
        // run 018_orders_selected_workshops_use_slug.sql. The canonical
        // selection is passed through Stripe metadata and persisted by the
        // webhook when the DB column supports TEXT[].
        selected_workshop_ids: [],
        status: "pending",
        payment_plan: isDeposit ? "deposit" : "full",
        amount_cents: 0, // Will be updated by Stripe webhook
        billing_email: user.email,
        is_test: process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_") ?? false,
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error("Order insert error:", orderError);
      return NextResponse.json(
        {
          error: "Errore creazione ordine",
          detail: orderError?.message,
          code: orderError?.code,
        },
        { status: 500 },
      );
    }

    // Persist the masterclass selection on the deposit order. The deposit
    // session carries no ticketable slugs (so it can never produce tickets),
    // so the balance flow reads them from here instead of Stripe metadata.
    // Tolerant: a returned error (e.g. legacy UUID[] column) is ignored.
    if (isDeposit && selectedAddonSlugs.length > 0) {
      await createAdminClient()
        .from("orders")
        .update({ selected_workshop_ids: selectedAddonSlugs })
        .eq("id", order.id);
    }

    // ── Caparra credit ────────────────────────────────────────────────────
    // If the user is buying a bundle full-price and has an open deposit (caparra
    // paid, balance not yet settled), auto-apply its -500€ coupon here too —
    // not only through the "Completa il saldo" CTA. It takes precedence over any
    // launch promo (no stacking) and closes the deposit on payment.
    let depositOrderId: string | null = null;
    let depositPromotionCodeId: string | null = null;
    if (!isDeposit && product.type === "bundle") {
      const { data: openDeposit } = await supabase
        .from("orders")
        .select("id, deposit_promotion_code_id")
        .eq("user_id", user.id)
        .eq("payment_plan", "deposit")
        .eq("status", "paid")
        .is("balance_order_id", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (openDeposit) {
        depositOrderId = openDeposit.id;
        depositPromotionCodeId = openDeposit.deposit_promotion_code_id;
        // Self-heal: issue the coupon if the webhook never did.
        if (!depositPromotionCodeId) {
          try {
            const { code, promotionCodeId } = await createDepositBalanceCoupon(
              packId,
              openDeposit.id,
            );
            depositPromotionCodeId = promotionCodeId;
            await createAdminClient()
              .from("orders")
              .update({
                deposit_promo_code: code,
                deposit_promotion_code_id: promotionCodeId,
                updated_at: new Date().toISOString(),
              })
              .eq("id", openDeposit.id);
          } catch (err) {
            console.error("Deposit credit self-heal error:", err);
          }
        }
      }
    }

    // Auto-apply active promo coupon for this product (DB-managed via /admin).
    // Priority: caparra credit > product-specific/category promo > user code.
    // Stripe non permette stacking → ignoriamo eventuale promotionCodeId del client.
    // Nessuno sconto sulla caparra stessa.
    const hasDepositCredit = Boolean(depositPromotionCodeId);
    const activePromo =
      isDeposit || hasDepositCredit
        ? null
        : await getActivePromoForProduct(packId);
    const couponId = activePromo?.stripe_coupon_id ?? null;
    const effectivePromotionCodeId = isDeposit
      ? null
      : hasDepositCredit
        ? depositPromotionCodeId
        : couponId
          ? null
          : promotionCodeId || null;

    // Create Stripe Checkout Session
    const cancelPath =
      packId === "fipe-personal-trainer"
        ? "/percorso/fipe-personal-trainer"
        : undefined;
    const session = await createCheckoutSession({
      priceId,
      customerEmail: user.email!,
      orderId: order.id,
      packId,
      workshopIds: legacyWorkshopIds,
      masterclassIds: selectedAddonSlugs,
      promotionCodeId: effectivePromotionCodeId,
      couponId,
      cancelPath,
      paymentPlan: isDeposit ? "deposit" : "full",
      depositOrderId,
    });

    // Update order with Stripe session ID via admin client.
    // Users have no UPDATE policy on `orders` (RLS), so the user-context
    // client would silently drop this write and the confirmation page
    // wouldn't be able to look the order up by session_id.
    const admin = createAdminClient();
    const { error: updateError } = await admin
      .from("orders")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", order.id);
    if (updateError) {
      console.error("Order session_id update error:", updateError);
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    const isProductionDomain =
      process.env.NEXT_PUBLIC_BASE_URL?.includes("academy.lacertosus.com") ??
      false;
    const detail =
      error instanceof Error
        ? error.message
        : typeof error === "string"
          ? error
          : "unknown";
    return NextResponse.json(
      {
        error: "Errore durante il checkout",
        // expose stripe/db error message on staging+dev to ease debugging
        detail: isProductionDomain ? undefined : detail,
      },
      { status: 500 },
    );
  }
}
