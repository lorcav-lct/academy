"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { GradientText } from "@/components/shared/gradient-text";
import { IconBag, IconScan, IconSearch, IconTrash } from "../_components/icons";

interface Order {
  id: string;
  status: string;
  amount_cents: number;
  billing_name: string;
  billing_email: string;
  created_at: string;
  pack_id: string | null;
  is_test: boolean;
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

type Filter = "all" | "paid" | "pending" | "cancelled" | "refunded";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Tutti" },
  { id: "paid", label: "Pagati" },
  { id: "pending", label: "In attesa" },
  { id: "cancelled", label: "Annullati" },
  { id: "refunded", label: "Rimborsati" },
];

function formatEUR(cents: number): string {
  if (!cents) return "—";
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [showTest, setShowTest] = useState(false);
  const [cancelling, setCancelling] = useState<string | null>(null);

  async function load() {
    const supabase = createClient();
    const { data } = await supabase
      .from("orders")
      .select(
        "id, status, amount_cents, billing_name, billing_email, created_at, pack_id, is_test",
      )
      .order("created_at", { ascending: false });
    if (data) setOrders(data as unknown as Order[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function cancelOrder(orderId: string) {
    if (!confirm("Annullare questo ordine?")) return;
    setCancelling(orderId);
    await fetch("/api/admin/cancel-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    });
    await load();
    setCancelling(null);
  }

  const scoped = useMemo(
    () => (showTest ? orders : orders.filter((o) => !o.is_test)),
    [orders, showTest],
  );

  const testCount = useMemo(
    () => orders.filter((o) => o.is_test).length,
    [orders],
  );

  const counts = useMemo(
    () => ({
      all: scoped.length,
      paid: scoped.filter((o) => o.status === "paid").length,
      pending: scoped.filter((o) => o.status === "pending").length,
      cancelled: scoped.filter((o) => o.status === "cancelled").length,
      refunded: scoped.filter((o) => o.status === "refunded").length,
    }),
    [scoped],
  );

  const filtered = useMemo(() => {
    let list =
      filter === "all" ? scoped : scoped.filter((o) => o.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (o) =>
          o.billing_name?.toLowerCase().includes(q) ||
          o.billing_email?.toLowerCase().includes(q) ||
          o.id.toLowerCase().includes(q) ||
          o.pack_id?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [scoped, filter, search]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-[11px] font-bold tracking-[0.3em] text-academy-orange uppercase">
            Gestione
          </p>
          <h1 className="text-3xl font-black text-academy-gray-800 md:text-4xl">
            <GradientText>Ordini</GradientText>
          </h1>
          <p className="mt-2 text-sm text-academy-gray-500">
            {scoped.length} ordini {showTest ? "totali" : "live"} ·{" "}
            {filtered.length} visibili
            {testCount > 0 && !showTest && (
              <span className="ml-1 text-academy-gray-400">
                ({testCount} test nascosti)
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTest((v) => !v)}
            className={`flex items-center gap-2 border px-4 py-2.5 text-[12px] font-bold tracking-wider uppercase transition-colors ${
              showTest
                ? "border-amber-500/40 bg-amber-500/10 text-amber-700"
                : "border-black/[0.08] bg-white text-academy-gray-600 hover:text-academy-gray-800"
            }`}
            title={
              showTest
                ? "Nascondi ordini in test mode"
                : "Mostra anche ordini in test mode"
            }
          >
            {showTest ? "Test ON" : "Test OFF"}
          </button>
          <Link
            href="/admin/scanner"
            className="flex items-center gap-2 border border-academy-orange/40 bg-academy-orange/10 px-4 py-2.5 text-[12px] font-bold tracking-wider text-academy-orange uppercase transition-colors hover:bg-academy-orange/20"
          >
            <IconScan className="h-3.5 w-3.5" />
            Scanner QR
          </Link>
        </div>
      </header>

      {/* Search + Filters */}
      <div className="space-y-3">
        <div className="relative">
          <IconSearch className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-academy-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cerca per nome, email, ID o pack..."
            className="w-full border border-black/[0.08] bg-white py-2.5 pr-3 pl-10 text-sm text-academy-gray-800 placeholder-academy-gray-400 outline-none transition-colors focus:border-academy-orange/50"
          />
        </div>

        <div className="-mx-[5%] overflow-x-auto px-[5%] md:mx-0 md:px-0">
          <div className="flex gap-2 pb-1">
            {FILTERS.map((f) => {
              const active = filter === f.id;
              const count = counts[f.id];
              return (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`flex shrink-0 items-center gap-2 border px-4 py-2 text-[12px] font-bold tracking-wider uppercase transition-all ${
                    active
                      ? "border-academy-orange/40 bg-academy-orange/10 text-academy-orange"
                      : "border-black/[0.08] bg-white text-academy-gray-600 hover:text-academy-gray-800"
                  }`}
                >
                  {f.label}
                  <span
                    className={`px-1.5 text-[10px] tabular-nums ${
                      active
                        ? "bg-academy-orange/20"
                        : "bg-black/[0.04] text-academy-gray-500"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="border border-black/[0.08] bg-white p-12 text-center text-sm text-academy-gray-500 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          Caricamento...
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Mobile: card list */}
          <ul className="space-y-3 lg:hidden">
            {filtered.map((order) => {
              const tone = ORDER_STATUS_TONE[order.status];
              return (
                <li
                  key={order.id}
                  className={`border bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)] ${
                    order.is_test
                      ? "border-amber-500/40 ring-1 ring-amber-500/20"
                      : "border-black/[0.08]"
                  }`}
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-bold text-academy-gray-800">
                        {order.billing_name || "—"}
                      </p>
                      <p className="truncate text-[12px] text-academy-gray-500">
                        {order.billing_email}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      {order.is_test && (
                        <span className="inline-flex items-center bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold tracking-wider text-amber-700 uppercase">
                          Test
                        </span>
                      )}
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${tone.bg} ${tone.text}`}
                      >
                        <span className={`h-1.5 w-1.5 ${tone.dot}`} />
                        {ORDER_STATUS_LABEL[order.status]}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold text-academy-orange tabular-nums">
                        {formatEUR(order.amount_cents)}
                      </p>
                      <p className="text-[11px] text-academy-gray-500">
                        {order.pack_id?.toUpperCase() || "—"} ·{" "}
                        {new Date(order.created_at).toLocaleDateString("it-IT")}
                      </p>
                    </div>
                    {order.status === "paid" && (
                      <button
                        onClick={() => cancelOrder(order.id)}
                        disabled={cancelling === order.id}
                        className="flex shrink-0 items-center gap-1.5 border border-red-500/30 bg-red-50 px-3 py-1.5 text-[11px] font-bold tracking-wider text-red-700 uppercase transition-all hover:bg-red-100 disabled:opacity-50"
                      >
                        <IconTrash className="h-3 w-3" />
                        {cancelling === order.id ? "..." : "Annulla"}
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Desktop: table */}
          <div className="hidden overflow-hidden border border-black/[0.08] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] lg:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-black/[0.06] bg-black/[0.015]">
                  {[
                    { label: "Cliente", align: "left" },
                    { label: "Prodotto", align: "left" },
                    { label: "Stato", align: "left" },
                    { label: "Importo", align: "right" },
                    { label: "Data", align: "right" },
                    { label: "", align: "right" },
                  ].map((h, i) => (
                    <th
                      key={i}
                      className={`px-5 py-3 text-[10px] font-bold tracking-[0.2em] text-academy-gray-500 uppercase ${
                        h.align === "right" ? "text-right" : "text-left"
                      }`}
                    >
                      {h.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => {
                  const tone = ORDER_STATUS_TONE[order.status];
                  return (
                    <tr
                      key={order.id}
                      className="border-b border-black/[0.04] transition-colors hover:bg-black/[0.015] last:border-b-0"
                    >
                      <td className="px-5 py-4">
                        <p className="font-bold text-academy-gray-800">
                          {order.billing_name || "—"}
                        </p>
                        <p className="text-[12px] text-academy-gray-500">
                          {order.billing_email}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-sm text-academy-gray-700">
                        {order.pack_id?.toUpperCase() || "—"}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${tone.bg} ${tone.text}`}
                          >
                            <span className={`h-1.5 w-1.5 ${tone.dot}`} />
                            {ORDER_STATUS_LABEL[order.status]}
                          </span>
                          {order.is_test && (
                            <span className="inline-flex items-center bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold tracking-wider text-amber-700 uppercase">
                              Test
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right text-sm font-bold text-academy-gray-800 tabular-nums">
                        {formatEUR(order.amount_cents)}
                      </td>
                      <td className="px-5 py-4 text-right text-[12px] text-academy-gray-500 tabular-nums">
                        {new Date(order.created_at).toLocaleDateString("it-IT")}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {order.status === "paid" && (
                          <button
                            onClick={() => cancelOrder(order.id)}
                            disabled={cancelling === order.id}
                            className="inline-flex items-center gap-1.5 border border-red-500/30 bg-red-50 px-3 py-1.5 text-[11px] font-bold tracking-wider text-red-700 uppercase transition-all hover:bg-red-100 disabled:opacity-50"
                          >
                            <IconTrash className="h-3 w-3" />
                            {cancelling === order.id ? "..." : "Annulla"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center border border-black/[0.08] bg-white p-12 text-center shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="mb-5 flex h-16 w-16 items-center justify-center bg-black/[0.04] text-academy-gray-500">
        <IconBag className="h-8 w-8" />
      </div>
      <p className="text-base font-bold text-academy-gray-800">Nessun ordine</p>
      <p className="mt-1 max-w-sm text-sm text-academy-gray-500">
        Nessun ordine corrisponde ai filtri attivi. Prova a modificare i criteri
        di ricerca.
      </p>
    </div>
  );
}
