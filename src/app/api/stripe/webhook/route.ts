import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { encryptPayload } from "@/lib/qr/encrypt";
import { generateQRCodeBuffer } from "@/lib/qr/generate";
import { PRODUCTS, DEPOSIT_PRICE_CENTS } from "@/lib/constants/packs";
import { sendEmail } from "@/lib/email/client";
import { OrderConfirmationEmail } from "@/lib/email/templates/order-confirmation";
import { DepositReceivedEmail } from "@/lib/email/templates/deposit-received";
import { createDepositBalanceCoupon } from "@/lib/stripe/deposit";
import React from "react";

/** Canonical public domain for customer-facing email links. Hardcoded so that
 *  emails sent from preview/staging deployments (NEXT_PUBLIC_BASE_URL =
 *  *.vercel.app) still point at the production site. */
const EMAIL_APP_URL = "https://academy.lacertosus.com";

function parseMetadataList(value: string | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return Array.from(
      new Set(
        parsed
          .filter((item): item is string => typeof item === "string")
          .map((item) => item.trim())
          .filter(Boolean),
      ),
    );
  } catch {
    return [];
  }
}

async function updateOrderPaid(
  supabase: ReturnType<typeof createAdminClient>,
  orderId: string,
  session: Stripe.Checkout.Session,
  selectedAddonSlugs: string[],
) {
  const baseUpdate = {
    status: "paid",
    amount_cents: session.amount_total || 0,
    tax_cents: session.total_details?.amount_tax || 0,
    stripe_payment_intent_id: session.payment_intent as string,
    billing_name: session.customer_details?.name,
    billing_email: session.customer_details?.email,
    billing_address: session.customer_details?.address,
    is_test: session.livemode === false,
    updated_at: new Date().toISOString(),
  };

  if (selectedAddonSlugs.length === 0) {
    return supabase.from("orders").update(baseUpdate).eq("id", orderId);
  }

  const withSelection = {
    ...baseUpdate,
    selected_workshop_ids: selectedAddonSlugs,
  };
  const result = await supabase
    .from("orders")
    .update(withSelection)
    .eq("id", orderId);

  if (!result.error) return result;

  // Backward compatibility: some active DBs still have selected_workshop_ids
  // as UUID[]. Do not block payment confirmation or ticket generation.
  return supabase.from("orders").update(baseUpdate).eq("id", orderId);
}

