import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { encryptPayload } from "@/lib/qr/encrypt";
import { generateQRCodeBuffer } from "@/lib/qr/generate";
import { PRODUCTS } from "@/lib/constants/packs";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createAdminClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.order_id;
    const productSlug = session.metadata?.pack_id;
    const workshopIds: string[] = JSON.parse(session.metadata?.workshop_ids || "[]");

    if (!orderId) {
      return NextResponse.json({ error: "No order_id" }, { status: 400 });
    }

    // Update order status
    await supabase
      .from("orders")
      .update({
        status: "paid",
        amount_cents: session.amount_total || 0,
        tax_cents: session.total_details?.amount_tax || 0,
        stripe_payment_intent_id: session.payment_intent as string,
        billing_name: session.customer_details?.name,
        billing_email: session.customer_details?.email,
        billing_address: session.customer_details?.address,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    // Fetch order to get user info
    const { data: order } = await supabase
      .from("orders")
      .select("*, profiles(*)")
      .eq("id", orderId)
      .single();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Determine which products to generate tickets for
    const slugsToTicket: string[] = [];
    if (productSlug) slugsToTicket.push(productSlug);
    workshopIds.forEach((s) => {
      if (s && !slugsToTicket.includes(s)) slugsToTicket.push(s);
    });

    // Generate one ticket per product slug
    for (const slug of slugsToTicket) {
      const product = PRODUCTS.find((p) => p.slug === slug);
      const productName = product?.name ?? slug;
      const ticketId = crypto.randomUUID();

      const payload = {
        ticketId,
        orderId: order.id,
        courseId: slug,
        userId: order.user_id,
        userName:
          (order.profiles as { full_name?: string } | null)?.full_name ||
          order.billing_name ||
          "",
        courseName: productName,
        eventDate: "",
        issuedAt: new Date().toISOString(),
      };

      const encrypted = encryptPayload(payload);
      const qrBuffer = await generateQRCodeBuffer(encrypted);

      const qrPath = `tickets/${orderId}/${ticketId}.png`;
      await supabase.storage
        .from("tickets")
        .upload(qrPath, qrBuffer, { contentType: "image/png" });

      const {
        data: { publicUrl },
      } = supabase.storage.from("tickets").getPublicUrl(qrPath);

      await supabase.from("tickets").insert({
        id: ticketId,
        order_id: orderId,
        user_id: order.user_id,
        course_id: slug,
        qr_payload: encrypted,
        qr_image_url: publicUrl,
      });
    }

    // Trigger Make.com webhook (async, don't await)
    if (process.env.MAKE_WEBHOOK_URL) {
      fetch(process.env.MAKE_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "payment_completed",
          orderId,
          packName: productSlug,
          customerEmail: order.billing_email,
          customerName: order.billing_name,
          amount: session.amount_total,
        }),
      }).catch(console.error);
    }
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.order_id;
    if (orderId) {
      await supabase
        .from("orders")
        .update({ status: "cancelled", updated_at: new Date().toISOString() })
        .eq("id", orderId);
    }
  }

  return NextResponse.json({ received: true });
}
