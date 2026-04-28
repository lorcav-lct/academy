"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTheme } from "@/components/providers/theme-provider";

// ── Data ──────────────────────────────────────────────────────────────────────

const OUTCOMES = [
  {
    title: "Anatomia e biomeccanica applicate al movimento",
    desc: "Le basi scientifiche del corpo umano diventano strumenti operativi, non nozioni astratte.",
  },
  {
    title: "Valutazione funzionale e screening professionale",
    desc: "Leggi il soggetto prima ancora che parli. Assessment, postura, analisi del movimento.",
  },
  {
    title: "Programmazione Functional Training",
    desc: "Costruisci percorsi strutturati partendo dai pattern di movimento fondamentali.",
  },
  {
    title: "Strength & Conditioning avanzato",
    desc: "Bilanciere, manubri, sprint, potenza. Programmazione S&C per atleti e non.",
  },
  {
    title: "Preparazione atleti e operatori tattici",
    desc: "Forze dell'ordine, militari, atleti agonisti. Saprai allenare chi ha bisogno del meglio.",
  },
  {
    title: "Collaborazione con professionisti sanitari",
    desc: "Post-intervento, lavoro interdisciplinare, comunicazione con medici e fisioterapisti.",
  },
  {
    title: "Gestione professionale del cliente",
    desc: "Relazione, comunicazione efficace, fidelizzazione. Il cliente diventa un riferimento.",
  },
  {
    title: "Business e imprenditoria nel fitness",
    desc: "Strategie, branding, numeri. Costruisci e gestisci la tua attività come un'impresa.",
  },
  {
    title: "Certificazione FIPE × Lacertosus",
    desc: "L'attestazione ufficiale che distingue il tuo profilo sul mercato del lavoro.",
  },
  {
    title: "Diventare l'imprenditore di te stesso",
    desc: "Il percorso termina dove inizia la tua carriera da professionista completo.",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function PercorsoOutcome() {
  const sectionRef = useRef<HTMLElement>(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      // Header animation
      gsap.from(".js-out-header > *", {
        scrollTrigger: {
          trigger: ".js-out-header",
          start: "top 82%",
          once: true,
        },
        opacity: 0,
        y: 28,
        stagger: 0.1,
        duration: 0.7,
        ease: "power3.out",
      });

      // Each outcome row: number first, then text
      gsap.utils.toArray<HTMLElement>(".js-out-row").forEach((row, i) => {
        gsap.from(row, {
          scrollTrigger: { trigger: row, start: "top 90%", once: true },
          opacity: 0,
          x: -24,
          duration: 0.55,
          delay: (i % 4) * 0.06,
          ease: "power3.out",
        });
      });

      // CTA
      gsap.from(".js-out-cta", {
        scrollTrigger: { trigger: ".js-out-cta", start: "top 92%", once: true },
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: "power3.out",
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const th = isDark ? "#f5f5fa" : "#0a0a1a";
  const tb = isDark ? "rgba(180,180,200,0.65)" : "#555";
  const ts = isDark ? "rgba(120,120,140,0.5)" : "#999";
  const borderColor = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";

  return (
    <section
      ref={sectionRef}
      id="competenze"
      className="themed-section relative py-24 md:py-32"
    >
      {/* Background — section-bg-alt per sfondo leggermente differente dall'hero */}
      <div className="absolute inset-0 section-bg-alt" />

      <div className="relative z-10 mx-auto max-w-[1440px] px-[5%] md:px-10">
        {/* 2-col layout: content left + sticky "10" right (desktop only) */}
        <div className="flex items-start gap-0 lg:gap-12">
          {/* ── Left column: tutto il contenuto ──────────────────────────── */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="js-out-header mb-16 max-w-3xl">
              <span className="label-tag mb-4 block">Profilo in Uscita</span>
              <h2
                className="font-black tracking-[-0.025em] leading-[0.92] text-[clamp(2.8rem,5.5vw,5.2rem)]"
                style={{ color: th }}
              >
                Cosa Saprai
                <br />
                <span className="gradient-text">Fare</span>
              </h2>
              <p
                className="mt-5 max-w-lg text-[0.95rem] leading-relaxed"
                style={{ color: tb }}
              >
                Al termine dei 9 mesi avrai costruito un profilo professionale
                che pochi sanno offrire. Queste sono le 10 competenze che ti
                distingueranno.
              </p>
            </div>

            {/* Numbered manifesto list */}
            <div className="max-w-4xl">
              {OUTCOMES.map((outcome, i) => (
                <div
                  key={i}
                  className="js-out-row group flex items-baseline gap-6 md:gap-10 py-5 md:py-6"
                  style={{ borderBottom: `1px solid ${borderColor}` }}
                >
                  <span
                    className="w-10 shrink-0 text-[clamp(1.4rem,2.5vw,2.2rem)] font-black leading-none tabular-nums"
                    style={{
                      color: isDark
                        ? "rgba(240,146,38,0.22)"
                        : "rgba(240,146,38,0.28)",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <div className="flex-1 flex flex-col sm:flex-row sm:items-baseline sm:gap-6">
                    <p
                      className="text-[clamp(0.95rem,1.6vw,1.2rem)] font-black leading-snug tracking-tight sm:min-w-[54%]"
                      style={{ color: th }}
                    >
                      {outcome.title}
                    </p>
                    <p
                      className="mt-1 sm:mt-0 text-[0.83rem] leading-relaxed"
                      style={{ color: ts }}
                    >
                      {outcome.desc}
                    </p>
                  </div>

                  <span className="hidden md:block shrink-0 text-[0.7rem] font-bold tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-academy-orange">
                    →
                  </span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="js-out-cta mt-14 flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <Link
                href="/pack"
                className="inline-flex items-center gap-3 px-8 py-4 text-sm font-black tracking-[0.16em] uppercase transition-all duration-200 hover:opacity-85"
                style={{ background: "#F09226", color: "#111111" }}
              >
                Inizia il Percorso
                <svg
                  viewBox="0 0 16 16"
                  width="13"
                  height="13"
                  fill="currentColor"
                >
                  <path d="M8 13L3 8l1.4-1.4L7 9.2V3h2v6.2l2.6-2.6L13 8z" />
                </svg>
              </Link>
              <p
                className="text-[0.82rem] leading-relaxed max-w-sm"
                style={{ color: ts }}
              >
                Le iscrizioni per l&apos;edizione 2026/27 sono aperte. I posti
                sono limitati a 30 partecipanti.
              </p>
            </div>
          </div>

          {/* ── Right column: "10" sticky (desktop only) ──────────────────── */}
          {/*
            Il flex container ha l'altezza del contenuto sinistro (header → CTA).
            Il sticky si ferma automaticamente quando il right col finisce,
            cioè alla stessa altezza della CTA.
          */}
          <div
            className="hidden lg:block shrink-0"
            style={{ width: "clamp(200px, 22vw, 300px)" }}
          >
            <div
              className="sticky"
              style={{ top: "88px" }} // sotto la navbar fissa
            >
              <span
                className="block font-black leading-none select-none pointer-events-none"
                style={{
                  fontSize: "clamp(160px, 20vw, 280px)",
                  color: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
                  letterSpacing: "-0.04em",
                  lineHeight: 1,
                }}
              >
                10
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
