"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WORKSHOPS } from "@/lib/constants/workshops";
import { getBundles } from "@/lib/constants/packs";
import { cn } from "@/lib/utils";

interface MasterclassSelectorProps {
  packSlug: string;
  count: number;
  onConfirm: (selected: string[]) => void;
  onClose: () => void;
}

export function MasterclassSelector({
  packSlug,
  count,
  onConfirm,
  onClose,
}: MasterclassSelectorProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const pack = getBundles().find((p) => p.slug === packSlug);
  const packName = pack?.name ?? packSlug.toUpperCase();

  function toggle(slug: string) {
    setSelected((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= count) return prev; // max reached, ignore
      return [...prev, slug];
    });
  }

  const maxReached = selected.length >= count;

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backdropFilter: "blur(12px)", backgroundColor: "rgba(2,0,38,0.85)" }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="relative flex w-full max-w-2xl flex-col overflow-hidden card-squared"
          style={{ maxHeight: "85vh" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-white/10 px-8 py-6">
            <div>
              <h2 className="text-xl font-black tracking-tight">
                Scegli le tue {count} Masterclass
              </h2>
              <p className="mt-1 text-sm text-academy-gray-400">
                Incluse nel tuo pack{" "}
                <span className="font-bold text-academy-orange">{packName}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Chiudi"
              className="ml-4 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center text-academy-gray-400 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-academy-orange"
            >
              <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
                <path
                  d="M2 2l12 12M14 2L2 14"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="square"
                />
              </svg>
            </button>
          </div>

          {/* Scrollable grid */}
          <div className="flex-1 overflow-y-auto px-8 py-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {WORKSHOPS.map((w) => {
                const isSelected = selected.includes(w.slug);
                const isDimmed = maxReached && !isSelected;

                return (
                  <button
                    key={w.slug}
                    onClick={() => toggle(w.slug)}
                    aria-pressed={isSelected}
                    className={cn(
                      "relative flex flex-col items-start p-5 text-left transition-all duration-200",
                      "border focus-visible:outline-2 focus-visible:outline-academy-orange",
                      isSelected
                        ? "border-academy-orange bg-academy-orange/10"
                        : "border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06]",
                      isDimmed && "opacity-40 cursor-not-allowed"
                    )}
                    disabled={isDimmed}
                  >
                    {/* Selected checkmark */}
                    {isSelected && (
                      <span className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center bg-academy-orange">
                        <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3">
                          <path
                            d="M10 3L5 9L2 6"
                            stroke="#020026"
                            strokeWidth={2}
                            strokeLinecap="square"
                          />
                        </svg>
                      </span>
                    )}

                    {/* TBD badge */}
                    {w.tbd && (
                      <span className="mb-2 inline-block border border-white/20 px-2 py-0.5 text-[10px] font-bold tracking-[0.2em] text-academy-gray-400 uppercase">
                        Da definire
                      </span>
                    )}

                    <h3 className="mb-1 text-sm font-black leading-tight">
                      Masterclass {w.title}
                    </h3>
                    <p className="mb-2 text-xs text-academy-orange">{w.trainerLabel}</p>
                    <p className="text-xs leading-relaxed text-academy-gray-400">{w.focus}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-white/10 px-8 py-5">
            <span className="text-sm text-academy-gray-400">
              <span
                className={cn(
                  "font-bold tabular-nums",
                  selected.length === count ? "text-academy-orange" : "text-white"
                )}
              >
                {selected.length}/{count}
              </span>{" "}
              masterclass selezionate
            </span>

            <button
              onClick={() => onConfirm(selected)}
              disabled={selected.length !== count}
              className={cn(
                "inline-flex items-center gap-2 px-6 py-3 text-sm font-bold tracking-wide transition-all duration-200",
                selected.length === count
                  ? "bg-academy-orange text-academy-dark hover:bg-amber-400 glow-orange cursor-pointer"
                  : "cursor-not-allowed bg-white/5 text-academy-gray-500"
              )}
            >
              Conferma e Procedi →
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
