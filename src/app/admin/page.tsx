"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { GradientText } from "@/components/shared/gradient-text";
import {
  IconArrowRight,
  IconBag,
  IconScan,
  IconLayout,
  IconEuro,
  IconCheck,
  IconRefresh,
} from "./_components/icons";

interface Stats {
  totalOrders: number;
  paidOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  totalTickets: number;
  usedTickets: number;
}

interface RecentOrder {
  id: string;
  status: string;
  amount_cents: number;
  billing_name: string;
  billing_email: string;
  created_at: string;
  pack_id: string | null;
}

const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: "In attesa",
  paid: "Pagato",
  cancelled: "Annullato",
  refunded: "Rimborsato",
};

const ORDER_STATUS_TONE: Record<
  string,
  { dot: string; text: string; bg: string }
> = {
  pending: {
    dot: "bg-amber-500",
    text: "text-amber-700",
    bg: "bg-amber-500/10",
  },
  paid: {
    dot: "bg-emerald-500",
    text: "text-emerald-700",
    bg: "bg-emerald-500/10",
  },
  cancelled: { dot: "bg-red-500", text: "text-red-700", bg: "bg-red-500/10" },
  refunded: {
    dot: "bg-academy-gray-500",
    text: "text-academy-gray-600",
    bg: "bg-black/[0.04]",
  },
};

