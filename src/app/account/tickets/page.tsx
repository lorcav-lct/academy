"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SectionContainer } from "@/components/shared/section-container";
import { GradientText } from "@/components/shared/gradient-text";
import QRCode from "qrcode";

interface Ticket {
  id: string;
  is_used: boolean;
  course_id: string | null;
  orders: { status: string } | null;
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [qrMap, setQrMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("tickets")
        .select("id, is_used, course_id, orders(status)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) {
        const list = data as unknown as Ticket[];
        setTickets(list);

        // Generate QR codes client-side from ticket UUID
        const map: Record<string, string> = {};
        await Promise.all(
          list.map(async (t) => {
            map[t.id] = await QRCode.toDataURL(t.id, {
              width: 200,
              margin: 1,
              color: { dark: "#000000", light: "#ffffff" },
            });
          })
        );
        setQrMap(map);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <section className="flex min-h-screen items-center pt-24">
        <SectionContainer>
          <div className="text-center text-academy-gray-400">Caricamento...</div>
        </SectionContainer>
      </section>
    );
  }

  // Only show tickets from paid orders
  const validTickets = tickets.filter((t) => t.orders?.status === "paid");

  return (
    <section className="min-h-screen pt-32">
      <SectionContainer>
        <div className="mb-12">
          <h1 className="mb-2 text-3xl font-black">
            I Miei <GradientText>Ticket</GradientText>
          </h1>
          <p className="text-academy-gray-400">
            Presenta il QR code al check-in per accedere ai corsi e workshop.
          </p>
        </div>

        {validTickets.length === 0 ? (
          <div className="card-squared p-12 text-center">
            <p className="mb-2 text-lg font-semibold text-academy-gray-300">
              Nessun ticket ancora
            </p>
            <p className="text-sm text-academy-gray-500">
              Acquista un pack per ricevere i tuoi ticket con QR code.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {validTickets.map((ticket) => (
              <div
                key={ticket.id}
                className={`card-squared overflow-hidden transition-all ${
                  ticket.is_used ? "opacity-60" : "hover:glow-orange"
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/5 p-4">
                  <h3 className="font-bold text-academy-gray-100">
                    {ticket.course_id?.toUpperCase() || "Corso"}
                  </h3>
                  <span
                    className={`text-[12px] font-bold tracking-wider uppercase ${
                      ticket.is_used ? "text-academy-gray-500" : "text-green-400"
                    }`}
                  >
                    {ticket.is_used ? "Utilizzato" : "Valido"}
                  </span>
                </div>

                {/* QR Code — generato lato client dall'UUID del ticket */}
                <div className="flex items-center justify-center bg-white p-6">
                  {qrMap[ticket.id] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={qrMap[ticket.id]}
                      alt={`QR ${ticket.course_id}`}
                      className="h-auto w-48"
                    />
                  ) : (
                    <div className="flex h-48 w-48 items-center justify-center bg-gray-100 text-sm text-gray-400">
                      ...
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-4">
                  <p className="mb-1 text-[12px] font-semibold tracking-wider text-academy-gray-500 uppercase">
                    Codice Ticket
                  </p>
                  <p
                    className="cursor-pointer font-mono text-xs text-academy-gray-400 transition-colors hover:text-academy-orange"
                    onClick={() => navigator.clipboard?.writeText(ticket.id)}
                    title="Tocca per copiare"
                  >
                    {ticket.id}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionContainer>
    </section>
  );
}