async function updateOrderSelectionIfPossible(
  supabase: ReturnType<typeof createAdminClient>,
  orderId: string,
  selectedAddonSlugs: string[],
) {
  if (selectedAddonSlugs.length === 0) return;

  await supabase
    .from("orders")
    .update({
      selected_workshop_ids: selectedAddonSlugs,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);
}

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
      process.env.STRIPE_WEBHOOK_SECRET!,
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
    const depositOrderId = session.metadata?.deposit_order_id || null;
    const workshopIds = parseMetadataList(session.metadata?.workshop_ids);
    const masterclassIds = parseMetadataList(session.metadata?.masterclass_ids);
    const selectedAddonSlugs = Array.from(
      new Set([...workshopIds, ...masterclassIds]),
    );

    if (!orderId) {
      return NextResponse.json({ error: "No order_id" }, { status: 400 });
    }

    // Idempotency: Stripe (and stripe-cli in dev) can deliver the same event
    // more than once. Skip if this order has already been processed.
    const { data: existingOrder } = await supabase
      .from("orders")
      .select("status")
      .eq("id", orderId)
      .single();

    const wasAlreadyPaid = existingOrder?.status === "paid";

    // Update order status
    if (!wasAlreadyPaid) {
      await updateOrderPaid(supabase, orderId, session, selectedAddonSlugs);
    } else if (selectedAddonSlugs.length > 0) {
      await updateOrderSelectionIfPossible(
        supabase,
        orderId,
        selectedAddonSlugs,
      );
    }

    // Fetch order to get user info
    const { data: order } = await supabase
      .from("orders")
      .select("*, profiles(*)")
      .eq("id", orderId)
      .single();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // ── Caparra (deposit) branch ──────────────────────────────────────────
    // A deposit grants NO tickets/access: it only issues the -500€ balance
    // coupon and emails the customer. Access is granted later when the balance
    // is paid as a normal pack purchase.
    //
    // Gate on the persisted order row (not Stripe metadata): the DB column is
    // the reliable source of truth and cannot be dropped/garbled in transit.
    if (order.payment_plan === "deposit") {
      if (!wasAlreadyPaid) {
        const depositPackSlug = order.pack_id || "";
        const pack = PRODUCTS.find((p) => p.slug === depositPackSlug);
        const balanceCents = Math.max(
          0,
          (pack?.priceCents ?? 0) - DEPOSIT_PRICE_CENTS,
        );
        try {
          const { code, promotionCodeId } = await createDepositBalanceCoupon(
            depositPackSlug,
            orderId,
          );
          await supabase
            .from("orders")
            .update({
              deposit_promo_code: code,
              deposit_promotion_code_id: promotionCodeId,
              updated_at: new Date().toISOString(),
            })
            .eq("id", orderId);

          const customerEmail =
            order.billing_email || session.customer_details?.email;
          if (customerEmail) {
            const appUrl = EMAIL_APP_URL;
            await sendEmail({
              to: customerEmail,
              subject: `Caparra ricevuta — ${pack?.name ?? "Pack"}`,
              react: React.createElement(DepositReceivedEmail, {
                userName:
                  (order.profiles as { full_name?: string } | null)
                    ?.full_name ||
                  order.billing_name ||
                  "Cliente",
                packName: pack?.name ?? "Pack",
                balanceCode: code,
                balanceTotal: new Intl.NumberFormat("it-IT", {
                  style: "currency",
                  currency: "EUR",
                }).format(balanceCents / 100),
                appUrl,
              }),
            }).catch(console.error);
          }
        } catch (err) {
          console.error("Deposit coupon/email error:", err);
        }
      }
      return NextResponse.json({ received: true });
    }

    // Determine which products to generate tickets for
    const slugsToTicket: string[] = [];
    if (productSlug) slugsToTicket.push(productSlug);
    selectedAddonSlugs.forEach((s) => {
      if (s && !slugsToTicket.includes(s)) slugsToTicket.push(s);
    });

    // Second-level idempotency: if a ticket for (order, slug) already exists,
    // skip — covers races where two webhook calls pass the status check together.
    const { data: existingTickets } = await supabase
      .from("tickets")
      .select("course_id")
      .eq("order_id", orderId);
    const alreadyTicketed = new Set(
      (existingTickets ?? []).map((t) => t.course_id),
    );

    // Generate one ticket per product slug
    for (const slug of slugsToTicket) {
      if (alreadyTicketed.has(slug)) continue;
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

    // If this is a balance payment, close the originating deposit order by
    // linking it to this full-price order.
    if (depositOrderId && !wasAlreadyPaid) {
      await supabase
        .from("orders")
        .update({
          balance_order_id: orderId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", depositOrderId);
    }

    // Send order confirmation email
    const customerEmail =
      order.billing_email || session.customer_details?.email;
    if (customerEmail && !wasAlreadyPaid) {
      const appUrl = EMAIL_APP_URL;
      const productName =
        PRODUCTS.find((p) => p.slug === productSlug)?.name ||
        productSlug ||
        "Pack";
      const total = new Intl.NumberFormat("it-IT", {
        style: "currency",
        currency: "EUR",
      }).format((session.amount_total || 0) / 100);

      await sendEmail({
        to: customerEmail,
        subject: `Conferma ordine — ${productName}`,
        react: React.createElement(OrderConfirmationEmail, {
          userName:
            (order.profiles as { full_name?: string } | null)?.full_name ||
            order.billing_name ||
            "Cliente",
          packName: productName,
          orderTotal: total,
          orderId: order.id,
          ticketCount: slugsToTicket.length,
          appUrl,
        }),
      }).catch(console.error);
    }

    // Trigger Make.com webhook (async, don't await)
    if (process.env.MAKE_WEBHOOK_URL && !wasAlreadyPaid) {
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
