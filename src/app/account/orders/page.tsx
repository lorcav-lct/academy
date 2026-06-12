"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { GradientText } from "@/components/shared/gradient-text";
import {
  formatEUR,
  formatDate,
  getProductLabel,
  getProductSubtitle,
  ORDER_STATUS_LABEL,
  ORDER_STATUS_TONE,
} from "@/lib/utils/account";
import { getProductBySlug, DEPOSIT_PRICE_CENTS } from "@/lib/constants/packs";
import {
  IconArrowRight,
  IconBag,
  IconTicket,
  IconCopy,
  IconCheck,
} from "../_components/icons";

interface Order {
  id: string;
  status: string;
  amount_cents: number;
  created_at: string;
  pack_id: string | null;
  payment_plan: string | null;
  balance_order_id: string | null;
  deposit_promo_code: string | null;
}

/** A paid deposit still awaiting its balance payment. */
function isDepositPending(o: Order): boolean {
  return (
    o.payment_plan === "deposit" && o.status === "paid" && !o.balance_order_id
  );
}

/** Remaining balance for a deposit order (pack price − 500€), in cents. */
function balanceCents(o: Order): number {
  const pack = getProductBySlug(o.pack_id ?? "");
  return Math.max(0, (pack?.priceCents ?? 0) - DEPOSIT_PRICE_CENTS);
}

interface TicketRef {
  id: string;
  order_id: string;
  is_used: boolean;
}

type Filter = "all" | "paid" | "pending" | "cancelled";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Tutti" },
  { id: "paid", label: "Pagati" },
  { id: "pending", label: "In attesa" },
  { id: "cancelled", label: "Annullati" },
];

