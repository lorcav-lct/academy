"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SectionContainer } from "@/components/shared/section-container";
import { GradientText } from "@/components/shared/gradient-text";
import { useTheme } from "@/components/providers/theme-provider";

const PARTNERS = [
  "Centro Aura Parma",
  "Centro Aura Pietrasanta",
  "21 Lab",
  "Line Up",
  "Att1tud",
  "Ronchi Verdi",
  "FitFam",
  "Riccardo Capello Studio",
  "CryoVis",
  "Union Training Lab",
  "Marco Bani Training",
  "Miwa Energia",
];

export function PercorsoTirocinio() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const calloutRef = useRef<HTMLDivElement>(null);

  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.from(headRef.current, {
        scrollTrigger: { trigger: headRef.current, start: "top 85%", once: true },
        opacity: 0,
        y: 28,
        duration: 0.7,
        ease: "power3.out",
      });

      const cards = gridRef.current?.querySelectorAll("[data-partner-card]");
      if (cards) {
        gsap.from(cards, {
          scrollTrigger: { trigger: gridRef.current, start: "top 78%", once: true },
          opacity: 0,
          y: 35,
          scale: 0.96,
          duration: 0.55,
          stagger: { amount: 0.7, from: "start" },
          ease: "power3.out",
        });
      }

      gsap.from(calloutRef.current, {
        scrollTrigger: { trigger: calloutRef.current, start: "top 88%", once: true },
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: "power3.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <SectionContainer>
      <div ref={sectionRef}>
        {/* Header */}
        <div ref={headRef} className="mb-14 text-center">
          <span className="label-tag mb-4 block">Tirocinio Garantito</span>
          <h2 className="mb-5 text-[clamp(1.9rem,4vw,3.5rem)] font-black leading-[1.05] tracking-tight">
            <GradientText>Metti in pratica</GradientText>{" "}
            <span
              style={{ color: isDark ? undefined : "#111111" }}
              className="text-academy-gray-100"
            >
              ciò che hai imparato.
            </span>
          </h2>
          <p
            className="mx-auto max-w-2xl text-sm leading-relaxed text-academy-gray-400"
            style={{ color: isDark ? undefined : "#666666" }}
          >
            Al termine del percorso, i partecipanti certificati possono accedere a un tirocinio
            garantito presso una delle strutture partner selezionate da Lacertosus Academy.
          </p>
        </div>

        {/* Partner grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
        >
          {PARTNERS.map((name) => (
            <div
              key={name}
              data-partner-card
              className="group relative overflow-hidden p-5 transition-all duration-400 hover:glow-orange"
              style={{
                background: isDark ? "rgba(10,8,28,0.7)" : "#ffffff",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)"}`,
                backdropFilter: "blur(12px)",
              }}
            >
              {/* Partner badge */}
              <span className="mb-3 inline-block bg-academy-orange/10 px-2 py-0.5 text-[0.6rem] font-black tracking-[0.22em] text-academy-orange uppercase">
                Partner Ufficiale
              </span>

              {/* Name */}
              <p
                className="text-sm font-bold leading-snug tracking-wide transition-colors duration-300 group-hover:text-academy-orange"
                style={{ color: isDark ? "#e8e4f0" : "#111111" }}
              >
                {name}
              </p>

              {/* Hover accent */}
              <div className="absolute right-0 bottom-0 h-16 w-16 translate-x-6 translate-y-6 rounded-full bg-academy-orange/5 blur-xl opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:translate-x-3 group-hover:translate-y-3" />
            </div>
          ))}
        </div>

        {/* Callout */}
        <div
          ref={calloutRef}
          className="mx-auto mt-10 max-w-3xl p-6 text-center text-sm leading-relaxed"
          style={{
            background: isDark
              ? "rgba(240,146,38,0.05)"
              : "rgba(240,146,38,0.06)",
            border: `1px solid ${isDark ? "rgba(240,146,38,0.18)" : "rgba(240,146,38,0.25)"}`,
          }}
        >
          <span
            className="font-medium"
            style={{ color: isDark ? "#c8c4d8" : "#555555" }}
          >
            Il tirocinio è un&apos;opportunità riservata agli alumni certificati{" "}
            <span className="font-bold text-academy-orange">FIPE × Lacertosus</span>. I posti
            sono limitati e assegnati in base al percorso e alla disponibilità.
          </span>
        </div>
      </div>
    </SectionContainer>
  );
}
