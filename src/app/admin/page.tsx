"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { SectionContainer } from "@/components/shared/section-container";
import { GradientText } from "@/components/shared/gradient-text";

interface Stats {
  totalOrders: number;
  paidOrders: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ totalOrders: 0, paidOrders: 0, totalRevenue: 0 });

  useEffect(() => {
    async function load() {
      const supabase = createClient();

      const { count: totalOrders } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true });

      const { data: paidData } = await supabase
        .from("orders")
        .select("amount_cents")
        .eq("status", "paid");

      setStats({
        totalOrders: totalOrders || 0,
        paidOrders: paidData?.length || 0,
        totalRevenue: paidData?.reduce((sum, o) => sum + (o.amount_cents || 0), 0) || 0,
      });
    }
    load();
  }, []);

  return (
    <section className="min-h-screen pt-32">
      <SectionContainer>
        <div className="mb-12">
          <h1 className="mb-2 text-3xl font-black">
            <GradientText>Admin</GradientText> Dashboard
          </h1>
          <p className="text-academy-gray-400">
            Gestione ordini, check-in e panoramica.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-12 grid gap-6 sm:grid-cols-3">
          <div className="card-squared p-8 text-center">
            <p className="text-3xl font-black text-academy-orange">{stats.totalOrders}</p>
            <p className="text-sm text-academy-gray-400">Ordini Totali</p>
          </div>
          <div className="card-squared p-8 text-center">
            <p className="text-3xl font-black text-green-400">{stats.paidOrders}</p>
            <p className="text-sm text-academy-gray-400">Ordini Pagati</p>
          </div>
          <div className="card-squared p-8 text-center">
            <p className="text-3xl font-black text-academy-orange">
              {new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(
                stats.totalRevenue / 100
              )}
            </p>
            <p className="text-sm text-academy-gray-400">Ricavi Totali</p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid gap-6 sm:grid-cols-2">
          <Link href="/admin/scanner" className="group">
            <div className="card-squared p-8 transition-all hover:glow-orange">
              <h2 className="mb-2 text-xl font-bold group-hover:text-academy-orange">
                Scanner QR Code
              </h2>
              <p className="text-sm text-academy-gray-400">
                Scansiona i QR code dei partecipanti per il check-in.
              </p>
            </div>
          </Link>
          <Link href="/admin/orders" className="group">
            <div className="card-squared p-8 transition-all hover:glow-orange">
              <h2 className="mb-2 text-xl font-bold group-hover:text-academy-orange">
                Gestione Ordini
              </h2>
              <p className="text-sm text-academy-gray-400">
                Visualizza e gestisci tutti gli ordini.
              </p>
            </div>
          </Link>
        </div>
      </SectionContainer>
    </section>
  );
}
