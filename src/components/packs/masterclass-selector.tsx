"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  PUBLIC_WORKSHOPS as WORKSHOPS,
  type Workshop,
} from "@/lib/constants/workshops";
import { getBundles } from "@/lib/constants/packs";

/* ──────────────────────────────────────────────────────────────
   Sales credentials per masterclass — minimal map for the picker
   (same content philosophy as workshop-grid; abbreviato per la modale)
─────────────────────────────────────────────────────────────── */
type Cred = { domain: string; pitch: string; featured?: boolean };

const CREDENTIALS: Record<string, Cred> = {
  "master-functional-bulgarian": {
    domain: "Functional × Bulgarian",
    pitch: "Metodo bulgaro × Macebell e Clubbell.",
    featured: true,
  },
  "master-strength": {
    domain: "Strength Avanzato",
    pitch: "Andrea Quarto — Nazionale Para Powerlifting & Marina Militare.",
  },
  "master-calcio": {
    domain: "Performance Calcio",
    pitch: "Luca Collino — Sport Therapist Juventus FC.",
    featured: true,
  },
  "master-volley": {
    domain: "S&C Pallavolo",
    pitch: "Oscar Berti — S&C Coach Modena Volley + Nazionale Italiana.",
    featured: true,
  },
  "master-tennis": {
    domain: "Performance Tennis",
    pitch: "Piatti Tennis Center — centro di alta specializzazione tennistica.",
  },
  "master-running": {
    domain: "Running Performance",
    pitch: "Ivan Pellizzari — Tecnico Allenatore F.I.T.R.I.",
  },
  "master-nuoto": {
    domain: "S&C Nuoto",
    pitch: "Marco Magnani + Riccardo Aimini — S&C Federazione Italiana Nuoto.",
    featured: true,
  },
  "master-rugby": {
    domain: "S&C Rugby",
    pitch: "Faculty in finalizzazione.",
  },
};

const ORANGE = "#F09226";
const ORANGE_RGB = "240,146,38";

interface MasterclassSelectorProps {
  packSlug: string;
  count: number;
  /** Pre-fill state — used by the checkout edit flow */
  initialSelected?: string[];
  onConfirm: (selected: string[]) => void;
  onClose: () => void;
}

