"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTheme } from "@/components/providers/theme-provider";
import type { Course } from "@/lib/constants/courses";
import { FIPE_SESSIONS } from "@/lib/constants/courses";
import { getTeachersByCourse } from "@/lib/constants/teachers";
import { TeacherPortrait } from "@/components/shared/teacher-portrait";
import { CertificationsCards } from "@/components/shared/certifications-cards";
import { PackPreview } from "@/components/home/pack-preview";

const FIPE_DESC: Record<string, string> = {
  function:
    "Verifica delle competenze acquisite sul movimento funzionale. Prima sessione di certificazione del percorso.",
  strength:
    "Sessione intermedia. Verifica avanzata su strength & conditioning, programmazione e tecnica.",
  science:
    "Sessione conclusiva. Integrazione completa del profilo professionale e certificazione finale FIPE × Lacertosus per i pack PRO ed ELITE.",
};

interface Props {
  course: Course;
  prevCourse: Course | null;
  nextCourse: Course | null;
}

export function PercorsoBlockDetail({ course, prevCourse, nextCourse }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      // ── Hero entrance ──────────────────────────────────────────────
      const heroEls =
        heroRef.current?.querySelectorAll<HTMLElement>("[data-hero-item]");
      if (heroEls?.length) {
        gsap.set(heroEls, { opacity: 0, y: 30 });
        gsap.to(heroEls, {
          opacity: 1,
          y: 0,
          stagger: 0.08,
          duration: 0.8,
          ease: "power3.out",
          delay: 0.15,
        });
      }

      // ── Section staggers ──────────────────────────────────────────
      gsap.utils.toArray<HTMLElement>("[data-bd-section]").forEach((row) => {
        const items = row.querySelectorAll<HTMLElement>("[data-bd-item]");
        if (!items.length) return;
        gsap.set(items, { opacity: 0, y: 24 });
        ScrollTrigger.create({
          trigger: row,
          start: "top 85%",
          once: true,
          onEnter: () => {
            gsap.to(items, {
              opacity: 1,
              y: 0,
              stagger: 0.07,
              duration: 0.7,
              ease: "power3.out",
            });
          },
        });
      });

      const refresh = () => ScrollTrigger.refresh();
      requestAnimationFrame(refresh);
      window.addEventListener("load", refresh);

      return () => {
        window.removeEventListener("load", refresh);
      };
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const teachers = getTeachersByCourse(course.slug);
  const fipe = FIPE_SESSIONS.find((f) => f.afterBlock === course.title);

  // Light theme tokens (used after the dark hero)
  const lTh = isDark ? "#f5f5fa" : "#0a0a1a";
  const lTb = isDark ? "rgba(180,180,200,0.65)" : "#555";
  const lTs = isDark ? "rgba(120,120,140,0.5)" : "#888";
  const lLine = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

  return (
    <div ref={containerRef}>
      {/* ══════════════════════════════════════════════════════════════ */}
      {/*  HERO — DARK, MINIMAL, CINEMATIC                                  */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(165deg, #1a1a1a 0%, #0a0a0a 60%, #1a1a1a 100%)",
        }}
      >
        {/* Orange grid with radial-gradient mask (mirrors home hero StaticGrid) */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ transformOrigin: "center center" }}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(240,146,38,0.25) 1px, transparent 1px)," +
                "linear-gradient(90deg, rgba(240,146,38,0.25) 1px, transparent 1px)",
              backgroundSize: "88px 88px",
              maskImage:
                "radial-gradient(ellipse 60% 58% at 50% 50%, transparent 0%, transparent 55%, rgba(0,0,0,0.4) 72%, black 88%, black 100%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 60% 58% at 50% 50%, transparent 0%, transparent 55%, rgba(0,0,0,0.4) 72%, black 88%, black 100%)",
            }}
          />
        </div>
        {/* Soft orange wash on top of the grid for warmth */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 70% 35%, rgba(240,146,38,0.08) 0%, transparent 55%), radial-gradient(ellipse at 15% 80%, rgba(240,146,38,0.04) 0%, transparent 50%)",
          }}
        />

        <div className="relative z-10 mx-auto max-w-[1440px] px-[5%] md:px-10 pt-32 md:pt-40 pb-24 md:pb-32">
          {/* Breadcrumb */}
          <div data-hero-item className="mb-12">
            <Link
              href="/percorso"
              className="inline-flex items-center gap-2 text-[0.66rem] font-bold tracking-[0.22em] uppercase transition-opacity hover:opacity-70"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              <span>←</span>
              <span>Il Percorso</span>
              <span style={{ color: "rgba(255,255,255,0.3)" }}>/</span>
              <span style={{ color: "#F09226" }}>{course.title}</span>
            </Link>
          </div>

          <div className="max-w-4xl">
            <h1
              data-hero-item
              className="font-black tracking-[-0.025em] leading-[0.92]"
              style={{
                fontSize: "clamp(3.5rem, 10vw, 9rem)",
                color: "#ffffff",
              }}
            >
              {course.title}
            </h1>
            <p
              data-hero-item
              className="mt-4 text-[0.85rem] md:text-[0.95rem] font-black tracking-[0.32em] uppercase"
              style={{ color: "#F09226" }}
            >
              {course.area}
            </p>
            <p
              data-hero-item
              className="mt-7 max-w-2xl text-[1.05rem] md:text-[1.18rem] leading-[1.6]"
              style={{ color: "rgba(220,220,235,0.78)" }}
            >
              {course.objective}
            </p>

            {/* Inline meta — minimal, no boxes, no precise dates */}
            <div
              data-hero-item
              className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-3 text-[0.7rem] font-bold tracking-[0.2em] uppercase"
              style={{ color: "rgba(220,220,235,0.6)" }}
            >
              <span className="inline-flex items-baseline gap-2">
                <span
                  className="font-black tabular-nums text-[1.05rem] tracking-tight"
                  style={{ color: "#ffffff" }}
                >
                  {course.curriculum.length}
                </span>
                <span>argomenti</span>
              </span>
              <span
                className="h-3 w-px"
                style={{ background: "rgba(255,255,255,0.18)" }}
              />
              <span className="inline-flex items-baseline gap-2">
                <span
                  className="font-black tabular-nums text-[1.05rem] tracking-tight"
                  style={{ color: "#ffffff" }}
                >
                  {teachers.length}
                </span>
                <span>docenti</span>
              </span>
              <span
                className="h-3 w-px"
                style={{ background: "rgba(255,255,255,0.18)" }}
              />
              <span className="inline-flex items-baseline gap-2">
                <span
                  className="font-black text-[1.05rem] tracking-tight"
                  style={{ color: "#ffffff" }}
                >
                  {course.duration}
                </span>
                <span>in presenza</span>
              </span>
            </div>
          </div>
        </div>

        {/* Bottom edge fade-out */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.3) 100%)",
          }}
        />
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/*  CURRICULUM ESTESO — light/themed, minimal typography             */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section data-bd-section className="themed-section relative">
        <div className="absolute inset-0 section-bg" />
        <div className="relative z-10 mx-auto max-w-[1440px] px-[5%] md:px-10 py-24 md:py-32">
          <div className="mb-16 max-w-3xl">
            <span data-bd-item className="label-tag mb-4 block">
              Programma Formativo {course.title}
            </span>
            <h2
              data-bd-item
              className="font-black tracking-[-0.025em] leading-[0.95]"
              style={{
                fontSize: "clamp(2.4rem, 5vw, 4rem)",
                color: lTh,
              }}
            >
              Il programma <span className="gradient-text">{course.title}</span>{" "}
              in {course.curriculum.length} argomenti.
            </h2>
            <p
              data-bd-item
              className="mt-5 text-[0.95rem] leading-relaxed max-w-xl"
              style={{ color: lTb }}
            >
              {course.curriculum.length} moduli formativi distribuiti su{" "}
              {course.duration}. Ogni argomento è affrontato con teoria, pratica
              sul campo e applicazione professionale diretta.
            </p>
          </div>

          <ol className="flex flex-col">
            {course.curriculum.map((item, i) => {
              const desc = course.curriculumDescs?.[i];
              return (
                <li
                  key={item}
                  data-bd-item
                  className="grid grid-cols-[auto_1fr] gap-6 md:gap-10 py-7 md:py-9"
                  style={{
                    borderTop: `1px solid ${lLine}`,
                    borderBottom:
                      i === course.curriculum.length - 1
                        ? `1px solid ${lLine}`
                        : "none",
                  }}
                >
                  <span
                    className="shrink-0 mt-1 text-[0.62rem] font-black tabular-nums tracking-[0.22em]"
                    style={{ color: "rgba(240,146,38,0.65)" }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <p
                      className="text-[1.1rem] md:text-[1.3rem] font-black leading-snug tracking-tight"
                      style={{ color: lTh }}
                    >
                      {item}
                    </p>
                    {desc && (
                      <p
                        className="mt-3 text-[0.92rem] leading-[1.65] max-w-[68ch]"
                        style={{ color: lTb }}
                      >
                        {desc}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/*  DOCENTI — minimal grid                                           */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section id="docenti" data-bd-section className="themed-section relative">
        <div className="absolute inset-0 section-bg-alt" />
        <div className="relative z-10 mx-auto max-w-[1440px] px-[5%] md:px-10 py-24 md:py-32">
          <div className="mb-14 max-w-3xl">
            <span data-bd-item className="label-tag mb-4 block">
              Docenti {course.title}
            </span>
            <h2
              data-bd-item
              className="font-black tracking-[-0.025em] leading-[0.95]"
              style={{
                fontSize: "clamp(2.4rem, 5vw, 4rem)",
                color: lTh,
              }}
            >
              {teachers.length} docenti per{" "}
              <span className="gradient-text">{course.title}</span>.
            </h2>
            <p
              data-bd-item
              className="mt-5 max-w-xl text-[0.95rem] leading-relaxed"
              style={{ color: lTb }}
            >
              Ricercatori universitari, professionisti e operatori sul campo.
              Ogni docente del blocco {course.title} porta competenza
              specialistica e applicazione pratica diretta sui propri argomenti.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {teachers.map((t) => (
              <article
                key={t.slug}
                data-bd-item
                className="flex flex-col overflow-hidden"
                style={{
                  border: `1px solid ${lLine}`,
                }}
              >
                <TeacherPortrait
                  teacher={t}
                  sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
                  fallbackTheme={isDark ? "dark" : "light"}
                />
                <div className="px-4 py-4 flex flex-col gap-2">
                  <p
                    className="text-[0.95rem] font-black leading-tight tracking-tight"
                    style={{ color: lTh }}
                  >
                    {t.name}
                  </p>
                  <p
                    className="text-[0.62rem] font-bold uppercase tracking-[0.16em] leading-snug"
                    style={{ color: "#F09226" }}
                  >
                    {t.role}
                  </p>
                  {t.talkTitle && (
                    <p
                      className="mt-1.5 text-[0.76rem] leading-snug border-l-2 pl-3"
                      style={{
                        color: lTb,
                        borderLeftColor: "rgba(240,146,38,0.55)",
                      }}
                    >
                      <span
                        className="block text-[0.5rem] font-black tracking-[0.24em] uppercase mb-0.5"
                        style={{ color: "#F09226" }}
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
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/*  CERTIFICAZIONI + FIPE — combined band                            */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {fipe && (
        <section
          data-bd-section
          className="themed-section relative overflow-hidden"
        >
          <div className="absolute inset-0 section-bg" />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: isDark
                ? "radial-gradient(ellipse at 50% 30%, rgba(240,146,38,0.10) 0%, transparent 55%)"
                : "radial-gradient(ellipse at 50% 30%, rgba(212,98,42,0.08) 0%, transparent 55%)",
            }}
          />
          <div className="relative z-10 mx-auto max-w-[1440px] px-[5%] md:px-10 py-24 md:py-32">
            <div className="mb-14 max-w-3xl">
              <span data-bd-item className="label-tag mb-4 block">
                Le Certificazioni del Percorso
              </span>
              <h2
                data-bd-item
                className="font-black tracking-[-0.025em] leading-[0.95]"
                style={{
                  fontSize: "clamp(2.6rem, 5.5vw, 4.4rem)",
                  color: lTh,
                }}
              >
                Due titoli <span className="gradient-text">riconosciuti</span>.
                <br />
                Una carriera reale.
              </h2>
              <p
                data-bd-item
                className="mt-6 text-[0.95rem] leading-[1.7] max-w-2xl"
                style={{ color: lTb }}
              >
                Al termine del percorso ricevi la certificazione{" "}
                <span className="font-bold" style={{ color: "#F09226" }}>
                  Functional Strength Master Coach
                </span>
                . Con i pack PRO ed ELITE ottieni anche la certificazione FIPE
                ufficiale, riconosciuta a livello nazionale e internazionale.
              </p>
            </div>

            {/* Certifications — rich shared component */}
            <div data-bd-item className="mb-12">
              <CertificationsCards isDark={isDark} />
            </div>

            {/* FIPE session info — secondary */}
            <div
              data-bd-item
              className="p-6 md:p-8"
              style={{
                background: isDark
                  ? "rgba(255,255,255,0.02)"
                  : "rgba(0,0,0,0.02)",
                border: `1px solid ${lLine}`,
              }}
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                <div className="flex-1">
                  <p
                    className="text-[0.6rem] font-black tracking-[0.3em] uppercase mb-2"
                    style={{ color: lTs }}
                  >
                    Sessione di certificazione del blocco
                  </p>
                  <p
                    className="text-[1.1rem] md:text-[1.3rem] font-black tracking-tight"
                    style={{ color: lTh }}
                  >
                    {fipe.title.replace("Sessione ", "Sessione ")} · dopo{" "}
                    {course.title}
                  </p>
                </div>
                <p
                  className="text-[0.85rem] leading-relaxed max-w-lg"
                  style={{ color: lTb }}
                >
                  {FIPE_DESC[course.slug]}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/*  PACK — riuso PackPreview da home (con modale)                   */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <PackPreview />

      {/* ══════════════════════════════════════════════════════════════ */}
      {/*  PREV / NEXT NAV                                                  */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section
        data-bd-section
        className="themed-section relative"
        style={{ borderTop: `1px solid ${lLine}` }}
      >
        <div className="absolute inset-0 section-bg-alt" />
        <div className="relative z-10 mx-auto max-w-[1440px] px-[5%] md:px-10 py-12 md:py-16">
          <div
            className="grid grid-cols-2 gap-px"
            style={{ background: lLine }}
          >
            {prevCourse ? (
              <Link
                href={`/percorso/${prevCourse.slug}`}
                data-bd-item
                className="group flex flex-col gap-2 p-6 md:p-8 transition-opacity hover:opacity-80"
                style={{
                  background: isDark
                    ? "rgba(6,6,16,0.92)"
                    : "rgba(250,250,252,0.96)",
                }}
              >
                <span
                  className="text-[0.6rem] font-black tracking-[0.28em] uppercase"
                  style={{ color: lTs }}
                >
                  ← Precedente
                </span>
                <span
                  className="text-[1.4rem] font-black tracking-tight"
                  style={{ color: lTh }}
                >
                  {prevCourse.title}
                </span>
                <span
                  className="text-[0.7rem] font-bold tracking-[0.18em] uppercase"
                  style={{ color: "#F09226" }}
                >
                  {prevCourse.area}
                </span>
              </Link>
            ) : (
              <div
                data-bd-item
                className="p-6 md:p-8"
                style={{
                  background: isDark
                    ? "rgba(6,6,16,0.92)"
                    : "rgba(250,250,252,0.96)",
                }}
              />
            )}

            {nextCourse ? (
              <Link
                href={`/percorso/${nextCourse.slug}`}
                data-bd-item
                className="group flex flex-col items-end text-right gap-2 p-6 md:p-8 transition-opacity hover:opacity-80"
                style={{
                  background: isDark
                    ? "rgba(6,6,16,0.92)"
                    : "rgba(250,250,252,0.96)",
                }}
              >
                <span
                  className="text-[0.6rem] font-black tracking-[0.28em] uppercase"
                  style={{ color: lTs }}
                >
                  Successivo →
                </span>
                <span
                  className="text-[1.4rem] font-black tracking-tight"
                  style={{ color: lTh }}
                >
                  {nextCourse.title}
                </span>
                <span
                  className="text-[0.7rem] font-bold tracking-[0.18em] uppercase"
                  style={{ color: "#F09226" }}
                >
                  {nextCourse.area}
                </span>
              </Link>
            ) : (
              <div
                data-bd-item
                className="p-6 md:p-8"
                style={{
                  background: isDark
                    ? "rgba(6,6,16,0.92)"
                    : "rgba(250,250,252,0.96)",
                }}
              />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
