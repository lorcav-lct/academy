"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { SectionContainer } from "@/components/shared/section-container";
import { GradientText } from "@/components/shared/gradient-text";

interface Ticket {
  id: string;
  qr_image_url: string;
  is_used: boolean;
  courses: { title: string; type: string } | null;
  orders: { status: string } | null;
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
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
        .select("id, qr_image_url, is_used, courses(title, type), orders(status)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) setTickets(data as unknown as Ticket[]);
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

        {tickets.length === 0 ? (
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
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className={`card-squared overflow-hidden transition-all ${
                  ticket.is_used ? "opacity-60" : "hover:glow-orange"
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/5 p-4">
                  <h3 className="font-bold text-academy-gray-100">
                    {ticket.courses?.title || "Corso"}
                  </h3>
                  <span
                    className={`text-[10px] font-bold tracking-wider uppercase ${
                      ticket.is_used ? "text-academy-gray-500" : "text-green-400"
                    }`}
                  >
                    {ticket.is_used ? "Utilizzato" : "Valido"}
                  </span>
                </div>

                {/* QR Code */}
                <div className="flex items-center justify-center bg-academy-darker/50 p-8">
                  {ticket.qr_image_url ? (
                    <Image
                      src={ticket.qr_image_url}
                      alt={`QR ${ticket.courses?.title}`}
                      width={200}
                      height={200}
                      className="h-auto w-48"
                    />
                  ) : (
                    <div className="flex h-48 w-48 items-center justify-center bg-academy-navy/50 text-sm text-academy-gray-500">
                      QR Code
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-4">
                  <p className="text-xs text-academy-gray-500">
                    ID: {ticket.id.slice(0, 8)}...
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
