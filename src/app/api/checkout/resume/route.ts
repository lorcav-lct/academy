import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createCheckoutSession } from "@/lib/stripe/checkout";
import { getProductBySlug, resolveStripePriceId } from "@/lib/constants/packs";
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

    const { orderId } = await request.json();
    if (!orderId) {
      return NextResponse.json({ error: "orderId mancante" }, { status: 400 });
    }

    // Fetch the pending order (must belong to this user)
    const { data: order } = await supabase
      .from("orders")
      .select("id, pack_id, status, user_id, selected_workshop_ids")
      .eq("id", orderId)
      .eq("user_id", user.id)
      .single();

    if (!order || order.status !== "pending") {
      return NextResponse.json(
        { error: "Ordine non trovato o non in attesa" },
        { status: 404 },
      );
    }

    const admin = createAdminClient();

    // Cancel the old pending order and its tickets
    await admin
      .from("orders")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("id", orderId);

    await admin
      .from("tickets")
      .update({ is_used: true })
      .eq("order_id", orderId);

    // Look up pack from constants
    const pack = getProductBySlug(order.pack_id);
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
      order.selected_workshop_ids,
    );
    const requiredMasterclasses =
      pack.type === "bundle" ? (pack.masterclassSelectionCount ?? 0) : 0;

    if (requiredMasterclasses > 0) {
      const workshopSlugs = new Set(WORKSHOPS.map((w) => w.slug));
      const invalidSelection =
        selectedMasterclassIds.length !== requiredMasterclasses ||
        selectedMasterclassIds.some((slug) => !workshopSlugs.has(slug));

      if (invalidSelection) {
        return NextResponse.json(
          {
            error:
              "Selezione masterclass mancante o non valida. Torna al checkout e scegli di nuovo le masterclass.",
          },
          { status: 400 },
        );
      }
    }

    // Create a new order + Stripe session
    const { data: newOrder, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        pack_id: pack.slug,
        // Kept empty for compatibility until the TEXT[] migration is applied.
        // The checkout metadata still carries the selected masterclass slugs.
        selected_workshop_ids: [],
        status: "pending",
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
    });

    await supabase
      .from("orders")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", newOrder.id);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Resume checkout error:", error);
    return NextResponse.json(
      { error: "Errore durante il checkout" },
      { status: 500 },
    );
  }
}
