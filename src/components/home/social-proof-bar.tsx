"use client";

import { useState } from "react";
import { useTheme } from "@/components/providers/theme-provider";

type MarqueeItemData =
  | { type: "stat";  value: string; label: string }
  | { type: "quote"; text: string }
  | { type: "badge"; value: string; label: string };

const ITEMS: MarqueeItemData[] = [
  { type: "stat",  value: "+200",  label: "Professionisti Formati" },
  { type: "quote", text: "Il percorso più completo del fitness italiano" },
  { type: "badge", value: "FIPE",  label: "Certificazione Ufficiale" },
  { type: "stat",  value: "9",     label: "Mesi di Formazione" },
  { type: "quote", text: "Docenti universitari e professionisti d'eccellenza" },
  { type: "badge", value: "100%",  label: "In Presenza" },
  { type: "stat",  value: "★★★★★", label: "Valutazione Media Alumni" },
  { type: "quote", text: "Dal tecnico all'imprenditore — formazione a 360°" },
  { type: "badge", value: "3",     label: "Blocchi Progressivi" },
  { type: "stat",  value: "8",     label: "Masterclass Specialistici" },
  { type: "quote", text: "L'unica academy che forma imprenditori del fitness" },
  { type: "badge", value: "PRIMAL → VIS → VICTOR", label: "Percorso Progressivo" },
];

const DOUBLE = [...ITEMS, ...ITEMS];

function Sep() {
  return (
    <span className="mx-4 shrink-0" style={{ color: "rgba(240,146,38,0.3)", fontSize: "0.35rem" }}>
      ◆
    </span>
  );
}

function MarqueeItem({ item, isDark }: { item: MarqueeItemData; isDark: boolean }) {
  const labelColor = isDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.65)";
  const quoteColor = isDark ? "rgba(255,255,255,0.68)" : "rgba(0,0,0,0.6)";

  if (item.type === "stat") {
    return (
      <div className="flex items-baseline gap-2.5 shrink-0">
        <span
          className="tabular-nums font-black"
          style={{ fontSize: "1.05rem", color: item.value.startsWith("★") ? "#D4AF37" : "#F09226" }}
        >
          {item.value}
        </span>
        <span className="text-[0.75rem] font-bold tracking-[0.18em] uppercase" style={{ color: labelColor }}>
          {item.label}
        </span>
        <Sep />
      </div>
    );
  }

  if (item.type === "badge") {
    return (
      <div className="flex items-center gap-2.5 shrink-0">
        <span
          className="text-[0.75rem] font-black tracking-[0.2em] px-2 py-[3px]"
          style={{ color: "#F09226", border: "1px solid rgba(240,146,38,0.35)" }}
        >
          {item.value}
        </span>
        <span className="text-[0.75rem] font-bold tracking-[0.18em] uppercase" style={{ color: labelColor }}>
          {item.label}
        </span>
        <Sep />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      <span style={{ color: "rgba(240,146,38,0.35)", fontSize: "0.7rem" }}>&ldquo;</span>
      <span className="text-[0.75rem] font-medium tracking-[0.06em] italic" style={{ color: quoteColor }}>
        {item.text}
      </span>
      <Sep />
    </div>
  );
}

export function SocialProofBar() {
  const [paused, setPaused] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className="spb-bg relative overflow-hidden cursor-default themed-section"
      style={{ borderBottom: "1px solid rgba(240,146,38,0.06)" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Fade masks */}
      <div className="spb-fade-l pointer-events-none absolute left-0 top-0 z-10 h-full w-24" />
      <div className="spb-fade-r pointer-events-none absolute right-0 top-0 z-10 h-full w-24" />

      {/* Top line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(240,146,38,0.1) 25%, rgba(212,175,55,0.14) 50%, rgba(240,146,38,0.1) 75%, transparent 100%)",
        }}
      />

      <div className="py-5 overflow-hidden">
        <div
          className="marquee-track flex items-center gap-8 whitespace-nowrap"
          style={{
            animationDuration: "38s",
            animationPlayState: paused ? "paused" : "running",
          }}
        >
          {DOUBLE.map((item, i) => (
            <MarqueeItem key={i} item={item} isDark={isDark} />
          ))}
        </div>
      </div>
    </div>
  );
}