export default function AccountOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [ticketMap, setTicketMap] = useState<Record<string, TicketRef>>({});
  const [loading, setLoading] = useState(true);
  const [resuming, setResuming] = useState<string | null>(null);
  const [completing, setCompleting] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [copied, setCopied] = useState<string | null>(null);

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
          .select(
            "id, status, amount_cents, created_at, pack_id, payment_plan, balance_order_id, deposit_promo_code",
          )
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

  async function handleCompleteDeposit(orderId: string) {
    setCompleting(orderId);
    const res = await fetch("/api/checkout/complete-deposit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
      return;
    }
    setCompleting(null);
  }

  async function copyId(id: string) {
    await navigator.clipboard?.writeText(id);
    setCopied(id);
    setTimeout(() => setCopied((c) => (c === id ? null : c)), 1500);
  }

  const counts = useMemo(() => {
    return {
      all: orders.length,
      paid: orders.filter((o) => o.status === "paid").length,
      pending: orders.filter((o) => o.status === "pending").length,
      cancelled: orders.filter(
        (o) => o.status === "cancelled" || o.status === "refunded",
      ).length,
    };
  }, [orders]);

  const filtered = useMemo(() => {
    if (filter === "all") return orders;
    if (filter === "cancelled")
      return orders.filter(
        (o) => o.status === "cancelled" || o.status === "refunded",
      );
    return orders.filter((o) => o.status === filter);
  }, [orders, filter]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="animate-pulse text-sm tracking-wider text-academy-gray-500 uppercase">
          Caricamento ordini...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="mb-2 text-[11px] font-bold tracking-[0.3em] text-academy-orange uppercase">
          Storico
        </p>
        <h1 className="text-3xl font-black text-academy-gray-800 md:text-4xl">
          I miei <GradientText>Ordini</GradientText>
        </h1>
        <p className="mt-2 text-sm text-academy-gray-500">
          Tutti gli acquisti effettuati su Lacertosus Academy.
        </p>
      </header>

      {orders.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Filters — sticky orizzontale */}
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

          {/* Orders list */}
          {filtered.length === 0 ? (
            <div className="border border-black/[0.08] bg-white p-10 text-center shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
              <p className="text-sm text-academy-gray-500">
                Nessun ordine in questa categoria.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {filtered.map((order) => {
                const ticket = ticketMap[order.id];
                const depositPending = isDepositPending(order);
                const tone = depositPending
                  ? ORDER_STATUS_TONE.pending
                  : ORDER_STATUS_TONE[order.status];
                const statusLabel = depositPending
                  ? "Caparra versata"
                  : ORDER_STATUS_LABEL[order.status];
                return (
                  <li
                    key={order.id}
                    className="border border-black/[0.08] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all hover:border-academy-orange/30 hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)]"
                  >
                    <div className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-base font-bold text-academy-gray-800">
                            {order.payment_plan === "deposit"
                              ? `Caparra · ${getProductLabel(order.pack_id)}`
                              : getProductLabel(order.pack_id)}
                          </h3>
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${tone.bg} ${tone.text}`}
                          >
                            <span className={`h-1.5 w-1.5 ${tone.dot}`} />
                            {statusLabel}
                          </span>
                        </div>

                        {getProductSubtitle(order.pack_id) && (
                          <p className="mt-1 text-[13px] text-academy-gray-500">
                            {getProductSubtitle(order.pack_id)}
                          </p>
                        )}

                        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[12px]">
                          <span className="flex items-center gap-1.5">
                            <span className="text-academy-gray-400">Data</span>
                            <span className="font-semibold text-academy-gray-700 tabular-nums">
                              {formatDate(order.created_at)}
                            </span>
                          </span>

                          <span className="flex items-center gap-1.5">
                            <span className="text-academy-gray-400">
                              Importo
                            </span>
                            <span className="font-bold text-academy-orange tabular-nums">
                              {order.amount_cents > 0
                                ? formatEUR(order.amount_cents)
                                : "—"}
                            </span>
                          </span>

                          <button
                            onClick={() => copyId(order.id)}
                            className="group flex items-center gap-1.5 font-mono text-[11px] text-academy-gray-500 transition-colors hover:text-academy-orange"
                            title="Copia ID ordine"
                          >
                            <span className="text-academy-gray-400">ID</span>
                            <span>#{order.id.slice(0, 12)}</span>
                            {copied === order.id ? (
                              <IconCheck className="h-3 w-3 text-emerald-600" />
                            ) : (
                              <IconCopy className="h-3 w-3 opacity-60 group-hover:opacity-100" />
                            )}
                          </button>
                        </div>

                        {depositPending && order.deposit_promo_code && (
                          <div className="mt-3 flex flex-wrap items-center gap-2 border border-academy-orange/30 bg-academy-orange/[0.06] px-3 py-2">
                            <span className="text-[10px] font-bold tracking-wider text-academy-gray-500 uppercase">
                              Sconto saldo
                            </span>
                            <button
                              onClick={() => copyId(order.deposit_promo_code!)}
                              className="group flex items-center gap-1.5 font-mono text-[12px] font-bold text-academy-orange"
                              title="Copia codice sconto"
                            >
                              <span>{order.deposit_promo_code}</span>
                              {copied === order.deposit_promo_code ? (
                                <IconCheck className="h-3 w-3 text-emerald-600" />
                              ) : (
                                <IconCopy className="h-3 w-3 opacity-60 group-hover:opacity-100" />
                              )}
                            </button>
                            <span className="text-[11px] text-academy-gray-500">
                              −500€ · si applica da solo al saldo
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 md:justify-end">
                        {depositPending && (
                          <button
                            disabled={completing === order.id}
                            onClick={() => handleCompleteDeposit(order.id)}
                            className="flex items-center gap-1.5 bg-academy-orange px-4 py-2.5 text-[11px] font-bold tracking-wider text-white uppercase transition-all hover:brightness-110 disabled:opacity-50"
                          >
                            {completing === order.id ? (
                              "..."
                            ) : (
                              <>
                                Completa il saldo ·{" "}
                                {formatEUR(balanceCents(order))}
                                <IconArrowRight className="h-3.5 w-3.5" />
                              </>
                            )}
                          </button>
                        )}

                        {order.status === "pending" && order.pack_id && (
                          <button
                            disabled={resuming === order.id}
                            onClick={() => handleResume(order.id)}
                            className="flex items-center gap-1.5 bg-academy-orange px-4 py-2.5 text-[11px] font-bold tracking-wider text-white uppercase transition-all hover:brightness-110 disabled:opacity-50"
                          >
                            {resuming === order.id ? (
                              "..."
                            ) : (
                              <>
                                Riprendi pagamento
                                <IconArrowRight className="h-3.5 w-3.5" />
                              </>
                            )}
                          </button>
                        )}

                        {ticket && order.status === "paid" && (
                          <Link
                            href="/account/tickets"
                            className={`flex items-center gap-1.5 border px-4 py-2.5 text-[11px] font-bold tracking-wider uppercase transition-all ${
                              ticket.is_used
                                ? "border-black/[0.08] bg-white text-academy-gray-500"
                                : "border-emerald-500/30 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            }`}
                          >
                            <IconTicket className="h-3.5 w-3.5" />
                            {ticket.is_used ? "Ticket usato" : "Vedi ticket"}
                          </Link>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
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
      <p className="text-base font-bold text-academy-gray-800">
        Nessun ordine ancora
      </p>
      <p className="mt-1 max-w-sm text-sm text-academy-gray-500">
        Acquista un pack o una masterclass per iniziare il tuo percorso
        formativo.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/pack"
          className="inline-flex items-center gap-1.5 bg-academy-orange px-5 py-2.5 text-xs font-bold tracking-wider text-white uppercase hover:brightness-110"
        >
          Esplora i Pack
          <IconArrowRight className="h-3.5 w-3.5" />
        </Link>
        <Link
          href="/masterclass"
          className="inline-flex items-center gap-1.5 border border-black/[0.1] bg-white px-5 py-2.5 text-xs font-bold tracking-wider text-academy-gray-700 uppercase hover:border-academy-orange/40 hover:text-academy-orange"
        >
          Masterclass
        </Link>
      </div>
    </div>
  );
}
