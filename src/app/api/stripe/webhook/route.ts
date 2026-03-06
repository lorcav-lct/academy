import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { encryptPayload } from "@/lib/qr/encrypt";
import { generateQRCodeBuffer } from "@/lib/qr/generate";

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
    const packId = session.metadata?.pack_id;
    const workshopIds = JSON.parse(session.metadata?.workshop_ids || "[]");

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

    // Fetch pack to determine which courses to generate tickets for
    const { data: pack } = await supabase
      .from("packs")
      .select("*")
      .eq("id", packId)
      .single();

    if (!pack) {
      return NextResponse.json({ error: "Pack not found" }, { status: 404 });
    }

    // Get courses included in the pack
    const { data: courses } = await supabase
      .from("courses")
      .select("*")
      .or(
        `block_number.in.(${pack.includes_blocks.join(",")}),id.in.(${workshopIds.join(",")})`
      );

    // Generate tickets with QR codes
    if (courses) {
      for (const course of courses) {
        const ticketId = crypto.randomUUID();

        const payload = {
          ticketId,
          orderId: order.id,
          courseId: course.id,
          userId: order.user_id,
          userName: order.profiles?.full_name || order.billing_name || "",
          courseName: course.title,
          eventDate: "",
          issuedAt: new Date().toISOString(),
        };

        const encrypted = encryptPayload(payload);
        const qrBuffer = await generateQRCodeBuffer(encrypted);

        // Upload QR to Supabase Storage
        const qrPath = `tickets/${orderId}/${ticketId}.png`;
        await supabase.storage
          .from("tickets")
          .upload(qrPath, qrBuffer, { contentType: "image/png" });

        const {
          data: { publicUrl },
        } = supabase.storage.from("tickets").getPublicUrl(qrPath);

        // Create ticket record
        await supabase.from("tickets").insert({
          id: ticketId,
          order_id: orderId,
          user_id: order.user_id,
          course_id: course.id,
          qr_payload: encrypted,
          qr_image_url: publicUrl,
        });
      }
    }

    // Trigger Make.com webhook (async, don't await)
    if (process.env.MAKE_WEBHOOK_URL) {
      fetch(process.env.MAKE_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "payment_completed",
          orderId,
          packName: pack.name,
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
