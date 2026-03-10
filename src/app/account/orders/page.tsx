"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { SectionContainer } from "@/components/shared/section-container";
import { GradientText } from "@/components/shared/gradient-text";

async function resumeCheckout(orderId: string): Promise<void> {
  const res = await fetch("/api/checkout/resume", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId }),
  });
  const data = await res.json();
  if (data.url) window.location.href = data.url;
}

interface Order {
  id: string;
  status: string;
  amount_cents: number;
  created_at: string;
  pack_id: string | null;
}

interface TicketRef {
  id: string;
  order_id: string;
  is_used: boolean;
}

const statusLabels: Record<string, string> = {
  pending: "In Attesa",
  paid: "Pagato",
  cancelled: "Annullato",
  refunded: "Rimborsato",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-400/10 text-yellow-400",
  paid: "bg-green-400/10 text-green-400",
  cancelled: "bg-red-400/10 text-red-400",
  refunded: "bg-academy-gray-400/10 text-academy-gray-400",
};

export default function AccountOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [ticketMap, setTicketMap] = useState<Record<string, TicketRef>>({});
  const [loading, setLoading] = useState(true);
  const [resuming, setResuming] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: ordersData }, { data: ticketsData }] = await Promise.all([
        supabase
          .from("orders")
          .select("id, status, amount_cents, created_at, pack_id")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("tickets")
          .select("id, order_id, is_used")
          .eq("user_id", user.id),
      ]);

      if (ordersData) setOrders(ordersData as unknown as Order[]);
      if (ticketsData) {
        const map: Record<string, TicketRef> = {};
        (ticketsData as unknown as TicketRef[]).forEach((t) => {
          map[t.order_id] = t;
        });
        setTicketMap(map);
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

  return (
    <section className="min-h-screen pt-32 pb-16">
      <SectionContainer>
        <div className="mb-8">
          <Link
            href="/account"
            className="mb-2 inline-flex items-center gap-1 text-xs text-academy-gray-500 hover:text-academy-orange"
          >
            ← Il mio account
          </Link>
          <h1 className="text-3xl font-black">
            I Miei <GradientText>Ordini</GradientText>
          </h1>
        </div>

        {orders.length === 0 ? (
          <div className="card-squared p-12 text-center">
            <p className="mb-2 text-lg font-semibold text-academy-gray-300">
              Nessun ordine ancora
            </p>
            <p className="mb-6 text-sm text-academy-gray-500">
              Acquista un pack per iniziare il tuo percorso.
            </p>
            <Link
              href="/pack"
              className="inline-block bg-academy-orange px-6 py-3 text-sm font-bold text-academy-dark transition-all hover:brightness-110"
            >
              Scopri i Pack
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const ticket = ticketMap[order.id];
              return (
                <div key={order.id} className="card-squared p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-academy-gray-100">
                        {order.pack_id?.toUpperCase() || "Prodotto"}
                      </p>
                      <p className="mt-0.5 font-mono text-[10px] text-academy-gray-600">
                        #{order.id.slice(0, 8)}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ${statusColors[order.status]}`}
                    >
                      {statusLabels[order.status]}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-bold text-academy-orange">
                        {order.amount_cents > 0
                          ? new Intl.NumberFormat("it-IT", {
                              style: "currency",
                              currency: "EUR",
                            }).format(order.amount_cents / 100)
                          : "—"}
                      </span>
                      <span className="text-xs text-academy-gray-500">
                        {new Date(order.created_at).toLocaleDateString("it-IT")}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {order.status === "pending" && order.pack_id && (
                        <button
                          disabled={resuming === order.id}
                          onClick={async () => {
                            setResuming(order.id);
                            await resumeCheckout(order.id);
                            setResuming(null);
                          }}
                          className="border border-academy-orange/30 bg-academy-orange/10 px-4 py-2 text-xs font-bold text-academy-orange transition-all hover:bg-academy-orange/20 disabled:opacity-50"
                        >
                          {resuming === order.id ? "..." : "Riprendi Pagamento"}
                        </button>
                      )}
                      {ticket && order.status === "paid" && (
                        <Link
                          href="/account/tickets"
                          className={`border px-4 py-2 text-xs font-bold transition-all ${
                            ticket.is_used
                              ? "border-academy-gray-600/30 text-academy-gray-500"
                              : "border-green-500/30 bg-green-500/5 text-green-400 hover:bg-green-500/10"
                          }`}
                        >
                          {ticket.is_used ? "Ticket Usato" : "Vedi Ticket"}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionContainer>
    </section>
  );
}
