"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { SectionContainer } from "@/components/shared/section-container";
import { BlockModal, type BlockSlug } from "@/components/shared/block-modal";
import { COURSES, FIPE_SESSIONS } from "@/lib/constants/courses";
import { fadeUp, staggerContainer } from "@/lib/animations/variants";

// Extracts month name: "11-12 Settembre" → "Settembre"
const monthOnly = (d: string) => d.split(" ").at(-1) ?? d;

// ── Types ─────────────────────────────────────────────────────────────────────

type BlockItem = {
  type: "block";
  slug: string;
  title: string;
  blockNumber: number;
  area: string;
  objective: string;
  curriculum: string[];
  dates: string[];
  teacherCount: number;
  monthIndices: number[];
};

type FipeItem = {
  type: "fipe";
  slug: string;
  title: string;
  displayTitle: string;
  dates: string[];
  afterBlock: string;
  monthIndices: number[];
};

type CalItem = BlockItem | FipeItem;

// ── Data ──────────────────────────────────────────────────────────────────────

const MONTHS = ["SET", "OTT", "NOV", "DIC", "GEN", "FEB", "MAR", "APR", "MAG"];

// Month index ranges (Sep=0 … May=8)
const BLOCK_MONTHS: number[][] = [
  [0, 1],
  [3, 4],
  [6, 7],
];
const FIPE_MONTHS: number[][] = [[2], [5], [8]];

const SORTED_COURSES = [...COURSES].sort((a, b) => a.sortOrder - b.sortOrder);
const SORTED_FIPE = [...FIPE_SESSIONS].sort(
  (a, b) => a.sortOrder - b.sortOrder,
);

// Interleaved: FUNCTION, FIPE-I, STRENGTH, FIPE-II, SCIENCE, FIPE-III
const ITEMS: CalItem[] = SORTED_COURSES.flatMap((course, i) => [
  {
    type: "block" as const,
    slug: course.slug,
    title: course.title,
    blockNumber: course.blockNumber,
    area: course.area,
    objective: course.objective,
    curriculum: course.curriculum,
    dates: course.dates,
    teacherCount: course.teacherSlugs.length,
    monthIndices: BLOCK_MONTHS[i],
  },
  {
    type: "fipe" as const,
    slug: SORTED_FIPE[i].slug,
    title: SORTED_FIPE[i].title,
    displayTitle: SORTED_FIPE[i].title.replace("Sessione ", ""),
    dates: SORTED_FIPE[i].dates,
    afterBlock: SORTED_FIPE[i].afterBlock,
    monthIndices: FIPE_MONTHS[i],
  },
]);

// Month → item index
const MONTH_TO_ITEM: Record<number, number> = {};
ITEMS.forEach((item, idx) => {
  item.monthIndices.forEach((m) => {
    MONTH_TO_ITEM[m] = idx;
  });
});

// ── Block panel ───────────────────────────────────────────────────────────────

