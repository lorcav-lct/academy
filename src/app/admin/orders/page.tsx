"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { SectionContainer } from "@/components/shared/section-container";
import { GradientText } from "@/components/shared/gradient-text";

interface Order {
  id: string;
  status: string;
  amount_cents: number;
  billing_name: string;
  billing_email: string;
  created_at: string;
  pack_id: string | null;
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

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [cancelling, setCancelling] = useState<string | null>(null);

  async function load(f = filter) {
    const supabase = createClient();
    let query = supabase
      .from("orders")
      .select("id, status, amount_cents, billing_name, billing_email, created_at, pack_id")
      .order("created_at", { ascending: false });
    if (f !== "all") query = query.eq("status", f);
    const { data } = await query;
    if (data) setOrders(data as unknown as Order[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  async function cancelOrder(orderId: string) {
    if (!confirm("Annullare questo ordine?")) return;
    setCancelling(orderId);
    const supabase = createClient();
    await supabase
      .from("orders")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("id", orderId);
    await load();
    setCancelling(null);
  }

  return (
    <section className="min-h-screen pt-28 pb-16">
      <SectionContainer>
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link href="/admin" className="mb-1 inline-flex items-center gap-1 text-xs text-academy-gray-500 hover:text-academy-orange">
              ← Dashboard
            </Link>
            <h1 className="text-2xl font-black sm:text-3xl">
              <GradientText>Ordini</GradientText>
            </h1>
            <p className="text-sm text-academy-gray-400">{orders.length} risultati</p>
          </div>
          <Link
            href="/admin/scanner"
            className="flex items-center gap-2 border border-academy-orange/30 bg-academy-orange/10 px-4 py-2 text-sm font-semibold text-academy-orange transition-all hover:bg-academy-orange/20"
          >
            Scanner QR
          </Link>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
          {["all", "pending", "paid", "cancelled"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`shrink-0 px-3 py-1.5 text-xs font-semibold tracking-wider uppercase transition-all ${
                filter === f
                  ? "bg-academy-orange text-academy-dark"
                  : "bg-academy-navy/50 text-academy-gray-400 hover:text-academy-orange"
              }`}
            >
              {f === "all" ? "Tutti" : statusLabels[f]}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center text-academy-gray-400">Caricamento...</div>
        ) : orders.length === 0 ? (
          <div className="card-squared p-12 text-center text-academy-gray-500">Nessun ordine trovato.</div>
        ) : (
          <>
            {/* Mobile / Tablet: card list */}
            <div className="space-y-3 lg:hidden">
              {orders.map((order) => (
                <div key={order.id} className="card-squared p-4">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-academy-gray-100">
                        {order.billing_name || "—"}
                      </p>
                      <p className="truncate text-xs text-academy-gray-500">{order.billing_email}</p>
                    </div>
                    <span className={`shrink-0 inline-block px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${statusColors[order.status]}`}>
                      {statusLabels[order.status]}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="space-y-0.5">
                      <p className="font-bold text-academy-orange">
                        {order.amount_cents > 0
                          ? new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(order.amount_cents / 100)
                          : "—"}
                      </p>
                      <p className="text-xs text-academy-gray-500">
                        {order.pack_id?.toUpperCase() || "—"} · {new Date(order.created_at).toLocaleDateString("it-IT")}
                      </p>
                    </div>
                    {order.status === "paid" && (
                      <button
                        onClick={() => cancelOrder(order.id)}
                        disabled={cancelling === order.id}
                        className="shrink-0 px-3 py-1.5 text-xs font-semibold text-red-400 border border-red-400/20 hover:bg-red-400/10 disabled:opacity-50 transition-all"
                      >
                        {cancelling === order.id ? "..." : "Annulla"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-academy-orange/10">
                    {["Cliente", "Prodotto", "Stato", "Importo", "Data", ""].map((h) => (
                      <th key={h} className={`pb-3 text-xs font-semibold tracking-wider text-academy-gray-500 uppercase ${h === "Importo" || h === "Data" ? "text-right" : "text-left"}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-white/5">
                      <td className="py-4">
                        <p className="font-semibold text-academy-gray-100">{order.billing_name || "—"}</p>
                        <p className="text-xs text-academy-gray-500">{order.billing_email}</p>
                      </td>
                      <td className="py-4 text-sm text-academy-gray-300">{order.pack_id?.toUpperCase() || "—"}</td>
                      <td className="py-4">
                        <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ${statusColors[order.status]}`}>
                          {statusLabels[order.status]}
                        </span>
                      </td>
                      <td className="py-4 text-right text-sm font-semibold text-academy-gray-200">
                        {order.amount_cents > 0
                          ? new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(order.amount_cents / 100)
                          : "—"}
                      </td>
                      <td className="py-4 text-right text-xs text-academy-gray-500">
                        {new Date(order.created_at).toLocaleDateString("it-IT")}
                      </td>
                      <td className="py-4 text-right">
                        {order.status === "paid" && (
                          <button
                            onClick={() => cancelOrder(order.id)}
                            disabled={cancelling === order.id}
                            className="px-3 py-1.5 text-xs font-semibold text-red-400 border border-red-400/20 hover:bg-red-400/10 disabled:opacity-50 transition-all"
                          >
                            {cancelling === order.id ? "..." : "Annulla"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </SectionContainer>
    </section>
  );
}
