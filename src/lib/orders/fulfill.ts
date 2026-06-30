/**
 * Order fulfillment — ticket/QR generation + confirmation email.
 *
 * Single source of truth shared by:
 *  - the Stripe webhook (a full/balance payment was confirmed), and
 *  - the admin manual activation (an order settled outside Stripe).
 *
 * Idempotent: a ticket is created once per (order, product slug); calling twice
 * does not duplicate tickets. Derives the products to ticket from the order row
 * (pack_id + selected add-ons) so it works with or without a Stripe session.
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { encryptPayload } from "@/lib/qr/encrypt";
import { generateQRCodeBuffer } from "@/lib/qr/generate";
import { PRODUCTS } from "@/lib/constants/packs";
import { sendEmail } from "@/lib/email/client";
import { OrderConfirmationEmail } from "@/lib/email/templates/order-confirmation";
import React from "react";

/** Canonical public domain for customer-facing email links (matches webhook). */
const EMAIL_APP_URL = "https://academy.lacertosus.com";

type AdminClient = ReturnType<typeof createAdminClient>;

export interface FulfillableOrder {
  id: string;
  user_id: string | null;
  pack_id: string | null;
  billing_name: string | null;
  billing_email: string | null;
  selected_workshop_ids?: unknown;
  profiles?: { full_name?: string | null; email?: string | null } | null;
}

export interface FulfillOptions {
  /** Add-on product slugs (workshops/masterclasses) to issue tickets for.
   *  Defaults to the order's persisted `selected_workshop_ids`. */
  addonSlugs?: string[];
  /** Send the order-confirmation email (with the QR link). Default true. */
  sendConfirmationEmail?: boolean;
  /** Total shown in the confirmation email, in cents. */
  emailTotalCents?: number;
}

export interface FulfillResult {
  /** Tickets that exist for this order after the call (incl. pre-existing). */
  ticketCount: number;
  /** Tickets actually created by this call. */
  createdCount: number;
}

function normalizeSlugList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((s): s is string => typeof s === "string" && s.trim().length > 0)
    .map((s) => s.trim());
}

/**
 * Generate one ticket/QR per product on the order and (optionally) email the
 * customer. Safe to call more than once for the same order.
 */
export async function fulfillOrder(
  supabase: AdminClient,
  order: FulfillableOrder,
  options: FulfillOptions = {},
): Promise<FulfillResult> {
  const addonSlugs =
    options.addonSlugs ?? normalizeSlugList(order.selected_workshop_ids);

  const slugsToTicket: string[] = [];
  if (order.pack_id) slugsToTicket.push(order.pack_id);
  addonSlugs.forEach((slug) => {
    if (slug && !slugsToTicket.includes(slug)) slugsToTicket.push(slug);
  });

  // Idempotency: skip slugs already ticketed for this order.
  const { data: existingTickets } = await supabase
    .from("tickets")
    .select("course_id")
    .eq("order_id", order.id);
  const alreadyTicketed = new Set(
    (existingTickets ?? []).map((t) => t.course_id),
  );

  const userName = order.profiles?.full_name || order.billing_name || "";
  let createdCount = 0;

  for (const slug of slugsToTicket) {
    if (alreadyTicketed.has(slug)) continue;
    const product = PRODUCTS.find((p) => p.slug === slug);
    const productName = product?.name ?? slug;
    const ticketId = crypto.randomUUID();

    const payload = {
      ticketId,
      orderId: order.id,
      courseId: slug,
      userId: order.user_id ?? "",
      userName,
      courseName: productName,
      eventDate: "",
      issuedAt: new Date().toISOString(),
    };

    const encrypted = encryptPayload(payload);
    const qrBuffer = await generateQRCodeBuffer(encrypted);

    const qrPath = `tickets/${order.id}/${ticketId}.png`;
    await supabase.storage
      .from("tickets")
      .upload(qrPath, qrBuffer, { contentType: "image/png" });

    const {
      data: { publicUrl },
    } = supabase.storage.from("tickets").getPublicUrl(qrPath);

    await supabase.from("tickets").insert({
      id: ticketId,
      order_id: order.id,
      user_id: order.user_id,
      course_id: slug,
      qr_payload: encrypted,
      qr_image_url: publicUrl,
    });
    createdCount += 1;
  }

  if (options.sendConfirmationEmail ?? true) {
    const customerEmail = order.billing_email || order.profiles?.email;
    if (customerEmail) {
      const productName =
        PRODUCTS.find((p) => p.slug === order.pack_id)?.name ||
        order.pack_id ||
        "Pack";
      const orderTotal = new Intl.NumberFormat("it-IT", {
        style: "currency",
        currency: "EUR",
      }).format((options.emailTotalCents ?? 0) / 100);

      await sendEmail({
        to: customerEmail,
        subject: `Conferma ordine — ${productName}`,
        react: React.createElement(OrderConfirmationEmail, {
          userName: userName || "Cliente",
          packName: productName,
          orderTotal,
          orderId: order.id,
          ticketCount: slugsToTicket.length,
          appUrl: EMAIL_APP_URL,
        }),
      }).catch(console.error);
    }
  }

  return { ticketCount: slugsToTicket.length, createdCount };
}
