"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import {
  PROGRAM_BLOCKS,
  getTopicTeachers,
  type ProgramBlockSlug,
} from "@/lib/constants/program";

const ORANGE = "#F09226";
const ORANGE_RGB = "240,146,38";
const DARK = "#111";

/**
 * Premium "academic syllabus" accordion used inside pack modals.
 * Light surface, refined typography, faculty chips per topic.
 */
export function ProgramAccordion({
  scopeId,
  defaultOpen = "function",
  /** Override surface tokens to embed in dark themes if ever needed. */
  tokens,
}: {
  /** Unique id (pack slug, page id) used to namespace ARIA ids. */
  scopeId: string;
  defaultOpen?: ProgramBlockSlug | null;
  tokens?: Partial<{
    surface: string;
    border: string;
    textH: string;
    textB: string;
    textMuted: string;
  }>;
}) {
  const [openBlock, setOpenBlock] = useState<ProgramBlockSlug | null>(
    defaultOpen,
  );

  const surface = tokens?.surface ?? "#ffffff";
  const border = tokens?.border ?? "rgba(17,17,17,0.09)";
  const textH = tokens?.textH ?? "#111111";
  const textB = tokens?.textB ?? "rgba(17,17,17,0.66)";
  const textMuted = tokens?.textMuted ?? "rgba(17,17,17,0.45)";

  return (
    <div>
      {/* Section eyebrow + meta */}
      <div className="flex items-baseline justify-between mb-3 gap-3">
        <span
          className="text-[0.58rem] font-black tracking-[0.32em] uppercase"
          style={{ color: textMuted }}
        >
          Syllabus · 9 mesi · 6 weekend in presenza
        </span>
        <span
          className="hidden sm:inline text-[0.58rem] font-bold tracking-[0.22em] uppercase"
          style={{ color: textMuted }}
        >
          Programma completo
        </span>
      </div>

      <div
        className="flex flex-col"
        style={{
          background: surface,
          border: `3px solid ${border}`,
        }}
      >
        {PROGRAM_BLOCKS.map((block, i) => {
          const isOpen = openBlock === block.slug;
          const headerId = `${scopeId}-acc-h-${block.slug}`;
          const panelId = `${scopeId}-acc-p-${block.slug}`;
          return (
            <div
              key={block.slug}
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
                  onClick={() => setOpenBlock(isOpen ? null : block.slug)}
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
                  {/* Roman-style numeral badge — academic feel */}
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
                    <div className="mt-0.5 flex items-baseline gap-0.5 flex-wrap">
                      <span
                        className="text-[1.05rem] md:text-[1.15rem] font-black leading-tight tracking-[-0.005em] w-full"
                        style={{ color: textH }}
                      >
                        {block.label}
                      </span>
                      <span
                        className="text-[0.78rem] leading-snug"
                        style={{ color: textB }}
                      >
                        — {block.area}
                      </span>
                    </div>
                    <div
                      className="mt-1 hidden sm:block text-[0.68rem] font-medium tracking-[0.18em] uppercase"
                      style={{ color: textMuted }}
                    >
                      {block.weekends} · {block.topics.length} lezioni
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
                      <ol className="flex flex-col gap-2.5 md:gap-3 list-none p-0 m-0">
                        {block.topics.map((topic, ti) => {
                          const topicTeachers = getTopicTeachers(topic);
                          return (
                            <li
                              key={ti}
                              className="grid grid-cols-1 md:grid-cols-[1fr_minmax(0,38%)] overflow-hidden"
                              style={{
                                background: surface,
                                border: `1px solid ${border}`,
                                borderLeft: `3px solid ${DARK}`,
                              }}
                            >
                              {/* ── Lesson column ── */}
                              <div className="flex items-start gap-3.5 md:gap-4 p-4 md:p-5">
                                <span
                                  className="shrink-0 inline-flex items-center justify-center h-10 w-10 text-[0.72rem] font-black tabular-nums tracking-[0.06em]"
                                  style={{
                                    color: ORANGE,
                                    background: `rgba(${ORANGE_RGB},0.06)`,
                                    border: `1.5px solid rgba(${ORANGE_RGB},0.4)`,
                                  }}
                                >
                                  {String(ti + 1).padStart(2, "0")}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <div
                                    className="text-[0.54rem] font-black tracking-[0.34em] uppercase mb-1.5"
                                    style={{ color: textMuted }}
                                  >
                                    Lezione
                                  </div>
                                  <p
                                    className="text-[0.95rem] md:text-[1rem] leading-[1.4] m-0 font-bold tracking-[-0.005em]"
                                    style={{ color: textH }}
                                  >
                                    {topic.title}
                                  </p>
                                </div>
                              </div>

                              {/* ── Teacher column ── */}
                              {topicTeachers.length > 0 && (
                                <div
                                  className="p-4 md:p-5 flex flex-col gap-2 md:gap-2.5 border-t md:border-t-0 md:border-l"
                                  style={{
                                    background: `rgba(${ORANGE_RGB},0.04)`,
                                    borderColor: border,
                                  }}
                                >
                                  <span
                                    className="text-[0.54rem] font-black tracking-[0.34em] uppercase"
                                    style={{ color: textMuted }}
                                  >
                                    {topicTeachers.length > 1
                                      ? "Docenti"
                                      : "Docente"}
                                  </span>
                                  <ul className="flex flex-col gap-2 list-none p-0 m-0">
                                    {topicTeachers.map((t) => (
                                      <li key={t.slug} className="min-w-0">
                                        <p
                                          className="text-[0.85rem] md:text-[0.88rem] font-black leading-tight m-0 tracking-[-0.005em]"
                                          style={{ color: textH }}
                                        >
                                          {t.name}
                                        </p>
                                        <p
                                          className="mt-0.5 text-[0.7rem] leading-[1.4] m-0"
                                          style={{ color: textB }}
                                        >
                                          {t.role}
                                        </p>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </li>
                          );
                        })}
                      </ol>
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
        Il programma può subire piccole variazioni in base alla disponibilità
        dei docenti. La faculty viene confermata in fase di iscrizione.
      </p>
    </div>
  );
}

function romanNumeral(n: number): string {
  const map: Record<number, string> = { 1: "I", 2: "II", 3: "III" };
  return map[n] ?? String(n);
}
