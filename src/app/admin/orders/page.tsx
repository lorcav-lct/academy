"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { GradientText } from "@/components/shared/gradient-text";
import { IconBag, IconScan, IconSearch, IconTrash } from "../_components/icons";
import { DEPOSIT_PRICE_CENTS } from "@/lib/constants/packs";

interface Order {
  id: string;
  status: string;
  amount_cents: number;
  billing_name: string;
  billing_email: string;
  created_at: string;
  pack_id: string | null;
  is_test: boolean;
  payment_plan: string | null;
  balance_order_id: string | null;
  settled_externally: boolean | null;
  fulfilled_at: string | null;
  agreed_total_cents: number | null;
  profiles: { full_name: string | null } | null;
}

/** Display name: Stripe billing name, falling back to the account profile name
 *  (deposit checkouts often don't capture a billing name → only email shows). */
function displayName(o: Order): string {
  return o.billing_name?.trim() || o.profiles?.full_name?.trim() || "—";
}

/** A paid caparra still awaiting its balance (online or external). */
function isDepositPending(o: Order): boolean {
  return (
    o.payment_plan === "deposit" &&
    o.status === "paid" &&
    !o.balance_order_id &&
    !o.settled_externally
  );
}

/** Orders an admin can activate by hand (settled outside Stripe). */
function canActivate(o: Order): boolean {
  if (o.fulfilled_at || o.balance_order_id) return false;
  return isDepositPending(o) || o.status === "pending";
}

