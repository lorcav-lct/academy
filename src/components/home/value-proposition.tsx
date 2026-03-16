"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const FEATURES = [
  {
    num: "01",
    title: "Docenti di eccellenza",
    body: "Professionisti attivi, coach con curricula internazionali e docenti universitari. Non teoria da libro, ma esperienza di campo.",
    accent: "rgba(240,146,38,0.08)",
  },
  {
    num: "02",
    title: "100% in presenza",
    body: "Nessuna lezione online. Pratica diretta, feedback immediato, confronto costante con i formatori e i colleghi.",
    accent: "rgba(212,175,55,0.06)",
  },
  {
    num: "03",
    title: "Dal tecnico all'imprenditore",
    body: "Biomeccanica, alimentazione, psicologia del cliente, business, branding e controllo dei numeri. Tutto in un percorso.",
    accent: "rgba(240,146,38,0.06)",
  },
  {
    num: "04",
    title: "Sbocchi concreti",
    body: "Posizionamento nel mercato, possibilità di aprire un Training Hub Lacertosus e una rete di professionisti certificati.",
    accent: "rgba(212,175,55,0.05)",
  },
];

const PROBLEMS = [
  "Corsi online senza pratica reale",
  "Certificazioni non riconosciute",
  "Formazione solo tecnica, zero business",
  "Docenti senza esperienza di campo",
];

export function ValueProposition() {
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const problemsRef = useRef<HTMLDivElement>(null);
  const bigstatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      // Section header
      gsap.from(headRef.current, {
        scrollTrigger: { trigger: headRef.current, start: "top 85%", once: true },
        opacity: 0, y: 35, duration: 0.7, ease: "power3.out",
      });

      // Big stat
      gsap.from(bigstatRef.current, {
        scrollTrigger: { trigger: bigstatRef.current, start: "top 80%", once: true },
        opacity: 0, scale: 0.85, duration: 0.8, ease: "back.out(1.5)",
      });

      // Problems list items
      const problemItems = problemsRef.current?.querySelectorAll("[data-problem]");
      if (problemItems) {
        gsap.from(problemItems, {
          scrollTrigger: { trigger: problemsRef.current, start: "top 80%", once: true },
          opacity: 0, x: -24, duration: 0.5, stagger: 0.1, ease: "power2.out",
        });
      }

      // Feature cards
      const cards = cardsRef.current?.querySelectorAll("[data-card]");
      if (cards) {
        gsap.from(cards, {
          scrollTrigger: { trigger: cardsRef.current, start: "top 78%", once: true },
          opacity: 0, y: 40, duration: 0.6, stagger: 0.12, ease: "power3.out",
        });
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="perche"
      className="relative overflow-hidden py-24 md:py-32"
    >
      {/* subtle bg shift */}
      <div className="absolute inset-0 bg-academy-darker/40" />

      <div className="relative z-10 mx-auto w-[90%] max-w-[1440px]">
        {/* Section label */}
        <div ref={headRef} className="mb-14">
          <span className="label-tag mb-3 block">Perché Lacertosus</span>
          <h2 className="max-w-2xl text-[clamp(1.9rem,4vw,3.5rem)] font-black leading-[1.05] tracking-tight text-academy-gray-100">
            Il settore fitness è pieno di corsi.{" "}
            <span className="gradient-text">Ma non di professionisti.</span>
          </h2>
        </div>

        {/* ─── Bento grid ─── */}
        <div className="grid gap-3 lg:grid-cols-12 lg:grid-rows-[auto_auto]">

          {/* Problems column — tall left card */}
          <div
            ref={problemsRef}
            className="bento-card-dark lg:col-span-3 lg:row-span-2 flex flex-col justify-between p-7"
          >
            <div>
              <p className="mb-5 text-[0.63rem] font-bold tracking-[0.28em] text-academy-orange/70 uppercase">
                Il problema
              </p>
              <ul className="space-y-3">
                {PROBLEMS.map((p) => (
                  <li
                    key={p}
                    data-problem
                    className="flex items-start gap-3 text-sm text-academy-gray-400"
                  >
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 bg-academy-gray-700" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-8 border-t border-academy-orange/8 pt-6">
              <p className="text-[0.63rem] font-bold tracking-[0.28em] text-academy-orange/60 uppercase">
                La soluzione
              </p>
              <p className="mt-2 text-sm font-semibold text-academy-gray-200">
                Un percorso formativo unico che unisce tecnica, pratica e visione imprenditoriale.
              </p>
            </div>
          </div>

          {/* Big stat — top center */}
          <div
            ref={bigstatRef}
            className="bento-card-accent lg:col-span-5 flex flex-col justify-between p-7"
          >
            <p className="text-[0.63rem] font-bold tracking-[0.28em] text-academy-orange/80 uppercase">
              Formazione completa
            </p>
            <div>
              <div className="text-[clamp(3.5rem,8vw,6rem)] font-black leading-none text-academy-orange tabular-nums">
                9
              </div>
              <p className="mt-1 text-lg font-bold text-academy-gray-200">
                mesi di trasformazione
              </p>
              <p className="mt-2 text-sm text-academy-gray-500">
                PRIMAL → VIS → VICTOR + Certificazione FipexLacertosus
              </p>
            </div>
          </div>

          {/* Top-right: quick stat */}
          <div className="bento-card lg:col-span-4 flex flex-col justify-center p-7">
            <div className="mb-1 text-[clamp(2.5rem,4vw,3.5rem)] font-black leading-none gradient-text tabular-nums">
              100%
            </div>
            <p className="text-base font-bold text-academy-gray-200">In Presenza</p>
            <p className="mt-1 text-sm text-academy-gray-500">
              Nessuna lezione online. Solo pratica autentica e confronto diretto.
            </p>
          </div>

          {/* Feature cards row */}
          <div
            ref={cardsRef}
            className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:col-span-9 lg:grid-cols-4"
          >
            {FEATURES.map((f) => (
              <div
                key={f.num}
                data-card
                className="bento-card group relative overflow-hidden p-6"
                style={{ background: `linear-gradient(145deg, ${f.accent}, rgba(2,0,38,0.9))` }}
              >
                <span className="mb-4 block text-[0.62rem] font-black tracking-[0.25em] text-academy-orange/50 uppercase">
                  {f.num}
                </span>
                <h3 className="mb-2 text-sm font-bold leading-tight text-academy-gray-100">
                  {f.title}
                </h3>
                <p className="text-xs leading-relaxed text-academy-gray-500">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
