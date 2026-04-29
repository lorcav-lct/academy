"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTheme } from "@/components/providers/theme-provider";
import { COURSES } from "@/lib/constants/courses";
import { getTeachersByCourse, type Teacher } from "@/lib/constants/teachers";
import { TeacherPortrait } from "@/components/shared/teacher-portrait";

const PREVIEW_TEACHERS = 3;

// SEO-oriented descriptors per block: keyword-rich, specific, search-friendly.
const SEO_TAGLINE_BY_SLUG: Record<string, string> = {
  function:
    "Anatomia, biomeccanica e Functional Training applicato alla general population.",
  strength:
    "Forza, condizionamento e preparazione atletica per atleti e operatori tattici.",
  science:
    "Recupero, nutrizione, psicologia del movimento e business del fitness.",
};

export function PercorsoBlocks() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const railFillRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // ── Header reveal ──────────────────────────────────────────────
      const headerEl = headerRef.current;
      if (headerEl) {
        const headerChildren = Array.from(
          headerEl.querySelectorAll<HTMLElement>("[data-header-item]"),
        );
        if (headerChildren.length) {
          gsap.set(headerChildren, { opacity: 0, y: 28 });
          ScrollTrigger.create({
            trigger: headerEl,
            start: "top 85%",
            once: true,
            onEnter: () => {
              gsap.to(headerChildren, {
                opacity: 1,
                y: 0,
                stagger: 0.08,
                duration: 0.85,
                ease: "power3.out",
              });
            },
          });
        }
      }

      // ── Vertical rail progress fill ────────────────────────────────
      if (railRef.current && railFillRef.current && sectionRef.current) {
        gsap.set(railFillRef.current, { scaleY: 0, transformOrigin: "top" });
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: "top 60%",
          end: "bottom 60%",
          scrub: 0.6,
          onUpdate: (self) => {
            gsap.to(railFillRef.current, {
              scaleY: self.progress,
              duration: 0.1,
              overwrite: "auto",
            });
          },
        });
      }

      // ── Per-block animations (mq desktop / mobile separate) ────────
      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px)", () => {
        gsap.utils.toArray<HTMLElement>("[data-block-row]").forEach((row) => {
          const num = row.querySelector<HTMLElement>("[data-block-num]");
          const titleChars =
            row.querySelectorAll<HTMLElement>("[data-title-char]");
          const meta = row.querySelectorAll<HTMLElement>("[data-block-meta]");
          const items = row.querySelectorAll<HTMLElement>(
            "[data-curriculum-item]",
          );
          const teachers = row.querySelectorAll<HTMLElement>(
            "[data-teacher-tile]",
          );
          const cta = row.querySelector<HTMLElement>("[data-block-cta]");

          if (num) {
            gsap.set(num, { opacity: 0, y: 60, scale: 0.85 });
            ScrollTrigger.create({
              trigger: row,
              start: "top 78%",
              once: true,
              onEnter: () =>
                gsap.to(num, {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  duration: 1.1,
                  ease: "expo.out",
                }),
            });
          }
          if (titleChars.length) {
            gsap.set(titleChars, { opacity: 0, y: 40, rotateX: -45 });
            ScrollTrigger.create({
              trigger: row,
              start: "top 75%",
              once: true,
              onEnter: () =>
                gsap.to(titleChars, {
                  opacity: 1,
                  y: 0,
                  rotateX: 0,
                  stagger: 0.04,
                  duration: 0.9,
                  ease: "power3.out",
                  delay: 0.15,
                }),
            });
          }
          if (meta.length) {
            gsap.set(meta, { opacity: 0, y: 20 });
            ScrollTrigger.create({
              trigger: row,
              start: "top 70%",
              once: true,
              onEnter: () =>
                gsap.to(meta, {
                  opacity: 1,
                  y: 0,
                  stagger: 0.07,
                  duration: 0.7,
                  ease: "power3.out",
                  delay: 0.4,
                }),
            });
          }
          if (items.length) {
            gsap.set(items, { opacity: 0, x: -32 });
            ScrollTrigger.create({
              trigger: row,
              start: "top 65%",
              once: true,
              onEnter: () =>
                gsap.to(items, {
                  opacity: 1,
                  x: 0,
                  stagger: 0.06,
                  duration: 0.6,
                  ease: "power3.out",
                  delay: 0.2,
                }),
            });
          }
          if (teachers.length) {
            gsap.set(teachers, { opacity: 0, y: 30, scale: 0.92 });
            ScrollTrigger.create({
              trigger: row,
              start: "top 55%",
              once: true,
              onEnter: () =>
                gsap.to(teachers, {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  stagger: 0.07,
                  duration: 0.65,
                  ease: "back.out(1.4)",
                }),
            });
          }
          if (cta) {
            gsap.set(cta, { opacity: 0, y: 18 });
            ScrollTrigger.create({
              trigger: row,
              start: "top 50%",
              once: true,
              onEnter: () =>
                gsap.to(cta, {
                  opacity: 1,
                  y: 0,
                  duration: 0.7,
                  ease: "power3.out",
                  delay: 0.1,
                }),
            });
          }

          // Parallax effect on the giant numeral
          if (num) {
            gsap.to(num, {
              yPercent: -25,
              ease: "none",
              scrollTrigger: {
                trigger: row,
                start: "top bottom",
                end: "bottom top",
                scrub: 1,
              },
            });
          }
        });
      });

      mm.add("(max-width: 1023px)", () => {
        gsap.utils.toArray<HTMLElement>("[data-block-row]").forEach((row) => {
          const items = row.querySelectorAll<HTMLElement>(
            "[data-curriculum-item]",
          );
          const meta = row.querySelectorAll<HTMLElement>("[data-block-meta]");
          const teachers = row.querySelectorAll<HTMLElement>(
            "[data-teacher-tile]",
          );
          const num = row.querySelector<HTMLElement>("[data-block-num]");
          const titleChars =
            row.querySelectorAll<HTMLElement>("[data-title-char]");

          if (num) {
            gsap.set(num, { opacity: 0, y: 24 });
            ScrollTrigger.create({
              trigger: row,
              start: "top 80%",
              once: true,
              onEnter: () =>
                gsap.to(num, {
                  opacity: 1,
                  y: 0,
                  duration: 0.7,
                  ease: "power3.out",
                }),
            });
          }
          if (titleChars.length) {
            gsap.set(titleChars, { opacity: 0, y: 24 });
            ScrollTrigger.create({
              trigger: row,
              start: "top 78%",
              once: true,
              onEnter: () =>
                gsap.to(titleChars, {
                  opacity: 1,
                  y: 0,
                  stagger: 0.03,
                  duration: 0.7,
                  ease: "power3.out",
                  delay: 0.1,
                }),
            });
          }
          if (meta.length) {
            gsap.set(meta, { opacity: 0, y: 14 });
            ScrollTrigger.create({
              trigger: row,
              start: "top 75%",
              once: true,
              onEnter: () =>
                gsap.to(meta, {
                  opacity: 1,
                  y: 0,
                  stagger: 0.06,
                  duration: 0.55,
                  ease: "power3.out",
                  delay: 0.2,
                }),
            });
          }
          if (items.length) {
            gsap.set(items, { opacity: 0, y: 20 });
            ScrollTrigger.create({
              trigger: row,
              start: "top 72%",
              once: true,
              onEnter: () =>
                gsap.to(items, {
                  opacity: 1,
                  y: 0,
                  stagger: 0.05,
                  duration: 0.55,
                  ease: "power3.out",
                  delay: 0.15,
                }),
            });
          }
          if (teachers.length) {
            gsap.set(teachers, { opacity: 0, y: 16 });
            ScrollTrigger.create({
              trigger: row,
              start: "top 68%",
              once: true,
              onEnter: () =>
                gsap.to(teachers, {
                  opacity: 1,
                  y: 0,
                  stagger: 0.05,
                  duration: 0.55,
                  ease: "power3.out",
                }),
            });
          }
        });
      });

      // Force refresh after layout settles to ensure triggers fire correctly
      const refresh = () => ScrollTrigger.refresh();
      requestAnimationFrame(refresh);
      window.addEventListener("load", refresh);

      return () => {
        mm.revert();
        window.removeEventListener("load", refresh);
      };
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const th = isDark ? "#f5f5fa" : "#0a0a1a";
  const tb = isDark ? "rgba(180,180,200,0.65)" : "#555";
  const ts = isDark ? "rgba(120,120,140,0.5)" : "#888";
  const numFaint = isDark ? "rgba(240,146,38,0.16)" : "rgba(240,146,38,0.28)";
  const lineColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

  const blocks = [...COURSES].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <section
      ref={sectionRef}
      className="themed-section relative overflow-hidden"
    >
      <div className="absolute inset-0 section-bg" />

      {/* Soft radial wash — no grid background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: isDark
            ? "radial-gradient(ellipse at 20% 30%, rgba(240,146,38,0.05) 0%, transparent 55%), radial-gradient(ellipse at 80% 70%, rgba(240,146,38,0.04) 0%, transparent 55%)"
            : "radial-gradient(ellipse at 20% 30%, rgba(212,98,42,0.05) 0%, transparent 55%), radial-gradient(ellipse at 80% 70%, rgba(212,98,42,0.04) 0%, transparent 55%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-[1440px] px-[5%] md:px-10 py-24 md:py-36">
        {/* ─── HEADER ─────────────────────────────────────────────── */}
        <div ref={headerRef} className="mb-20 md:mb-28 max-w-3xl">
          <span data-header-item className="label-tag mb-4 block">
            Il Programma in 3 Blocchi
          </span>
          <h2
            data-header-item
            className="font-black tracking-[-0.025em] leading-[0.92] text-[clamp(2.6rem,5.5vw,5rem)]"
            style={{ color: th }}
          >
            FUNCTION, STRENGTH, SCIENCE.
            <br />9 mesi per diventare{" "}
            <span className="gradient-text">personal trainer</span>.
          </h2>
          <p
            data-header-item
            className="mt-6 max-w-xl text-[0.95rem] leading-relaxed"
            style={{ color: tb }}
          >
            Tre blocchi formativi in presenza che coprono biomeccanica e
            Functional Training, Strength &amp; Conditioning per atleti e
            preparazione tattica, recupero, nutrizione, psicologia del movimento
            e business del fitness. Curriculum, docenti e date di ogni blocco.
          </p>
        </div>

        {/* ─── BLOCKS LAYOUT ──────────────────────────────────────── */}
        <div className="relative">
          {/* Vertical rail (desktop only) */}
          <div
            ref={railRef}
            aria-hidden
            className="hidden lg:block absolute left-0 top-0 bottom-0 w-px"
            style={{ background: lineColor }}
          >
            <div
              ref={railFillRef}
              className="absolute inset-0 w-px"
              style={{ background: "#F09226" }}
            />
          </div>

          <div className="flex flex-col">
            {blocks.map((course, i) => {
              const teachers = getTeachersByCourse(course.slug);
              const previewTeachers = teachers.slice(0, PREVIEW_TEACHERS);

              return (
                <BlockRow
                  key={course.slug}
                  index={i}
                  isLast={i === blocks.length - 1}
                  title={course.title}
                  seoTagline={SEO_TAGLINE_BY_SLUG[course.slug] ?? ""}
                  area={course.area}
                  objective={course.objective}
                  curriculum={course.curriculum}
                  duration={course.duration}
                  teacherCount={teachers.length}
                  teachersPreview={previewTeachers}
                  slug={course.slug}
                  isDark={isDark}
                  colors={{ th, tb, ts, numFaint, lineColor }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Single block row ─────────────────────────────────────────────────────────

interface BlockRowProps {
  index: number;
  isLast: boolean;
  title: string;
  seoTagline: string;
  area: string;
  objective: string;
  curriculum: string[];
  duration: string;
  teacherCount: number;
  teachersPreview: Teacher[];
  slug: string;
  isDark: boolean;
  colors: {
    th: string;
    tb: string;
    ts: string;
    numFaint: string;
    lineColor: string;
  };
}

function BlockRow({
  index,
  isLast,
  title,
  seoTagline,
  area,
  objective,
  curriculum,
  duration,
  teacherCount,
  teachersPreview,
  slug,
  isDark,
  colors,
}: BlockRowProps) {
  const { th, tb, ts, numFaint, lineColor } = colors;
  const num = String(index + 1).padStart(2, "0");

  return (
    <article
      data-block-row
      className="relative grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-12 lg:gap-16 lg:pl-10 py-20 md:py-28"
      style={{
        borderBottom: isLast ? "none" : `1px solid ${lineColor}`,
      }}
    >
      {/* ─── LEFT: identity (sticky on desktop) ───────────────── */}
      <div className="lg:sticky lg:top-28 lg:self-start lg:h-fit">
        {/* Massive numeral — minimal, no eyebrow */}
        <div data-block-num className="relative inline-block leading-none">
          <span
            className="block font-black leading-[0.85] tabular-nums tracking-[-0.05em] select-none"
            style={{
              fontSize: "clamp(7rem, 18vw, 16rem)",
              color: numFaint,
            }}
          >
            {num}
          </span>
        </div>

        <div className="mt-2 lg:mt-4">
          <div
            data-title-anchor
            className="overflow-hidden"
            style={{ perspective: 800 }}
          >
            <h3
              className="font-black tracking-[-0.025em] leading-[0.95]"
              style={{
                fontSize: "clamp(2.6rem, 5.5vw, 4.4rem)",
                color: th,
              }}
            >
              {Array.from(title).map((ch, ci) => (
                <span
                  key={ci}
                  data-title-char
                  className="inline-block"
                  style={{
                    transformStyle: "preserve-3d",
                  }}
                >
                  {ch === " " ? " " : ch}
                </span>
              ))}
            </h3>
          </div>
          <p
            data-block-meta
            className="mt-3 text-[0.78rem] font-black tracking-[0.28em] uppercase"
            style={{ color: "#F09226" }}
          >
            {area}
          </p>
        </div>

        {/* SEO-rich tagline — keyword-dense, search-friendly */}
        {seoTagline && (
          <p
            data-block-meta
            className="mt-6 text-[1.05rem] md:text-[1.1rem] font-black leading-[1.35] tracking-[-0.01em] max-w-[42ch]"
            style={{ color: th }}
          >
            {seoTagline}
          </p>
        )}

        <p
          data-block-meta
          className="mt-4 text-[0.95rem] leading-[1.65] max-w-[44ch]"
          style={{ color: tb }}
        >
          {objective}
        </p>

        {/* Inline meta line — minimal, no boxes */}
        <div
          data-block-meta
          className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-[0.7rem] font-bold tracking-[0.18em] uppercase"
          style={{ color: tb }}
        >
          <span className="inline-flex items-center gap-2">
            <span
              className="font-black tabular-nums text-[0.95rem]"
              style={{ color: th }}
            >
              {curriculum.length}
            </span>
            <span style={{ color: ts }}>argomenti</span>
          </span>
          <span className="inline-flex items-center gap-2">
            <span
              className="font-black tabular-nums text-[0.95rem]"
              style={{ color: th }}
            >
              {teacherCount}
            </span>
            <span style={{ color: ts }}>docenti</span>
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="font-black text-[0.95rem]" style={{ color: th }}>
              {duration.replace(/^(\d+)/, "$1")}
            </span>
          </span>
        </div>

        <Link
          data-block-cta
          href={`/percorso/${slug}`}
          className="group mt-9 inline-flex items-center gap-3 px-6 py-3.5 transition-opacity duration-200 hover:opacity-85"
          style={{ background: "#F09226", color: "#111111" }}
        >
          <span className="text-[0.78rem] font-black tracking-[0.16em] uppercase">
            Approfondisci il blocco
          </span>
          <span className="text-[0.85rem] font-black transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </Link>
      </div>

      {/* ─── RIGHT: curriculum + teachers ─────────────────────── */}
      <div className="flex flex-col gap-12">
        {/* Curriculum — typographic list, no bento */}
        <div>
          <div
            data-block-meta
            className="flex items-baseline justify-between mb-6 pb-3"
            style={{ borderBottom: `1px solid ${lineColor}` }}
          >
            <span className="label-tag">Programma</span>
            <span
              className="text-[0.62rem] font-bold tracking-[0.18em] uppercase tabular-nums"
              style={{ color: ts }}
            >
              {curriculum.length} voci
            </span>
          </div>

          <ol className="flex flex-col">
            {curriculum.map((item, ci) => (
              <li
                key={item}
                data-curriculum-item
                className="group/item grid grid-cols-[auto_1fr] gap-5 md:gap-7 py-3.5 md:py-4 transition-colors duration-300"
                style={{
                  borderBottom: `1px solid ${lineColor}`,
                }}
              >
                <span
                  className="shrink-0 mt-0.5 text-[0.58rem] font-black tabular-nums tracking-[0.2em]"
                  style={{ color: "rgba(240,146,38,0.6)" }}
                >
                  {String(ci + 1).padStart(2, "0")}
                </span>
                <p
                  className="text-[0.95rem] md:text-[1rem] leading-[1.5] font-medium transition-colors duration-300"
                  style={{ color: th }}
                >
                  {item}
                </p>
              </li>
            ))}
          </ol>
        </div>

        {/* Teachers preview — minimal portraits row */}
        <div>
          <div
            data-block-meta
            className="flex items-baseline justify-between mb-5 pb-3"
            style={{ borderBottom: `1px solid ${lineColor}` }}
          >
            <span className="label-tag">Docenti</span>
            <Link
              href={`/percorso/${slug}`}
              className="text-[0.62rem] font-bold tracking-[0.18em] uppercase transition-opacity hover:opacity-70"
              style={{ color: "#F09226" }}
            >
              Vedi tutti i {teacherCount} →
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {teachersPreview.map((t) => (
              <Link
                key={t.slug}
                data-teacher-tile
                href={`/percorso/${slug}`}
                className="block group/teacher"
              >
                <div className="relative overflow-hidden">
                  <TeacherPortrait
                    teacher={t}
                    sizes="(max-width: 640px) 30vw, (max-width: 1024px) 22vw, 14vw"
                    fallbackTheme={isDark ? "dark" : "light"}
                  />
                  <div
                    className="absolute inset-x-0 bottom-0 px-2.5 py-2 transition-opacity duration-300 group-hover/teacher:opacity-100 opacity-95"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.92) 100%)",
                    }}
                  >
                    <p className="text-[0.7rem] md:text-[0.78rem] font-black leading-tight tracking-tight text-white truncate">
                      {t.name}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
