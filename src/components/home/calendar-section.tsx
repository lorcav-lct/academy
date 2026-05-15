"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTheme } from "@/components/providers/theme-provider";

const COLORS = {
  function: {
    bg: "rgba(240,146,38,0.12)",
    border: "rgba(240,146,38,0.35)",
    text: "#F09226",
    dot: "#F09226",
  },
  strength: {
    bg: "rgba(240,146,38,0.10)",
    border: "rgba(240,146,38,0.30)",
    text: "#F09226",
    dot: "#F09226",
  },
  science: {
    bg: "rgba(240,146,38,0.08)",
    border: "rgba(240,146,38,0.25)",
    text: "#F09226",
    dot: "#F09226",
  },
  fipe: {
    bg: "rgba(67,67,67,0.10)",
    border: "rgba(67,67,67,0.30)",
    text: "#434343",
    dot: "#434343",
  },
  workshop: {
    bg: "rgba(240,146,38,0.05)",
    border: "rgba(240,146,38,0.15)",
    text: "#F09226",
    dot: "rgba(240,146,38,0.5)",
  },
};

const EVENTS = [
  { label: "FUNCTION 1", dates: "11–12 Settembre", type: "function" },
  { label: "Master Tennis", dates: "26 Settembre", type: "workshop" },
  { label: "FUNCTION 2", dates: "9–10 Ottobre", type: "function" },
  { label: "Master Calcio", dates: "24 Ottobre", type: "workshop" },
  { label: "FIPE I", dates: "13–14 Novembre", type: "fipe" },
  { label: "Master FT", dates: "28 Novembre", type: "workshop" },
  { label: "STRENGTH 1", dates: "11–12 Dicembre", type: "strength" },
  { label: "Master End.", dates: "19 Dicembre", type: "workshop" },
  { label: "STRENGTH 2", dates: "15–16 Gennaio", type: "strength" },
  { label: "Master Nuoto", dates: "30 Gennaio", type: "workshop" },
  { label: "FIPE II", dates: "12–13 Febbraio", type: "fipe" },
  { label: "Master Rugby", dates: "27 Febbraio", type: "workshop" },
  { label: "SCIENCE 1", dates: "12–13 Marzo", type: "science" },
  { label: "Master Volley", dates: "27 Marzo", type: "workshop" },
  { label: "SCIENCE 2", dates: "9–10 Aprile", type: "science" },
  { label: "Master Running", dates: "24 Aprile", type: "workshop" },
  { label: "FIPE III", dates: "14–15 Maggio", type: "fipe" },
];

export function CalendarSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLDivElement>(null);

  const { theme } = useTheme();
  const d = theme === "dark";

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.from(headRef.current, {
        scrollTrigger: {
          trigger: headRef.current,
          start: "top 85%",
          once: true,
        },
        opacity: 0,
        y: 25,
        duration: 0.7,
        ease: "power3.out",
      });

      if (lineRef.current) {
        gsap.fromTo(
          lineRef.current,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            transformOrigin: "top",
            scrollTrigger: {
              trigger: itemsRef.current,
              start: "top 70%",
              end: "bottom 60%",
              scrub: 0.5,
            },
          },
        );
      }

      const items = itemsRef.current?.querySelectorAll("[data-cal-item]");
      if (items) {
        gsap.from(items, {
          scrollTrigger: {
            trigger: itemsRef.current,
            start: "top 75%",
            once: true,
          },
          opacity: 0,
          x: 20,
          duration: 0.45,
          stagger: 0.07,
          ease: "power2.out",
        });
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const th = d ? undefined : "#111111";
  const tm = d ? "#c7c7cc" : "#777777";
  const ringColor = d ? "#1a1a1a" : "#ffffff";

  return (
    <section
      ref={sectionRef}
      id="calendario"
      className="themed-section relative overflow-hidden py-24 md:py-32"
    >
      <div className="absolute inset-0 section-bg" />

      <div className="relative z-10 mx-auto max-w-[1440px] px-[5%] md:px-10">
        {/* Header */}
        <div
          ref={headRef}
          className="mb-14 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <span className="label-tag mb-3 block">Calendario Formativo</span>
            <h2
              className="text-[clamp(1.9rem,4vw,3.5rem)] font-black leading-[1.05] tracking-tight text-academy-gray-100"
              style={{ color: th }}
            >
              Il percorso inizia{" "}
              <span className="gradient-text">l&apos;11 Settembre.</span>
            </h2>
            <p
              className="mt-3 max-w-lg text-sm text-academy-gray-400"
              style={{ color: tm }}
            >
              Date reali, senza countdown artificiali. Sai già quando sarai in
              formazione per i prossimi 9 mesi.
            </p>
          </div>
          {/* Legend */}
          <div className="flex flex-wrap gap-3">
            {[
              { label: "Blocco formativo", color: "#F09226" },
              { label: "Sessione FIPE", color: "#434343" },
              { label: "Master", color: "rgba(240,146,38,0.5)" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ background: l.color }}
                />
                <span
                  className="text-[0.75rem] font-medium text-academy-gray-500 uppercase"
                  style={{ color: tm }}
                >
                  {l.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div
            className="absolute left-[7px] top-0 bottom-0 w-px"
            style={{
              background: d ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.1)",
            }}
          />
          <div
            ref={lineRef}
            className="absolute left-[7px] top-0 bottom-0 w-px timeline-progress"
            style={{
              background:
                "linear-gradient(180deg, #F09226, rgba(240,146,38,0.5), #F09226)",
            }}
          />

          <div
            ref={itemsRef}
            className="grid grid-cols-1 gap-2 pl-8 sm:grid-cols-2 lg:grid-cols-3"
          >
            {EVENTS.map((ev) => {
              const c = COLORS[ev.type as keyof typeof COLORS];
              return (
                <div
                  key={`${ev.label}-${ev.dates}`}
                  data-cal-item
                  className="relative flex items-center gap-3 overflow-hidden px-4 py-3"
                  style={{ background: c.bg, border: `1px solid ${c.border}` }}
                >
                  {/* Dot on the line */}
                  <div
                    className="absolute -left-8 h-3 w-3 shrink-0 rounded-full"
                    style={{
                      background: c.dot,
                      boxShadow: `0 0 0 2px ${ringColor}`,
                    }}
                  />
                  <div className="min-w-0">
                    <p
                      className="truncate text-xs font-bold text-academy-gray-200"
                      style={{ color: th }}
                    >
                      {ev.label}
                    </p>
                    <p
                      className="text-[0.75rem] font-medium"
                      style={{ color: c.text }}
                    >
                      {ev.dates}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
