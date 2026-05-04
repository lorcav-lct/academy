import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { decryptPayload } from "@/lib/qr/encrypt";
import { getProductBySlug } from "@/lib/constants/packs";

type QrPayload = {
  ticketId: string;
  userName: string;
  courseName: string;
  eventDate: string;
  orderId: string;
};

type AccessRule = {
  product_slug: string;
  product_type: "bundle" | "workshop";
  max_entries: number | null;
  active: boolean;
};

function getTicketProductName(slug: string | null | undefined): string {
  if (!slug) return "-";
  return getProductBySlug(slug)?.name ?? slug;
}

function getFallbackLimit(slug: string | null | undefined): number {
  const product = slug ? getProductBySlug(slug) : null;
  return product?.type === "bundle" ? 6 : 1;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // Verify staff/admin role
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || !["admin", "staff"].includes(profile.role)) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
    }

    const { qrData, eventId } = await request.json();
    if (!qrData) {
      return NextResponse.json({ error: "Codice mancante" }, { status: 400 });
    }

    // Accept either a plain ticket UUID or an encrypted QR payload.
    const isUuid = /^[0-9a-f-]{36}$/i.test(qrData.trim());
    let payload: QrPayload | null = null;

    if (!isUuid) {
      try {
        payload = decryptPayload(qrData);
      } catch {
        return NextResponse.json(
          { valid: false, error: "QR code non valido o corrotto" },
          { status: 200 },
        );
      }
    }

    const ticketId = isUuid ? qrData.trim() : payload!.ticketId;

    // Verify ticket exists and is not used
    const { data: ticket } = await supabase
      .from("tickets")
      .select("*, orders(*)")
      .eq("id", ticketId)
      .single();

    if (!ticket) {
      return NextResponse.json(
        { valid: false, error: "Ticket non trovato" },
        { status: 200 },
      );
    }

    if (ticket.orders?.status !== "paid") {
      return NextResponse.json(
        { valid: false, error: "Ordine non pagato" },
        { status: 200 },
      );
    }

    const ticketName =
      payload?.courseName || getTicketProductName(ticket.course_id);
    const productSlug = (ticket.course_id as string | null) ?? "";

    const { data: accessRuleData } = productSlug
      ? await supabase
          .from("product_access_rules")
          .select("product_slug, product_type, max_entries, active")
          .eq("product_slug", productSlug)
          .maybeSingle()
      : { data: null };

    const accessRule = accessRuleData as unknown as AccessRule | null;
    const maxEntries = accessRule?.max_entries ?? getFallbackLimit(productSlug);

    if (accessRule && !accessRule.active) {
      return NextResponse.json(
        { valid: false, error: "Accesso disattivato per questo prodotto" },
        { status: 200 },
      );
    }

    const { count: usedEntries } = await supabase
      .from("ticket_checkins")
      .select("id", { count: "exact", head: true })
      .eq("ticket_id", ticket.id);

    const used = usedEntries ?? 0;

    if (maxEntries !== null && used >= maxEntries) {
      return NextResponse.json(
        {
          valid: false,
          error: "Ingressi terminati",
          ticket: {
            id: ticket.id,
            userName: payload?.userName || ticket.user_id,
            courseName: ticketName,
            eventDate: payload?.eventDate || "",
            orderId: payload?.orderId || ticket.order_id,
            usedEntries: used,
            maxEntries,
            remainingEntries: 0,
          },
        },
        { status: 200 },
      );
    }

    // Check if already checked in for this event
    if (eventId) {
      const { data: existing } = await supabase
        .from("ticket_checkins")
        .select("id")
        .eq("ticket_id", ticket.id)
        .eq("event_id", eventId)
        .single();

      if (existing) {
        return NextResponse.json(
          {
            valid: false,
            error: "Gia registrato per questo evento",
            ticket: {
              userName: payload?.userName || ticket.user_id,
              courseName: ticketName,
              checkedInAt: existing,
              usedEntries: used,
              maxEntries,
              remainingEntries:
                maxEntries === null ? null : Math.max(0, maxEntries - used),
            },
          },
          { status: 200 },
        );
      }
    }

    const { error: checkinError } = await supabase.from("ticket_checkins").insert({
      ticket_id: ticket.id,
      product_slug: productSlug || ticketName,
      scanned_by: user.id,
      event_id: eventId || null,
    });

    if (checkinError) {
      return NextResponse.json(
        { valid: false, error: "Check-in non registrato" },
        { status: 200 },
      );
    }

    const nextUsed = used + 1;
    const remainingEntries =
      maxEntries === null ? null : Math.max(0, maxEntries - nextUsed);

    if (maxEntries !== null && nextUsed >= maxEntries) {
      await supabase.from("tickets").update({ is_used: true }).eq("id", ticket.id);
    }

    return NextResponse.json({
      valid: true,
      ticket: {
        id: ticket.id,
        userName: payload?.userName || ticket.user_id,
        courseName: ticketName,
        eventDate: payload?.eventDate || "",
        orderId: payload?.orderId || ticket.order_id,
        usedEntries: nextUsed,
        maxEntries,
        remainingEntries,
      },
    });
  } catch (error) {
    console.error("QR validation error:", error);
    return NextResponse.json({ error: "Errore validazione" }, { status: 500 });
  }
}
