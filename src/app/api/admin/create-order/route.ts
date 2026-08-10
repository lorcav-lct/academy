/**
 * Create an order by hand for a customer who paid outside Stripe.
 *
 * Some deals never touch the checkout at all: the card payment was blocked, the
 * price was agreed offline, or extra products were granted as part of the deal.
 * There was no way to grant access in that case — `/api/admin/activate-order`
 * only works on an order that already exists (and never on a cancelled one), and
 * it can only ticket the products already persisted on it.
 *
 * This creates the order already settled (`status='paid'`,
 * `settled_externally`) and reuses `fulfillOrder` so tickets/QR and the
 * confirmation email are identical to a Stripe purchase.
 *
 * POST { userId, packId?, addonSlugs[], amountCents?, paymentMethod?, silent?, force? }
 */
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fulfillOrder } from "@/lib/orders/fulfill";
import { getProductBySlug } from "@/lib/constants/packs";

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
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });

  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("role, email")
    .eq("id", user.id)
    .single();
  if (!adminProfile || !["admin", "staff"].includes(adminProfile.role)) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }

  const body = await request.json();
  const {
    userId,
    packId,
    amountCents,
    paymentMethod,
    silent,
    force,
  }: {
    userId?: string;
    packId?: string | null;
    amountCents?: number | null;
    paymentMethod?: string | null;
    silent?: boolean;
    force?: boolean;
  } = body;

  if (!userId)
    return NextResponse.json({ error: "Cliente mancante" }, { status: 400 });

  const packSlug = typeof packId === "string" ? packId.trim() : "";
  const addonSlugs = normalizeSlugList(body.addonSlugs).filter(
    (slug) => slug !== packSlug,
  );

  const slugs = [...(packSlug ? [packSlug] : []), ...addonSlugs];
  if (slugs.length === 0) {
    return NextResponse.json(
      { error: "Seleziona almeno un pack o una masterclass" },
      { status: 400 },
    );
  }

  const unknown = slugs.filter((slug) => !getProductBySlug(slug));
  if (unknown.length > 0) {
    return NextResponse.json(
      { error: `Prodotto non valido: ${unknown.join(", ")}` },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  const { data: customer } = await admin
    .from("profiles")
    .select("id, email, full_name")
    .eq("id", userId)
    .single();
  if (!customer)
    return NextResponse.json({ error: "Cliente non trovato" }, { status: 404 });

  // Don't hand out a second ticket for something the customer already owns:
  // a duplicate QR would silently double their entry allowance.
  const { data: ownedTickets } = await admin
    .from("tickets")
    .select("course_id, orders!inner(status)")
    .eq("user_id", userId)
    .in("course_id", slugs)
    .neq("orders.status", "cancelled");

  const owned = Array.from(
    new Set((ownedTickets ?? []).map((t) => t.course_id as string)),
  );
  if (owned.length > 0 && !force) {
    return NextResponse.json(
      {
        error: `Il cliente ha già un ticket attivo per: ${owned.join(", ")}.`,
        alreadyOwned: owned,
      },
      { status: 409 },
    );
  }

  const cents =
    typeof amountCents === "number" &&
    Number.isFinite(amountCents) &&
    amountCents > 0
      ? Math.round(amountCents)
      : null;
  const method =
    typeof paymentMethod === "string" && paymentMethod.trim()
      ? paymentMethod.trim().slice(0, 60)
      : null;

  const now = new Date().toISOString();
  const { data: order, error: insertError } = await admin
    .from("orders")
    .insert({
      user_id: userId,
      // Empty (not null) keeps the column's legacy NOT NULL happy for
      // masterclass-only orders; `fulfillOrder` treats it as "no pack".
      pack_id: packSlug,
      selected_workshop_ids: addonSlugs,
      status: "paid",
      payment_plan: "full",
      // Everything collected here is off-Stripe, so it lives in
      // external_payment_cents — amount_cents stays 0 (what Stripe charged).
      amount_cents: 0,
      settled_externally: true,
      fulfilled_at: now,
      external_payment_method: method,
      external_payment_cents: cents,
      billing_name: customer.full_name,
      billing_email: customer.email,
      is_test: process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_") ?? false,
      notes: `Ordine creato manualmente da ${adminProfile.email ?? user.id}`,
    })
    .select("*, profiles(*)")
    .single();

  if (insertError || !order) {
    console.error("Manual order insert error:", insertError);
    return NextResponse.json(
      { error: insertError?.message ?? "Errore creazione ordine" },
      { status: 500 },
    );
  }

  // Email subject/name: the pack when there is one, otherwise the products
  // actually granted (a masterclass-only order has no pack to name).
  const names = slugs.map((slug) => getProductBySlug(slug)?.name ?? slug);
  const emailProductName = packSlug
    ? (getProductBySlug(packSlug)?.name ?? packSlug)
    : names.length === 1
      ? names[0]
      : `${names.length} Masterclass`;

  // No amount recorded → fall back to the list price of what was granted, so
  // the confirmation email never reads "0,00 €" (there's no later edit path).
  const listPriceCents = slugs.reduce(
    (sum, slug) => sum + (getProductBySlug(slug)?.priceCents ?? 0),
    0,
  );

  const { ticketCount, createdCount } = await fulfillOrder(admin, order, {
    addonSlugs,
    sendConfirmationEmail: !silent,
    emailTotalCents: cents ?? listPriceCents,
    emailProductName,
  });

  return NextResponse.json({
    ok: true,
    orderId: order.id,
    ticketCount,
    createdCount,
  });
}
