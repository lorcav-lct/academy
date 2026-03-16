"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ticketMap, setTicketMap] = useState<Record<string, TicketRef>>({});
  const [loading, setLoading] = useState(true);
  const [resuming, setResuming] = useState<string | null>(null);

  // Edit profile state
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [emailMsg, setEmailMsg] = useState("");

  async function handleResume(orderId: string) {
    setResuming(orderId);
    const res = await fetch("/api/checkout/resume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    setResuming(null);
  }

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // After email confirmation, redirect to any pending checkout
      const pendingCheckout = localStorage.getItem("pending_checkout");
      if (pendingCheckout) {
        localStorage.removeItem("pending_checkout");
        router.push(pendingCheckout);
        return;
      }

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

      // Always use auth email as source of truth (profiles.email can be stale after email change)
      const p: Profile = {
        full_name: profileData?.full_name || (user.user_metadata?.full_name as string) || "",
        email: user.email || profileData?.email || "",
        phone: profileData?.phone || (user.user_metadata?.phone as string) || "",
      };
      setProfile(p);
      setEditName(p.full_name);
      setEditPhone(p.phone || "");
      setEditEmail(p.email || "");

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
  }, [router]);

  async function handleSaveProfile() {
    setSaving(true);
    setSaveMsg("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("profiles")
      .update({ full_name: editName.trim(), phone: editPhone.trim() })
      .eq("id", user.id);

    setProfile((p) => p ? { ...p, full_name: editName.trim(), phone: editPhone.trim() } : p);
    setSaveMsg("Salvato.");
    setSaving(false);
    setEditing(false);
    setTimeout(() => setSaveMsg(""), 3000);
  }

  async function handleEmailChange() {
    if (!editEmail.trim() || editEmail === profile?.email) return;
    setEmailMsg("");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ email: editEmail.trim() });
    if (error) {
      setEmailMsg("Errore: " + error.message);
    } else {
      setEmailMsg("Controlla la tua email per confermare il cambio indirizzo.");
    }
  }

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
    <section className="min-h-screen pt-32 pb-16">
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
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xs font-bold tracking-[0.2em] text-academy-orange uppercase">
                Profilo
              </h2>
              <button
                onClick={() => { setEditing((v) => !v); setSaveMsg(""); setEmailMsg(""); }}
                className="text-xs font-semibold text-academy-gray-400 hover:text-academy-orange transition-colors"
              >
                {editing ? "Annulla" : "Modifica"}
              </button>
            </div>

            {!editing ? (
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
                {saveMsg && (
                  <p className="text-xs text-green-400">{saveMsg}</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="mb-1 block text-xs text-academy-gray-500">Nome</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full border border-academy-orange/20 bg-academy-navy/50 px-3 py-2 text-sm text-academy-gray-100 outline-none focus:border-academy-orange/50"
                  />
                </div>
                {/* Phone */}
                <div>
                  <label className="mb-1 block text-xs text-academy-gray-500">Telefono</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full border border-academy-orange/20 bg-academy-navy/50 px-3 py-2 text-sm text-academy-gray-100 outline-none focus:border-academy-orange/50"
                    placeholder="+39 333 1234567"
                  />
                </div>
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="w-full bg-academy-orange py-2 text-xs font-bold text-academy-dark transition-all hover:brightness-110 disabled:opacity-50"
                >
                  {saving ? "Salvataggio..." : "Salva"}
                </button>

                {/* Email change — separate flow */}
                <div className="border-t border-white/5 pt-4">
                  <label className="mb-1 block text-xs text-academy-gray-500">
                    Nuova Email
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="min-w-0 flex-1 border border-academy-orange/20 bg-academy-navy/50 px-3 py-2 text-sm text-academy-gray-100 outline-none focus:border-academy-orange/50"
                      placeholder={profile?.email}
                    />
                    <button
                      onClick={handleEmailChange}
                      className="shrink-0 border border-academy-orange/30 px-3 py-2 text-xs font-bold text-academy-orange hover:bg-academy-orange/10"
                    >
                      Cambia
                    </button>
                  </div>
                  <p className="mt-1 text-[12px] text-academy-gray-500">
                    Riceverai una conferma via email.
                  </p>
                  {emailMsg && (
                    <p className={`mt-1 text-xs ${emailMsg.startsWith("Errore") ? "text-red-400" : "text-green-400"}`}>
                      {emailMsg}
                    </p>
                  )}
                </div>
              </div>
            )}
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
                            <button
                              disabled={resuming === order.id}
                              onClick={() => handleResume(order.id)}
                              className="text-[12px] font-bold tracking-wider text-academy-orange uppercase hover:underline disabled:opacity-50"
                            >
                              {resuming === order.id ? "..." : "Riprendi Pagamento →"}
                            </button>
                          )}
                          {ticket && order.status === "paid" && (
                            <Link
                              href="/account/tickets"
                              className="text-[12px] font-bold tracking-wider text-green-400 uppercase hover:underline"
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
