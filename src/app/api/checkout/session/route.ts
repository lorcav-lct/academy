import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createCheckoutSession } from "@/lib/stripe/checkout";
import { getActivePromoForProduct } from "@/lib/promos/server";
import { getProductBySlug } from "@/lib/constants/packs";
import { WORKSHOPS } from "@/lib/constants/workshops";

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
    const { packId, priceId, workshopIds, masterclassIds, promotionCodeId } =
      body;

    if (!packId || !priceId) {
      return NextResponse.json({ error: "Pack non valido" }, { status: 400 });
    }

    const product = getProductBySlug(packId);
    if (!product || product.stripePriceId !== priceId) {
      return NextResponse.json(
        { error: "Prodotto o prezzo non valido" },
        { status: 400 },
      );
    }

    const legacyWorkshopIds = normalizeSlugList(workshopIds);
    const selectedMasterclassIds = normalizeSlugList(masterclassIds);
    const selectedAddonSlugs = Array.from(
      new Set([...legacyWorkshopIds, ...selectedMasterclassIds]),
    );
    const workshopSlugs = new Set(WORKSHOPS.map((w) => w.slug));
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

    // Auto-apply active promo coupon for this product (DB-managed via /admin).
    // Priority: product-specific > category-wide.
    // Stripe non permette stacking → ignoriamo eventuale promotionCodeId del client.
    const activePromo = await getActivePromoForProduct(packId);
    const couponId = activePromo?.stripe_coupon_id ?? null;
    const effectivePromotionCodeId = couponId ? null : promotionCodeId || null;

    // Create Stripe Checkout Session
    const session = await createCheckoutSession({
      priceId,
      customerEmail: user.email!,
      orderId: order.id,
      packId,
      workshopIds: legacyWorkshopIds,
      masterclassIds: selectedAddonSlugs,
      promotionCodeId: effectivePromotionCodeId,
      couponId,
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
    return NextResponse.json(
      { error: "Errore durante il checkout" },
      { status: 500 },
    );
  }
}
