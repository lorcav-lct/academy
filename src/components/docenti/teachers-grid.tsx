"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { useTheme } from "@/components/providers/theme-provider";
import { TEACHERS, type Teacher } from "@/lib/constants/teachers";
import { WORKSHOPS } from "@/lib/constants/workshops";
import { TeacherPortrait } from "@/components/shared/teacher-portrait";
import { staggerContainer, fadeUp } from "@/lib/animations/variants";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CourseRef {
  label: string;
  href: string;
  type: string;
}

const ORANGE = "#F09226";
const ORANGE_RGB = "240,146,38";

// ─── Filters ─────────────────────────────────────────────────────────────────

const FILTERS = [
  { key: "all", label: "Tutti" },
  { key: "function", label: "FUNCTION" },
  { key: "strength", label: "STRENGTH" },
  { key: "science", label: "SCIENCE" },
  { key: "masterclass", label: "Masterclass" },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

const WORKSHOP_SLUGS = new Set(WORKSHOPS.map((w) => w.slug));

function matchesFilter(teacher: Teacher, filter: FilterKey): boolean {
  if (filter === "all") return true;
  if (filter === "masterclass")
    return teacher.courses.some((c) => WORKSHOP_SLUGS.has(c));
  return teacher.courses.includes(filter);
}

function getCourseRef(slug: string): CourseRef {
  if (slug === "function")
    return {
      label: "FUNCTION",
      href: "/corsi/function",
      type: "Blocco Formativo",
    };
  if (slug === "strength")
    return {
      label: "STRENGTH",
      href: "/corsi/strength",
      type: "Blocco Formativo",
    };
  if (slug === "science")
    return {
      label: "SCIENCE",
      href: "/corsi/science",
      type: "Blocco Formativo",
    };
  const workshop = WORKSHOPS.find((w) => w.slug === slug);
  if (workshop) {
    return {
      label: workshop.title,
      href: `/masterclass/${slug}`,
      type: "Masterclass",
    };
  }
  return { label: slug, href: "#", type: "Corso" };
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function DocentiHero({ isDark, total }: { isDark: boolean; total: number }) {
  const heroRef = useRef<HTMLElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!counterRef.current) return;
    const obj = { v: 0 };
    const tween = gsap.to(obj, {
      v: total,
      duration: 1.6,
      ease: "power3.out",
      onUpdate: () => {
        if (counterRef.current) {
          counterRef.current.textContent = String(Math.round(obj.v)).padStart(
            2,
            "0",
          );
        }
      },
    });
    return () => {
      tween.kill();
    };
  }, [total]);

  const subBg = isDark
    ? "linear-gradient(180deg, rgba(67,67,67,0.4) 0%, rgba(10,10,14,0.0) 100%)"
    : "linear-gradient(180deg, rgba(240,240,240,0.7) 0%, rgba(255,255,255,0) 100%)";

  return (
    <section
      ref={heroRef}
      className="relative overflow-hidden"
      style={{ background: subBg }}
    >
      {/* Grid lines bg */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          color: isDark ? "#fff" : "#000",
        }}
      />

      <div className="relative mx-auto max-w-[1440px] px-[5%] md:px-10 pt-12 pb-20 md:pt-20 md:pb-28">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-y-10 gap-x-10 items-end"
        >
          <div>
            <motion.div
              variants={fadeUp}
              className="mb-6 flex items-center gap-3"
            >
              <span
                className="h-px w-10"
                style={{ background: `rgba(${ORANGE_RGB},0.6)` }}
              />
              <span
                className="text-[0.7rem] font-black tracking-[0.32em] uppercase"
                style={{ color: ORANGE }}
              >
                Il Corpo Docente
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="font-black leading-[0.9] tracking-[-0.035em]"
              style={{
                fontSize: "clamp(3.2rem, 9vw, 7.2rem)",
                color: isDark ? "#f5f5f7" : "#0a0a14",
              }}
            >
              I volti dietro
              <br />
              <span style={{ color: ORANGE }}>l&apos;Academy.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-8 max-w-[44ch] text-[1.05rem] md:text-[1.15rem] leading-[1.55]"
              style={{ color: isDark ? "rgba(245,245,247,0.7)" : "#3a3a44" }}
            >
              Ricercatori universitari, professionisti d&apos;élite e campioni
              internazionali. Ognuno selezionato per autorità reale nel suo
              campo — non per fama.
            </motion.p>
          </div>

          {/* Counter pillar */}
          <motion.div
            variants={fadeUp}
            className="flex flex-col items-start lg:items-end shrink-0"
          >
            <span
              className="text-[0.62rem] font-black tracking-[0.32em] uppercase mb-2"
              style={{
                color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)",
              }}
            >
              Cohort 2026/27
            </span>
            <div className="flex items-baseline gap-3">
              <span
                ref={counterRef}
                className="font-black tabular-nums leading-none tracking-[-0.04em]"
                style={{
                  fontSize: "clamp(5rem, 12vw, 9rem)",
                  color: ORANGE,
                }}
              >
                00
              </span>
              <span
                className="text-[0.66rem] font-black tracking-[0.3em] uppercase"
                style={{
                  color: isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.55)",
                }}
              >
                Docenti
                <br />
                Selezionati
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-px"
          style={{
            background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)"}`,
          }}
        >
          {[
            { v: "PhD", l: "Ricercatori" },
            { v: "Pro", l: "Operativi sul campo" },
            { v: "ITA + INT", l: "Network globale" },
            { v: "100%", l: "In presenza" },
          ].map((s) => (
            <div
              key={s.l}
              className="flex flex-col px-5 py-5"
              style={{ background: isDark ? "#0a0a0e" : "#ffffff" }}
            >
              <span
                className="text-[1.6rem] font-black leading-none tracking-tight"
                style={{ color: isDark ? "#f5f5f7" : "#0a0a14" }}
              >
                {s.v}
              </span>
              <span
                className="mt-2 text-[0.6rem] font-bold tracking-[0.22em] uppercase"
                style={{
                  color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
                }}
              >
                {s.l}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── TeacherCard (editorial) ──────────────────────────────────────────────────

function TeacherCard({
  teacher,
  index,
  onClick,
  isDark,
}: {
  teacher: Teacher;
  index: number;
  onClick: (t: Teacher) => void;
  isDark: boolean;
}) {
  const courseLabel = teacher.courses
    .map((c) => getCourseRef(c).label)
    .join(" · ");

  return (
    <button
      onClick={() => onClick(teacher)}
      data-teacher-card
      className="group relative w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-academy-orange transition-transform duration-500 hover:-translate-y-1"
      style={{
        background: isDark ? "#0d0d12" : "#ffffff",
        border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
      }}
      aria-label={`Apri profilo di ${teacher.name}`}
    >
      <TeacherPortrait
        teacher={teacher}
        sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 30vw"
        priority={index < 4}
        fallbackTheme={isDark ? "dark" : "light"}
      />

      {/* Index marker top-left */}
      <span
        className="absolute top-3 left-3 z-10 px-2 py-1 font-mono text-[0.6rem] font-black tracking-[0.2em]"
        style={{
          background: "rgba(0,0,0,0.6)",
          color: "#ffffff",
          backdropFilter: "blur(4px)",
        }}
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* Course badge top-right */}
      <span
        className="absolute top-3 right-3 z-10 px-2 py-1 text-[0.6rem] font-black tracking-[0.2em] uppercase truncate max-w-[60%]"
        style={{
          background: `rgba(${ORANGE_RGB},0.92)`,
          color: "#111",
        }}
      >
        {courseLabel}
      </span>

      {/* Body */}
      <div className="px-5 py-5 md:px-6 md:py-6">
        <h3
          className="text-[1.05rem] md:text-[1.15rem] font-black leading-[1.1] tracking-tight transition-colors group-hover:text-academy-orange"
          style={{ color: isDark ? "#f5f5f7" : "#111111" }}
        >
          {teacher.name}
        </h3>
        <p
          className="mt-2 text-[0.7rem] font-bold tracking-[0.18em] uppercase line-clamp-2"
          style={{ color: ORANGE }}
        >
          {teacher.role}
        </p>

        {/* Subtle hover affordance */}
        <div
          className="mt-4 flex items-center gap-2 text-[0.62rem] font-bold tracking-[0.24em] uppercase opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: ORANGE }}
        >
          <span>Apri profilo</span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M2 6h8M6 2l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="square"
            />
          </svg>
        </div>
      </div>
    </button>
  );
}

// ─── Modal (premium portrait + info) ──────────────────────────────────────────

function TeacherModal({
  teacher,
  onClose,
  isDark,
}: {
  teacher: Teacher | null;
  onClose: () => void;
  isDark: boolean;
}) {
  useEffect(() => {
    if (!teacher) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [teacher, onClose]);

  useEffect(() => {
    if (teacher) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [teacher]);

  return (
    <AnimatePresence>
      {teacher && (
        <>
          <motion.div
            key="bd"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[400] cursor-pointer"
            style={{
              background: "rgba(0,0,0,0.78)",
              backdropFilter: "blur(14px)",
            }}
            onClick={onClose}
            aria-hidden
          />

          <motion.div
            key="md"
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] }}
            role="dialog"
            aria-modal="true"
            aria-label={`Profilo di ${teacher.name}`}
            className="fixed inset-0 z-[401] flex items-end md:items-center justify-center md:p-6 lg:p-10"
            style={{ pointerEvents: "none" }}
          >
            <div
              className="relative w-full overflow-hidden flex flex-col md:grid md:grid-cols-[minmax(280px,42%)_1fr] h-dvh max-h-dvh md:h-auto md:max-h-[88vh] md:max-w-[1080px]"
              style={{
                pointerEvents: "all",
                background: isDark ? "#0a0a0e" : "#ffffff",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
                boxShadow: "0 40px 120px rgba(0,0,0,0.7)",
              }}
            >
              {/* Portrait — left full height (desktop) / top (mobile) */}
              <div className="relative shrink-0 md:h-full">
                <TeacherPortrait
                  teacher={teacher}
                  sizes="(max-width: 768px) 100vw, 42vw"
                  priority
                  fallbackTheme={isDark ? "dark" : "light"}
                />
                {/* Close on mobile (over image) */}
                <button
                  onClick={onClose}
                  aria-label="Chiudi"
                  className="md:hidden absolute top-4 right-4 z-10 flex items-center justify-center h-10 w-10 transition-opacity hover:opacity-80"
                  style={{
                    background: "rgba(0,0,0,0.65)",
                    color: "#ffffff",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M1 1l12 12M13 1L1 13"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="square"
                    />
                  </svg>
                </button>
              </div>

              {/* Info column */}
              <div className="relative overflow-y-auto p-6 md:p-9 flex flex-col">
                {/* Close on desktop */}
                <button
                  onClick={onClose}
                  aria-label="Chiudi"
                  className="hidden md:flex absolute top-5 right-5 z-10 items-center gap-2 text-[0.66rem] font-bold tracking-[0.22em] uppercase transition-opacity hover:opacity-60"
                  style={{
                    color: isDark
                      ? "rgba(255,255,255,0.55)"
                      : "rgba(0,0,0,0.55)",
                  }}
                >
                  Chiudi
                  <span className="text-base leading-none">×</span>
                </button>

                <p
                  className="text-[0.62rem] font-black tracking-[0.32em] uppercase mb-3"
                  style={{ color: ORANGE }}
                >
                  Docente Academy
                </p>
                <h2
                  className="font-black leading-[0.95] tracking-[-0.025em]"
                  style={{
                    fontSize: "clamp(1.7rem, 4vw, 2.4rem)",
                    color: isDark ? "#f5f5f7" : "#0a0a14",
                  }}
                >
                  {teacher.name}
                </h2>
                <p
                  className="mt-3 text-[0.78rem] md:text-[0.82rem] font-bold uppercase tracking-[0.2em]"
                  style={{ color: ORANGE }}
                >
                  {teacher.role}
                </p>

                {teacher.bio && (
                  <p
                    className="mt-6 text-[0.92rem] md:text-[0.95rem] leading-[1.65]"
                    style={{
                      color: isDark ? "rgba(245,245,247,0.72)" : "#3d3d44",
                    }}
                  >
                    {teacher.bio}
                  </p>
                )}

                {teacher.talkTitle && (
                  <div
                    className="mt-6 px-4 py-4 border-l-2"
                    style={{
                      background: `rgba(${ORANGE_RGB},${isDark ? "0.07" : "0.06"})`,
                      borderLeftColor: ORANGE,
                    }}
                  >
                    <p
                      className="text-[0.6rem] font-black tracking-[0.28em] uppercase mb-2"
                      style={{ color: ORANGE }}
                    >
                      Intervento in Academy
                    </p>
                    <p
                      className="text-[0.95rem] leading-snug font-semibold"
                      style={{ color: isDark ? "#f5f5f7" : "#111111" }}
                    >
                      {teacher.talkTitle}
                    </p>
                  </div>
                )}

                <div className="mt-8">
                  <p
                    className="mb-3 text-[0.6rem] font-black tracking-[0.28em] uppercase"
                    style={{
                      color: isDark
                        ? "rgba(255,255,255,0.45)"
                        : "rgba(0,0,0,0.5)",
                    }}
                  >
                    Insegna in
                  </p>
                  <div className="flex flex-col gap-2">
                    {teacher.courses.map((slug) => {
                      const ref = getCourseRef(slug);
                      return (
                        <Link
                          key={slug}
                          href={ref.href}
                          onClick={onClose}
                          className="group/l flex items-center justify-between px-4 py-3 transition-all"
                          style={{
                            background: `rgba(${ORANGE_RGB},${isDark ? "0.06" : "0.05"})`,
                            border: `1px solid rgba(${ORANGE_RGB},0.22)`,
                          }}
                        >
                          <div>
                            <span
                              className="block text-[0.85rem] font-black tracking-wide"
                              style={{ color: ORANGE }}
                            >
                              {ref.label}
                            </span>
                            <span
                              className="text-[0.62rem] font-bold tracking-[0.22em] uppercase"
                              style={{
                                color: isDark
                                  ? "rgba(255,255,255,0.4)"
                                  : "rgba(0,0,0,0.45)",
                              }}
                            >
                              {ref.type}
                            </span>
                          </div>
                          <span
                            className="text-base opacity-0 transition-all group-hover/l:opacity-100 group-hover/l:translate-x-1"
                            style={{ color: ORANGE }}
                          >
                            →
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────

export function TeachersGrid() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const cards = cardsRef.current?.querySelectorAll("[data-teacher-card]");
      if (cards && cards.length > 0) {
        gsap.from(cards, {
          opacity: 0,
          y: 28,
          duration: 0.6,
          stagger: 0.05,
          ease: "power3.out",
          delay: 0.15,
        });
      }
    });
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const cards = cardsRef.current?.querySelectorAll("[data-teacher-card]");
    if (!cards || cards.length === 0) return;
    gsap.from(cards, {
      opacity: 0,
      y: 18,
      duration: 0.4,
      stagger: 0.04,
      ease: "power2.out",
    });
  }, [activeFilter]);

  const filtered = useMemo(
    () => TEACHERS.filter((t) => matchesFilter(t, activeFilter)),
    [activeFilter],
  );

  return (
    <>
      <DocentiHero isDark={isDark} total={TEACHERS.length} />

      {/* Filter bar — sticky-ish */}
      <div
        className="sticky top-0 z-30 -mt-1"
        style={{
          background: isDark ? "rgba(10,10,14,0.92)" : "rgba(255,255,255,0.92)",
          backdropFilter: "blur(14px)",
          borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
          borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
        }}
      >
        <div className="mx-auto max-w-[1440px] px-[5%] md:px-10 py-3 md:py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div
              className="flex flex-wrap gap-px"
              style={{
                background: isDark
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(0,0,0,0.08)",
              }}
            >
              {FILTERS.map((f) => {
                const isActive = activeFilter === f.key;
                return (
                  <button
                    key={f.key}
                    onClick={() => setActiveFilter(f.key)}
                    className="px-3 md:px-4 py-2 text-[0.62rem] md:text-[0.66rem] font-black tracking-[0.2em] uppercase transition-all focus:outline-none focus-visible:ring-1 focus-visible:ring-academy-orange"
                    style={{
                      background: isActive
                        ? ORANGE
                        : isDark
                          ? "#0a0a0e"
                          : "#ffffff",
                      color: isActive
                        ? "#111"
                        : isDark
                          ? "rgba(255,255,255,0.7)"
                          : "rgba(0,0,0,0.7)",
                    }}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
            <span
              className="text-[0.6rem] font-bold tracking-[0.24em] uppercase tabular-nums"
              style={{
                color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)",
              }}
            >
              {filtered.length} {filtered.length === 1 ? "docente" : "docenti"}
            </span>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="mx-auto max-w-[1440px] px-[5%] md:px-10 py-12 md:py-16">
        <div
          ref={cardsRef}
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {filtered.map((teacher, i) => (
            <TeacherCard
              key={teacher.slug}
              teacher={teacher}
              index={i}
              onClick={setSelectedTeacher}
              isDark={isDark}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <p
            className="py-20 text-center text-[0.85rem]"
            style={{
              color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.5)",
            }}
          >
            Nessun docente trovato per questo filtro.
          </p>
        )}
      </div>

      <TeacherModal
        teacher={selectedTeacher}
        onClose={() => setSelectedTeacher(null)}
        isDark={isDark}
      />
    </>
  );
}
