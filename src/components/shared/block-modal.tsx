"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { gsap } from "gsap";
import { smoothScrollTo } from "@/lib/scroll";
import { COURSES } from "@/lib/constants/courses";
import { getTeachersByCourse } from "@/lib/constants/teachers";
import { TeacherPortrait } from "@/components/shared/teacher-portrait";
import { useTheme } from "@/components/providers/theme-provider";

export type BlockSlug = "function" | "strength" | "science";

export function BlockModal({
  slug,
  onClose,
  ctaHref = "/pack",
}: {
  slug: BlockSlug;
  onClose: () => void;
  /** CTA destination. Pass an in-page anchor (e.g. "#section-packs") to scroll without navigation. */
  ctaHref?: string;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const course = COURSES.find((c) => c.slug === slug)!;
  const teachers = getTeachersByCourse(slug);

  const bg = isDark ? "rgba(8,8,18,0.99)" : "rgba(248,248,252,0.99)";
  const th = isDark ? "#f5f5fa" : "#0a0a1a";
  const tb = isDark ? "rgba(180,180,200,0.65)" : "#555";
  const ts = isDark ? "rgba(120,120,140,0.5)" : "#888";
  const cellBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)";
  const cellBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const accentColor = isDark ? "rgba(240,146,38,0.8)" : "rgba(180,80,0,0.85)";

  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(
      overlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.22, ease: "power2.out" },
    );
    tl.fromTo(
      panelRef.current,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.38, ease: "power3.out" },
      "-=0.08",
    );
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function close() {
    const tl = gsap.timeline({ onComplete: onClose });
    tl.to(panelRef.current, {
      opacity: 0,
      y: 16,
      duration: 0.22,
      ease: "power2.in",
    });
    tl.to(overlayRef.current, { opacity: 0, duration: 0.14 }, "-=0.06");
  }

  const blockNum = { function: "01", strength: "02", science: "03" }[slug];

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[400] flex items-end md:items-center justify-center md:p-6 lg:p-8"
      style={{
        background: isDark ? "rgba(0,0,0,0.84)" : "rgba(0,0,0,0.52)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
      onClick={close}
    >
      <div
        ref={panelRef}
        className="relative w-full flex flex-col overflow-hidden
          h-dvh max-h-dvh
          md:h-auto md:max-h-[90vh] md:max-w-[1040px]"
        style={{
          background: bg,
          border: `1px solid ${cellBorder}`,
          boxShadow: isDark
            ? "0 40px 120px rgba(0,0,0,0.75)"
            : "0 24px 80px rgba(0,0,0,0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Fixed header: title + CTA ───────────────────────────────────── */}
        <div
          className="shrink-0 flex items-center gap-4 px-6 py-5 md:px-10"
          style={{ borderBottom: `1px solid ${cellBorder}` }}
        >
          {/* Block number badge */}
          <div
            className="shrink-0 hidden sm:flex items-center justify-center text-xs font-black"
            style={{
              width: "40px",
              height: "40px",
              border: `1px solid ${cellBorder}`,
              color: ts,
            }}
          >
            {blockNum}
          </div>

          {/* Title info */}
          <div className="flex-1 min-w-0">
            <div
              className="text-[0.6rem] font-black tracking-[0.35em] uppercase mb-0.5"
              style={{ color: ts }}
            >
              Blocco Formativo
            </div>
            <h2
              className="font-black leading-none tracking-tight truncate"
              style={{ fontSize: "clamp(1.7rem,3vw,2.2rem)", color: th }}
            >
              {course.title}
            </h2>
            <div
              className="text-[0.72rem] font-bold tracking-[0.16em] uppercase mt-1 truncate"
              style={{ color: accentColor }}
            >
              {course.area}
            </div>
          </div>

          {/* CTA */}
          <a
            href={ctaHref}
            className="shrink-0 inline-flex items-center gap-2.5 px-5 py-2.5 text-[0.72rem] font-black tracking-[0.14em] uppercase transition-opacity duration-200 hover:opacity-85"
            style={{ background: "#F09226", color: "#111111" }}
            onClick={(e) => {
              if (ctaHref.startsWith("#")) {
                e.preventDefault();
                close();
                // Defer the scroll until the close animation finishes
                window.setTimeout(() => {
                  smoothScrollTo(ctaHref);
                }, 380);
                return;
              }
              close();
            }}
          >
            <span className="hidden sm:inline">Inizia il Percorso</span>
            <span className="sm:hidden">Inizia</span>
            <svg viewBox="0 0 16 16" width="11" height="11" fill="currentColor">
              <path d="M8 13L3 8l1.4-1.4L7 9.2V3h2v6.2l2.6-2.6L13 8z" />
            </svg>
          </a>

          {/* Close */}
          <button
            onClick={close}
            className="shrink-0 flex items-center gap-1 text-[0.66rem] font-bold tracking-[0.22em] uppercase transition-opacity hover:opacity-60 focus-visible:outline-none ml-1"
            style={{ color: ts }}
            aria-label="Chiudi"
          >
            <span className="hidden sm:inline">Chiudi</span>
            <span className="text-base leading-none">×</span>
          </button>
        </div>

        {/* ── Scrollable content ─────────────────────────────────────────── */}
        <div className="overflow-y-auto flex-1 p-6 md:p-10">
          {/* ── Layout: 3 sezioni verticali ────────────────────────── */}
          <div className="flex flex-col gap-4">
            {/* 0 ── DATE — near-title size for maximum visibility ─────── */}
            <div
              className="p-5 md:p-6"
              style={{ background: cellBg, border: `1px solid ${cellBorder}` }}
            >
              <p
                className="text-[0.68rem] font-black tracking-[0.3em] uppercase mb-4"
                style={{ color: ts }}
              >
                Date del Blocco
              </p>
              <div className="flex flex-col gap-2">
                {course.dates.map((d) => (
                  <span
                    key={d}
                    className="flex items-center gap-3 font-black tracking-[-0.02em] leading-none uppercase"
                    style={{
                      fontSize: "clamp(1.35rem,2.6vw,1.9rem)",
                      color: th,
                    }}
                  >
                    <span
                      className="h-[3px] w-6 shrink-0"
                      style={{ background: "#F09226" }}
                    />
                    {d}
                  </span>
                ))}
              </div>
            </div>

            {/* 1 ── OBIETTIVO ──────────────────────────────────────────── */}
            <div
              className="p-5 md:p-6"
              style={{
                border: `1px solid rgba(240,146,38,0.18)`,
                background: isDark
                  ? "rgba(240,146,38,0.04)"
                  : "rgba(240,146,38,0.03)",
              }}
            >
              <p
                className="text-[0.68rem] font-black tracking-[0.3em] uppercase mb-3"
                style={{ color: accentColor, opacity: 0.75 }}
              >
                Obiettivo del Blocco
              </p>
              <p
                className="text-[1.05rem] md:text-[1.1rem] leading-relaxed font-medium"
                style={{ color: th }}
              >
                {course.objective}
              </p>
            </div>

            {/* 2 ── PROGRAMMA ──────────────────────────────────────────── */}
            <div
              className="p-5 md:p-6"
              style={{ background: cellBg, border: `1px solid ${cellBorder}` }}
            >
              <div className="flex items-baseline gap-3 mb-5">
                <span
                  className="text-[0.68rem] font-black tracking-[0.3em] uppercase"
                  style={{ color: ts }}
                >
                  Programma
                </span>
                <span
                  className="text-[0.65rem] font-bold px-2 py-0.5 tabular-nums"
                  style={{
                    color: accentColor,
                    border: `1px solid ${isDark ? "rgba(240,146,38,0.2)" : "rgba(180,80,0,0.18)"}`,
                    background: isDark
                      ? "rgba(240,146,38,0.06)"
                      : "rgba(240,146,38,0.04)",
                  }}
                >
                  {course.curriculum.length} argomenti
                </span>
              </div>
              <div className="flex flex-col">
                {course.curriculum.map((item, i) => {
                  const desc = course.curriculumDescs?.[i];
                  return (
                    <div
                      key={i}
                      className="flex gap-4 py-4"
                      style={{
                        borderTop: i > 0 ? `1px solid ${cellBorder}` : "none",
                      }}
                    >
                      <div
                        className="shrink-0 flex items-center justify-center text-[0.55rem] font-black tabular-nums mt-0.5"
                        style={{
                          width: "30px",
                          height: "30px",
                          color: accentColor,
                          border: `1px solid ${isDark ? "rgba(240,146,38,0.22)" : "rgba(180,80,0,0.2)"}`,
                          background: isDark
                            ? "rgba(240,146,38,0.07)"
                            : "rgba(240,146,38,0.05)",
                        }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-[0.95rem] font-bold leading-snug"
                          style={{ color: th }}
                        >
                          {item}
                        </p>
                        {desc && (
                          <p
                            className="mt-1 text-[0.83rem] leading-relaxed"
                            style={{ color: tb }}
                          >
                            {desc}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3 ── STATS ──────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { val: String(teachers.length), label: "Docenti" },
                { val: course.duration, label: "Durata" },
                { val: "3", label: "Sessioni FIPE" },
                { val: "100%", label: "In presenza" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex flex-col items-center justify-center py-5 px-3 text-center"
                  style={{
                    background: cellBg,
                    border: `1px solid ${cellBorder}`,
                  }}
                >
                  <span
                    className="text-[1.3rem] font-black leading-tight"
                    style={{ color: th }}
                  >
                    {s.val}
                  </span>
                  <span
                    className="mt-1.5 text-[0.62rem] font-bold tracking-[0.18em] uppercase"
                    style={{ color: ts }}
                  >
                    {s.label}
                  </span>
                </div>
              ))}
            </div>

            {/* 4 ── DOCENTI ────────────────────────────────────────────── */}
            <div
              className="p-5 md:p-6"
              style={{ background: cellBg, border: `1px solid ${cellBorder}` }}
            >
              <div className="flex items-baseline justify-between gap-3 mb-6">
                <p
                  className="text-[0.68rem] font-black tracking-[0.3em] uppercase"
                  style={{ color: ts }}
                >
                  I Docenti del Blocco
                </p>
                <span
                  className="text-[0.65rem] font-bold px-2 py-0.5 tabular-nums"
                  style={{
                    color: accentColor,
                    border: `1px solid ${isDark ? "rgba(240,146,38,0.2)" : "rgba(180,80,0,0.18)"}`,
                    background: isDark
                      ? "rgba(240,146,38,0.06)"
                      : "rgba(240,146,38,0.04)",
                  }}
                >
                  {teachers.length} docenti
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {teachers.map((t) => (
                  <article
                    key={t.slug}
                    className="flex flex-col overflow-hidden"
                    style={{
                      background: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
                      border: `1px solid ${cellBorder}`,
                    }}
                  >
                    {/* Portrait 4:5 */}
                    <TeacherPortrait
                      teacher={t}
                      sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
                      fallbackTheme={isDark ? "dark" : "light"}
                    />

                    {/* Info */}
                    <div className="px-4 py-4 flex flex-col gap-2">
                      <p
                        className="text-[1rem] font-black leading-tight tracking-tight"
                        style={{ color: th }}
                      >
                        {t.name}
                      </p>
                      <p
                        className="text-[0.7rem] font-bold uppercase tracking-[0.16em] leading-snug"
                        style={{ color: accentColor }}
                      >
                        {t.role}
                      </p>
                      {t.talkTitle && (
                        <p
                          className="mt-1 text-[0.78rem] leading-snug border-l-2 pl-3"
                          style={{
                            color: th,
                            borderLeftColor: accentColor,
                          }}
                        >
                          <span
                            className="block text-[0.55rem] font-black tracking-[0.24em] uppercase mb-0.5"
                            style={{ color: accentColor }}
                          >
                            Intervento
                          </span>
                          {t.talkTitle}
                        </p>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {/* 5 ── INFO PACK ──────────────────────────────────────────── */}
            <div
              className="flex items-start gap-3 p-4"
              style={{
                border: "1px solid rgba(240,146,38,0.18)",
                background: isDark
                  ? "rgba(240,146,38,0.04)"
                  : "rgba(240,146,38,0.03)",
              }}
            >
              <span className="shrink-0 mt-0.5" style={{ color: "#F09226" }}>
                ●
              </span>
              <p
                className="text-[0.78rem] leading-relaxed"
                style={{ color: tb }}
              >
                Tutti i pack rilasciano l&apos;attestazione{" "}
                <span className="font-bold" style={{ color: accentColor }}>
                  Functional Strength Master Trainer
                </span>{" "}
                (diploma CSEN) e i{" "}
                <span className="font-bold" style={{ color: accentColor }}>
                  2.0 CEU NSCA
                </span>{" "}
                di valore internazionale. I pack{" "}
                <span className="font-bold" style={{ color: accentColor }}>
                  PRO ed ELITE
                </span>{" "}
                aggiungono la certificazione ufficiale Personal Trainer FIPE e 2
                Masterclass a scelta tra le 8 disponibili.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
