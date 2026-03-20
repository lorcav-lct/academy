import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createCheckoutSession } from "@/lib/stripe/checkout";

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
    const { packId, priceId, workshopIds, masterclassIds } = body;

    if (!packId || !priceId) {
      return NextResponse.json(
        { error: "Pack non valido" },
        { status: 400 }
      );
    }

    // Create order in pending state
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        pack_id: packId,
        selected_workshop_ids: workshopIds || [],
        status: "pending",
        amount_cents: 0, // Will be updated by Stripe webhook
        billing_email: user.email,
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error("Order insert error:", orderError);
      return NextResponse.json(
        { error: "Errore creazione ordine", detail: orderError?.message, code: orderError?.code },
        { status: 500 }
      );
    }

    // Create Stripe Checkout Session
    const session = await createCheckoutSession({
      priceId,
      customerEmail: user.email!,
      orderId: order.id,
      packId,
      workshopIds: workshopIds || [],
      masterclassIds: masterclassIds || [],
    });

    // Update order with Stripe session ID
    await supabase
      .from("orders")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", order.id);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Errore durante il checkout" },
      { status: 500 }
    );
  }
}
