"use client";

import Link from "next/link";

const CONTENT_SECTIONS = [
  {
    href: "/admin/contenuti/hero",
    label: "Hero Slides",
    desc: "Modifica titoli, descrizioni, CTA e immagini di sfondo delle slide nella sezione hero.",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="5" width="20" height="14" rx="1" />
        <path d="M8 12l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function AdminContenutiPage() {
  return (
    <section className="min-h-screen pt-32 pb-20">
      <div className="mx-auto max-w-4xl px-6">

        <div className="mb-10">
          <Link href="/admin" className="text-[0.62rem] text-academy-gray-500 hover:text-academy-orange uppercase tracking-[0.2em] mb-3 block">
            ← Admin
          </Link>
          <h1 className="text-3xl font-black text-white">
            Gestione <span className="text-academy-orange">Contenuti</span>
          </h1>
          <p className="text-sm text-academy-gray-400 mt-1">
            Modifica i contenuti visibili sul sito senza toccare il codice.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CONTENT_SECTIONS.map((s) => (
            <Link key={s.href} href={s.href} className="group">
              <div className="card-squared p-7 h-full transition-all hover:glow-orange flex flex-col gap-4">
                <div className="text-academy-orange/60 group-hover:text-academy-orange transition-colors">
                  {s.icon}
                </div>
                <div>
                  <h2 className="text-base font-bold text-white mb-1.5 group-hover:text-academy-orange transition-colors">
                    {s.label}
                  </h2>
                  <p className="text-[0.65rem] text-academy-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