function formatEUR(cents: number): string {
  if (!cents) return "—";
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    paidOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    totalTickets: 0,
    usedTickets: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    const supabase = createClient();

    const [
      { count: totalOrders },
      { data: paidData },
      { count: pendingOrders },
      { count: totalTickets },
      { count: usedTickets },
      { data: recent },
    ] = await Promise.all([
      supabase.from("orders").select("*", { count: "exact", head: true }),
      supabase.from("orders").select("amount_cents").eq("status", "paid"),
      supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase.from("tickets").select("*", { count: "exact", head: true }),
      supabase
        .from("tickets")
        .select("*", { count: "exact", head: true })
        .eq("is_used", true),
      supabase
        .from("orders")
        .select(
          "id, status, amount_cents, billing_name, billing_email, created_at, pack_id",
        )
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    setStats({
      totalOrders: totalOrders || 0,
      paidOrders: paidData?.length || 0,
      pendingOrders: pendingOrders || 0,
      totalRevenue:
        paidData?.reduce((sum, o) => sum + (o.amount_cents || 0), 0) || 0,
      totalTickets: totalTickets || 0,
      usedTickets: usedTickets || 0,
    });
    if (recent) setRecentOrders(recent as unknown as RecentOrder[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function refresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  const conversionRate =
    stats.totalOrders > 0
      ? Math.round((stats.paidOrders / stats.totalOrders) * 100)
      : 0;

  const checkInRate =
    stats.totalTickets > 0
      ? Math.round((stats.usedTickets / stats.totalTickets) * 100)
      : 0;

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-[11px] font-bold tracking-[0.3em] text-academy-orange uppercase">
            Pannello amministrativo
          </p>
          <h1 className="text-3xl font-black text-academy-gray-800 md:text-4xl">
            <GradientText>Admin</GradientText> Dashboard
          </h1>
          <p className="mt-2 text-sm text-academy-gray-500">
            Panoramica ordini, ticket e gestione contenuti.
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={refreshing}
          className="flex items-center gap-2 border border-black/[0.08] bg-white px-4 py-2.5 text-[12px] font-bold tracking-wider text-academy-gray-700 uppercase transition-colors hover:border-academy-orange/30 hover:text-academy-orange disabled:opacity-50"
        >
          <IconRefresh
            className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
          />
          Aggiorna
        </button>
      </header>

      {/* Stats */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Ordini totali"
          value={stats.totalOrders.toString()}
          hint={`${stats.pendingOrders} in attesa`}
          tone={stats.pendingOrders > 0 ? "warn" : "neutral"}
        />
        <StatCard
          label="Ordini pagati"
          value={stats.paidOrders.toString()}
          hint={`${conversionRate}% conversione`}
          tone="success"
        />
        <StatCard
          label="Ricavi totali"
          value={formatEUR(stats.totalRevenue)}
          hint={loading ? "..." : "lordo da Stripe"}
          tone="accent"
        />
        <StatCard
          label="Check-in"
          value={`${stats.usedTickets} / ${stats.totalTickets}`}
          hint={`${checkInRate}% utilizzati`}
          tone="neutral"
        />
      </section>

      {/* Quick actions */}
      <section>
        <h2 className="mb-3 text-[11px] font-bold tracking-[0.25em] text-academy-gray-500 uppercase">
          Azioni rapide
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <ActionCard
            href="/admin/scanner"
            icon={<IconScan className="h-5 w-5" />}
            title="Scanner QR"
            description="Check-in partecipanti tramite scansione del codice."
          />
          <ActionCard
            href="/admin/orders"
            icon={<IconBag className="h-5 w-5" />}
            title="Gestione ordini"
            description="Visualizza, filtra e gestisci gli ordini ricevuti."
            badge={
              stats.pendingOrders > 0
                ? `${stats.pendingOrders} pending`
                : undefined
            }
          />
          <ActionCard
            href="/admin/contenuti"
            icon={<IconLayout className="h-5 w-5" />}
            title="Contenuti sito"
            description="Hero slides e CTA telefonica visibili sul sito."
          />
        </div>
      </section>

      {/* Recent orders */}
      <section className="border border-black/[0.08] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between border-b border-black/[0.06] px-6 py-4">
          <h2 className="text-[11px] font-bold tracking-[0.25em] text-academy-gray-700 uppercase">
            Ordini recenti
          </h2>
          <Link
            href="/admin/orders"
            className="flex items-center gap-1 text-[12px] font-bold tracking-wider text-academy-orange uppercase hover:underline"
          >
            Tutti
            <IconArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="px-6 py-12 text-center text-sm text-academy-gray-500">
            Caricamento...
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-academy-gray-500">
            Nessun ordine ancora.
          </div>
        ) : (
          <ul className="divide-y divide-black/[0.06]">
            {recentOrders.map((order) => {
              const tone = ORDER_STATUS_TONE[order.status];
              return (
                <li
                  key={order.id}
                  className="flex flex-wrap items-center gap-4 px-6 py-4 transition-colors hover:bg-black/[0.015]"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-bold text-academy-gray-800">
                        {order.billing_name || "—"}
                      </p>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${tone.bg} ${tone.text}`}
                      >
                        <span className={`h-1.5 w-1.5 ${tone.dot}`} />
                        {ORDER_STATUS_LABEL[order.status]}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-[12px] text-academy-gray-500">
                      {order.billing_email}
                      {order.pack_id ? ` · ${order.pack_id.toUpperCase()}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-0.5 text-right">
                    <span className="text-sm font-bold text-academy-gray-800 tabular-nums">
                      {formatEUR(order.amount_cents)}
                    </span>
                    <span className="text-[11px] text-academy-gray-500 tabular-nums">
                      {new Date(order.created_at).toLocaleDateString("it-IT")}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  tone: "neutral" | "success" | "accent" | "warn";
}) {
  const styles = {
    neutral: {
      wrap: "border-black/[0.08] bg-white",
      value: "text-academy-gray-800",
    },
    success: {
      wrap: "border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.06] to-white",
      value: "text-emerald-700",
    },
    accent: {
      wrap: "border-academy-orange/30 bg-gradient-to-br from-academy-orange/[0.06] to-white",
      value: "text-academy-orange",
    },
    warn: {
      wrap: "border-amber-500/30 bg-gradient-to-br from-amber-500/[0.06] to-white",
      value: "text-amber-700",
    },
  }[tone];

  const Icon =
    tone === "accent"
      ? IconEuro
      : tone === "success"
        ? IconCheck
        : tone === "warn"
          ? IconBag
          : IconBag;

  return (
    <div
      className={`relative overflow-hidden border p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] ${styles.wrap}`}
    >
      <div className="flex items-start justify-between">
        <span
          className={`inline-flex h-9 w-9 items-center justify-center bg-black/[0.04] text-academy-gray-600`}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-4 text-[11px] font-bold tracking-[0.2em] text-academy-gray-500 uppercase">
        {label}
      </p>
      <p className={`mt-1 text-2xl font-black tabular-nums ${styles.value}`}>
        {value}
      </p>
      <p className="mt-1 text-[12px] text-academy-gray-500">{hint}</p>
    </div>
  );
}

function ActionCard({
  href,
  icon,
  title,
  description,
  badge,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col gap-3 border border-black/[0.08] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all hover:border-academy-orange/30 hover:shadow-[0_4px_16px_rgba(240,146,38,0.08)]"
    >
      <div className="flex items-center justify-between">
        <span className="flex h-10 w-10 items-center justify-center bg-academy-orange/10 text-academy-orange transition-all group-hover:bg-academy-orange/20">
          {icon}
        </span>
        {badge && (
          <span className="bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-amber-700 uppercase">
            {badge}
          </span>
        )}
      </div>
      <div>
        <p className="font-bold text-academy-gray-800 group-hover:text-academy-orange">
          {title}
        </p>
        <p className="mt-1 text-[12px] text-academy-gray-500">{description}</p>
      </div>
      <span className="mt-1 flex items-center gap-1 text-[11px] font-bold tracking-wider text-academy-gray-500 uppercase transition-colors group-hover:text-academy-orange">
        Apri
        <IconArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