const PAYMENT_METHODS = [
  { id: "bonifico", label: "Bonifico" },
  { id: "scalapay", label: "Scalapay" },
  { id: "contanti", label: "Contanti" },
  { id: "carta", label: "Carta (POS)" },
  { id: "altro", label: "Altro" },
];

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
  const [activateTarget, setActivateTarget] = useState<Order | null>(null);
  const [activating, setActivating] = useState(false);
  const [activateError, setActivateError] = useState<string | null>(null);
  const [activateMethod, setActivateMethod] = useState("bonifico");
  const [activateAmount, setActivateAmount] = useState("");
  const [activateSilent, setActivateSilent] = useState(false);
  const [priceTarget, setPriceTarget] = useState<Order | null>(null);
  const [priceValue, setPriceValue] = useState("");
  const [priceSaving, setPriceSaving] = useState(false);
  const [priceError, setPriceError] = useState<string | null>(null);

  async function load() {
    const supabase = createClient();
    const { data } = await supabase
      .from("orders")
      .select(
        "id, status, amount_cents, billing_name, billing_email, created_at, pack_id, is_test, payment_plan, balance_order_id, settled_externally, fulfilled_at, agreed_total_cents, profiles(full_name)",
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

  function openActivate(order: Order) {
    setActivateTarget(order);
    setActivateError(null);
    setActivateMethod("bonifico");
    setActivateAmount("");
    setActivateSilent(false);
  }

  async function submitActivate() {
    if (!activateTarget) return;
    setActivating(true);
    setActivateError(null);
    const parsed = parseFloat(activateAmount.replace(",", "."));
    const amountCents =
      Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed * 100) : null;
    const res = await fetch("/api/admin/activate-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: activateTarget.id,
        silent: activateSilent,
        paymentMethod: activateMethod,
        amountCents,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setActivateError(data.error || "Errore durante l'attivazione");
      setActivating(false);
      return;
    }
    setActivating(false);
    setActivateTarget(null);
    await load();
  }

  function openPrice(order: Order) {
    setPriceTarget(order);
    setPriceValue(
      order.agreed_total_cents != null
        ? String(order.agreed_total_cents / 100)
        : "",
    );
    setPriceError(null);
  }

  /** Save (or clear, when the field is empty) the negotiated total price. */
  async function submitPrice() {
    if (!priceTarget) return;
    setPriceSaving(true);
    setPriceError(null);
    const raw = priceValue.trim();
    let agreedTotalCents: number | null = null;
    if (raw) {
      const parsed = parseFloat(raw.replace(",", "."));
      if (!Number.isFinite(parsed) || parsed <= 0) {
        setPriceError("Importo non valido");
        setPriceSaving(false);
        return;
      }
      agreedTotalCents = Math.round(parsed * 100);
    }
    const res = await fetch("/api/admin/agreed-total", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: priceTarget.id, agreedTotalCents }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setPriceError(data.error || "Errore durante il salvataggio");
      setPriceSaving(false);
      return;
    }
    setPriceSaving(false);
    setPriceTarget(null);
    await load();
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
          o.profiles?.full_name?.toLowerCase().includes(q) ||
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
              const depositPending = isDepositPending(order);
              const tone = depositPending
                ? ORDER_STATUS_TONE.pending
                : ORDER_STATUS_TONE[order.status];
              const statusLabel = depositPending
                ? "Caparra · saldo atteso"
                : ORDER_STATUS_LABEL[order.status];
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
                        {displayName(order)}
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
                        {statusLabel}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold text-academy-orange tabular-nums">
                        {formatEUR(order.amount_cents)}
                      </p>
                      <p className="text-[11px] text-academy-gray-500">
                        {order.pack_id?.toUpperCase() || "—"} ·{" "}
                        {new Date(order.created_at).toLocaleDateString("it-IT")}
                      </p>
                    </div>
                    {/* wraps below the amount when three actions don't fit */}
                    <div className="flex flex-wrap items-center gap-2">
                      {isDepositPending(order) && (
                        <button
                          onClick={() => openPrice(order)}
                          className="flex items-center gap-1.5 border border-black/[0.12] bg-white px-3 py-1.5 text-[11px] font-bold tracking-wider text-academy-gray-600 uppercase transition-colors hover:text-academy-gray-800"
                        >
                          {order.agreed_total_cents != null
                            ? formatEUR(order.agreed_total_cents)
                            : "Prezzo"}
                        </button>
                      )}
                      {canActivate(order) && (
                        <button
                          onClick={() => openActivate(order)}
                          className="flex items-center gap-1.5 bg-academy-orange px-3 py-1.5 text-[11px] font-bold tracking-wider text-white uppercase transition-all hover:brightness-110"
                        >
                          Attiva
                        </button>
                      )}
                      {(order.status === "paid" ||
                        order.status === "pending") && (
                        <button
                          onClick={() => cancelOrder(order.id)}
                          disabled={cancelling === order.id}
                          className="flex items-center gap-1.5 border border-red-500/30 bg-red-50 px-3 py-1.5 text-[11px] font-bold tracking-wider text-red-700 uppercase transition-all hover:bg-red-100 disabled:opacity-50"
                        >
                          <IconTrash className="h-3 w-3" />
                          {cancelling === order.id ? "..." : "Annulla"}
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Desktop: table */}
          {/* overflow-x-auto, not hidden: with 3 actions + badges a narrow
              laptop would clip the last button instead of letting it scroll. */}
          <div className="hidden overflow-x-auto border border-black/[0.08] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] lg:block">
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
                      className={`px-4 py-3 text-[10px] font-bold tracking-[0.2em] whitespace-nowrap text-academy-gray-500 uppercase ${
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
                  const depositPending = isDepositPending(order);
                  const tone = depositPending
                    ? ORDER_STATUS_TONE.pending
                    : ORDER_STATUS_TONE[order.status];
                  // Short label in the table: the full wording wrapped onto
                  // three lines and blew the row width.
                  const statusLabel = depositPending
                    ? "Saldo atteso"
                    : ORDER_STATUS_LABEL[order.status];
                  return (
                    <tr
                      key={order.id}
                      className="border-b border-black/[0.04] transition-colors hover:bg-black/[0.015] last:border-b-0"
                    >
                      <td className="px-4 py-4">
                        <p className="font-bold text-academy-gray-800">
                          {displayName(order)}
                        </p>
                        <p className="text-[12px] text-academy-gray-500">
                          {order.billing_email}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-sm text-academy-gray-700">
                        {order.pack_id?.toUpperCase() || "—"}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                          <span
                            className={`inline-flex shrink-0 items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${tone.bg} ${tone.text}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 shrink-0 ${tone.dot}`}
                            />
                            {statusLabel}
                          </span>
                          {order.is_test && (
                            <span className="inline-flex shrink-0 items-center bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold tracking-wider text-amber-700 uppercase">
                              Test
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right text-sm font-bold text-academy-gray-800 tabular-nums">
                        {formatEUR(order.amount_cents)}
                      </td>
                      <td className="px-4 py-4 text-right text-[12px] text-academy-gray-500 tabular-nums">
                        {new Date(order.created_at).toLocaleDateString("it-IT")}
                      </td>
                      <td className="w-px px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                          {isDepositPending(order) && (
                            <button
                              onClick={() => openPrice(order)}
                              title="Prezzo totale concordato con il cliente"
                              className="inline-flex items-center gap-1.5 border border-black/[0.12] bg-white px-2.5 py-1.5 text-[11px] font-bold tracking-wider text-academy-gray-600 uppercase transition-colors hover:text-academy-gray-800"
                            >
                              {order.agreed_total_cents != null
                                ? formatEUR(order.agreed_total_cents)
                                : "Prezzo"}
                            </button>
                          )}
                          {canActivate(order) && (
                            <button
                              onClick={() => openActivate(order)}
                              className="inline-flex items-center gap-1.5 bg-academy-orange px-2.5 py-1.5 text-[11px] font-bold tracking-wider text-white uppercase transition-all hover:brightness-110"
                            >
                              Attiva
                            </button>
                          )}
                          {(order.status === "paid" ||
                            order.status === "pending") && (
                            <button
                              onClick={() => cancelOrder(order.id)}
                              disabled={cancelling === order.id}
                              className="inline-flex items-center gap-1.5 border border-red-500/30 bg-red-50 px-2.5 py-1.5 text-[11px] font-bold tracking-wider text-red-700 uppercase transition-all hover:bg-red-100 disabled:opacity-50"
                            >
                              <IconTrash className="h-3 w-3" />
                              {cancelling === order.id ? "..." : "Annulla"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activateTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => !activating && setActivateTarget(null)}
        >
          <div
            className="w-full max-w-md border border-black/[0.08] bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-1 text-[11px] font-bold tracking-[0.3em] text-academy-orange uppercase">
              {activateTarget.payment_plan === "deposit"
                ? "Salda caparra"
                : "Attiva ordine"}
            </p>
            <h2 className="text-xl font-black text-academy-gray-800">
              {activateTarget.billing_name || activateTarget.billing_email}
            </h2>
            <p className="mt-1 text-[13px] text-academy-gray-500">
              {activateTarget.pack_id?.toUpperCase() || "—"} · genera ticket e
              QR e attiva l&apos;accesso del cliente.
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-[11px] font-bold tracking-wider text-academy-gray-500 uppercase">
                  Metodo di pagamento
                </label>
                <select
                  value={activateMethod}
                  onChange={(e) => setActivateMethod(e.target.value)}
                  className="w-full border border-black/[0.1] bg-white px-3 py-2.5 text-sm text-academy-gray-800 outline-none focus:border-academy-orange/50"
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-bold tracking-wider text-academy-gray-500 uppercase">
                  Importo saldato (€)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={activateAmount}
                  onChange={(e) => setActivateAmount(e.target.value)}
                  placeholder="es. 1490"
                  className="w-full border border-black/[0.1] bg-white px-3 py-2.5 text-sm text-academy-gray-800 placeholder-academy-gray-400 outline-none focus:border-academy-orange/50"
                />
                <p className="mt-1 text-[11px] text-academy-gray-400">
                  Solo per registro interno. Lascia vuoto se non rilevante.
                </p>
              </div>

              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-academy-gray-700">
                <input
                  type="checkbox"
                  checked={!activateSilent}
                  onChange={(e) => setActivateSilent(!e.target.checked)}
                  className="h-4 w-4 accent-academy-orange"
                />
                Invia email di conferma al cliente
              </label>
            </div>

            {activateError && (
              <p className="mt-4 border border-red-500/30 bg-red-50 px-3 py-2 text-[13px] text-red-700">
                {activateError}
              </p>
            )}

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setActivateTarget(null)}
                disabled={activating}
                className="border border-black/[0.1] bg-white px-4 py-2.5 text-[12px] font-bold tracking-wider text-academy-gray-600 uppercase transition-colors hover:text-academy-gray-800 disabled:opacity-50"
              >
                Annulla
              </button>
              <button
                onClick={submitActivate}
                disabled={activating}
                className="bg-academy-orange px-5 py-2.5 text-[12px] font-bold tracking-wider text-white uppercase transition-all hover:brightness-110 disabled:opacity-50"
              >
                {activating
                  ? "Attivazione..."
                  : activateSilent
                    ? "Attiva senza email"
                    : "Attiva e invia email"}
              </button>
            </div>
          </div>
        </div>
      )}

      {priceTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => !priceSaving && setPriceTarget(null)}
        >
          <div
            className="w-full max-w-md border border-black/[0.08] bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-1 text-[11px] font-bold tracking-[0.3em] text-academy-orange uppercase">
              Prezzo concordato
            </p>
            <h2 className="text-xl font-black text-academy-gray-800">
              {priceTarget.billing_name || priceTarget.billing_email}
            </h2>
            <p className="mt-1 text-[13px] text-academy-gray-500">
              {priceTarget.pack_id?.toUpperCase() || "—"} · totale pattuito per
              il pack, caparra inclusa.
            </p>

            <div className="mt-5">
              <label className="mb-1.5 block text-[11px] font-bold tracking-wider text-academy-gray-500 uppercase">
                Totale concordato (€)
              </label>
              <input
                type="text"
                inputMode="decimal"
                autoFocus
                value={priceValue}
                onChange={(e) => setPriceValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !priceSaving) submitPrice();
                }}
                placeholder="es. 2000"
                className="w-full border border-black/[0.1] bg-white px-3 py-2.5 text-sm text-academy-gray-800 placeholder-academy-gray-400 outline-none focus:border-academy-orange/50"
              />
              <p className="mt-1.5 text-[11px] text-academy-gray-400">
                Il cliente pagherà questo importo meno i{" "}
                {formatEUR(DEPOSIT_PRICE_CENTS)} di caparra già versati
                {priceValue.trim() &&
                Number.isFinite(parseFloat(priceValue.replace(",", "."))) ? (
                  <>
                    {" "}
                    → saldo{" "}
                    <span className="font-bold text-academy-gray-600">
                      {formatEUR(
                        Math.round(
                          parseFloat(priceValue.replace(",", ".")) * 100,
                        ) - DEPOSIT_PRICE_CENTS,
                      )}
                    </span>
                  </>
                ) : null}
                . Svuota il campo per tornare al prezzo di listino.
              </p>
            </div>

            {priceError && (
              <p className="mt-4 border border-red-500/30 bg-red-50 px-3 py-2 text-[13px] text-red-700">
                {priceError}
              </p>
            )}

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setPriceTarget(null)}
                disabled={priceSaving}
                className="border border-black/[0.1] bg-white px-4 py-2.5 text-[12px] font-bold tracking-wider text-academy-gray-600 uppercase transition-colors hover:text-academy-gray-800 disabled:opacity-50"
              >
                Annulla
              </button>
              <button
                onClick={submitPrice}
                disabled={priceSaving}
                className="bg-academy-orange px-5 py-2.5 text-[12px] font-bold tracking-wider text-white uppercase transition-all hover:brightness-110 disabled:opacity-50"
              >
                {priceSaving ? "Salvataggio..." : "Salva"}
              </button>
            </div>
          </div>
        </div>
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
