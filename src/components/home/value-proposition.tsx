"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTheme } from "@/components/providers/theme-provider";

const PROBLEMS = [
  "Corsi online senza pratica reale",
  "Certificazioni non riconosciute dal settore",
  "Formazione tecnica — zero visione business",
  "Docenti senza esperienza concreta di campo",
  "Nessuna rete professionale dopo il corso",
];

const SOLUTIONS = [
  {
    num: "01",
    title: "Docenti di eccellenza",
    body: "Professionisti attivi, coach con curricula internazionali e docenti universitari. Non teoria da libro, ma esperienza di campo.",
    accent: "rgba(240,146,38,0.12)",
    accentLight: "rgba(240,146,38,0.06)",
  },
  {
    num: "02",
    title: "Certificazione FIPE × Lacertosus",
    body: "L'unica certificazione doppia riconosciuta a livello nazionale e internazionale — inclusa nel percorso senza costi aggiuntivi.",
    accent: "rgba(212,175,55,0.10)",
    accentLight: "rgba(212,175,55,0.05)",
  },
  {
    num: "03",
    title: "Dal tecnico all'imprenditore",
    body: "Biomeccanica, alimentazione, psicologia del cliente, business e branding. Un percorso a 360° senza compromessi.",
    accent: "rgba(240,146,38,0.10)",
    accentLight: "rgba(240,146,38,0.05)",
  },
  {
    num: "04",
    title: "Una rete concreta",
    body: "Accesso a una comunità di professionisti certificati e possibilità di aprire un Training Hub Lacertosus.",
    accent: "rgba(212,175,55,0.08)",
    accentLight: "rgba(212,175,55,0.04)",
  },
];