function BlockPanel({
  item,
  onOpenBlock,
}: {
  item: BlockItem;
  onOpenBlock: (slug: BlockSlug) => void;
}) {
  return (
    <div className="grid gap-8 md:gap-12 md:grid-cols-[45fr_55fr]">
      {/* Left */}
      <div className="flex flex-col gap-6">
        <div>
          <span className="label-tag mb-4 block">
            Blocco {String(item.blockNumber).padStart(2, "0")}
          </span>
          <h3
            className="font-black tracking-[-0.03em] leading-none gradient-text mb-3"
            style={{ fontSize: "clamp(2.8rem,6.5vw,5.2rem)" }}
          >
            {item.title}
          </h3>
          <p className="text-[0.7rem] font-bold tracking-[0.22em] text-academy-orange/65 uppercase mb-5">
            {item.area}
          </p>
          <p className="text-[0.9rem] leading-relaxed text-academy-gray-400 max-w-sm">
            {item.objective}
          </p>
        </div>

        {/* Month badges */}
        <div className="flex flex-wrap gap-2">
          {item.dates.map((d, di) => (
            <span
              key={d}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-[0.72rem] font-bold tracking-wider text-academy-orange uppercase"
              style={{
                background: "rgba(240,146,38,0.07)",
                border: "1px solid rgba(240,146,38,0.2)",
              }}
            >
              <span
                className="h-1.5 w-1.5 shrink-0"
                style={{ background: `rgba(240,146,38,${0.5 + di * 0.3})` }}
              />
              {monthOnly(d)}
            </span>
          ))}
        </div>

        <button
          onClick={() => onOpenBlock(item.slug as BlockSlug)}
          className="group inline-flex items-center gap-3 text-[0.85rem] font-bold text-academy-orange transition-all duration-300 hover:gap-5 w-fit focus-visible:outline-none"
        >
          Scopri il Blocco
          <span className="h-px w-8 bg-current transition-all duration-300 group-hover:w-12" />
        </button>
      </div>

      {/* Right — curriculum */}
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <span className="label-tag">Programma</span>
          <span className="text-[0.65rem] font-bold text-academy-gray-500">
            2 Weekend · {item.teacherCount} Docenti
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {item.curriculum.map((c, ci) => (
            <div
              key={c}
              className="flex items-start gap-3 p-3 bento-card bento-card--themed"
            >
              <span className="text-[0.53rem] font-black tracking-[0.3em] text-academy-orange/35 mt-0.5 shrink-0 tabular-nums">
                {String(ci + 1).padStart(2, "0")}
              </span>
              <span className="text-[0.79rem] leading-snug text-academy-gray-300">
                {c}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── FIPE panel ────────────────────────────────────────────────────────────────

function FipePanel({ item }: { item: FipeItem }) {
  return (
    <div className="flex flex-col items-center text-center gap-10 py-6 md:py-10">
      <div>
        <span className="label-tag mb-5 block">Certificazione Ufficiale</span>
        <h3
          className="font-black tracking-tight leading-none mb-4 text-academy-gray-100"
          style={{ fontSize: "clamp(2.2rem,5vw,4rem)" }}
        >
          {item.displayTitle}
        </h3>
        <p className="text-[0.7rem] font-bold tracking-[0.22em] text-academy-gray-400 uppercase mb-6">
          FIPE × Lacertosus
        </p>

        <div className="flex flex-wrap gap-2 justify-center">
          {item.dates.map((d) => (
            <span
              key={d}
              className="inline-block px-5 py-2 text-[0.75rem] font-bold tracking-wider text-academy-orange/80 uppercase"
              style={{
                background: "rgba(240,146,38,0.07)",
                border: "1px solid rgba(240,146,38,0.2)",
              }}
            >
              {monthOnly(d)}
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-[500px] w-full space-y-4">
        <div
          className="p-6 text-left"
          style={{
            border: "1px solid rgba(240,146,38,0.1)",
            background: "rgba(240,146,38,0.03)",
          }}
        >
          <p className="text-[0.88rem] leading-relaxed text-academy-gray-400">
            Sessione formativa e di certificazione ufficiale FIPE × Lacertosus.
            Al termine del blocco{" "}
            <span className="font-bold text-academy-gray-200">
              {item.afterBlock}
            </span>
            , questa sessione sancisce il completamento del livello con
            certificazione riconosciuta.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          {["Riconoscimento Ufficiale", "Attestato Professionale"].map(
            (tag) => (
              <span
                key={tag}
                className="px-3 py-1.5 text-[0.62rem] font-bold tracking-[0.18em] text-academy-orange/60 uppercase"
                style={{
                  border: "1px solid rgba(240,146,38,0.18)",
                }}
              >
                {tag}
              </span>
            ),
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export function PercorsoTimeline() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [openBlock, setOpenBlock] = useState<BlockSlug | null>(null);
  const touchStartX = useRef<number>(0);

  const goTo = useCallback(
    (idx: number) => {
      if (idx === activeIdx) return;
      setActiveIdx(idx);
    },
    [activeIdx],
  );

  const prev = useCallback(
    () => goTo(Math.max(0, activeIdx - 1)),
    [goTo, activeIdx],
  );
  const next = useCallback(
    () => goTo(Math.min(ITEMS.length - 1, activeIdx + 1)),
    [goTo, activeIdx],
  );

  // Touch swipe
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);
  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const delta = touchStartX.current - e.changedTouches[0].clientX;
      if (Math.abs(delta) > 48) {
        if (delta > 0) next();
        else prev();
      }
    },
    [next, prev],
  );

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next]);

  const active = ITEMS[activeIdx];
  const activeMonths = active.monthIndices;

  // Scroll active tab into view on mobile
  const activeTabRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    activeTabRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activeIdx]);

  return (
    <>
      <SectionContainer id="calendario" className="themed-section">
        {/* ── Section header ─────────────────────────────────────────── */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="mb-14 text-center"
        >
          <motion.span variants={fadeUp} className="label-tag mb-4 block">
            2026 / 2027
          </motion.span>
          <motion.h2
            variants={fadeUp}
            className="text-3xl font-black tracking-tight sm:text-4xl mb-4 text-academy-gray-100"
          >
            Il Calendario Completo
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mx-auto max-w-xl text-[0.9rem] text-academy-gray-400"
          >
            Naviga i 9 mesi mese per mese: 3 blocchi formativi e 3 sessioni
            FIPE, ogni evento con date e contenuti.
          </motion.p>
        </motion.div>

        {/* ── Month progress strip ────────────────────────────────────── */}
        <div className="mb-10 overflow-x-auto -mx-2 px-2">
          <div className="flex min-w-[480px]">
            {MONTHS.map((month, mi) => {
              const itemIdx = MONTH_TO_ITEM[mi];
              const isActive = activeMonths.includes(mi);
              const activeColor = "rgba(240,146,38,0.9)";
              const activeTextColor = "#F09226";

              return (
                <button
                  key={month}
                  onClick={() => goTo(itemIdx)}
                  className="flex-1 flex flex-col items-center gap-2 py-3 transition-all duration-200 focus-visible:outline-none"
                  aria-label={`Vai a ${ITEMS[itemIdx]?.title ?? month}`}
                >
                  {/* Bar */}
                  <div
                    className={`w-full h-[3px] transition-all duration-300${isActive ? "" : " cal-month-bar"}`}
                    style={isActive ? { background: activeColor } : undefined}
                  />
                  {/* Label */}
                  <span
                    className={`text-[0.61rem] font-bold tracking-[0.2em] transition-colors duration-200${isActive ? "" : " cal-month-text"}`}
                    style={isActive ? { color: activeTextColor } : undefined}
                  >
                    {month}
                  </span>
                  {/* Dot */}
                  <div
                    className={`h-1.5 w-1.5 rounded-full transition-all duration-300${isActive ? "" : " cal-month-dot"}`}
                    style={
                      isActive
                        ? {
                            background: activeTextColor,
                            transform: "scale(1.4)",
                          }
                        : undefined
                    }
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Event selector tabs ─────────────────────────────────────── */}
        <div
          className="flex gap-2 overflow-x-auto -mx-2 px-2 pb-1 mb-6 scroll-smooth"
          role="tablist"
          aria-label="Seleziona evento formativo"
        >
          {ITEMS.map((item, idx) => {
            const isActive = idx === activeIdx;
            const label =
              item.type === "block"
                ? item.title
                : (item as FipeItem).displayTitle;
            const sublabel =
              item.type === "block"
                ? `Blocco ${String((item as BlockItem).blockNumber).padStart(2, "0")}`
                : "FIPE";
            const month = MONTHS[item.monthIndices[0]];

            return (
              <button
                key={item.slug}
                ref={isActive ? activeTabRef : null}
                role="tab"
                aria-selected={isActive}
                onClick={() => goTo(idx)}
                className={`shrink-0 flex flex-col items-start gap-1 px-5 py-4 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-academy-orange/50${isActive ? "" : " cal-tab"}`}
                style={
                  isActive
                    ? {
                        border: "1px solid rgba(240,146,38,0.45)",
                        background: "rgba(240,146,38,0.07)",
                        minWidth: "118px",
                      }
                    : { minWidth: "118px" }
                }
              >
                <span
                  className="text-[0.54rem] font-black tracking-[0.3em] uppercase"
                  style={{
                    color: isActive ? "rgba(240,146,38,0.7)" : undefined,
                  }}
                >
                  {sublabel}
                </span>
                <span
                  className="text-[0.88rem] font-black tracking-tight leading-tight"
                  style={{ color: isActive ? "#F09226" : undefined }}
                >
                  {label}
                </span>
                <span
                  className="text-[0.62rem] font-medium"
                  style={{
                    color: isActive ? "rgba(240,146,38,0.5)" : undefined,
                  }}
                >
                  {month}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Content panel ───────────────────────────────────────────── */}
        <div>
          {/*
          Grid-stacking: tutti i pannelli sono nel DOM contemporaneamente
          nella stessa cella della griglia → l'altezza è sempre quella del
          pannello più alto. Solo quello attivo è visibile (opacity 1).
        */}
          <div
            className="cal-panel p-8 md:p-10 lg:p-12"
            role="tabpanel"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            style={{ display: "grid", gridTemplateColumns: "1fr" }}
          >
            {ITEMS.map((item, idx) => {
              const isActive = idx === activeIdx;
              return (
                <motion.div
                  key={item.slug}
                  style={{
                    gridArea: "1 / 1",
                    pointerEvents: isActive ? "auto" : "none",
                  }}
                  animate={{ opacity: isActive ? 1 : 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  aria-hidden={!isActive}
                >
                  {item.type === "block" ? (
                    <BlockPanel
                      item={item as BlockItem}
                      onOpenBlock={setOpenBlock}
                    />
                  ) : (
                    <FipePanel item={item as FipeItem} />
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Navigation row */}
          <div className="flex items-center justify-between mt-5 px-1">
            <button
              onClick={prev}
              disabled={activeIdx === 0}
              className="cal-nav-btn flex items-center gap-2 text-[0.8rem] font-bold tracking-wide transition-all duration-200 disabled:opacity-20 disabled:cursor-not-allowed focus-visible:outline-none"
              aria-label="Evento precedente"
            >
              ← Precedente
            </button>

            {/* Dot progress */}
            <div className="flex items-center gap-2" aria-hidden>
              {ITEMS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => goTo(idx)}
                  className={`h-1.5 transition-all duration-300 focus-visible:outline-none${idx === activeIdx ? "" : " cal-dot"}`}
                  style={{
                    width: idx === activeIdx ? "22px" : "6px",
                    background: idx === activeIdx ? "#F09226" : undefined,
                    borderRadius: "1px",
                  }}
                  aria-label={`Vai all'evento ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={next}
              disabled={activeIdx === ITEMS.length - 1}
              className="cal-nav-btn flex items-center gap-2 text-[0.8rem] font-bold tracking-wide transition-all duration-200 disabled:opacity-20 disabled:cursor-not-allowed focus-visible:outline-none"
              aria-label="Evento successivo"
            >
              Successivo →
            </button>
          </div>
        </div>
      </SectionContainer>

      {openBlock && (
        <BlockModal slug={openBlock} onClose={() => setOpenBlock(null)} />
      )}
    </>
  );
}
