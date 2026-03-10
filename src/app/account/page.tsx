"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { SectionContainer } from "@/components/shared/section-container";
import { GradientText } from "@/components/shared/gradient-text";

interface Profile {
  full_name: string;
  email: string;
  phone: string;
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

export default function AccountPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ticketMap, setTicketMap] = useState<Record<string, TicketRef>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: profileData }, { data: ordersData }, { data: ticketsData }] =
        await Promise.all([
          supabase
            .from("profiles")
            .select("full_name, email, phone")
            .eq("id", user.id)
            .single(),
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

      if (profileData) {
        setProfile(profileData);
      } else {
        setProfile({
          full_name: (user.user_metadata?.full_name as string) || "",
          email: user.email || "",
          phone: (user.user_metadata?.phone as string) || "",
        });
      }
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

  const statusLabels: Record<string, string> = {
    pending: "In Attesa",
    paid: "Pagato",
    cancelled: "Annullato",
    refunded: "Rimborsato",
  };

  const statusColors: Record<string, string> = {
    pending: "text-yellow-400",
    paid: "text-green-400",
    cancelled: "text-red-400",
    refunded: "text-academy-gray-400",
  };

  return (
    <section className="min-h-screen pt-32">
      <SectionContainer>
        <div className="mb-12">
          <h1 className="mb-2 text-3xl font-black">
            Ciao, <GradientText>{profile?.full_name || "Studente"}</GradientText>
          </h1>
          <p className="text-academy-gray-400">
            Gestisci il tuo account e visualizza i tuoi ordini.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Profile card */}
          <div className="card-squared p-8">
            <h2 className="mb-4 text-xs font-bold tracking-[0.2em] text-academy-orange uppercase">
              Profilo
            </h2>
            <div className="space-y-3">
              <div>
                <span className="text-xs text-academy-gray-500">Nome</span>
                <p className="font-semibold">{profile?.full_name}</p>
              </div>
              <div>
                <span className="text-xs text-academy-gray-500">Email</span>
                <p className="font-semibold">{profile?.email}</p>
              </div>
              {profile?.phone && (
                <div>
                  <span className="text-xs text-academy-gray-500">Telefono</span>
                  <p className="font-semibold">{profile.phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick links */}
          <div className="card-squared p-8">
            <h2 className="mb-4 text-xs font-bold tracking-[0.2em] text-academy-orange uppercase">
              Azioni Rapide
            </h2>
            <div className="space-y-3">
              <Link
                href="/account/tickets"
                className="flex items-center justify-between border border-academy-orange/10 bg-academy-navy/30 p-4 transition-all hover:border-academy-orange/30"
              >
                <span className="font-semibold">I Miei Ticket</span>
                <span className="text-academy-orange">→</span>
              </Link>
              <Link
                href="/pack"
                className="flex items-center justify-between border border-academy-orange/10 bg-academy-navy/30 p-4 transition-all hover:border-academy-orange/30"
              >
                <span className="font-semibold">Acquista un Pack</span>
                <span className="text-academy-orange">→</span>
              </Link>
            </div>
          </div>

          {/* Orders summary */}
          <div className="card-squared p-8">
            <h2 className="mb-4 text-xs font-bold tracking-[0.2em] text-academy-orange uppercase">
              Ordini Recenti
            </h2>
            {orders.length === 0 ? (
              <p className="text-sm text-academy-gray-500">Nessun ordine ancora.</p>
            ) : (
              <>
                <div className="space-y-3">
                  {orders.slice(0, 3).map((order) => {
                    const ticket = ticketMap[order.id];
                    return (
                      <div
                        key={order.id}
                        className="border border-white/5 bg-academy-navy/20 p-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold">
                            {order.pack_id?.toUpperCase() || "Prodotto"}
                          </span>
                          <span className={`text-xs font-bold ${statusColors[order.status]}`}>
                            {statusLabels[order.status]}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-academy-gray-500">
                          {new Date(order.created_at).toLocaleDateString("it-IT")}
                        </p>
                        <div className="mt-2 flex gap-2">
                          {order.status === "pending" && order.pack_id && (
                            <Link
                              href={`/checkout?pack=${order.pack_id}`}
                              className="text-[10px] font-bold tracking-wider text-academy-orange uppercase hover:underline"
                            >
                              Riprendi Pagamento →
                            </Link>
                          )}
                          {ticket && order.status === "paid" && (
                            <Link
                              href="/account/tickets"
                              className="text-[10px] font-bold tracking-wider text-green-400 uppercase hover:underline"
                            >
                              Vedi Ticket →
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {orders.length > 0 && (
                  <Link
                    href="/account/orders"
                    className="mt-4 flex items-center justify-end gap-1 text-xs font-semibold text-academy-orange hover:underline"
                  >
                    Vedi tutti ({orders.length}) →
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </SectionContainer>
    </section>
  );
}
