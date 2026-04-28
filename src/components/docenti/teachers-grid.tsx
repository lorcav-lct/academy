"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { useTheme } from "@/components/providers/theme-provider";
import { TEACHERS, type Teacher } from "@/lib/constants/teachers";
import { WORKSHOPS } from "@/lib/constants/workshops";
import { staggerContainer, fadeUp } from "@/lib/animations/variants";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CourseRef {
  label: string;
  href: string;
  type: string;
}

// ─── Filter tabs ──────────────────────────────────────────────────────────────

const FILTERS = [
  { key: "all", label: "Tutti" },
  { key: "function", label: "FUNCTION" },
  { key: "strength", label: "STRENGTH" },
  { key: "science", label: "SCIENCE" },
  { key: "masterclass", label: "Masterclass" },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

// Workshop slugs set for quick lookup
const WORKSHOP_SLUGS = new Set(WORKSHOPS.map((w) => w.slug));

function isMasterclassOnly(teacher: Teacher): boolean {
  return teacher.courses.every((c) => WORKSHOP_SLUGS.has(c));
}

function matchesFilter(teacher: Teacher, filter: FilterKey): boolean {
  if (filter === "all") return true;
  if (filter === "masterclass")
    return teacher.courses.some((c) => WORKSHOP_SLUGS.has(c));
  return teacher.courses.includes(filter);
}

// ─── getCourseRef helper ──────────────────────────────────────────────────────

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

// ─── Course label badge colors ────────────────────────────────────────────────

function getCourseColor(_slug: string): string {
  return "#F09226";
}

// ─── Initials helper ──────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

// ─── TeacherCard ─────────────────────────────────────────────────────────────

interface TeacherCardProps {
  teacher: Teacher;
  onClick: (teacher: Teacher) => void;
  isDark: boolean;
}

function TeacherCard({ teacher, onClick, isDark }: TeacherCardProps) {
  const accentColor = teacher.color;

  return (
    <button
      data-teacher-card
      onClick={() => onClick(teacher)}
      className="group w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-academy-orange"
      aria-label={`Apri profilo di ${teacher.name}`}
    >
      <div
        className="relative flex h-full flex-col overflow-hidden transition-all duration-500"
        style={{
          background: isDark
            ? "linear-gradient(135deg, rgba(67,67,67,0.85) 0%, rgba(26,26,26,0.95) 100%)"
            : "#ffffff",
          border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)"}`,
          borderRadius: 0,
        }}
        // Hover border glow via inline style transition is done with CSS class
      >
        {/* Hover glow overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            boxShadow: `inset 0 0 0 1px ${accentColor}44, 0 0 30px ${accentColor}18`,
          }}
        />

        {/* Scale wrapper */}
        <div className="transition-transform duration-500 group-hover:scale-[1.02]">
          {/* Image area — ~45% height */}
          <div
            className="relative flex items-center justify-center"
            style={{
              paddingTop: "45%",
              background: isDark
                ? `linear-gradient(135deg, ${accentColor}14 0%, rgba(26,26,26,0.6) 100%)`
                : `linear-gradient(135deg, ${accentColor}18 0%, ${accentColor}08 100%)`,
              borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)"}`,
            }}
          >
            {teacher.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={teacher.image_url}
                alt={teacher.name}
                className="absolute inset-0 h-full w-full object-cover object-top"
              />
            ) : (
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ background: "transparent" }}
              >
                <span
                  className="text-3xl font-black tracking-widest"
                  style={{ color: accentColor, opacity: 0.6 }}
                >
                  {getInitials(teacher.name)}
                </span>
              </div>
            )}

            {/* Masterclass badge */}
            {isMasterclassOnly(teacher) && (
              <div
                className="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase"
                style={{
                  background: "rgba(240,146,38,0.15)",
                  border: "1px solid rgba(240,146,38,0.35)",
                  color: "#F09226",
                }}
              >
                Masterclass
              </div>
            )}
          </div>

          {/* Content area */}
          <div className="flex flex-1 flex-col p-5">
            <h3
              className="mb-1 text-base font-black leading-tight tracking-tight transition-colors duration-300 group-hover:text-academy-orange"
              style={{ color: isDark ? "#f5f5f7" : "#111111" }}
            >
              {teacher.name}
            </h3>
            <p
              className="mb-4 text-xs leading-relaxed"
              style={{ color: isDark ? "#8e8e93" : "#636366" }}
            >
              {teacher.role}
            </p>

            {/* Course badge pills */}
            <div className="mt-auto flex flex-wrap gap-1.5">
              {teacher.courses.map((slug) => {
                const ref = getCourseRef(slug);
                const color = getCourseColor(slug);
                return (
                  <span
                    key={slug}
                    className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase"
                    style={{
                      background: `${color}14`,
                      border: `1px solid ${color}30`,
                      color: color,
                    }}
                  >
                    {ref.label}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ModalProps {
  teacher: Teacher | null;
  onClose: () => void;
  isDark: boolean;
}

function TeacherModal({ teacher, onClose, isDark }: ModalProps) {
  // Close on ESC
  useEffect(() => {
    if (!teacher) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [teacher, onClose]);

  // Prevent body scroll when open
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
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 cursor-pointer"
            style={{
              backdropFilter: "blur(8px)",
              background: "rgba(0,0,0,0.65)",
            }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal card */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            role="dialog"
            aria-modal="true"
            aria-label={`Profilo di ${teacher.name}`}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ pointerEvents: "none" }}
          >
            <div
              className="relative w-full max-w-lg overflow-y-auto"
              style={{
                pointerEvents: "all",
                maxHeight: "90vh",
                background: isDark
                  ? "linear-gradient(135deg, rgba(67,67,67,0.97) 0%, rgba(26,26,26,0.99) 100%)"
                  : "#ffffff",
                border: `1px solid ${isDark ? "rgba(240,146,38,0.2)" : "rgba(0,0,0,0.1)"}`,
                boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
              }}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center transition-colors hover:text-academy-orange focus:outline-none focus-visible:ring-2 focus-visible:ring-academy-orange"
                style={{ color: isDark ? "#8e8e93" : "#636366" }}
                aria-label="Chiudi"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M1 1l14 14M15 1L1 15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>

              {/* Header: image + name + role */}
              <div
                className="flex items-center gap-5 p-6 pb-5"
                style={{
                  borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
                }}
              >
                {/* Avatar */}
                <div
                  className="relative shrink-0 overflow-hidden"
                  style={{
                    width: 80,
                    height: 80,
                    background: isDark
                      ? `linear-gradient(135deg, ${teacher.color}18, rgba(26,26,26,0.8))`
                      : `linear-gradient(135deg, ${teacher.color}20, ${teacher.color}08)`,
                    border: `2px solid ${teacher.color}40`,
                  }}
                >
                  {teacher.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={teacher.image_url}
                      alt={teacher.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span
                      className="absolute inset-0 flex items-center justify-center text-xl font-black"
                      style={{ color: teacher.color, opacity: 0.7 }}
                    >
                      {getInitials(teacher.name)}
                    </span>
                  )}
                </div>

                {/* Name & role */}
                <div className="min-w-0">
                  <h2
                    className="text-xl font-black leading-tight tracking-tight"
                    style={{ color: isDark ? "#f5f5f7" : "#111111" }}
                  >
                    {teacher.name}
                  </h2>
                  <p
                    className="mt-1 text-sm font-semibold"
                    style={{ color: "#F09226" }}
                  >
                    {teacher.role}
                  </p>
                </div>
              </div>

              {/* Bio */}
              <div className="px-6 pt-5 pb-4">
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: isDark ? "#8e8e93" : "#636366" }}
                >
                  {teacher.bio}
                </p>
              </div>

              {/* Insegna in */}
              <div className="px-6 pb-6">
                <p
                  className="mb-3 text-[11px] font-bold tracking-[0.25em] uppercase"
                  style={{ color: isDark ? "#48484a" : "#8e8e93" }}
                >
                  Insegna in
                </p>
                <div className="flex flex-col gap-2">
                  {teacher.courses.map((slug) => {
                    const ref = getCourseRef(slug);
                    const color = getCourseColor(slug);
                    return (
                      <Link
                        key={slug}
                        href={ref.href}
                        onClick={onClose}
                        className="group/link flex items-center justify-between px-4 py-3 transition-all duration-300"
                        style={{
                          background: isDark ? `${color}0d` : `${color}0a`,
                          border: `1px solid ${color}25`,
                        }}
                      >
                        <div>
                          <span
                            className="block text-sm font-bold tracking-wide transition-colors group-hover/link:text-white"
                            style={{ color: color }}
                          >
                            {ref.label}
                          </span>
                          <span
                            className="text-[11px] tracking-wider uppercase"
                            style={{ color: isDark ? "#636366" : "#8e8e93" }}
                          >
                            {ref.type}
                          </span>
                        </div>
                        <span
                          className="text-base opacity-0 transition-all duration-300 group-hover/link:translate-x-1 group-hover/link:opacity-100"
                          style={{ color: color }}
                        >
                          →
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function TeachersGrid() {
  const { theme } = useTheme();
  const d = theme === "dark";

  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  const headRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  // GSAP animations
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      // Header scroll reveal
      if (headRef.current) {
        gsap.from(headRef.current, {
          scrollTrigger: {
            trigger: headRef.current,
            start: "top 88%",
            once: true,
          },
          opacity: 0,
          y: 30,
          duration: 0.8,
          ease: "power3.out",
        });
      }

      // Cards stagger on load
      const cards = cardsRef.current?.querySelectorAll("[data-teacher-card]");
      if (cards && cards.length > 0) {
        gsap.from(cards, {
          opacity: 0,
          y: 30,
          duration: 0.6,
          stagger: 0.06,
          ease: "power3.out",
          delay: 0.2,
        });
      }
    });
    return () => ctx.revert();
  }, []);

  // Re-animate cards when filter changes
  useEffect(() => {
    const cards = cardsRef.current?.querySelectorAll("[data-teacher-card]");
    if (!cards || cards.length === 0) return;
    gsap.from(cards, {
      opacity: 0,
      y: 20,
      duration: 0.4,
      stagger: 0.05,
      ease: "power2.out",
    });
  }, [activeFilter]);

  const filtered = TEACHERS.filter((t) => matchesFilter(t, activeFilter));

  return (
    <>
      {/* ── Header ── */}
      <div
        ref={headRef}
        className="mx-auto max-w-[1440px] px-[5%] md:px-10 pb-12"
      >
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.span variants={fadeUp} className="label-tag mb-4 block">
            Il Corpo Docente
          </motion.span>
          <motion.h1
            variants={fadeUp}
            className="mb-4 text-4xl font-black leading-tight tracking-tight sm:text-6xl lg:text-7xl"
          >
            I Nostri <span className="gradient-text">Docenti</span>
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="max-w-2xl text-lg leading-relaxed"
            style={{ color: d ? "#8e8e93" : "#636366" }}
          >
            Ricercatori universitari, professionisti d&apos;élite e campioni
            internazionali. Ogni docente è selezionato per eccellenza nel
            proprio campo.
          </motion.p>
        </motion.div>

        {/* ── Filter tabs ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-8 flex flex-wrap gap-2"
        >
          {FILTERS.map((f) => {
            const isActive = activeFilter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className="px-4 py-2 text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-academy-orange"
                style={{
                  background: isActive
                    ? "rgba(240,146,38,0.15)"
                    : d
                      ? "rgba(255,255,255,0.04)"
                      : "rgba(0,0,0,0.04)",
                  border: `1px solid ${isActive ? "rgba(240,146,38,0.5)" : d ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)"}`,
                  color: isActive ? "#F09226" : d ? "#8e8e93" : "#636366",
                }}
              >
                {f.label}
              </button>
            );
          })}
        </motion.div>
      </div>

      {/* ── Grid ── */}
      <div className="mx-auto max-w-[1440px] px-[5%] md:px-10">
        <div
          ref={cardsRef}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.map((teacher) => (
            <TeacherCard
              key={teacher.slug}
              teacher={teacher}
              onClick={setSelectedTeacher}
              isDark={d}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <p
            className="py-16 text-center text-sm"
            style={{ color: d ? "#636366" : "#8e8e93" }}
          >
            Nessun docente trovato per questo filtro.
          </p>
        )}
      </div>

      {/* ── Modal ── */}
      <TeacherModal
        teacher={selectedTeacher}
        onClose={() => setSelectedTeacher(null)}
        isDark={d}
      />
    </>
  );
}
