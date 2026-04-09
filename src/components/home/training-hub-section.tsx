"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTheme } from "@/components/providers/theme-provider";

// ── Data ──────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    n: "01",
    title: "Zero investimento iniziale",
    desc: "Nessun capitale da immobilizzare. Paghi un canone mensile che include attrezzatura, immobile e supporto.",
  },
  {
    n: "02",
    title: "Autonomia totale",
    desc: "Sei tu a fissare tariffe, orari e strategia commerciale. Il brand Lacertosus, il tuo business.",
  },
  {
    n: "03",
    title: "Brand e rete già pronti",
    desc: "Accedi al brand Lacertosus, ai materiali di marketing e alla rete nazionale di professionisti certificati.",
  },
  {
    n: "04",
    title: "Supporto operativo continuo",
    desc: "Metodologie, materiali di formazione e assistenza diretta dal team Lacertosus per avviare e crescere.",
  },
  {
    n: "05",
    title: "Apertura rapida",
    desc: "Il format è già testato e rodato. Dalla firma del contratto all'apertura in tempi brevi.",
  },
];

const MODELS = [
  {
    id: "hub50",
    size: "50 mq",
    label: "Solo Trainer",
    desc: "Per il professionista che vuole iniziare in autonomia con il suo spazio esclusivo.",
    featured: false,
  },
  {
    id: "hub100",
    size: "100 mq",
    label: "Partner / Duo",
    desc: "Per due trainer che condividono gli spazi e abbattono i costi fissi.",
    featured: true,
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function TrainingHubSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { theme } = useTheme();
  const d = theme === "dark";

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.from(".js-hub-header > *", {
        scrollTrigger: {
          trigger: ".js-hub-header",
          start: "top 80%",
          once: true,
        },
        opacity: 0,
        y: 26,
        stagger: 0.1,
        duration: 0.7,
        ease: "power3.out",
      });
      gsap.from(".js-hub-feat", {
        scrollTrigger: {
          trigger: ".js-hub-feats",
          start: "top 80%",
          once: true,
        },
        opacity: 0,
        y: 22,
        stagger: 0.08,
        duration: 0.6,
        ease: "power3.out",
      });
      gsap.from(".js-hub-model", {
        scrollTrigger: {
          trigger: ".js-hub-models",
          start: "top 78%",
          once: true,
        },
        opacity: 0,
        y: 28,
        stagger: 0.1,
        duration: 0.65,
        ease: "power3.out",
      });
      gsap.from(".js-hub-cta", {
        scrollTrigger: { trigger: ".js-hub-cta", start: "top 90%", once: true },
        opacity: 0,
        y: 18,
        duration: 0.6,
        ease: "power3.out",
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const th = d ? "#f5f5fa" : "#0a0a1a";
  const tb = d ? "rgba(180,180,200,0.65)" : "#555";
  const ts = d ? "rgba(120,120,140,0.5)" : "#999";
  const borderSubtle = d ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const cardBg = d ? "rgba(10,10,40,0.5)" : "rgba(255,255,255,0.85)";

  return (
    <section
      ref={sectionRef}
      id="training-hub"
      className="themed-section relative overflow-hidden py-24 md:py-32"
    >
      {/* Background */}
      <div className="absolute inset-0 section-bg" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: d
            ? "radial-gradient(ellipse at 20% 50%, rgba(240,146,38,0.045) 0%, transparent 55%)"
            : "radial-gradient(ellipse at 20% 50%, rgba(240,146,38,0.06) 0%, transparent 55%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(to right, ${d ? "#fff" : "#000"} 1px, transparent 1px), linear-gradient(to bottom, ${d ? "#fff" : "#000"} 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-[1440px] px-[5%] md:px-10 space-y-20 md:space-y-28">
        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <div className="js-hub-header flex flex-col gap-0 max-w-4xl">
          <span className="label-tag mb-5 block">
            Opportunità Imprenditoriale
          </span>
          <h2
            className="font-black tracking-[-0.025em] leading-[0.92] text-[clamp(2.6rem,5.5vw,5rem)]"
            style={{ color: th }}
          >
            Apri il tuo
            <br />
            <span className="gradient-text">Training Hub.</span>
          </h2>
          <p
            className="mt-4 text-[clamp(1.3rem,2.2vw,1.8rem)] font-black tracking-tight leading-tight"
            style={{
              color: d ? "rgba(240,146,38,0.75)" : "rgba(200,85,0,0.8)",
            }}
          >
            Zero investimento iniziale. Zero scuse.
          </p>
          <p
            className="mt-5 max-w-xl text-[0.95rem] leading-relaxed"
            style={{ color: tb }}
          >
            Il percorso Academy non è solo formazione — è la chiave per aprire
            una struttura certificata Lacertosus sul territorio. Canone mensile,
            brand già costruito, supporto operativo dal giorno uno.
          </p>
        </div>

        {/* ── 5 FEATURES ──────────────────────────────────────────────────── */}
        <div className="js-hub-feats grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {FEATURES.map((f) => (
            <div
              key={f.n}
              className="js-hub-feat flex flex-col gap-4 p-6"
              style={{
                border: `1px solid ${borderSubtle}`,
                background: cardBg,
              }}
            >
              <span className="text-[0.55rem] font-black tracking-[0.3em] text-academy-orange/40 uppercase">
                {f.n}
              </span>
              <div>
                <p
                  className="text-[0.95rem] font-black leading-snug"
                  style={{ color: th }}
                >
                  {f.title}
                </p>
                <p
                  className="mt-2 text-[0.8rem] leading-relaxed"
                  style={{ color: ts }}
                >
                  {f.desc}
                </p>
              </div>
              <div
                className="mt-auto h-0.5 w-8"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(240,146,38,0.45), transparent)",
                }}
              />
            </div>
          ))}
        </div>

        {/* ── 2 MODELS ────────────────────────────────────────────────────── */}
        <div className="js-hub-models">
          <div className="mb-8">
            <span className="label-tag mb-3 block">I Modelli</span>
            <h3
              className="text-[1.6rem] font-black tracking-tight"
              style={{ color: th }}
            >
              Scegli la dimensione giusta per te
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MODELS.map((m) => (
              <div
                key={m.id}
                className="js-hub-model relative flex flex-col justify-between p-8"
                style={{
                  border: m.featured
                    ? "1px solid rgba(240,146,38,0.35)"
                    : `1px solid ${borderSubtle}`,
                  background: m.featured
                    ? d
                      ? "linear-gradient(145deg, rgba(240,146,38,0.06), rgba(10,10,40,0.7))"
                      : "linear-gradient(145deg, rgba(240,146,38,0.05), rgba(255,255,255,0.95))"
                    : cardBg,
                }}
              >
                {m.featured && (
                  <div
                    className="absolute top-0 left-0 right-0 h-0.5"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, rgba(240,146,38,0.6), transparent)",
                    }}
                  />
                )}

                <div className="flex flex-col gap-5">
                  <div>
                    <p
                      className="text-[2.5rem] font-black leading-none"
                      style={{ color: th }}
                    >
                      {m.size}
                    </p>
                    <p className="text-[0.72rem] font-bold tracking-[0.2em] text-academy-orange/65 uppercase mt-1">
                      {m.label}
                    </p>
                  </div>
                  <p
                    className="text-[0.88rem] leading-relaxed"
                    style={{ color: tb }}
                  >
                    {m.desc}
                  </p>

                  {/* Academy discount badge */}
                  <div
                    className="inline-flex items-center gap-2.5 px-4 py-2.5 self-start"
                    style={{
                      border: "1px solid rgba(240,146,38,0.3)",
                      background: "rgba(240,146,38,0.07)",
                    }}
                  >
                    <span
                      className="h-1.5 w-1.5 shrink-0"
                      style={{ background: "#F09226" }}
                    />
                    <span className="text-[0.72rem] font-bold tracking-[0.15em] text-academy-orange uppercase">
                      Sconto riservato ai partecipanti Academy
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA BAND ────────────────────────────────────────────────────── */}
        <div
          className="js-hub-cta relative overflow-hidden p-10 md:p-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-8"
          style={{
            border: "1px solid rgba(240,146,38,0.2)",
            background: d
              ? "linear-gradient(145deg, rgba(240,146,38,0.06), rgba(2,0,38,0.95))"
              : "linear-gradient(145deg, rgba(240,146,38,0.05), rgba(255,255,255,0.98))",
          }}
        >
          {/* Accent line */}
          <div
            className="absolute top-0 left-0 right-0 h-0.5"
            style={{
              background: "linear-gradient(90deg, #F09226, transparent)",
            }}
          />

          <div>
            <p
              className="text-[clamp(1.4rem,2.5vw,2.2rem)] font-black tracking-tight leading-tight"
              style={{ color: th }}
            >
              Pronto ad aprire il tuo Hub?
            </p>
            <p className="mt-2 text-[0.9rem] max-w-md" style={{ color: tb }}>
              Scopri tutti i dettagli e candidati per un Training Hub Lacertosus
              nella tua città.
            </p>
          </div>

          <a
            href="/pack"
            className="shrink-0 inline-flex items-center gap-3 px-8 py-4 text-sm font-black tracking-[0.16em] uppercase transition-all duration-200 hover:opacity-85"
            style={{ background: "#F09226", color: "#010015" }}
          >
            Inizia il Percorso
            <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor">
              <path d="M8 13L3 8l1.4-1.4L7 9.2V3h2v6.2l2.6-2.6L13 8z" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