export function ValueProposition() {
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const problemsRef = useRef<HTMLDivElement>(null);
  const stat9Ref = useRef<HTMLDivElement>(null);
  const counter9Ref = useRef<HTMLSpanElement>(null);
  const counter100Ref = useRef<HTMLSpanElement>(null);
  const imagePlaceholderRef = useRef<HTMLDivElement>(null);
  const imgInnerRef = useRef<HTMLDivElement>(null);
  const solutionsRef = useRef<HTMLDivElement>(null);

  const { theme } = useTheme();
  const d = theme === "dark";

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {

      // 1. Header fade up
      gsap.from(headRef.current, {
        scrollTrigger: { trigger: headRef.current, start: "top 88%", once: true },
        opacity: 0, y: 40, duration: 0.85, ease: "power3.out",
      });

      // 2. Problems column — slide in from left, then strikethrough lines draw across
      const problemItems = problemsRef.current?.querySelectorAll("[data-problem]");
      if (problemItems?.length) {
        gsap.from(problemItems, {
          scrollTrigger: { trigger: problemsRef.current, start: "top 82%", once: true },
          opacity: 0, x: -30, duration: 0.55, stagger: 0.1, ease: "power2.out",
        });
        const strikes = problemsRef.current?.querySelectorAll("[data-strike]");
        if (strikes?.length) {
          gsap.set(strikes, { scaleX: 0, transformOrigin: "left center" });
          gsap.to(strikes, {
            scrollTrigger: { trigger: problemsRef.current, start: "top 68%", once: true },
            scaleX: 1, duration: 0.55, stagger: 0.13, ease: "power2.inOut", delay: 0.5,
          });
        }
      }

      // 3. Counter: 9 mesi
      if (counter9Ref.current) {
        const obj = { val: 0 };
        gsap.to(obj, {
          scrollTrigger: { trigger: stat9Ref.current, start: "top 82%", once: true },
          val: 9, duration: 1.4, ease: "power2.out",
          onUpdate() { if (counter9Ref.current) counter9Ref.current.textContent = String(Math.round(obj.val)); },
        });
      }

      // 4. Counter: 100%
      if (counter100Ref.current) {
        const obj = { val: 0 };
        gsap.to(obj, {
          scrollTrigger: { trigger: counter100Ref.current, start: "top 82%", once: true },
          val: 100, duration: 1.6, ease: "power2.out",
          onUpdate() { if (counter100Ref.current) counter100Ref.current.textContent = String(Math.round(obj.val)); },
        });
      }

      // 5. Image placeholder — subtle parallax on scroll (scrub)
      if (imagePlaceholderRef.current && imgInnerRef.current) {
        gsap.to(imgInnerRef.current, {
          scrollTrigger: {
            trigger: imagePlaceholderRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.5,
          },
          y: -28, ease: "none",
        });
      }

      // 6. Solution cards — perspective flip stagger (user-centric: feel "revealed" as you scroll)
      const solutionCards = solutionsRef.current?.querySelectorAll("[data-solution]");
      if (solutionCards?.length) {
        gsap.set(solutionsRef.current, { perspective: 1000 });
        gsap.from(solutionCards, {
          scrollTrigger: { trigger: solutionsRef.current, start: "top 84%", once: true },
          opacity: 0, y: 55, rotateX: 10, duration: 0.7, stagger: 0.12, ease: "power3.out",
        });
      }

    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const th = d ? undefined : "#111111";
  const tm = d ? undefined : "#777777";

  const cardBg = d ? "rgba(10,8,28,0.7)" : "#ffffff";
  const cardBorder = d ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)";
  const problemBg = d ? "rgba(6,4,18,0.88)" : "#F0EDE8";
  const problemBorder = d ? "rgba(220,60,60,0.12)" : "rgba(200,40,40,0.09)";
  const accentBg = d
    ? "linear-gradient(145deg, rgba(240,146,38,0.1), rgba(2,0,38,0.92))"
    : "linear-gradient(145deg, rgba(240,146,38,0.07), rgba(255,255,255,0.99))";
  const accentBorder = d ? "rgba(240,146,38,0.2)" : "rgba(240,146,38,0.22)";

  return (
    <section ref={sectionRef} id="perche" className="themed-section relative overflow-hidden py-24 md:py-32">
      <div className="absolute inset-0 section-bg" />

      <div className="relative z-10 mx-auto max-w-[1440px] px-[5%] md:px-10">

        {/* Header */}
        <div ref={headRef} className="mb-12">
          <span className="label-tag mb-3 block">Perché Lacertosus</span>
          <h2
            className="max-w-3xl text-[clamp(2rem,4.5vw,3.8rem)] font-black leading-[1.05] tracking-tight"
            style={{ color: th }}
          >
            Il settore fitness è pieno di corsi.{" "}
            <span className="gradient-text">Ma non di professionisti.</span>
          </h2>
        </div>

        {/* Main grid */}
        <div className="grid gap-3 lg:grid-cols-12">

          {/* PROBLEMS — col-span-4, row-span-2: tall card crossing rows 1 and 2 */}
          <div
            ref={problemsRef}
            className="relative flex flex-col justify-between overflow-hidden p-7 lg:col-span-4 lg:row-span-2"
            style={{ background: problemBg, border: `1px solid ${problemBorder}` }}
          >
            {/* Subtle red tint glow */}
            <div className="pointer-events-none absolute inset-0" style={{
              background: "radial-gradient(ellipse at 20% 15%, rgba(200,40,40,0.06) 0%, transparent 65%)",
            }} />

            <div className="relative">
              <p className="mb-7 text-[0.7rem] font-black tracking-[0.32em] uppercase" style={{ color: d ? "rgba(210,55,55,0.75)" : "rgba(190,35,35,0.65)" }}>
                ✕&ensp;Il problema
              </p>
              <ul className="space-y-5">
                {PROBLEMS.map((p, i) => (
                  <li key={i} data-problem className="flex items-start gap-3.5">
                    <span
                      className="mt-[3px] shrink-0 text-[0.6rem] font-black"
                      style={{ color: d ? "rgba(220,55,55,0.45)" : "rgba(190,35,35,0.38)" }}
                    >
                      ✕
                    </span>
                    <span
                      className="relative text-[0.85rem] leading-snug"
                      style={{ color: d ? "rgba(255,255,255,0.48)" : "rgba(0,0,0,0.4)" }}
                    >
                      {p}
                      {/* Animated strikethrough */}
                      <span
                        data-strike
                        className="absolute left-0 right-0"
                        style={{
                          top: "50%",
                          height: "1px",
                          background: d ? "rgba(210,55,55,0.32)" : "rgba(190,35,35,0.25)",
                          transformOrigin: "left center",
                        }}
                      />
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="relative mt-8 pt-6"
              style={{ borderTop: d ? "1px solid rgba(240,146,38,0.1)" : "1px solid rgba(0,0,0,0.07)" }}
            >
              <p className="text-[0.7rem] font-black tracking-[0.3em] text-academy-orange/80 uppercase">
                ✓&ensp;La risposta
              </p>
              <p className="mt-2 text-[0.88rem] font-semibold leading-relaxed" style={{ color: d ? "rgba(255,255,255,0.78)" : "#1a1a1a" }}>
                Un percorso formativo unico che unisce tecnica, pratica e visione imprenditoriale.
              </p>
            </div>
          </div>

          {/* FORMAZIONE — 9 mesi — col-span-4, row 1 */}
          <div
            ref={stat9Ref}
            className="flex flex-col justify-between p-7 lg:col-span-4"
            style={{ background: accentBg, border: `1px solid ${accentBorder}` }}
          >
            <p className="text-[0.75rem] font-bold tracking-[0.28em] text-academy-orange/80 uppercase">Formazione</p>
            <div>
              <div className="text-[clamp(4.5rem,9vw,7rem)] font-black leading-none text-academy-orange tabular-nums">
                <span ref={counter9Ref}>0</span>
              </div>
              <p className="mt-1 text-lg font-bold" style={{ color: th }}>mesi di trasformazione</p>
              <p className="mt-2 text-[0.8rem]" style={{ color: tm }}>CORPUS → VIS → VICTOR + Certificazione FIPE</p>
            </div>
          </div>

          {/* IMAGE PLACEHOLDER — col-span-4, row-span-2 (right column, spanning both rows) */}
          <div
            ref={imagePlaceholderRef}
            className="relative overflow-hidden lg:col-span-4 lg:row-span-2"
            style={{
              minHeight: "200px",
              background: d ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0.025)",
              border: d ? "1px dashed rgba(255,255,255,0.07)" : "1px dashed rgba(0,0,0,0.09)",
            }}
          >
            <div ref={imgInnerRef} className="absolute inset-0 flex flex-col items-center justify-center gap-3 select-none">
              <svg width="38" height="38" viewBox="0 0 24 24" fill="none" style={{ color: d ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.18)" }}>
                <rect x="2" y="6" width="20" height="15" rx="2" stroke="currentColor" strokeWidth="1.2" />
                <circle cx="12" cy="13.5" r="3.5" stroke="currentColor" strokeWidth="1.2" />
                <path d="M8 6l1.5-2.5h5L16 6" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
              </svg>
              <p className="text-[0.68rem] font-bold tracking-[0.32em] uppercase" style={{ color: d ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.16)" }}>
                Inserisci immagine
              </p>
            </div>
          </div>

          {/* PRESENZA — 100% — col-span-4, row 2 (stacked below Formazione) */}
          <div
            className="flex flex-col justify-between p-7 lg:col-span-4"
            style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
          >
            <p className="text-[0.75rem] font-bold tracking-[0.28em] text-academy-orange/80 uppercase">Presenza</p>
            <div>
              <div className="text-[clamp(3.5rem,7vw,5.5rem)] font-black leading-none gradient-text tabular-nums">
                <span ref={counter100Ref}>0</span>
                <span className="text-[clamp(1.8rem,3.5vw,2.8rem)]">%</span>
              </div>
              <p className="mt-1 text-base font-bold" style={{ color: th }}>In Presenza</p>
              <p className="mt-1 text-[0.8rem]" style={{ color: tm }}>Nessuna lezione online. Solo pratica autentica e confronto diretto.</p>
            </div>
          </div>

          {/* SOLUTION CARDS — col-span-12, bottom row */}
          <div
            ref={solutionsRef}
            className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:col-span-12 lg:grid-cols-4"
          >
            {SOLUTIONS.map((s) => (
              <div
                key={s.num}
                data-solution
                className="relative overflow-hidden p-6"
                style={{
                  background: d
                    ? `linear-gradient(145deg, ${s.accent}, rgba(2,0,38,0.9))`
                    : `linear-gradient(145deg, ${s.accentLight}, rgba(255,255,255,0.98))`,
                  border: d ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.07)",
                }}
              >
                <span className="mb-4 block text-[0.7rem] font-black tracking-[0.3em] text-academy-orange/50 uppercase">{s.num}</span>
                <h3 className="mb-2 text-[0.88rem] font-bold leading-tight" style={{ color: th }}>{s.title}</h3>
                <p className="text-[0.8rem] leading-relaxed" style={{ color: tm }}>{s.body}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
