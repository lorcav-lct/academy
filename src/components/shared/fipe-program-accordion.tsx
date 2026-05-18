"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import {
  FIPE_WEEKENDS,
  FIPE_PROGRAM_META,
  getWeekendHours,
  type FipeWeekend,
} from "@/lib/constants/fipe-program";

const ORANGE = "#F09226";
const ORANGE_RGB = "240,146,38";
const DARK = "#111";

/**
 * Accordion del programma FIPE — stesso linguaggio visivo del ProgramAccordion
 * usato nei modali pack PRO/ELITE. Default: superficie chiara.
 */
export function FipeProgramAccordion({
  scopeId,
  defaultOpen = 1,
  tokens,
  showEyebrow = true,
}: {
  scopeId: string;
  defaultOpen?: number | null;
  tokens?: Partial<{
    surface: string;
    border: string;
    textH: string;
    textB: string;
    textMuted: string;
  }>;
  showEyebrow?: boolean;
}) {
  const [openWeekend, setOpenWeekend] = useState<number | null>(defaultOpen);

  const surface = tokens?.surface ?? "#ffffff";
  const border = tokens?.border ?? "rgba(17,17,17,0.09)";
  const textH = tokens?.textH ?? "#111111";
  const textB = tokens?.textB ?? "rgba(17,17,17,0.66)";
  const textMuted = tokens?.textMuted ?? "rgba(17,17,17,0.45)";

  return (
    <div>
      {showEyebrow && (
        <div className="flex items-baseline justify-between mb-3 gap-3">
          <span
            className="text-[0.58rem] font-black tracking-[0.32em] uppercase"
            style={{ color: textMuted }}
          >
            FIPE · {FIPE_PROGRAM_META.weekends} weekend ·{" "}
            {FIPE_PROGRAM_META.hoursTheory}h teoria +{" "}
            {FIPE_PROGRAM_META.hoursPractice}h pratica
          </span>
          <span
            className="hidden sm:inline text-[0.58rem] font-bold tracking-[0.22em] uppercase"
            style={{ color: textMuted }}
          >
            Programma completo
          </span>
        </div>
      )}

      <div
        className="flex flex-col"
        style={{
          background: surface,
          border: `3px solid ${border}`,
        }}
      >
        {FIPE_WEEKENDS.map((wk, i) => {
          const isOpen = openWeekend === wk.weekend;
          const headerId = `${scopeId}-fipe-h-${wk.weekend}`;
          const panelId = `${scopeId}-fipe-p-${wk.weekend}`;
          const wkHours = getWeekendHours(wk);
          return (
            <div
              key={wk.weekend}
              style={{
                borderTop: i === 0 ? "none" : `3px solid ${border}`,
              }}
            >
              <h4 className="m-0">
                <button
                  type="button"
                  id={headerId}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenWeekend(isOpen ? null : wk.weekend)}
                  className="group flex items-center gap-3 md:gap-4 w-full text-left px-4 md:px-5 py-4 md:py-5 transition-colors"
                  style={{
                    background: isOpen
                      ? `rgba(${ORANGE_RGB},0.04)`
                      : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!isOpen)
                      (e.currentTarget as HTMLElement).style.background =
                        "rgba(17,17,17,0.025)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isOpen)
                      (e.currentTarget as HTMLElement).style.background =
                        "transparent";
                  }}
                >
                  <span
                    className="shrink-0 flex h-10 w-10 items-center justify-center text-[0.62rem] font-black tracking-[0.18em] tabular-nums"
                    style={{
                      border: `1.5px solid rgba(${ORANGE_RGB},${isOpen ? 0.85 : 0.55})`,
                      color: ORANGE,
                      background: `rgba(${ORANGE_RGB},${isOpen ? 0.12 : 0.06})`,
                    }}
                  >
                    {romanNumeral(i + 1)}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="mt-0.5 flex items-baseline gap-2 flex-wrap">
                      <span
                        className="text-[1.05rem] md:text-[1.15rem] font-black leading-tight tracking-[-0.005em]"
                        style={{ color: textH }}
                      >
                        {wk.label.toUpperCase()}
                      </span>
                      <span
                        className="text-[0.78rem] leading-snug"
                        style={{ color: textB }}
                      >
                        — {wk.days.length} giornate
                      </span>
                    </div>
                    <div
                      className="mt-1 hidden sm:block text-[0.68rem] font-medium tracking-[0.18em] uppercase"
                      style={{ color: textMuted }}
                    >
                      {wkHours > 0
                        ? `${wkHours} ore di lezione`
                        : "Esame finale"}
                    </div>
                  </div>

                  <span
                    className="shrink-0 inline-flex items-center justify-center h-8 w-8"
                    style={{
                      border: `1px solid ${border}`,
                      color: ORANGE,
                    }}
                    aria-hidden
                  >
                    <motion.span
                      initial={false}
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={{
                        duration: 0.28,
                        ease: [0.4, 0, 0.2, 1],
                      }}
                      className="block leading-none text-[1.1rem] font-black"
                      style={{ lineHeight: 1 }}
                    >
                      +
                    </motion.span>
                  </span>
                </button>
              </h4>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="content"
                    id={panelId}
                    role="region"
                    aria-labelledby={headerId}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{
                      height: { duration: 0.36, ease: [0.4, 0, 0.2, 1] },
                      opacity: { duration: 0.24, ease: "easeOut" },
                    }}
                    style={{ overflow: "hidden" }}
                  >
                    <div
                      className="px-4 md:px-5 pb-5 md:pb-6 pt-4 md:pt-5"
                      style={{
                        borderTop: `1px dashed ${border}`,
                        background: "#fafafa",
                      }}
                    >
                      <div className="flex flex-col gap-4 md:gap-5">
                        {wk.days.map((d) => (
                          <DayBlock
                            key={d.day}
                            weekend={wk}
                            day={d}
                            tokens={{
                              surface,
                              border,
                              textH,
                              textB,
                              textMuted,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <p
        className="mt-3 text-[0.68rem] leading-relaxed italic"
        style={{ color: textMuted }}
      >
        Programma ufficiale FIPE. Le giornate possono subire piccole variazioni
        organizzative; calendario e sede vengono confermati in fase di
        iscrizione.
      </p>
    </div>
  );
}

function DayBlock({
  day,
  tokens,
}: {
  weekend: FipeWeekend;
  day: import("@/lib/constants/fipe-program").FipeDay;
  tokens: {
    surface: string;
    border: string;
    textH: string;
    textB: string;
    textMuted: string;
  };
}) {
  const { surface, border, textH, textB, textMuted } = tokens;
  const dayHours = day.lessons.reduce((s, l) => s + (l.hours || 0), 0);

  return (
    <div
      className="overflow-hidden"
      style={{
        background: surface,
        border: `1px solid ${border}`,
        borderLeft: `3px solid ${DARK}`,
      }}
    >
      {/* Day header */}
      <div
        className="flex items-center justify-between gap-3 px-4 md:px-5 py-3 md:py-3.5"
        style={{
          background: `rgba(${ORANGE_RGB},0.04)`,
          borderBottom: `1px solid ${border}`,
        }}
      >
        <div className="flex items-baseline gap-2 flex-wrap min-w-0">
          <span
            className="text-[0.62rem] font-black tracking-[0.3em] uppercase"
            style={{ color: ORANGE }}
          >
            {day.dayLabel}
          </span>
          {day.isExam && (
            <span
              className="text-[0.6rem] font-black tracking-[0.2em] uppercase px-2 py-0.5"
              style={{
                color: "#111",
                background: ORANGE,
              }}
            >
              Esame finale
            </span>
          )}
        </div>
        {!day.isExam && (
          <span
            className="text-[0.62rem] font-bold tracking-[0.18em] uppercase tabular-nums shrink-0"
            style={{ color: textMuted }}
          >
            {dayHours} ore
          </span>
        )}
      </div>

      {/* Lessons */}
      {!day.isExam ? (
        <ol className="flex flex-col list-none p-0 m-0">
          {day.lessons.map((l, li) => (
            <li
              key={li}
              className="grid grid-cols-[auto_auto_1fr] items-start gap-3 md:gap-4 px-4 md:px-5 py-3 md:py-3.5"
              style={{
                borderTop: li === 0 ? "none" : `1px dashed ${border}`,
              }}
            >
              <span
                className="shrink-0 inline-flex items-center justify-center h-9 w-9 text-[0.68rem] font-black tabular-nums tracking-[0.04em]"
                style={{
                  color: ORANGE,
                  background: `rgba(${ORANGE_RGB},0.06)`,
                  border: `1.5px solid rgba(${ORANGE_RGB},0.4)`,
                }}
                aria-label={`${l.hours} ore`}
              >
                {l.hours}h
              </span>
              <span
                className="shrink-0 mt-2 text-[0.54rem] font-black tracking-[0.3em] uppercase tabular-nums"
                style={{ color: textMuted }}
              >
                {String(li + 1).padStart(2, "0")}
              </span>
              <p
                className="text-[0.92rem] md:text-[0.98rem] leading-[1.45] m-0 font-bold tracking-[-0.005em]"
                style={{ color: textH }}
              >
                {l.title}
              </p>
            </li>
          ))}
        </ol>
      ) : (
        <div className="px-4 md:px-5 py-5 md:py-6">
          <p
            className="text-[0.95rem] md:text-[1rem] leading-[1.5] m-0 font-bold tracking-[-0.005em]"
            style={{ color: textH }}
          >
            Prova finale per il rilascio del titolo FIPE — Istruttore Sala Pesi
            e Pesistica · Personal Trainer I Livello.
          </p>
          <p
            className="mt-1 text-[0.78rem] leading-[1.5] m-0"
            style={{ color: textB }}
          >
            La valutazione conclude le 40 ore del programma e abilita
            all&apos;iscrizione all&apos;albo tecnici FIPE.
          </p>
        </div>
      )}
    </div>
  );
}

function romanNumeral(n: number): string {
  const map: Record<number, string> = { 1: "I", 2: "II", 3: "III" };
  return map[n] ?? String(n);
}
