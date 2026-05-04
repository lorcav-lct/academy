"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GradientText } from "@/components/shared/gradient-text";
import {
  formatEUR,
  formatDateShort,
  getProductLabel,
  getProductSubtitle,
  getCourseLabel,
  getNextCourseDate,
  greeting,
  ORDER_STATUS_LABEL,
  ORDER_STATUS_TONE,
} from "@/lib/utils/account";
import {
  IconArrowRight,
  IconBag,
  IconTicket,
  IconEuro,
  IconCalendar,
  IconEdit,
  IconCheck,
  IconClock,
  IconSpark,
} from "./_components/icons";

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
  course_id: string | null;
}

export default function AccountPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tickets, setTickets] = useState<TicketRef[]>([]);
  const [loading, setLoading] = useState(true);
  const [resuming, setResuming] = useState<string | null>(null);

  // Edit profile
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [emailMsg, setEmailMsg] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const pendingCheckout = localStorage.getItem("pending_checkout");
      if (pendingCheckout) {
        localStorage.removeItem("pending_checkout");
        router.push(pendingCheckout);
        return;
      }

      const [
        { data: profileData },
        { data: ordersData },
        { data: ticketsData },
      ] = await Promise.all([
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
          .select("id, order_id, is_used, course_id")
          .eq("user_id", user.id),
      ]);

      const p: Profile = {
        full_name:
          profileData?.full_name ||
          (user.user_metadata?.full_name as string) ||
          "",
        email: user.email || profileData?.email || "",
        phone:
          profileData?.phone || (user.user_metadata?.phone as string) || "",
      };
      setProfile(p);
      setEditName(p.full_name);
      setEditPhone(p.phone || "");
      setEditEmail(p.email || "");

      if (ordersData) setOrders(ordersData as unknown as Order[]);
      if (ticketsData) setTickets(ticketsData as unknown as TicketRef[]);
      setLoading(false);
    }
    load();
  }, [router]);

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

  async function handleSaveProfile() {
    setSaving(true);
    setSaveMsg("");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("profiles")
      .update({ full_name: editName.trim(), phone: editPhone.trim() })
      .eq("id", user.id);

    setProfile((p) =>
      p ? { ...p, full_name: editName.trim(), phone: editPhone.trim() } : p,
    );
    setSaveMsg("Profilo aggiornato.");
    setSaving(false);
    setEditing(false);
    setTimeout(() => setSaveMsg(""), 3000);
  }

  async function handleEmailChange() {
    if (!editEmail.trim() || editEmail === profile?.email) return;
    setEmailMsg("");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      email: editEmail.trim(),
    });
    if (error) {
      setEmailMsg("Errore: " + error.message);
    } else {
      setEmailMsg("Controlla la casella per confermare il nuovo indirizzo.");
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="animate-pulse text-sm tracking-wider text-academy-gray-500 uppercase">
          Caricamento dashboard...
        </div>
      </div>
    );
  }

  const paidOrders = orders.filter((o) => o.status === "paid");
  const pendingOrders = orders.filter((o) => o.status === "pending");
  const activeTickets = tickets.filter((t) => !t.is_used);
  const totalSpent = paidOrders.reduce((s, o) => s + (o.amount_cents || 0), 0);

  const ticketsByOrder = tickets.reduce<Record<string, TicketRef[]>>(
    (acc, t) => {
      if (!acc[t.order_id]) acc[t.order_id] = [];
      acc[t.order_id].push(t);
      return acc;
    },
    {},
  );

  const courseSlugs = activeTickets
    .map((t) => t.course_id)
    .filter((s): s is string => Boolean(s));
  const nextCourse = getNextCourseDate(courseSlugs);

  const firstName = (profile?.full_name || "").split(" ")[0] || "Studente";

  return (
    <div className="max-w-full min-w-0 space-y-6 overflow-x-clip lg:space-y-8">
      {/* ─── Hero ─── */}
      <header className="flex min-w-0 flex-wrap items-end justify-between gap-4">
        <div className="min-w-0 max-w-full">
          <p className="mb-2 text-[11px] font-bold tracking-[0.3em] text-academy-orange uppercase">
            Area riservata
          </p>
          <h1 className="max-w-full text-3xl font-black break-words text-academy-gray-800 md:text-4xl">
            {greeting()}, <GradientText>{firstName}</GradientText>
          </h1>
          <p className="mt-2 max-w-md text-sm text-academy-gray-500">
            Da qui gestisci profilo, ordini e ticket QR per l&apos;accesso ai
            corsi.
          </p>
        </div>

        {pendingOrders.length > 0 && (
          <div className="flex items-center gap-2 border border-amber-500/30 bg-amber-50 px-4 py-2.5">
            <IconClock className="h-4 w-4 text-amber-600" />
            <span className="text-xs font-bold tracking-wider text-amber-700 uppercase">
              {pendingOrders.length} ordin
              {pendingOrders.length === 1 ? "e" : "i"} in attesa
            </span>
          </div>
        )}
      </header>

      {/* ─── Bento mobile shortcuts ─── */}
      <section className="grid min-w-0 grid-cols-2 gap-3 lg:hidden">
        <BentoLink
          href="/account/orders"
          icon={<IconBag className="h-6 w-6" />}
          title="Ordini"
          value={orders.length}
          hint={
            pendingOrders.length > 0
              ? `${pendingOrders.length} in attesa`
              : "Storico acquisti"
          }
          highlight={pendingOrders.length > 0}
        />
        <BentoLink
          href="/account/tickets"
          icon={<IconTicket className="h-6 w-6" />}
          title="Ticket"
          value={activeTickets.length}
          hint={activeTickets.length > 0 ? "QR pronti" : "Nessuno attivo"}
        />
      </section>

      {/* ─── Stats grid ─── */}
      <section className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<IconBag className="h-5 w-5" />}
          label="Ordini totali"
          value={orders.length.toString()}
          hint={`${paidOrders.length} pagati`}
        />
        <StatCard
          icon={<IconTicket className="h-5 w-5" />}
          label="Ticket attivi"
          value={activeTickets.length.toString()}
          hint={`${tickets.length - activeTickets.length} usati`}
        />
        <StatCard
          icon={<IconEuro className="h-5 w-5" />}
          label="Investito"
          value={totalSpent > 0 ? formatEUR(totalSpent) : "—"}
          hint="su corsi & masterclass"
        />
        <StatCard
          icon={<IconCalendar className="h-5 w-5" />}
          label="Prossima data"
          value={nextCourse?.date || "—"}
          hint={nextCourse ? nextCourse.course : "Nessuna programmata"}
          accent={!!nextCourse}
        />
      </section>

      {/* ─── Main grid ─── */}
      <div className="grid min-w-0 gap-5 lg:grid-cols-3">
        {/* Profile */}
        <section className="min-w-0 max-w-full overflow-hidden border border-black/[0.08] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] lg:col-span-1">
          <div className="flex min-w-0 items-center justify-between gap-3 border-b border-black/[0.06] px-5 py-4 sm:px-6">
            <h2 className="text-[11px] font-bold tracking-[0.25em] text-academy-gray-700 uppercase">
              Profilo
            </h2>
            <button
              onClick={() => {
                setEditing((v) => !v);
                setSaveMsg("");
                setEmailMsg("");
              }}
              className="flex items-center gap-1.5 text-[12px] font-bold tracking-wider text-academy-gray-500 uppercase transition-colors hover:text-academy-orange"
            >
              {editing ? (
                "Annulla"
              ) : (
                <>
                  <IconEdit className="h-3.5 w-3.5" />
                  Modifica
                </>
              )}
            </button>
          </div>

          <div className="min-w-0 space-y-4 p-5 sm:p-6">
            {!editing ? (
              <>
                <Field label="Nome" value={profile?.full_name || "—"} />
                <Field label="Email" value={profile?.email || "—"} />
                <Field
                  label="Telefono"
                  value={profile?.phone || "Non impostato"}
                />
                {saveMsg && (
                  <p className="flex items-center gap-1.5 text-xs text-emerald-600">
                    <IconCheck className="h-3.5 w-3.5" />
                    {saveMsg}
                  </p>
                )}
              </>
            ) : (
              <>
                <InputField
                  label="Nome"
                  value={editName}
                  onChange={setEditName}
                />
                <InputField
                  label="Telefono"
                  type="tel"
                  value={editPhone}
                  onChange={setEditPhone}
                  placeholder="+39 333 1234567"
                />
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="w-full bg-academy-orange py-2.5 text-xs font-bold tracking-wider text-white uppercase transition-all hover:brightness-110 disabled:opacity-50"
                >
                  {saving ? "Salvataggio..." : "Salva modifiche"}
                </button>

                <div className="border-t border-black/[0.06] pt-4">
                  <label className="mb-1.5 block text-[11px] font-bold tracking-[0.2em] text-academy-gray-500 uppercase">
                    Cambia email
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="min-w-0 flex-1 border border-black/[0.1] bg-white px-3 py-2 text-sm text-academy-gray-800 outline-none transition-colors focus:border-academy-orange/50"
                      placeholder={profile?.email}
                    />
                    <button
                      onClick={handleEmailChange}
                      className="shrink-0 border border-academy-orange/40 bg-academy-orange/5 px-3 py-2 text-[11px] font-bold tracking-wider text-academy-orange uppercase hover:bg-academy-orange/10"
                    >
                      Cambia
                    </button>
                  </div>
                  <p className="mt-1.5 text-[11px] text-academy-gray-500">
                    Riceverai un&apos;email di conferma all&apos;indirizzo
                    nuovo.
                  </p>
                  {emailMsg && (
                    <p
                      className={`mt-2 text-xs ${
                        emailMsg.startsWith("Errore")
                          ? "text-red-600"
                          : "text-emerald-600"
                      }`}
                    >
                      {emailMsg}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </section>

        {/* Recent orders */}
        <section className="min-w-0 max-w-full overflow-hidden border border-black/[0.08] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] lg:col-span-2">
          <div className="flex min-w-0 items-center justify-between gap-3 border-b border-black/[0.06] px-5 py-4 sm:px-6">
            <h2 className="text-[11px] font-bold tracking-[0.25em] text-academy-gray-700 uppercase">
              Ordini recenti
            </h2>
            {orders.length > 3 && (
              <Link
                href="/account/orders"
                className="flex items-center gap-1 text-[12px] font-bold tracking-wider text-academy-orange uppercase hover:underline"
              >
                Tutti ({orders.length})
                <IconArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>

          {orders.length === 0 ? (
            <EmptyState
              icon={<IconBag className="h-10 w-10" />}
              title="Nessun ordine"
              description="Acquista un pack o una masterclass per iniziare il percorso."
              ctaLabel="Esplora i Pack"
              ctaHref="/pack"
            />
          ) : (
            <ul className="divide-y divide-black/[0.06]">
              {orders.slice(0, 4).map((order) => {
                const tone = ORDER_STATUS_TONE[order.status];
                const ticketsForOrder = ticketsByOrder[order.id] || [];
                return (
                  <li
                    key={order.id}
                  className="flex min-w-0 flex-wrap items-center gap-4 px-5 py-4 transition-colors hover:bg-black/[0.015] sm:px-6"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-bold text-academy-gray-800">
                          {getProductLabel(order.pack_id)}
                        </p>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${tone.bg} ${tone.text}`}
                        >
                          <span className={`h-1.5 w-1.5 ${tone.dot}`} />
                          {ORDER_STATUS_LABEL[order.status]}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-[12px] text-academy-gray-500">
                        {getProductSubtitle(order.pack_id) ||
                          `Ordine #${order.id.slice(0, 8)}`}
                      </p>
                    </div>

                    <div className="min-w-0 flex flex-col items-end gap-1 text-right">
                      <span className="text-sm font-bold text-academy-gray-800 tabular-nums">
                        {order.amount_cents > 0
                          ? formatEUR(order.amount_cents)
                          : "—"}
                      </span>
                      <span className="text-[11px] text-academy-gray-500 tabular-nums">
                        {formatDateShort(order.created_at)}
                      </span>
                    </div>

                    <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
                      {order.status === "pending" && order.pack_id && (
                        <button
                          disabled={resuming === order.id}
                          onClick={() => handleResume(order.id)}
                          className="border border-academy-orange/40 bg-academy-orange/10 px-3 py-1.5 text-[11px] font-bold tracking-wider text-academy-orange uppercase transition-all hover:bg-academy-orange/20 disabled:opacity-50"
                        >
                          {resuming === order.id ? "..." : "Paga ora"}
                        </button>
                      )}
                      {order.status === "paid" &&
                        ticketsForOrder.length > 0 && (
                          <Link
                            href="/account/tickets"
                            className="flex items-center gap-1 border border-emerald-500/30 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold tracking-wider text-emerald-700 uppercase transition-all hover:bg-emerald-100"
                          >
                            <IconTicket className="h-3 w-3" />
                            Ticket
                          </Link>
                        )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {/* ─── Active tickets quick view ─── */}
      {activeTickets.length > 0 && (
        <section className="min-w-0 max-w-full overflow-hidden border border-black/[0.08] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <div className="flex min-w-0 items-center justify-between gap-3 border-b border-black/[0.06] px-5 py-4 sm:px-6">
            <h2 className="text-[11px] font-bold tracking-[0.25em] text-academy-gray-700 uppercase">
              Ticket attivi
            </h2>
            <Link
              href="/account/tickets"
              className="flex items-center gap-1 text-[12px] font-bold tracking-wider text-academy-orange uppercase hover:underline"
            >
              Mostra QR
              <IconArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <ul className="grid min-w-0 divide-y divide-black/[0.06] sm:grid-cols-2 sm:divide-y-0 sm:divide-x lg:grid-cols-3 lg:divide-x">
            {activeTickets.slice(0, 6).map((t) => (
              <li
                key={t.id}
                className="flex items-center gap-3 p-5 sm:[&:nth-child(n+3)]:border-t sm:[&:nth-child(n+3)]:border-black/[0.06] lg:[&:nth-child(n+3)]:border-t lg:[&:nth-child(n+4)]:border-t"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-academy-orange/10 text-academy-orange">
                  <IconTicket className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-academy-gray-800">
                    {getCourseLabel(t.course_id)}
                  </p>
                  <p className="truncate font-mono text-[11px] text-academy-gray-500">
                    {t.id.slice(0, 8)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ─── Discover ─── */}
      <section className="grid min-w-0 gap-3 md:grid-cols-2">
        <DiscoverCard
          title="Acquista un pack"
          description="START, PRO o ELITE — il percorso 9 mesi completo."
          href="/pack"
        />
        <DiscoverCard
          title="Esplora masterclass"
          description="Workshop singoli con i migliori docenti del settore."
          href="/masterclass"
        />
      </section>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`relative min-w-0 max-w-full overflow-hidden border p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] ${
        accent
          ? "border-academy-orange/30 bg-gradient-to-br from-academy-orange/[0.06] to-white"
          : "border-black/[0.08] bg-white"
      }`}
    >
      <div className="flex items-start justify-between">
        <span
          className={`inline-flex h-9 w-9 items-center justify-center ${
            accent
              ? "bg-academy-orange/15 text-academy-orange"
              : "bg-black/[0.04] text-academy-gray-600"
          }`}
        >
          {icon}
        </span>
      </div>
      <p className="mt-4 text-[11px] font-bold tracking-[0.2em] text-academy-gray-500 uppercase">
        {label}
      </p>
      <p className="mt-1 text-2xl font-black text-academy-gray-800 tabular-nums">
        {value}
      </p>
      <p className="mt-1 text-[12px] text-academy-gray-500">{hint}</p>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-0.5 text-[11px] font-bold tracking-[0.2em] text-academy-gray-500 uppercase">
        {label}
      </p>
      <p className="text-sm font-semibold break-words text-academy-gray-800">
        {value}
      </p>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-bold tracking-[0.2em] text-academy-gray-500 uppercase">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full min-w-0 border border-black/[0.1] bg-white px-3 py-2 text-sm text-academy-gray-800 outline-none transition-colors focus:border-academy-orange/50"
      />
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
  ctaLabel,
  ctaHref,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center bg-black/[0.04] text-academy-gray-500">
        {icon}
      </div>
      <p className="text-sm font-bold text-academy-gray-800">{title}</p>
      <p className="mt-1 max-w-xs text-xs text-academy-gray-500">
        {description}
      </p>
      <Link
        href={ctaHref}
        className="mt-5 inline-flex items-center gap-1.5 bg-academy-orange px-5 py-2.5 text-xs font-bold tracking-wider text-white uppercase hover:brightness-110"
      >
        {ctaLabel}
        <IconArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

function BentoLink({
  href,
  icon,
  title,
  value,
  hint,
  highlight,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  value: number;
  hint: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group relative min-w-0 max-w-full overflow-hidden border p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all active:scale-[0.98] ${
        highlight
          ? "border-academy-orange/40 bg-gradient-to-br from-academy-orange/[0.08] to-white"
          : "border-black/[0.08] bg-white"
      }`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`flex h-10 w-10 items-center justify-center ${
            highlight
              ? "bg-academy-orange text-white"
              : "bg-academy-orange/10 text-academy-orange"
          }`}
        >
          {icon}
        </span>
        <IconArrowRight className="h-4 w-4 text-academy-gray-400 transition-transform group-hover:translate-x-0.5 group-hover:text-academy-orange" />
      </div>
      <div>
        <p className="truncate text-[10px] font-bold tracking-[0.2em] text-academy-gray-500 uppercase">
          {title}
        </p>
        <p className="mt-0.5 text-2xl font-black text-academy-gray-800 tabular-nums leading-none">
          {value}
        </p>
        <p className="mt-1 truncate text-[11px] text-academy-gray-500">
          {hint}
        </p>
      </div>
    </Link>
  );
}

function DiscoverCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex min-w-0 max-w-full items-center justify-between gap-4 border border-black/[0.08] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all hover:border-academy-orange/30 hover:shadow-[0_4px_16px_rgba(240,146,38,0.08)]"
    >
      <div className="flex min-w-0 items-center gap-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-academy-orange/10 text-academy-orange transition-all group-hover:bg-academy-orange/20">
          <IconSpark className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate font-bold text-academy-gray-800">{title}</p>
          <p className="truncate text-[12px] text-academy-gray-500">
            {description}
          </p>
        </div>
      </div>
      <IconArrowRight className="h-4 w-4 shrink-0 text-academy-gray-500 transition-transform group-hover:translate-x-1 group-hover:text-academy-orange" />
    </Link>
  );
}
