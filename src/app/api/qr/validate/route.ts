import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { decryptPayload } from "@/lib/qr/encrypt";

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

    // Accept either a plain ticket UUID or an encrypted QR payload
    const isUuid = /^[0-9a-f-]{36}$/i.test(qrData.trim());
    let payload: { ticketId: string; userName: string; courseName: string; eventDate: string; orderId: string } | null = null;

    if (!isUuid) {
      try {
        payload = decryptPayload(qrData);
      } catch {
        return NextResponse.json(
          { valid: false, error: "QR code non valido o corrotto" },
          { status: 200 }
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
        { status: 200 }
      );
    }

    if (ticket.orders?.status !== "paid") {
      return NextResponse.json(
        { valid: false, error: "Ordine non pagato" },
        { status: 200 }
      );
    }

    // Check if already checked in for this event
    if (eventId) {
      const { data: existing } = await supabase
        .from("attendance")
        .select("id")
        .eq("ticket_id", ticket.id)
        .eq("calendar_event_id", eventId)
        .single();

      if (existing) {
        return NextResponse.json(
          {
            valid: false,
            error: "Gia registrato per questo evento",
            ticket: {
              userName: payload?.userName || ticket.user_id,
              courseName: payload?.courseName || (ticket.course_id as string) || "—",
              checkedInAt: existing,
            },
          },
          { status: 200 }
        );
      }

      // Record attendance
      await supabase.from("attendance").insert({
        ticket_id: ticket.id,
        calendar_event_id: eventId,
        checked_in_by: user.id,
      });
    }

    return NextResponse.json({
      valid: true,
      ticket: {
        id: ticket.id,
        userName: payload?.userName || ticket.user_id,
        courseName: payload?.courseName || (ticket.course_id as string) || "—",
        eventDate: payload?.eventDate || "",
        orderId: payload?.orderId || ticket.order_id,
      },
    });
  } catch (error) {
    console.error("QR validation error:", error);
    return NextResponse.json(
      { error: "Errore validazione" },
      { status: 500 }
    );
  }
}