export function MasterclassSelector({
  packSlug,
  count,
  initialSelected,
  onConfirm,
  onClose,
}: MasterclassSelectorProps) {
  const [selected, setSelected] = useState<string[]>(initialSelected ?? []);
  const [mounted, setMounted] = useState(false);

  const pack = getBundles().find((p) => p.slug === packSlug);
  const tierLabel = pack?.name ?? packSlug.toUpperCase();

  useEffect(() => {
    setMounted(true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  function toggle(slug: string) {
    setSelected((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= count) return prev;
      return [...prev, slug];
    });
  }

  const sortedWorkshops = [...WORKSHOPS].sort((a, b) => {
    const af = CREDENTIALS[a.slug]?.featured ? 0 : 1;
    const bf = CREDENTIALS[b.slug]?.featured ? 0 : 1;
    if (af !== bf) return af - bf;
    return a.sortOrder - b.sortOrder;
  });

  const isComplete = selected.length === count;
  const initial = initialSelected ?? [];
  const isPristine =
    selected.length === initial.length &&
    selected.every((s) => initial.includes(s));

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        className="fixed inset-0 z-[300] flex items-stretch justify-center"
        style={{
          background: "rgba(8,8,14,0.78)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.985 }}
          transition={{ duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative m-auto flex h-dvh max-h-dvh w-full max-w-[1080px] flex-col overflow-hidden md:h-auto md:max-h-[92vh]"
          style={{
            background: "rgb(43 43 43 / 96%)",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 40px 120px rgba(0,0,0,0.7)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ════ STICKY TOP BAR ════ */}
          <div
            className="z-30 flex shrink-0 items-center justify-between gap-3 px-5 py-3.5 md:px-8 md:py-4"
            style={{
              background: "rgba(20,20,28,0.92)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              borderBottom: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <div className="flex min-w-0 items-center gap-3">
              <span
                className="text-[0.58rem] font-black uppercase tracking-[0.32em]"
                style={{ color: ORANGE }}
              >
                Pack
              </span>
              <span
                className="truncate text-[1.05rem] font-black tracking-[-0.01em] md:text-[1.2rem]"
                style={{ color: "#fff" }}
              >
                {tierLabel}
              </span>
              <span
                className="hidden h-4 w-px sm:inline-block"
                style={{ background: "rgba(255,255,255,0.18)" }}
              />
              <span
                className="hidden text-[0.62rem] font-bold uppercase tracking-[0.22em] sm:inline"
                style={{ color: "rgba(255,255,255,0.55)" }}
              >
                {initialSelected
                  ? "Modifica le tue masterclass"
                  : `Scegli ${count} masterclass`}
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              {/* Live counter pill */}
              <div
                className="hidden items-center gap-2 px-3 py-1.5 sm:flex"
                style={{
                  background: isComplete
                    ? `rgba(${ORANGE_RGB},0.18)`
                    : "rgba(255,255,255,0.04)",
                  border: `1px solid ${
                    isComplete
                      ? `rgba(${ORANGE_RGB},0.6)`
                      : "rgba(255,255,255,0.12)"
                  }`,
                  transition: "background 0.2s, border-color 0.2s",
                }}
                aria-live="polite"
              >
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{
                    background: isComplete ? ORANGE : "rgba(255,255,255,0.4)",
                    boxShadow: isComplete
                      ? `0 0 8px rgba(${ORANGE_RGB},0.7)`
                      : undefined,
                  }}
                />
                <span
                  className="text-[0.62rem] font-black uppercase tracking-[0.22em] tabular-nums"
                  style={{
                    color: isComplete ? ORANGE : "rgba(255,255,255,0.7)",
                  }}
                >
                  {selected.length} / {count} selezionate
                </span>
              </div>
              <button
                onClick={onClose}
                aria-label="Chiudi"
                className="inline-flex items-center gap-1.5 text-[0.66rem] font-bold uppercase tracking-[0.22em] transition-opacity hover:opacity-65"
                style={{ color: "rgba(255,255,255,0.6)" }}
              >
                <span className="hidden sm:inline">Chiudi</span>
                <span className="text-lg leading-none">×</span>
              </button>
            </div>
          </div>

          {/* ════ SCROLLABLE BODY ════ */}
          <div className="flex-1 overflow-y-auto">
            {/* ── HEADER ─────────────────────────────────────── */}
            <section
              className="px-6 pt-8 pb-7 md:px-10 md:pt-10 md:pb-8"
              style={{
                background: `radial-gradient(ellipse at 50% 0%, rgba(${ORANGE_RGB},0.07) 0%, transparent 60%)`,
              }}
            >
              <div
                className="mb-5 inline-flex items-center gap-2 px-2.5 py-1"
                style={{
                  background: `rgba(${ORANGE_RGB},0.12)`,
                  border: `1px solid rgba(${ORANGE_RGB},0.45)`,
                }}
              >
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{
                    background: ORANGE,
                    boxShadow: `0 0 8px rgba(${ORANGE_RGB},0.8)`,
                  }}
                />
                <span
                  className="text-[0.6rem] font-black uppercase tracking-[0.22em]"
                  style={{ color: ORANGE }}
                >
                  Le tue {count} Masterclass
                </span>
              </div>

              <h2
                className="max-w-[28ch] font-black leading-[1.02] tracking-[-0.025em]"
                style={{
                  fontSize: "clamp(1.6rem, 3.4vw, 2.4rem)",
                  color: "#fff",
                }}
              >
                Scegli i {count} approfondimenti
                <br />
                <span style={{ color: ORANGE }}>
                  che disegnano la tua specializzazione.
                </span>
              </h2>

              <p
                className="mt-4 max-w-[58ch] text-[0.92rem] leading-[1.65] md:text-[0.98rem]"
                style={{ color: "rgba(255,255,255,0.78)" }}
              >
                {count} master a scelta tra 8 specializzazioni. Featured = i top
                trainer della community. Puoi cambiare la tua selezione fino al
                pagamento.
              </p>
            </section>

            {/* ── GRID ───────────────────────────────────────── */}
            <section
              className="px-6 pb-8 md:px-10 md:pb-10"
              style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div className="grid grid-cols-1 gap-3 pt-7 md:gap-4 sm:grid-cols-2">
                {sortedWorkshops.map((w) => (
                  <WorkshopCard
                    key={w.slug}
                    workshop={w}
                    selected={selected.includes(w.slug)}
                    canSelectMore={selected.length < count}
                    onToggle={() => toggle(w.slug)}
                  />
                ))}
              </div>
            </section>
          </div>

          {/* ════ STICKY BOTTOM BAR ════ */}
          <div
            className="z-30 flex shrink-0 items-center justify-between gap-3 px-4 py-3 md:px-8"
            style={{
              background: "rgba(20,20,28,0.92)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              borderTop: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <div className="flex min-w-0 flex-col">
              <span
                className="text-[0.55rem] font-bold uppercase tracking-[0.18em]"
                style={{ color: "rgba(255,255,255,0.55)" }}
              >
                {isComplete ? "Selezione completa" : "Continua a selezionare"}
              </span>
              <span
                className="text-[0.95rem] font-black leading-tight tabular-nums md:text-[1.05rem]"
                style={{ color: "#fff" }}
              >
                {selected.length} / {count}{" "}
                <span
                  className="text-[0.7rem] font-semibold tracking-[0.04em]"
                  style={{ color: "rgba(255,255,255,0.55)" }}
                >
                  masterclass
                </span>
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {initialSelected && (
                <button
                  onClick={onClose}
                  className="hidden px-4 py-3 text-[0.7rem] font-bold uppercase tracking-[0.18em] transition-opacity hover:opacity-70 sm:inline-flex"
                  style={{
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  Annulla
                </button>
              )}
              <button
                onClick={() => onConfirm(selected)}
                disabled={!isComplete || isPristine}
                className="inline-flex shrink-0 items-center gap-2 px-4 py-3 text-[0.7rem] font-black uppercase tracking-[0.14em] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45 sm:px-5"
                style={{
                  background: ORANGE,
                  color: "#111",
                }}
              >
                <span>
                  {initialSelected
                    ? isPristine
                      ? "Nessuna modifica"
                      : "Salva modifiche"
                    : "Conferma e procedi"}
                </span>
                {!isPristine && <span aria-hidden>→</span>}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}

/* ──────────────────────────────────────────────────────────────
   Workshop Card
─────────────────────────────────────────────────────────────── */
function WorkshopCard({
  workshop,
  selected,
  canSelectMore,
  onToggle,
}: {
  workshop: Workshop;
  selected: boolean;
  canSelectMore: boolean;
  onToggle: () => void;
}) {
  const cred = CREDENTIALS[workshop.slug];
  const dimmed = !selected && !canSelectMore;

  const cardBg = selected
    ? `linear-gradient(135deg, rgba(${ORANGE_RGB},0.14) 0%, rgba(6,6,16,0.6) 100%)`
    : "rgba(255,255,255,0.025)";
  const cardBorder = selected
    ? `rgba(${ORANGE_RGB},0.6)`
    : "rgba(255,255,255,0.1)";

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={dimmed}
      aria-pressed={selected}
      className="group relative flex flex-col overflow-hidden p-5 text-left transition-all duration-200 disabled:cursor-not-allowed md:p-6"
      style={{
        background: cardBg,
        border: `1px solid ${cardBorder}`,
        opacity: dimmed ? 0.4 : 1,
        boxShadow: selected ? `0 0 32px rgba(${ORANGE_RGB},0.12)` : "none",
      }}
    >
      {/* Top accent bar */}
      <div
        className="-mx-5 -mt-5 mb-5 h-[2px] w-[calc(100%+2.5rem)] md:-mx-6 md:-mt-6 md:w-[calc(100%+3rem)]"
        style={{
          background: `linear-gradient(90deg, ${
            selected ? ORANGE : `rgba(${ORANGE_RGB},0.4)`
          }, rgba(${ORANGE_RGB},0.05))`,
        }}
      />

      {/* Top row — eyebrow + selected check */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="text-[0.6rem] font-black uppercase tracking-[0.28em]"
            style={{ color: ORANGE }}
          >
            {cred?.domain ?? "Masterclass"}
          </span>
          {cred?.featured && (
            <span
              className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[0.52rem] font-black uppercase tracking-[0.2em]"
              style={{
                background: ORANGE,
                color: "#111",
              }}
            >
              Top
            </span>
          )}
          {workshop.tbd && (
            <span
              className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[0.52rem] font-black uppercase tracking-[0.2em]"
              style={{
                border: "1px solid rgba(255,255,255,0.18)",
                color: "rgba(255,255,255,0.6)",
              }}
            >
              TBD
            </span>
          )}
        </div>

        {/* Selection indicator */}
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center transition-all duration-200"
          style={{
            background: selected ? ORANGE : "rgba(255,255,255,0.04)",
            border: `1.5px solid ${
              selected ? ORANGE : "rgba(255,255,255,0.18)"
            }`,
          }}
          aria-hidden
        >
          {selected && (
            <svg viewBox="0 0 12 12" fill="none" width="10" height="10">
              <path
                d="M10 3L5 9L2 6"
                stroke="#111"
                strokeWidth={2.4}
                strokeLinecap="square"
              />
            </svg>
          )}
        </span>
      </div>

      {/* Title */}
      <h3
        className="text-[1.05rem] font-black leading-tight tracking-[-0.01em]"
        style={{ color: "#fff" }}
      >
        {workshop.title}
      </h3>

      {/* Trainer pitch */}
      <p
        className="mt-2 text-[0.78rem] font-bold leading-snug"
        style={{ color: ORANGE }}
      >
        {workshop.trainerLabel}
      </p>
      {cred?.pitch && (
        <p
          className="mt-1.5 text-[0.78rem] leading-[1.55]"
          style={{ color: "rgba(255,255,255,0.7)" }}
        >
          {cred.pitch}
        </p>
      )}

      {/* Footer — duration */}
      <div
        className="mt-4 flex items-center justify-between border-t pt-3 text-[0.62rem] font-bold uppercase tracking-[0.2em]"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        <span style={{ color: "rgba(255,255,255,0.45)" }}>
          {workshop.duration}
        </span>
        <span
          className="transition-opacity duration-200"
          style={{
            color: selected ? ORANGE : "rgba(255,255,255,0.5)",
            opacity: selected ? 1 : 0.6,
          }}
        >
          {selected ? "Inclusa ✓" : "Seleziona"}
        </span>
      </div>
    </button>
  );
}
