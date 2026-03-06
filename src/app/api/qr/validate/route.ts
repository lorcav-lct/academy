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
      return NextResponse.json(
        { error: "QR code mancante" },
        { status: 400 }
      );
    }

    // Decrypt QR payload
    let payload;
    try {
      payload = decryptPayload(qrData);
    } catch {
      return NextResponse.json(
        { valid: false, error: "QR code non valido o corrotto" },
        { status: 200 }
      );
    }

    // Verify ticket exists and is not used
    const { data: ticket } = await supabase
      .from("tickets")
      .select("*, orders(*), courses(*)")
      .eq("id", payload.ticketId)
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
              userName: payload.userName,
              courseName: payload.courseName,
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
        userName: payload.userName,
        courseName: payload.courseName,
        eventDate: payload.eventDate,
        orderId: payload.orderId,
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
