"use client";

import { useState } from "react";
import Link from "next/link";
import { GradientText } from "@/components/shared/gradient-text";
import { IconArrowLeft } from "../../_components/icons";
import { AutomaticPromosPanel } from "./_components/automatic-promos";
import { CouponCodesPanel } from "./_components/coupon-codes";

type Tab = "codes" | "automatic";

const TABS: { id: Tab; label: string }[] = [
  { id: "codes", label: "Codici coupon" },
  { id: "automatic", label: "Promo automatiche" },
];

export default function AdminCouponPage() {
  const [tab, setTab] = useState<Tab>("codes");

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Back link */}
      <Link
        href="/admin/contenuti"
        className="inline-flex items-center gap-1.5 text-[12px] font-bold tracking-wider text-academy-gray-500 uppercase transition-colors hover:text-academy-orange"
      >
        <IconArrowLeft className="h-3.5 w-3.5" />
        Contenuti
      </Link>

      <header>
        <p className="mb-2 text-[11px] font-bold tracking-[0.3em] text-academy-orange uppercase">
          Promo & Coupon
        </p>
        <h1 className="text-3xl font-black text-academy-gray-800 md:text-4xl">
          Gestione <GradientText>Sconti</GradientText>
        </h1>
      </header>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-black/[0.08]">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`-mb-px border-b-2 px-4 py-3 text-[12px] font-bold tracking-wider uppercase transition-colors ${
                active
                  ? "border-academy-orange text-academy-orange"
                  : "border-transparent text-academy-gray-500 hover:text-academy-gray-800"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "codes" ? <CouponCodesPanel /> : <AutomaticPromosPanel />}
    </div>
  );
}
