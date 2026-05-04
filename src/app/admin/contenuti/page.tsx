"use client";

import Link from "next/link";
import { GradientText } from "@/components/shared/gradient-text";
import {
  IconImage,
  IconArrowRight,
  IconEuro,
  IconScan,
} from "../_components/icons";

const CONTENT_SECTIONS = [
  {
    href: "/admin/contenuti/hero",
    label: "Hero Slides",
    desc: "Modifica titoli, descrizioni, CTA e immagini di sfondo delle slide nella sezione hero della home.",
    Icon: IconImage,
  },
  {
    href: "/admin/contenuti/coupon",
    label: "Promo & Coupon",
    desc: "Crea e modifica promozioni applicate a pack e masterclass: sconti fissi o percentuali, scadenza, max utilizzi. Sync automatico con Stripe.",
    Icon: IconEuro,
  },
  {
    href: "/admin/contenuti/accessi",
    label: "Accessi QR",
    desc: "Configura quante volte ogni QR resta valido per pack e masterclass prima di risultare terminato allo scanner.",
    Icon: IconScan,
  },
];

export default function AdminContenutiPage() {
  return (
    <div className="space-y-6 lg:space-y-8">
      <header>
        <p className="mb-2 text-[11px] font-bold tracking-[0.3em] text-academy-orange uppercase">
          Editor
        </p>
        <h1 className="text-3xl font-black text-academy-gray-800 md:text-4xl">
          Gestione <GradientText>Contenuti</GradientText>
        </h1>
        <p className="mt-2 text-sm text-academy-gray-500">
          Modifica i contenuti visibili sul sito senza toccare il codice.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CONTENT_SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="group flex flex-col gap-4 border border-black/[0.08] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all hover:border-academy-orange/30 hover:shadow-[0_4px_16px_rgba(240,146,38,0.08)]"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-12 w-12 items-center justify-center bg-academy-orange/10 text-academy-orange transition-all group-hover:bg-academy-orange/20">
                <s.Icon className="h-6 w-6" />
              </span>
              <IconArrowRight className="h-4 w-4 text-academy-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-academy-orange" />
            </div>
            <div>
              <h2 className="text-base font-bold text-academy-gray-800 transition-colors group-hover:text-academy-orange">
                {s.label}
              </h2>
              <p className="mt-1 text-[12px] leading-relaxed text-academy-gray-500">
                {s.desc}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
