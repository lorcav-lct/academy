import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createCheckoutSession } from "@/lib/stripe/checkout";
import { getProductBySlug } from "@/lib/constants/packs";

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
      .select("id, pack_id, status, user_id")
      .eq("id", orderId)
      .eq("user_id", user.id)
      .single();

    if (!order || order.status !== "pending") {
      return NextResponse.json({ error: "Ordine non trovato o non in attesa" }, { status: 404 });
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
    if (!pack || !pack.stripePriceId) {
      return NextResponse.json({ error: "Prodotto non trovato" }, { status: 404 });
    }

    // Create a new order + Stripe session
    const { data: newOrder, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        pack_id: pack.slug,
        selected_workshop_ids: [],
        status: "pending",
        amount_cents: 0,
        billing_email: user.email,
      })
      .select()
      .single();

    if (orderError || !newOrder) {
      return NextResponse.json({ error: "Errore creazione ordine" }, { status: 500 });
    }

    const session = await createCheckoutSession({
      priceId: pack.stripePriceId,
      customerEmail: user.email!,
      orderId: newOrder.id,
      packId: pack.slug,
      workshopIds: [],
    });

    await supabase
      .from("orders")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", newOrder.id);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Resume checkout error:", error);
    return NextResponse.json({ error: "Errore durante il checkout" }, { status: 500 });
  }
}
