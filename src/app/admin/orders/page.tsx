"use client";

import { useEffect, useState } from "react";
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
  packs: { name: string } | null;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      let query = supabase
        .from("orders")
        .select("id, status, amount_cents, billing_name, billing_email, created_at, packs(name)")
        .order("created_at", { ascending: false });

      if (filter !== "all") {
        query = query.eq("status", filter);
      }

      const { data } = await query;
      if (data) setOrders(data as unknown as Order[]);
      setLoading(false);
    }
    load();
  }, [filter]);

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

  return (
    <section className="min-h-screen pt-32">
      <SectionContainer>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-black">
              <GradientText>Ordini</GradientText>
            </h1>
            <p className="text-academy-gray-400">
              {orders.length} ordini totali
            </p>
          </div>

          {/* Filter */}
          <div className="flex gap-2">
            {["all", "pending", "paid", "cancelled"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-semibold tracking-wider uppercase transition-all ${
                  filter === f
                    ? "bg-academy-orange text-academy-dark"
                    : "bg-academy-navy/50 text-academy-gray-400 hover:text-academy-orange"
                }`}
              >
                {f === "all" ? "Tutti" : statusLabels[f]}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center text-academy-gray-400">Caricamento...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-academy-orange/10">
                  <th className="pb-3 text-left text-xs font-semibold tracking-wider text-academy-gray-500 uppercase">
                    Cliente
                  </th>
                  <th className="pb-3 text-left text-xs font-semibold tracking-wider text-academy-gray-500 uppercase">
                    Pack
                  </th>
                  <th className="pb-3 text-left text-xs font-semibold tracking-wider text-academy-gray-500 uppercase">
                    Stato
                  </th>
                  <th className="pb-3 text-right text-xs font-semibold tracking-wider text-academy-gray-500 uppercase">
                    Importo
                  </th>
                  <th className="pb-3 text-right text-xs font-semibold tracking-wider text-academy-gray-500 uppercase">
                    Data
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-white/5">
                    <td className="py-4">
                      <p className="font-semibold text-academy-gray-100">
                        {order.billing_name || "—"}
                      </p>
                      <p className="text-xs text-academy-gray-500">
                        {order.billing_email}
                      </p>
                    </td>
                    <td className="py-4 text-sm text-academy-gray-300">
                      {order.packs?.name || "—"}
                    </td>
                    <td className="py-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                          statusColors[order.status]
                        }`}
                      >
                        {statusLabels[order.status]}
                      </span>
                    </td>
                    <td className="py-4 text-right text-sm font-semibold text-academy-gray-200">
                      {order.amount_cents > 0
                        ? new Intl.NumberFormat("it-IT", {
                            style: "currency",
                            currency: "EUR",
                          }).format(order.amount_cents / 100)
                        : "—"}
                    </td>
                    <td className="py-4 text-right text-xs text-academy-gray-500">
                      {new Date(order.created_at).toLocaleDateString("it-IT")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionContainer>
    </section>
  );
}
