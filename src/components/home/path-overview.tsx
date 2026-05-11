"use client";

import { useState } from "react";
import { COURSES } from "@/lib/constants/courses";
import { BlockModal, type BlockSlug } from "@/components/shared/block-modal";

const META = {
  function: {
    roman: "I",
    color: "#F09226",
    tagline: "Le Fondamenta",
    season: "Autunno 2026",
  },
  strength: {
    roman: "II",
    color: "#F09226",
    tagline: "La Forza",
    season: "Inverno 2026/27",
  },
  science: {
    roman: "III",
    color: "#F09226",
    tagline: "La Vittoria",
    season: "Primavera 2027",
  },
} as const;

const STATS = [
  { v: "9", u: "mesi" },
  { v: "11", u: "weekend" },
  { v: "30", u: "posti" },
];

export function PathOverview() {
  const [openBlock, setOpenBlock] = useState<BlockSlug | null>(null);

  return (
    <section
      id="percorso"
      className="relative"
      style={{
        background:
          "radial-gradient(ellipse at 18% 55%, rgba(240,146,38,0.09) 0%, transparent 58%), radial-gradient(ellipse at 82% 25%, rgba(240,146,38,0.05) 0%, transparent 45%), linear-gradient(145deg, #434343 0%, #1a1a1a 55%, #0a0a0a 100%)",
      }}
    >
      <style jsx>{`
        @keyframes path-card-float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .path-float {
            animation: none !important;
          }
        }
      `}</style>

      {/* ── DESKTOP ──────────────────────────────────────────────────────────── */}
      <div className="relative hidden lg:block px-[5%] py-28">
        <div className="mx-auto w-full max-w-[1400px]">
          {/* Header */}
          <div className="grid grid-cols-2 items-end gap-12 mb-16">
            <div>
              <span className="label-tag mb-4 block">
                I 3 Blocchi Formativi — 2026/27
              </span>
              <h2
                className="font-black leading-[0.95] tracking-tight text-white"
                style={{ fontSize: "clamp(3rem,5.5vw,5.5rem)" }}
              >
                Il <span style={{ color: "#F09226" }}>Percorso.</span>
              </h2>
              <p
                className="mt-5 max-w-lg text-[1.0625rem] leading-relaxed"
                style={{ color: "rgba(255,255,255,0.72)" }}
              >
                9 mesi di formazione progressiva. Tre blocchi che si
                costruiscono l&apos;uno sull&apos;altro.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 justify-self-end max-w-sm w-full">
              {STATS.map(({ v, u }) => (
                <div
                  key={u}
                  className="p-4 text-center"
                  style={{
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(255,255,255,0.04)",
                  }}
                >
                  <p
                    className="text-[2rem] font-black leading-none tabular-nums"
                    style={{ color: "#F09226" }}
                  >
                    {v}
                  </p>
                  <p
                    className="mt-1 text-[0.72rem] font-bold tracking-[0.18em] uppercase"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                  >
                    {u}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 3-column grid */}
          <div className="grid grid-cols-3 gap-6">
            {COURSES.map((course, idx) => {
              const meta = META[course.slug as keyof typeof META];
              if (!meta) return null;
              const { roman, color, tagline, season } = meta;
              return (
                <div
                  key={course.slug}
                  className="path-float flex flex-col justify-between"
                  style={{
                    background: "#f8f8fc",
                    border: "1px solid rgba(0,0,0,0.07)",
                    boxShadow:
                      "0 28px 70px rgba(0,0,0,0.32), 0 4px 18px rgba(0,0,0,0.14)",
                    padding: "2.25rem 2rem",
                    minHeight: "640px",
                    animation: `path-card-float 3.6s ease-in-out ${idx * 0.4}s infinite`,
                    willChange: "transform",
                  }}
                >
                  <div>
                    {/* Step indicator */}
                    <div className="mb-6 flex items-center gap-1.5">
                      {COURSES.map((_, di) => (
                        <span
                          key={di}
                          className="block"
                          style={{
                            width: di === idx ? 28 : 8,
                            height: 2,
                            background: di === idx ? color : "rgba(0,0,0,0.15)",
                          }}
                        />
                      ))}
                      <span
                        className="ml-2 text-[0.62rem] font-bold tracking-[0.28em] uppercase"
                        style={{ color: "rgba(0,0,0,0.4)" }}
                      >
                        {roman} / III
                      </span>
                    </div>

                    {/* Roman */}
                    <div
                      className="font-black leading-none tabular-nums"
                      style={{
                        fontSize: "clamp(4.5rem, 7vw, 7.5rem)",
                        color,
                        lineHeight: 0.88,
                      }}
                    >
                      {roman}
                    </div>
                    <span
                      className="mt-3 block text-[0.68rem] font-black tracking-[0.32em] uppercase"
                      style={{ color: "rgba(240,146,38,0.75)" }}
                    >
                      {course.area}
                    </span>
                    <h3
                      className="mt-1 font-black leading-tight tracking-tight"
                      style={{
                        fontSize: "clamp(1.6rem, 2vw, 2.1rem)",
                        color: "#111111",
                      }}
                    >
                      {course.title}
                    </h3>
                    <p
                      className="mt-1 text-[0.95rem] font-bold"
                      style={{ color }}
                    >
                      {tagline}
                    </p>

                    <p
                      className="mt-5 text-[0.88rem] leading-relaxed"
                      style={{ color: "#555555" }}
                    >
                      {course.objective}
                    </p>

                    <ul className="mt-6 space-y-2">
                      {course.curriculum.slice(0, 4).map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2.5 text-[0.82rem]"
                          style={{ color: "rgba(17,17,17,0.78)" }}
                        >
                          <span
                            className="mt-[0.5em] h-1 w-1 shrink-0"
                            style={{ background: color }}
                          />
                          {item}
                        </li>
                      ))}
                      {course.curriculum.length > 4 && (
                        <li
                          className="pl-[14px] text-[0.75rem]"
                          style={{ color: "rgba(0,0,0,0.38)" }}
                        >
                          + {course.curriculum.length - 4} altri argomenti
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="mt-6">
                    <div className="mb-4 flex items-center gap-2">
                      <span
                        className="text-[0.62rem] font-bold tracking-[0.2em] uppercase"
                        style={{ color: "rgba(0,0,0,0.4)" }}
                      >
                        Periodo
                      </span>
                      <span
                        className="px-2.5 py-0.5 text-[0.7rem] font-bold"
                        style={{
                          border: "1px solid rgba(240,146,38,0.35)",
                          color: "#C06A0A",
                          background: "rgba(240,146,38,0.08)",
                        }}
                      >
                        {season}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOpenBlock(course.slug as BlockSlug)}
                      className="block w-full py-3.5 text-center text-[0.8rem] font-black tracking-[0.18em] uppercase transition-opacity duration-200 cursor-pointer hover:opacity-85"
                      style={{ background: "#F09226", color: "#111111" }}
                    >
                      Scopri il programma →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── MOBILE ──────────────────────────────────────────────────────────── */}
      <div className="relative lg:hidden">
        <div className="px-[5%] pt-16 pb-6">
          <span className="label-tag mb-3 block">I 3 Blocchi Formativi</span>
          <h2
            className="font-black leading-tight tracking-tight text-white"
            style={{ fontSize: "clamp(2.2rem,8vw,3rem)" }}
          >
            Il Percorso.
          </h2>
          <p
            className="mt-2 text-[0.9375rem] leading-relaxed"
            style={{ color: "rgba(255,255,255,0.65)" }}
          >
            9 mesi · 3 blocchi
          </p>
        </div>

        <div
          className="overflow-x-auto pb-6"
          style={{
            scrollSnapType: "x mandatory",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
            display: "flex",
            gap: "12px",
            paddingLeft: "5%",
            paddingRight: "5%",
            scrollPaddingInlineStart: "5%",
          }}
        >
          {COURSES.map((course) => {
            const meta = META[course.slug as keyof typeof META];
            if (!meta) return null;
            const { roman, color, tagline, season } = meta;
            return (
              <div
                key={course.slug}
                className="relative flex shrink-0 flex-col justify-between p-6"
                style={{
                  width: "82vw",
                  scrollSnapAlign: "start",
                  scrollSnapStop: "always",
                  background: "#f8f8fc",
                  border: "1px solid rgba(0,0,0,0.07)",
                }}
              >
                <div
                  className="font-black leading-none tabular-nums mb-3"
                  style={{ fontSize: "3.5rem", color }}
                >
                  {roman}
                </div>
                <div>
                  <span
                    className="mb-1 block text-[0.7rem] font-bold tracking-[0.28em] uppercase"
                    style={{ color: "rgba(240,146,38,0.75)" }}
                  >
                    {course.area}
                  </span>
                  <h3
                    className="text-[2rem] font-black leading-none"
                    style={{ color: "#111" }}
                  >
                    {course.title}
                  </h3>
                  <p
                    className="mt-0.5 text-[0.9375rem] font-bold"
                    style={{ color }}
                  >
                    {tagline}
                  </p>
                  <p
                    className="mt-3 text-[0.9375rem] leading-relaxed"
                    style={{ color: "#444" }}
                  >
                    {course.objective}
                  </p>
                  <ul className="mt-4 space-y-1.5">
                    {course.curriculum.slice(0, 4).map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-[0.875rem]"
                        style={{ color: "#555" }}
                      >
                        <span
                          className="mt-[0.42em] h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ background: color }}
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-5 space-y-3">
                  <span
                    className="inline-block px-2.5 py-1 text-[0.75rem] font-bold"
                    style={{
                      border: "1px solid rgba(240,146,38,0.25)",
                      color: "#C06A0A",
                      background: "rgba(240,146,38,0.06)",
                    }}
                  >
                    {season}
                  </span>
                  <button
                    type="button"
                    onClick={() => setOpenBlock(course.slug as BlockSlug)}
                    className="block w-full py-3 text-center text-[0.8rem] font-black tracking-[0.18em] uppercase cursor-pointer"
                    style={{ background: "#F09226", color: "#111111" }}
                  >
                    Scopri il programma →
                  </button>
                </div>
              </div>
            );
          })}

          <div style={{ width: "5%", flexShrink: 0 }} aria-hidden />
        </div>

        <div className="flex justify-center gap-1.5 pb-12">
          {Array.from({ length: 3 }, (_, i) => (
            <span
              key={i}
              className="block h-px w-5"
              style={{
                background: i === 0 ? "#F09226" : "rgba(255,255,255,0.2)",
              }}
            />
          ))}
        </div>
      </div>

      {openBlock && (
        <BlockModal slug={openBlock} onClose={() => setOpenBlock(null)} />
      )}
    </section>
  );
}
