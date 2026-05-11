"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useInView } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/providers/theme-provider";
import {
  getBundles,
  getPublicMasterclassProducts,
  type AcademyProduct,
} from "@/lib/constants/packs";
import { getTeachersByCourse, type Teacher } from "@/lib/constants/teachers";
import { TeacherPortrait } from "@/components/shared/teacher-portrait";
import { CertificationsCards } from "@/components/shared/certifications-cards";
import { getWorkshopBySlug } from "@/lib/constants/workshops";
import { COURSES } from "@/lib/constants/courses";
import { formatPrice } from "@/lib/utils";
import { usePromoForSlug } from "@/lib/promos/client";
import { computePromoPricing, type PromoRow } from "@/lib/promos/types";
import { createClient } from "@/lib/supabase/client";
import { MasterclassSelector } from "./masterclass-selector";
import { BlockModal, type BlockSlug } from "@/components/shared/block-modal";
import { ProgramAccordion } from "./program-accordion";
import dynamic from "next/dynamic";

const HeroScene = dynamic(
  () => import("./hero-scene").then((m) => m.HeroScene),
  { ssr: false },
);

// ─── Constants ────────────────────────────────────────────────────────────────

const BRUSHED_STEEL_OVERLAY =
  "repeating-linear-gradient(90deg, transparent 0px, transparent 1px, rgba(255,255,255,0.035) 1px, rgba(255,255,255,0.035) 2px)";

const TIER: Record<
  string,
  {
    label: string;
  }
> = {
  start: { label: "START" },
  pro: { label: "PRO" },
  elite: { label: "ELITE" },
};

// Listini bundle (IVA inclusa). Allineati a packs.ts e Stripe.
const PACK_PRICE_DISPLAY: Record<string, string> = {
  start: "€ 3.300",
  pro: "€ 4.700",
  elite: "€ 7.000",
};

const PACK_PRICE_CENTS: Record<string, number> = {
  start: 330000,
  pro: 470000,
  elite: 700000,
};

function formatEuroClean(cents: number): string {
  return `€ ${new Intl.NumberFormat("it-IT").format(Math.round(cents / 100))}`;
}

/** Restituisce il prezzo "display" tenendo conto di un'eventuale promo attiva.
 *  Passa `promo` da useActivePromos(). Se null, mostra prezzo originale. */
function getPackPriceDisplay(
  slug: string,
  promo: PromoRow | null,
): {
  discounted: string;
  original?: string;
  hasDiscount: boolean;
  promoName?: string;
} {
  const original = PACK_PRICE_CENTS[slug] ?? 0;
  if (!promo || original <= 0) {
    return {
      discounted: PACK_PRICE_DISPLAY[slug] ?? formatEuroClean(original),
      hasDiscount: false,
    };
  }
  const pricing = computePromoPricing(promo, original);
  if (pricing.discount <= 0) {
    return {
      discounted: PACK_PRICE_DISPLAY[slug] ?? formatEuroClean(original),
      hasDiscount: false,
    };
  }
  return {
    discounted: formatEuroClean(pricing.final),
    original: formatEuroClean(pricing.original),
    hasDiscount: true,
    promoName: promo.name,
  };
}

const BLOCK_SLUGS = ["function", "strength", "science"] as const;
const BLOCK_LABELS: Record<string, string> = {
  function: "FUNCTION",
  strength: "STRENGTH",
  science: "SCIENCE",
};

/* Scarcity — singolo source of truth, mostrato nella section header */
const SEATS_TOTAL = 30;

function getBundleTeachers(): Record<string, Teacher[]> {
  return {
    function: getTeachersByCourse("function"),
    strength: getTeachersByCourse("strength"),
    science: getTeachersByCourse("science"),
  };
}

// ─── Hero Section ─────────────────────────────────────────────────────────────

function HeroSection({
  isDark,
  onOpenBlock,
}: {
  isDark: boolean;
  onOpenBlock: (slug: BlockSlug) => void;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const sceneWrapRef = useRef<HTMLDivElement>(null);

  const th = isDark ? "#f5f5fa" : "#0a0a1a";
  const tb = isDark ? "rgba(180,180,200,0.65)" : "#555555";
  const ts = isDark ? "rgba(120,120,140,0.5)" : "#888888";
  const borderSubtle = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Entrance animation — use fromTo to avoid stale state
    const entranceTl = gsap.timeline({ delay: 0.1 });
    const textChildren = sectionRef.current?.querySelectorAll(
      ".js-pack-hero-text > *",
    );
    if (textChildren) {
      entranceTl.fromTo(
        Array.from(textChildren),
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, stagger: 0.1, duration: 0.75, ease: "power3.out" },
      );
    }

    const scrollParent = sectionRef.current?.closest("[data-hero-scroll]");
    if (!scrollParent) return;

    const isMobile = window.innerWidth < 1024;
    const triggers: ScrollTrigger[] = [];

    if (isMobile) {
      // Single ScrollTrigger for all mobile text animations
      const statEls = statsRef.current?.children
        ? (Array.from(statsRef.current.children) as HTMLElement[])
        : [];

      const trigger = ScrollTrigger.create({
        trigger: scrollParent,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.5,
        onUpdate: (self) => {
          const p = self.progress; // 0→1 over full 280vh scroll

          // 0→0.06: stats disappear one by one (reverse)
          const reversed = [...statEls].reverse();
          reversed.forEach((el, i) => {
            const start = i * 0.015;
            const end = start + 0.015;
            const sp = gsap.utils.clamp(0, 1, (p - start) / (end - start));
            el.style.opacity = String(1 - sp);
            el.style.transform = `scale(${1 - sp * 0.3})`;
          });

          // 0.06→0.12: description fades
          if (detailsRef.current) {
            const dp = gsap.utils.clamp(0, 1, (p - 0.06) / 0.06);
            detailsRef.current.style.opacity = String(1 - dp);
            detailsRef.current.style.transform = `translateY(${-dp * 30}px)`;
          }

          // 0.1→0.22: scene slides up
          if (sceneWrapRef.current) {
            const sp2 = gsap.utils.clamp(0, 1, (p - 0.1) / 0.12);
            sceneWrapRef.current.style.transform = `translateY(${-sp2 * 180}px)`;
          }
        },
      });
      triggers.push(trigger);
    } else {
      // Desktop: details + stats fade
      const trigger = ScrollTrigger.create({
        trigger: scrollParent,
        start: "top top",
        end: "25% top",
        scrub: 0.6,
        onUpdate: (self) => {
          const p = self.progress;
          if (detailsRef.current) {
            detailsRef.current.style.opacity = String(1 - p);
            detailsRef.current.style.transform = `translateY(${-p * 20}px)`;
          }
          if (statsRef.current) {
            statsRef.current.style.opacity = String(1 - p);
            statsRef.current.style.transform = `translateY(${-p * 10}px)`;
          }
        },
      });
      triggers.push(trigger);
    }

    return () => {
      entranceTl.kill();
      triggers.forEach((t) => t.kill());
    };
  }, []);

  return (
    <div data-hero-scroll className="relative h-[180vh] lg:h-[280vh]">
      <section
        ref={sectionRef}
        className="themed-section relative overflow-hidden"
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Background */}
        <div className="absolute inset-0 section-bg" />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: isDark
              ? "radial-gradient(ellipse at 68% 48%, rgba(240,146,38,0.045) 0%, transparent 52%)"
              : "radial-gradient(ellipse at 68% 42%, rgba(212,98,42,0.05) 0%, transparent 50%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.022]"
          style={{
            backgroundImage: `linear-gradient(to right, ${isDark ? "#fff" : "#000"} 1px, transparent 1px), linear-gradient(to bottom, ${isDark ? "#fff" : "#000"} 1px, transparent 1px)`,
            backgroundSize: "80px 80px",
          }}
        />

        {/* Content */}
        <div className="relative z-10 w-full mx-auto max-w-[1440px] px-[5%] md:px-10 pt-24 md:pt-28">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-14">
            {/* Left — text */}
            <div className="js-pack-hero-text flex flex-col lg:w-[52%]">
              <span className="label-tag mb-5 block">Pack &amp; Prezzi</span>
              <h1
                className="font-black tracking-[-0.025em] leading-[0.93] text-[clamp(2.6rem,5.2vw,4.8rem)]"
                style={{ color: th }}
              >
                Investi nella tua
                <br />
                <span className="gradient-text">eccellenza.</span>
              </h1>

              {/* Description — hidden on mobile scroll */}
              <div ref={detailsRef}>
                <p
                  className="mt-6 max-w-[440px] text-[0.95rem] leading-relaxed"
                  style={{ color: tb }}
                >
                  Tre blocchi progressivi. Certificazione FIPE.{" "}
                  <span
                    className="font-semibold"
                    style={{ color: isDark ? "rgba(220,220,235,0.9)" : "#222" }}
                  >
                    9 mesi per costruire il professionista completo del fitness.
                  </span>
                </p>
              </div>

              {/* Stats — hidden one by one on mobile scroll */}
              <div ref={statsRef} className="mt-6 flex flex-wrap gap-3">
                {[
                  { val: "9", unit: "mesi" },
                  { val: "100%", unit: "in presenza" },
                  { val: "33+", unit: "docenti" },
                  { val: "3", unit: "certificazioni" },
                ].map((s) => (
                  <div
                    key={s.unit}
                    className="flex flex-col items-center px-4 py-2.5"
                    style={{
                      border: `1px solid ${borderSubtle}`,
                      background: isDark
                        ? "rgba(255,255,255,0.03)"
                        : "rgba(0,0,0,0.02)",
                      minWidth: "68px",
                    }}
                  >
                    <span
                      className="text-xl font-black leading-none"
                      style={{ color: "#F09226" }}
                    >
                      {s.val}
                    </span>
                    <span
                      className="mt-1 text-[0.62rem] font-bold tracking-[0.18em] uppercase"
                      style={{ color: ts }}
                    >
                      {s.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — scroll-driven animation */}
            <div
              ref={sceneWrapRef}
              className="lg:w-[48%]"
              style={{ minHeight: "clamp(280px, 40vw, 420px)" }}
            >
              <HeroScene
                isDark={isDark}
                onClickBlock={(slug) => {
                  if (slug !== "fipe") onOpenBlock(slug as BlockSlug);
                }}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── Journey Section ──────────────────────────────────────────────────────────

function JourneySection({
  isDark,
  onOpenBlock,
}: {
  isDark: boolean;
  onOpenBlock: (slug: BlockSlug) => void;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  const th = isDark ? "#f5f5fa" : "#0a0a1a";
  const tb = isDark ? "rgba(180,180,200,0.62)" : "#555555";
  const ts = isDark ? "rgba(120,120,140,0.5)" : "#888888";
  const borderSubtle = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const numFaint = isDark ? "rgba(240,146,38,0.18)" : "rgba(240,146,38,0.32)";

  type BlockEntry = {
    num: string;
    label: string;
    area: string;
    objective: string;
    slug: BlockSlug;
    period: string;
    topics: number;
    teachers: number;
    weekends: string;
  };

  const COURSE_BY_SLUG: Record<BlockSlug, (typeof COURSES)[number]> = {
    function: COURSES.find((c) => c.slug === "function")!,
    strength: COURSES.find((c) => c.slug === "strength")!,
    science: COURSES.find((c) => c.slug === "science")!,
  };

  const BLOCKS: BlockEntry[] = [
    {
      num: "01",
      label: "FUNCTION",
      area: "Functional Training",
      objective:
        "Fondamenti anatomici, biomeccanici e metodologici del movimento funzionale.",
      slug: "function",
      period: "Set → Ott 2026",
      topics: COURSE_BY_SLUG.function.curriculum.length,
      teachers: getTeachersByCourse("function").length,
      weekends: COURSE_BY_SLUG.function.duration,
    },
    {
      num: "02",
      label: "STRENGTH",
      area: "Strength & Conditioning",
      objective:
        "Sviluppo di forza, potenza e condizionamento per l'atleta completo.",
      slug: "strength",
      period: "Dic 2026 → Gen 2027",
      topics: COURSE_BY_SLUG.strength.curriculum.length,
      teachers: getTeachersByCourse("strength").length,
      weekends: COURSE_BY_SLUG.strength.duration,
    },
    {
      num: "03",
      label: "SCIENCE",
      area: "Business & Performance",
      objective:
        "Integrazione professionale, performance e business del fitness.",
      slug: "science",
      period: "Mar → Apr 2027",
      topics: COURSE_BY_SLUG.science.curriculum.length,
      teachers: getTeachersByCourse("science").length,
      weekends: COURSE_BY_SLUG.science.duration,
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="themed-section relative overflow-hidden py-24 md:py-32"
    >
      <div className="absolute inset-0 section-bg-alt" />
      {/* Subtle radial wash, mirroring home hero */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: isDark
            ? "radial-gradient(ellipse at 50% 30%, rgba(240,146,38,0.045) 0%, transparent 55%)"
            : "radial-gradient(ellipse at 50% 30%, rgba(212,98,42,0.05) 0%, transparent 55%)",
        }}
      />
      {/* Background grid like home hero */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.022]"
        style={{
          backgroundImage: `linear-gradient(to right, ${isDark ? "#fff" : "#000"} 1px, transparent 1px), linear-gradient(to bottom, ${isDark ? "#fff" : "#000"} 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-[1440px] px-[5%] md:px-10">
        {/* Header — split white/orange in home-hero style */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-14 md:mb-20"
        >
          <span
            className="text-[0.7rem] font-black tracking-[0.34em] uppercase mb-5 block"
            style={{ color: "#F09226" }}
          >
            — Il Percorso Formativo
          </span>
          <h2
            className="font-black tracking-[-0.03em] leading-[0.95] text-[clamp(2.4rem,5.2vw,4.6rem)]"
            style={{ color: th }}
          >
            Tre blocchi.
            <br />
            Una <span className="gradient-text">progressione</span> precisa.
          </h2>
          <p
            className="mt-6 max-w-2xl text-[clamp(0.95rem,1.1vw,1.05rem)] leading-[1.7]"
            style={{ color: tb }}
          >
            9 mesi suddivisi in 3 blocchi indipendenti ma costruiti per essere
            vissuti in sequenza. Ogni blocco apre il successivo, ogni successivo
            consolida il precedente.
          </p>
        </motion.div>

        {/* Progression rail — desktop horizontal nodes */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="hidden md:flex items-center justify-between mb-12"
        >
          {BLOCKS.map((b, i) => (
            <div
              key={b.slug}
              className="flex items-center flex-1 last:flex-initial"
            >
              <div className="flex flex-col items-center gap-2 shrink-0">
                <div
                  className="w-12 h-12 flex items-center justify-center"
                  style={{
                    background: isDark
                      ? "rgba(240,146,38,0.07)"
                      : "rgba(240,146,38,0.06)",
                    border: "1.5px solid rgba(240,146,38,0.45)",
                  }}
                >
                  <span
                    className="text-[0.85rem] font-black tracking-[0.1em]"
                    style={{ color: "#F09226" }}
                  >
                    {b.num}
                  </span>
                </div>
                <span
                  className="text-[0.6rem] font-black tracking-[0.25em] uppercase"
                  style={{ color: th }}
                >
                  {b.label}
                </span>
              </div>
              {i < BLOCKS.length - 1 && (
                <div
                  className="h-px flex-1 mx-3 mb-6"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(240,146,38,0.45), rgba(240,146,38,0.45))",
                  }}
                />
              )}
              {i === BLOCKS.length - 1 && (
                <>
                  <div
                    className="h-px w-16 lg:w-24 mx-3 mb-6"
                    style={{
                      background:
                        "linear-gradient(90deg, rgba(240,146,38,0.45), rgba(240,146,38,0.75))",
                    }}
                  />
                  <div className="flex flex-col items-center gap-2 shrink-0">
                    <div
                      className="px-4 h-12 flex items-center justify-center"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(240,146,38,0.22) 0%, rgba(240,146,38,0.08) 100%)",
                        border: "2px solid rgba(240,146,38,0.7)",
                        boxShadow: "0 0 24px rgba(240,146,38,0.18)",
                      }}
                    >
                      <span
                        className="text-[0.78rem] font-black tracking-[0.25em]"
                        style={{ color: "#F09226" }}
                      >
                        CERT.
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </motion.div>

        {/* Block panels — full hero-style */}
        <div className="flex flex-col gap-5 md:gap-6">
          {BLOCKS.map((b, i) => (
            <motion.button
              key={b.slug}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.65,
                delay: 0.25 + i * 0.1,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              onClick={() => onOpenBlock(b.slug)}
              className="group relative overflow-hidden text-left transition-transform duration-300 hover:-translate-y-[2px] focus-visible:outline-none"
              style={{
                background: isDark
                  ? "rgba(6,6,16,0.55)"
                  : "rgba(250,250,252,0.6)",
                border: `1px solid ${borderSubtle}`,
                backdropFilter: "blur(2px)",
              }}
            >
              {/* Top accent bar */}
              <div
                className="h-[2px] w-full transition-all duration-500 group-hover:w-full"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(240,146,38,0.85), rgba(240,146,38,0.05))",
                }}
              />

              <div className="relative grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-6 md:gap-10 items-center px-6 py-7 md:px-10 md:py-9">
                {/* Massive numeral — like home hero S2 KPIs */}
                <div className="flex items-baseline gap-3 md:flex-col md:items-start md:gap-1">
                  <span
                    className="font-black leading-[0.85] tabular-nums tracking-[-0.04em]"
                    style={{
                      fontSize: "clamp(3.6rem, 7vw, 6rem)",
                      color: numFaint,
                      textShadow: isDark
                        ? "0 0 40px rgba(240,146,38,0.08)"
                        : "0 0 40px rgba(240,146,38,0.06)",
                    }}
                  >
                    {b.num}
                  </span>
                  <span
                    className="text-[0.6rem] font-black tracking-[0.32em] uppercase mb-1 md:mb-0"
                    style={{ color: ts }}
                  >
                    Blocco
                  </span>
                </div>

                {/* Block title block */}
                <div className="min-w-0">
                  <div
                    className="font-black tracking-[-0.025em] leading-[0.95] text-[clamp(1.9rem,3.6vw,3rem)]"
                    style={{ color: th }}
                  >
                    {b.label}
                  </div>
                  <div
                    className="mt-2 text-[0.72rem] md:text-[0.78rem] font-black tracking-[0.28em] uppercase"
                    style={{ color: "#F09226" }}
                  >
                    {b.area}
                  </div>
                  <p
                    className="mt-4 text-[0.95rem] md:text-[1rem] leading-[1.65] max-w-[58ch]"
                    style={{ color: tb }}
                  >
                    {b.objective}
                  </p>

                  {/* Stats inline */}
                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    {[
                      { v: b.topics, l: "Argomenti" },
                      { v: b.teachers, l: "Docenti" },
                      { v: b.weekends, l: "" },
                      { v: b.period, l: "" },
                    ].map((s, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[0.6rem] md:text-[0.62rem] font-bold tracking-[0.18em] uppercase"
                        style={{
                          border: `1px solid ${borderSubtle}`,
                          background: isDark
                            ? "rgba(255,255,255,0.025)"
                            : "rgba(0,0,0,0.02)",
                          color: tb,
                        }}
                      >
                        <span
                          className="font-black tabular-nums"
                          style={{ color: th }}
                        >
                          {s.v}
                        </span>
                        {s.l && <span style={{ color: ts }}>{s.l}</span>}
                      </span>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div className="hidden md:flex flex-col items-end gap-2 shrink-0">
                  <span
                    className="text-[0.62rem] font-black tracking-[0.32em] uppercase"
                    style={{ color: ts }}
                  >
                    Esplora
                  </span>
                  <div
                    className="w-12 h-12 flex items-center justify-center transition-all duration-300 group-hover:bg-[#F09226]"
                    style={{
                      border: "1.5px solid rgba(240,146,38,0.55)",
                      background: isDark
                        ? "rgba(240,146,38,0.05)"
                        : "rgba(240,146,38,0.04)",
                    }}
                  >
                    <svg
                      viewBox="0 0 16 16"
                      width="14"
                      height="14"
                      fill="#F09226"
                      className="transition-colors duration-300 group-hover:fill-[#111]"
                    >
                      <path d="M5 3l1.4-1.4L13 8l-6.6 6.4L5 13l5-5z" />
                    </svg>
                  </div>
                </div>

                {/* Mobile CTA inline */}
                <div className="flex md:hidden items-center gap-2 pt-1">
                  <span
                    className="text-[0.65rem] font-black tracking-[0.28em] uppercase"
                    style={{ color: "#F09226" }}
                  >
                    Esplora il blocco
                  </span>
                  <span
                    className="text-[0.85rem] font-black"
                    style={{ color: "#F09226" }}
                  >
                    →
                  </span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Bottom strip — same compact info, refined to match new heading scale */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.65 }}
          className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-[1px]"
          style={{ background: borderSubtle }}
        >
          {/* Masterclass */}
          <div
            className="flex items-center gap-3 px-5 py-4"
            style={{
              background: isDark
                ? "rgba(6,6,16,0.92)"
                : "rgba(250,250,252,0.96)",
            }}
          >
            <span
              className="text-[1.7rem] font-black leading-none tabular-nums"
              style={{ color: "#F09226" }}
            >
              8
            </span>
            <div>
              <span
                className="text-[0.6rem] font-black tracking-[0.24em] uppercase block"
                style={{ color: th }}
              >
                Masterclass
              </span>
              <span
                className="text-[0.55rem] font-bold tracking-[0.15em] uppercase"
                style={{ color: ts }}
              >
                2 incluse in PRO &amp; ELITE
              </span>
            </div>
          </div>
          {/* Periodo */}
          <div
            className="flex items-center gap-3 px-5 py-4"
            style={{
              background: isDark
                ? "rgba(6,6,16,0.92)"
                : "rgba(250,250,252,0.96)",
            }}
          >
            <span
              className="text-[1.7rem] font-black leading-none tabular-nums"
              style={{ color: th }}
            >
              9
            </span>
            <div>
              <span
                className="text-[0.6rem] font-black tracking-[0.24em] uppercase block"
                style={{ color: th }}
              >
                Mesi in presenza
              </span>
              <span
                className="text-[0.55rem] font-bold tracking-[0.15em] uppercase"
                style={{ color: ts }}
              >
                Set 2026 → Mag 2027
              </span>
            </div>
          </div>
          {/* Certificazioni */}
          <div
            className="flex items-center gap-3 px-5 py-4"
            style={{
              background: isDark
                ? "rgba(6,6,16,0.92)"
                : "rgba(250,250,252,0.96)",
            }}
          >
            <span
              className="text-[1.7rem] font-black leading-none tabular-nums"
              style={{ color: "#F09226" }}
            >
              2
            </span>
            <div>
              <span
                className="text-[0.6rem] font-black tracking-[0.24em] uppercase block"
                style={{ color: th }}
              >
                Certificazioni
              </span>
              <span
                className="text-[0.55rem] font-bold tracking-[0.15em] uppercase"
                style={{ color: ts }}
              >
                Master Coach + FIPE × Lacertosus
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Pack Modal ───────────────────────────────────────────────────────────────

/* Sales-page narrative copy per tier — luxury / high-ticket positioning */
type ModalCopy = {
  eyebrow: string;
  headline: string;
  promise: string;
  /** Reasons-to-believe used in the trust strip */
  guarantees: { label: string; sub: string }[];
};

const MODAL_COPY: Record<string, ModalCopy> = {
  start: {
    eyebrow: "Edizione 2026/27 — Solo 30 posti",
    headline: "Costruisci le fondamenta di un vero professionista del fitness.",
    promise:
      "9 mesi di formazione in presenza con i migliori docenti italiani. Tre blocchi progressivi, niente extra. Il percorso essenziale che funziona.",
    guarantees: [
      { label: "100% in presenza", sub: "Zero DAD, zero scuse" },
      { label: "33+ docenti", sub: "Tutti professionisti attivi" },
      { label: "Materiale a vita", sub: "Slide, registrazioni, schede" },
    ],
  },
  pro: {
    eyebrow: "Edizione 2026/27 — Solo 30 posti",
    headline:
      "La certificazione FIPE che fa la differenza nel mercato professionale.",
    promise:
      "Tutto il percorso + la certificazione ufficiale Personal Trainer FIPE × Lacertosus (riconosciuta a livello nazionale e internazionale) + 2 Masterclass a scelta tra 9 sessioni esclusive. Il pack scelto da chi punta in alto.",
    guarantees: [
      {
        label: "Personal Trainer FIPE",
        sub: "Riconoscimento nazionale e internazionale",
      },
      { label: "Master Coach", sub: "Certificazione nazionale Lacertosus" },
      { label: "2 Masterclass", sub: "A scelta su 9 sessioni esclusive" },
    ],
  },
  elite: {
    eyebrow: "Edizione 2026/27 — Solo 30 posti",
    headline:
      "L'esperienza più completa. Senza distrazioni operative, da insider.",
    promise:
      "Tutto del pack PRO + vitto e alloggio inclusi per i 6 weekend formativi. Accesso prioritario alla community e agli eventi riservati. Vivi il percorso a 360°.",
    guarantees: [
      { label: "Vitto & Alloggio", sub: "Inclusi per tutti i 6 weekend" },
      {
        label: "Personal Trainer FIPE",
        sub: "Riconoscimento nazionale e internazionale",
      },
      { label: "Accesso prioritario", sub: "Eventi riservati e network" },
    ],
  },
};

function PackModal({
  pack,
  isDark,
  onClose,
  onBuy,
}: {
  pack: AcademyProduct;
  isDark: boolean;
  onClose: () => void;
  onBuy: (pack: AcademyProduct) => void;
}) {
  const tier = TIER[pack.slug] ?? TIER.start;
  const teachers = getBundleTeachers();
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const copy = MODAL_COPY[pack.slug] ?? MODAL_COPY.start;
  const promoForSlug = usePromoForSlug(pack.slug);
  const priceInfo = getPackPriceDisplay(pack.slug, promoForSlug);
  const priceDisplay = priceInfo.discounted;
  const totalTeachers = BLOCK_SLUGS.reduce(
    (acc, s) => acc + teachers[s].length,
    0,
  );

  // ── Mixed theme palette ──────────────────────────────────────
  // ELITE conserva il dark profondo (#0a0a14). START/PRO usano un grigio
  // antracite trasparente per ammorbidire il modale.
  const isProSlug = pack.slug === "pro";
  const isEliteSlug = pack.slug === "elite";

  const modalBg = isEliteSlug ? "#0a0a14" : "rgb(43 43 43 / 94%)";
  const stickyBarBg = isEliteSlug
    ? "rgba(10,10,20,0.92)"
    : "rgb(43 43 43 / 92%)";

  // Dark surface tokens (used on hero, video frame, ELITE section, final CTA)
  const surfaceBorder = isEliteSlug
    ? "rgba(255,255,255,0.08)"
    : "rgba(255,255,255,0.12)";
  const surfaceBorderStrong = "rgba(255,255,255,0.16)";
  const textH = "#ffffff";
  const textB = isEliteSlug
    ? "rgba(220,220,235,0.78)"
    : "rgba(255,255,255,0.82)";
  const textMuted = isEliteSlug
    ? "rgba(180,180,200,0.55)"
    : "rgba(255,255,255,0.6)";

  // Light tokens (used by value stack, guarantees, faculty)
  const lightBg = "#F8F8FA";
  const lightSurface = "#ffffff";
  const lightBorder = "rgba(17,17,17,0.09)";
  const lightTextH = "#111111";
  const lightTextB = "rgba(17,17,17,0.66)";
  const lightTextMuted = "rgba(17,17,17,0.45)";

  const ORANGE = "#F09226";
  const ORANGE_RGB = "240,146,38";

  void isProSlug;

  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(
      overlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.28, ease: "power2.out" },
    );
    tl.fromTo(
      panelRef.current,
      { opacity: 0, y: 32 },
      { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" },
      "-=0.1",
    );
    const timeout = setTimeout(() => {
      setVideoSrc(
        "https://player.vimeo.com/video/1161847546?autoplay=0&title=0&byline=0&portrait=0&dnt=1",
      );
    }, 400);
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(timeout);
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  function close() {
    const tl = gsap.timeline({ onComplete: onClose });
    tl.to(panelRef.current, {
      opacity: 0,
      y: 24,
      duration: 0.28,
      ease: "power2.in",
    });
    tl.to(overlayRef.current, { opacity: 0, duration: 0.18 }, "-=0.1");
  }

  /* Light theming control kept for future variants */
  void isDark;

  /* What's included sections, structured for "value stack" rendering */
  const isPro = isProSlug;
  const isElite = isEliteSlug;

  const valueStackExtras: { label: string; sub: string }[] = [];
  // Sempre incluso (tutti i pack)
  valueStackExtras.push({
    label: "Functional Strength Master Coach",
    sub: "Certificazione nazionale Lacertosus inclusa in tutti i pack",
  });
  if (isPro || isElite) {
    valueStackExtras.push({
      label: "Personal Trainer FIPE × Lacertosus",
      sub: "Certificazione FIPE · Riconoscimento nazionale e internazionale",
    });
    valueStackExtras.push({
      label: "2 Masterclass a scelta su 9",
      sub: "Specialisti di caratura internazionale",
    });
  }
  if (isElite) {
    valueStackExtras.push({
      label: "Accesso prioritario alla community",
      sub: "Eventi riservati e network esclusivo Lacertosus",
    });
  }

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[300] flex items-stretch justify-center"
      style={{
        background: "transparent",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
      onClick={close}
    >
      <div
        ref={panelRef}
        className="relative flex flex-col w-full max-w-[1080px] m-auto rounded-sm overflow-hidden h-dvh max-h-dvh md:h-auto md:max-h-[92vh]"
        style={{
          background: modalBg,
          border: `1px solid ${surfaceBorder}`,
          boxShadow: "0 40px 120px rgba(0,0,0,0.7)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ════ STICKY TOP BAR ════ */}
        <div
          className="shrink-0 flex items-center justify-between px-5 md:px-8 py-3.5 md:py-4 z-30"
          style={{
            background: stickyBarBg,
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderBottom: `1px solid ${surfaceBorder}`,
          }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <span
              className="text-[0.58rem] font-black tracking-[0.32em] uppercase"
              style={{ color: ORANGE }}
            >
              Pack
            </span>
            <span
              className="text-[1.05rem] md:text-[1.2rem] font-black tracking-[-0.01em] truncate"
              style={{ color: textH }}
            >
              {tier.label}
            </span>
          </div>
          <button
            onClick={close}
            className="shrink-0 inline-flex items-center gap-1.5 text-[0.66rem] font-bold tracking-[0.22em] uppercase transition-opacity hover:opacity-65"
            style={{ color: textMuted }}
            aria-label="Chiudi"
          >
            <span className="hidden sm:inline">Chiudi</span>
            <span className="text-lg leading-none">×</span>
          </button>
        </div>

        {/* ════ SCROLLABLE BODY ════ */}
        <div className="overflow-y-auto flex-1">
          {/* ── 1. HERO — eyebrow + headline + promise + price + CTA ── */}
          <section
            className="relative px-6 md:px-10 pt-8 pb-9 md:pt-10 md:pb-12"
            style={{
              background:
                "radial-gradient(ellipse at 50% 0%, rgba(240,146,38,0.07) 0%, transparent 60%)",
            }}
          >
            {/* Eyebrow with scarcity */}
            <div
              className="inline-flex items-center gap-2 px-2.5 py-1 mb-5"
              style={{
                background: "rgba(240,146,38,0.12)",
                border: "1px solid rgba(240,146,38,0.45)",
              }}
            >
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{
                  background: ORANGE,
                  boxShadow: "0 0 8px rgba(240,146,38,0.8)",
                }}
              />
              <span
                className="text-[0.6rem] font-black tracking-[0.18em] uppercase"
                style={{ color: ORANGE }}
              >
                {copy.eyebrow}
              </span>
            </div>

            {/* Headline */}
            <h2
              className="font-black tracking-[-0.025em] leading-[1.02] text-[clamp(1.7rem,3.4vw,2.6rem)] max-w-[24ch]"
              style={{ color: textH }}
            >
              {copy.headline}
            </h2>

            {/* Promise */}
            <p
              className="mt-5 text-[0.95rem] md:text-[1rem] leading-[1.65] max-w-[58ch]"
              style={{ color: textB }}
            >
              {copy.promise}
            </p>

            {/* Price + CTA inline (also sticky bottom CTA below) */}
            <div className="mt-7 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <div
                  className="text-[0.55rem] font-black tracking-[0.3em] uppercase mb-1 flex items-center gap-2"
                  style={{ color: textMuted }}
                >
                  <span>Investimento</span>
                  {priceInfo.hasDiscount && (
                    <span
                      className="px-1.5 py-0.5 text-[0.5rem] font-black tracking-[0.18em]"
                      style={{ background: ORANGE, color: "#111" }}
                    >
                      {priceInfo.promoName ?? "PROMO"}
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-3 flex-wrap">
                  {priceInfo.hasDiscount && priceInfo.original && (
                    <span
                      className="text-[clamp(1.2rem,2.4vw,1.7rem)] font-semibold leading-none tabular-nums line-through"
                      style={{ color: textMuted }}
                    >
                      {priceInfo.original}
                    </span>
                  )}
                  <span
                    className="text-[clamp(2.4rem,5vw,3.6rem)] font-black leading-none tracking-[-0.025em] tabular-nums"
                    style={{ color: textH }}
                  >
                    {priceDisplay}
                  </span>
                  <span
                    className="text-[0.7rem] font-bold tracking-[0.16em] uppercase"
                    style={{ color: textMuted }}
                  >
                    IVA inclusa
                  </span>
                </div>
                <div
                  className="mt-2 text-[0.7rem] font-semibold"
                  style={{ color: textB }}
                >
                  {priceInfo.hasDiscount
                    ? "Sconto di lancio attivo fino al 30 giugno · Iscrizione vincolata? No."
                    : "Pagamento rateale disponibile · Iscrizione vincolata? No."}
                </div>
              </div>
              <button
                onClick={() => onBuy(pack)}
                className="inline-flex items-center justify-between gap-3 px-6 py-4 text-[0.78rem] font-black tracking-[0.16em] uppercase transition-all duration-200 hover:opacity-90"
                style={{ background: ORANGE, color: "#111111" }}
              >
                <span>Riserva il tuo posto</span>
                <span aria-hidden className="text-base">
                  →
                </span>
              </button>
            </div>
          </section>

          {/* ── 2. VIDEO — inline (NOT sticky) ─────────────────── */}
          <section
            className="px-6 md:px-10 pb-9 md:pb-12"
            style={{ borderTop: `1px solid ${surfaceBorder}` }}
          >
            <div className="pt-7 md:pt-9">
              <p
                className="mb-4 text-[0.6rem] font-black tracking-[0.3em] uppercase"
                style={{ color: ORANGE }}
              >
                — L&apos;Academy in 2 minuti
              </p>
              <div
                className="relative w-full overflow-hidden"
                style={{
                  paddingBottom: "56.25%",
                  background: "#000",
                  border: `1px solid ${surfaceBorderStrong}`,
                  boxShadow: `0 0 60px rgba(${ORANGE_RGB},0.06)`,
                }}
              >
                {videoSrc ? (
                  <iframe
                    src={videoSrc}
                    className="absolute inset-0 h-full w-full"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className="flex h-14 w-14 items-center justify-center rounded-full"
                      style={{
                        background: `rgba(${ORANGE_RGB},0.14)`,
                        border: `1.5px solid rgba(${ORANGE_RGB},0.45)`,
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width="20"
                        height="20"
                        fill={ORANGE}
                      >
                        <path d="M8 5.14v14l11-7-11-7z" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ── 3. VALUE STACK — LIGHT theme ─────────────────── */}
          <section
            className="px-6 md:px-10 py-10 md:py-14"
            style={{ background: lightBg }}
          >
            <p
              className="mb-2 text-[0.6rem] font-black tracking-[0.3em] uppercase"
              style={{ color: ORANGE }}
            >
              — Cosa Ottieni
            </p>
            <h3
              className="font-black tracking-[-0.02em] leading-[1.05] text-[clamp(1.3rem,2.4vw,1.9rem)]"
              style={{ color: lightTextH }}
            >
              Il percorso, in dettaglio.
            </h3>

            {/* Blocks — accordion programma completo */}
            <div className="mt-7">
              <ProgramAccordion scopeId={`pack-${pack.slug}`} />
            </div>

            {/* Tier extras */}
            {valueStackExtras.length > 0 && (
              <div className="mt-8">
                <span
                  className="text-[0.58rem] font-black tracking-[0.32em] uppercase mb-3 block"
                  style={{ color: ORANGE }}
                >
                  In più
                </span>
                <div className="flex flex-col gap-2.5">
                  {valueStackExtras.map((e, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-4"
                      style={{
                        background: lightSurface,
                        border: `1px solid rgba(${ORANGE_RGB},0.28)`,
                        borderLeft: `3px solid ${ORANGE}`,
                      }}
                    >
                      <span
                        className="shrink-0 mt-0.5 flex h-5 w-5 items-center justify-center text-[0.95rem] font-black leading-none"
                        style={{ color: ORANGE }}
                      >
                        +
                      </span>
                      <div className="min-w-0 flex-1">
                        <p
                          className="text-[0.95rem] font-black leading-tight tracking-[0.02em]"
                          style={{ color: lightTextH }}
                        >
                          {e.label}
                        </p>
                        <p
                          className="mt-1 text-[0.78rem] leading-relaxed"
                          style={{ color: lightTextB }}
                        >
                          {e.sub}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* ── 3b. ELITE EXCLUSIVE — Vitto & Alloggio luxury section ── */}
          {isElite && (
            <section
              className="relative overflow-hidden px-6 md:px-10 py-14 md:py-20"
              style={{
                background: `${BRUSHED_STEEL_OVERLAY}, linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 60%, #1a1a1a 100%)`,
                borderTop: `1px solid ${surfaceBorderStrong}`,
                borderBottom: `1px solid ${surfaceBorderStrong}`,
              }}
            >
              {/* Glow ornaments */}
              <div
                className="pointer-events-none absolute -top-32 -right-32 h-80 w-80 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, rgba(240,146,38,0.18) 0%, transparent 70%)",
                  filter: "blur(8px)",
                }}
              />
              <div
                className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, rgba(240,146,38,0.1) 0%, transparent 70%)",
                  filter: "blur(8px)",
                }}
              />

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-center">
                <div>
                  <span
                    className="inline-flex items-center gap-2 text-[0.58rem] font-black tracking-[0.32em] uppercase mb-4"
                    style={{ color: ORANGE }}
                  >
                    ★ — L&apos;Esperienza Esclusiva
                  </span>
                  <h3
                    className="font-black tracking-[-0.025em] leading-[1.02] text-[clamp(1.7rem,3.6vw,2.8rem)]"
                    style={{ color: textH }}
                  >
                    Vitto &amp; Alloggio
                    <br />
                    <span style={{ color: ORANGE }}>inclusi.</span>
                  </h3>
                  <p
                    className="mt-5 text-[0.95rem] md:text-[1rem] leading-[1.65] max-w-[58ch]"
                    style={{ color: textB }}
                  >
                    Per tutti i 6 weekend formativi dormi in struttura premium e
                    mangi con ristorazione curata. Niente prenotazioni,
                    spostamenti o logistica: ti dedichi solo alla formazione e
                    al network.
                  </p>

                  {/* Sub-features */}
                  <div className="mt-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      {
                        icon: "★",
                        label: "Struttura premium",
                        sub: "Camere singole / doppie",
                      },
                      {
                        icon: "✦",
                        label: "Ristorazione curata",
                        sub: "Cucina sportiva inclusa",
                      },
                      {
                        icon: "↺",
                        label: "Zero logistica",
                        sub: "Tutto già organizzato",
                      },
                    ].map((f) => (
                      <div
                        key={f.label}
                        className="flex flex-col gap-1 px-4 py-3"
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(240,146,38,0.22)",
                        }}
                      >
                        <span
                          className="text-[1rem] leading-none"
                          style={{ color: ORANGE }}
                        >
                          {f.icon}
                        </span>
                        <p
                          className="mt-1.5 text-[0.78rem] font-black leading-tight"
                          style={{ color: textH }}
                        >
                          {f.label}
                        </p>
                        <p
                          className="text-[0.62rem] leading-snug"
                          style={{ color: textB }}
                        >
                          {f.sub}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Decorative big icon — bed */}
                <div className="hidden lg:flex shrink-0 items-center justify-center">
                  <div
                    className="relative flex h-44 w-44 items-center justify-center"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(240,146,38,0.16) 0%, rgba(240,146,38,0.02) 100%)",
                      border: "1.5px solid rgba(240,146,38,0.55)",
                      boxShadow: "0 0 60px rgba(240,146,38,0.18)",
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="80"
                      height="80"
                      fill="none"
                      stroke={ORANGE}
                      strokeWidth="1.5"
                      strokeLinecap="square"
                    >
                      <path d="M3 18v-7m0 7h18m-18 0v-3h18v3M5 11V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3" />
                      <circle cx="9" cy="11.5" r="1.5" fill={ORANGE} />
                    </svg>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ── 4. GUARANTEES — LIGHT trust strip ────────────── */}
          <section
            className="px-6 md:px-10 py-9 md:py-11"
            style={{ background: lightBg }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {copy.guarantees.map((g, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-4"
                  style={{
                    background: lightSurface,
                    border: `1px solid ${lightBorder}`,
                  }}
                >
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    className="shrink-0 h-5 w-5"
                    style={{ color: ORANGE }}
                  >
                    <path
                      d="M13.5 4.5L6 12L2.5 8.5"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="square"
                    />
                  </svg>
                  <div className="min-w-0">
                    <p
                      className="text-[0.78rem] font-black leading-tight tracking-[0.02em]"
                      style={{ color: lightTextH }}
                    >
                      {g.label}
                    </p>
                    <p
                      className="mt-0.5 text-[0.62rem] leading-snug"
                      style={{ color: lightTextMuted }}
                    >
                      {g.sub}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── 5. FACULTY — LIGHT social proof ────────────── */}
          <section
            className="px-6 md:px-10 py-10 md:py-14"
            style={{
              background: lightSurface,
              borderTop: `1px solid ${lightBorder}`,
            }}
          >
            <div className="flex items-end justify-between gap-4 mb-7">
              <div>
                <p
                  className="mb-2 text-[0.6rem] font-black tracking-[0.3em] uppercase"
                  style={{ color: ORANGE }}
                >
                  — La Faculty
                </p>
                <h3
                  className="font-black tracking-[-0.02em] leading-[1.05] text-[clamp(1.3rem,2.4vw,1.9rem)]"
                  style={{ color: lightTextH }}
                >
                  {totalTeachers}+ docenti professionisti.
                </h3>
              </div>
            </div>

            <div className="space-y-8">
              {BLOCK_SLUGS.map((slug) => (
                <div key={slug}>
                  <p
                    className="mb-4 text-[0.7rem] font-black tracking-[0.3em] uppercase"
                    style={{ color: ORANGE }}
                  >
                    Docenti — {BLOCK_LABELS[slug]}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 md:gap-3">
                    {teachers[slug].map((t) => (
                      <article
                        key={t.slug}
                        className="flex flex-col overflow-hidden"
                        style={{
                          background: lightSurface,
                          border: `1px solid ${lightBorder}`,
                          maxWidth: 220,
                        }}
                      >
                        <TeacherPortrait
                          teacher={t}
                          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 28vw, 200px"
                          fallbackTheme="light"
                        />
                        <div className="px-2.5 pt-2.5 pb-3">
                          <p
                            className="text-[0.78rem] md:text-[0.82rem] font-black leading-tight tracking-[-0.005em] m-0"
                            style={{ color: lightTextH }}
                          >
                            {t.name}
                          </p>
                          <p
                            className="mt-1 text-[0.58rem] font-bold tracking-[0.16em] uppercase line-clamp-2 leading-[1.35]"
                            style={{ color: ORANGE }}
                          >
                            {t.role}
                          </p>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── 6. FINAL CTA + scarcity ──────────────────── */}
          <section className="px-6 md:px-10 py-10 md:py-14 text-center">
            <p
              className="mb-3 text-[0.62rem] font-black tracking-[0.3em] uppercase"
              style={{ color: ORANGE }}
            >
              — {copy.eyebrow}
            </p>
            <h3
              className="font-black tracking-[-0.025em] leading-[1.05] text-[clamp(1.5rem,3vw,2.4rem)] mx-auto max-w-[22ch]"
              style={{ color: textH }}
            >
              Riserva il tuo posto in{" "}
              <span style={{ color: ORANGE }}>{tier.label}</span>.
            </h3>
            <p
              className="mt-4 mx-auto max-w-[44ch] text-[0.85rem] leading-[1.6]"
              style={{ color: textB }}
            >
              I posti si esauriscono ogni anno con largo anticipo. Bloccare la
              tua iscrizione ora ti garantisce il tuo spazio nell&apos;edizione
              2026/27.
            </p>
            <div className="mt-7 flex flex-col items-center gap-2.5">
              <button
                onClick={() => onBuy(pack)}
                className="inline-flex items-center justify-between gap-3 px-7 py-4 text-[0.78rem] font-black tracking-[0.16em] uppercase transition-all duration-200 hover:opacity-90 min-w-[280px]"
                style={{ background: ORANGE, color: "#111111" }}
              >
                <span>
                  Scegli {tier.label} · {priceDisplay}
                </span>
                <span aria-hidden className="text-base">
                  →
                </span>
              </button>
              <p
                className="text-[0.62rem] font-semibold tracking-[0.04em]"
                style={{ color: textMuted }}
              >
                Nessun pagamento richiesto ora · Completa il profilo per
                procedere
              </p>
            </div>
          </section>
        </div>

        {/* ════ STICKY BOTTOM BAR (mobile + desktop) ════ */}
        <div
          className="shrink-0 flex items-center justify-between gap-3 px-4 md:px-8 py-3 z-30"
          style={{
            background: stickyBarBg,
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderTop: `1px solid ${surfaceBorder}`,
          }}
        >
          <div className="min-w-0 flex flex-col">
            <span
              className="text-[0.55rem] font-bold tracking-[0.18em] uppercase flex items-center gap-1.5"
              style={{ color: textMuted }}
            >
              <span>Pack {tier.label}</span>
              {priceInfo.hasDiscount && (
                <span
                  className="px-1 py-0.5 text-[0.5rem] font-black tracking-[0.18em]"
                  style={{ background: ORANGE, color: "#111" }}
                >
                  {priceInfo.promoName ?? "PROMO"}
                </span>
              )}
            </span>
            <span className="flex items-baseline gap-2">
              {priceInfo.hasDiscount && priceInfo.original && (
                <span
                  className="text-[0.75rem] font-semibold tabular-nums line-through"
                  style={{ color: textMuted }}
                >
                  {priceInfo.original}
                </span>
              )}
              <span
                className="text-[1.05rem] font-black leading-none tabular-nums tracking-[-0.01em]"
                style={{ color: textH }}
              >
                {priceDisplay}
              </span>
            </span>
          </div>
          <button
            onClick={() => onBuy(pack)}
            className="shrink-0 inline-flex items-center gap-2 px-4 sm:px-5 py-3 text-[0.7rem] font-black tracking-[0.14em] uppercase transition-opacity hover:opacity-90"
            style={{ background: ORANGE, color: "#111111" }}
          >
            <span>Riserva ora</span>
            <span aria-hidden>→</span>
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ─── Cell tilt helpers ────────────────────────────────────────────────────────

function onMove(e: React.MouseEvent<HTMLDivElement>) {
  const rect = e.currentTarget.getBoundingClientRect();
  const dx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
  const dy = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
  gsap.to(e.currentTarget, {
    rotateX: -dy * 3,
    rotateY: dx * 3,
    duration: 0.5,
    ease: "power2.out",
    transformPerspective: 900,
  });
}
function onLeave(e: React.MouseEvent<HTMLDivElement>) {
  gsap.to(e.currentTarget, {
    rotateX: 0,
    rotateY: 0,
    duration: 0.9,
    ease: "elastic.out(1, 0.4)",
  });
}

// ─── Pack Card ────────────────────────────────────────────────────────────────

type HeroExtraIcon = "bed" | "masterclass";

function HeroExtraGlyph({ icon }: { icon: HeroExtraIcon }) {
  if (icon === "bed") {
    return (
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="#F09226"
        strokeWidth="2"
        strokeLinecap="square"
        aria-hidden
      >
        <path d="M3 18v-7m0 7h18m-18 0v-3h18v3M5 11V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3" />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="#F09226"
      strokeWidth="2"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden
    >
      <path d="M2 9l10-5 10 5-10 5z" />
      <path d="M6 11v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" />
      <path d="M21 9v6" />
    </svg>
  );
}

type HeroExtra = {
  eyebrow: string;
  text: string;
  sub: string;
  icon: HeroExtraIcon;
};

type CardCopy = {
  badge?: string;
  tagline: string;
  audience: string;
  /** Premium luxury callouts shown above the regular extras list. */
  heroExtras?: HeroExtra[];
  /** Tier-specific extras shown after the always-visible blocks */
  extras: { text: string; sub?: string }[];
  ctaLabel: string;
};

const CARD_COPY: Record<string, CardCopy> = {
  start: {
    tagline:
      "Accedi al metodo Lacertosus nella sua forma più pura. Tre blocchi formativi guidati dai migliori docenti del settore.",
    audience: "Per chi vuole entrare nell'Academy.",
    extras: [
      {
        text: "Functional Strength Master Coach",
        sub: "Certificazione nazionale Lacertosus inclusa",
      },
    ],
    ctaLabel: "Scegli START",
  },
  pro: {
    tagline:
      "Il percorso completo + la certificazione FIPE riconosciuta a livello nazionale e internazionale.",
    audience: "Per chi vuole costruire una carriera riconosciuta.",
    heroExtras: [
      {
        icon: "masterclass",
        eyebrow: "Specializzazione",
        text: "2 Masterclass a scelta",
        sub: "Sessioni esclusive con specialisti di caratura internazionale. Selezioni i percorsi affini al tuo profilo durante l'iscrizione.",
      },
    ],
    extras: [
      {
        text: "Functional Strength Master Coach",
        sub: "Certificazione nazionale Lacertosus inclusa",
      },
      {
        text: "Personal Trainer FIPE × Lacertosus",
        sub: "Certificazione FIPE — riconoscimento nazionale e internazionale",
      },
    ],
    ctaLabel: "Scegli PRO",
  },
  elite: {
    badge: "VIP Experience",
    tagline:
      "Vivi i 6 weekend di formazione da insider. Vitto e alloggio inclusi, niente di operativo a cui pensare.",
    audience: "Per chi sceglie di concentrarsi solo sulla formazione.",
    heroExtras: [
      {
        icon: "bed",
        eyebrow: "Esperienza Esclusiva",
        text: "Vitto & Alloggio inclusi",
        sub: "Struttura premium e ristorazione curata per tutti i 6 weekend formativi.",
      },
      {
        icon: "masterclass",
        eyebrow: "Specializzazione",
        text: "2 Masterclass a scelta",
        sub: "Sessioni esclusive con specialisti di caratura internazionale. Selezioni i percorsi affini al tuo profilo durante l'iscrizione.",
      },
    ],
    extras: [
      {
        text: "Functional Strength Master Coach",
        sub: "Certificazione nazionale Lacertosus inclusa",
      },
      {
        text: "Personal Trainer FIPE × Lacertosus",
        sub: "Certificazione FIPE — riconoscimento nazionale e internazionale",
      },
      {
        text: "Accesso prioritario alla community",
        sub: "Eventi riservati e network esclusivo",
      },
    ],
    ctaLabel: "Scegli ELITE",
  },
};

function PackCard({
  pack,
  isDark,
  onClick,
}: {
  pack: AcademyProduct;
  isDark: boolean;
  onClick: () => void;
}) {
  /* isDark intentionally unused — emphasis-based theming overrides theme */
  void isDark;
  const tier = TIER[pack.slug] ?? TIER.start;
  const isHighlighted = pack.highlighted;
  const promoForSlug = usePromoForSlug(pack.slug);
  const priceInfo = getPackPriceDisplay(pack.slug, promoForSlug);
  const priceDisplay = priceInfo.discounted;
  const copy = CARD_COPY[pack.slug] ?? CARD_COPY.start;
  const isPro = pack.slug === "pro";
  const isElite = pack.slug === "elite";
  const isStart = pack.slug === "start";
  const ORANGE = "#F09226";

  /* ── Theme tokens per tier ─────────────────────────────────────
     - START: full white card, dark text
     - PRO: orange "head" + light off-white "body" with dark text
     - ELITE: full premium dark card, light text
  */
  const headBg = isStart
    ? "#ffffff"
    : isPro
      ? "#F09226"
      : `${BRUSHED_STEEL_OVERLAY}, linear-gradient(145deg, #434343 0%, #1a1a1a 55%, #0a0a0a 100%)`;

  const bodyBg = isStart
    ? "#ffffff"
    : isPro
      ? "#F5F5F7"
      : `${BRUSHED_STEEL_OVERLAY}, linear-gradient(145deg, #434343 0%, #1a1a1a 55%, #0a0a0a 100%)`;

  // Head text colors
  const headText = isPro || isStart ? "#111111" : "#ffffff";
  const headTextMuted = isPro
    ? "rgba(17,17,17,0.72)"
    : isStart
      ? "rgba(17,17,17,0.55)"
      : "rgba(255,255,255,0.65)";
  const headTagBg = isPro
    ? "rgba(17,17,17,0.08)"
    : isStart
      ? "rgba(240,146,38,0.08)"
      : "rgba(240,146,38,0.12)";
  const headTagText = isPro
    ? "rgba(17,17,17,0.85)"
    : isStart
      ? "rgba(180,80,0,0.85)"
      : "rgba(240,146,38,0.85)";

  // Body text colors
  const bodyText = isElite ? "#ffffff" : "#111111";
  const bodyTextSecondary = isElite
    ? "rgba(255,255,255,0.72)"
    : "rgba(17,17,17,0.62)";
  const bodyTextMuted = isElite
    ? "rgba(255,255,255,0.45)"
    : "rgba(17,17,17,0.42)";
  const bodyDivider = isElite ? "rgba(255,255,255,0.1)" : "rgba(17,17,17,0.08)";
  const bodyAccent = "#F09226";
  const blockTileBg = isElite
    ? "rgba(255,255,255,0.04)"
    : "rgba(17,17,17,0.03)";
  const blockTileBorder = isElite
    ? "rgba(255,255,255,0.08)"
    : "rgba(17,17,17,0.08)";

  // Card outer
  const outerBorder = isStart
    ? "1px solid rgba(0,0,0,0.1)"
    : isPro
      ? "1px solid rgba(240,146,38,0.4)"
      : "1px solid rgba(255,255,255,0.1)";
  const outerShadow = isPro
    ? "0 0 60px rgba(240,146,38,0.18), 0 24px 80px rgba(0,0,0,0.18)"
    : isElite
      ? "0 0 60px rgba(0,0,0,0.4), 0 24px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)"
      : undefined;

  return (
    <div
      data-pack-card
      className="relative flex cursor-pointer flex-col overflow-hidden rounded-sm"
      style={{
        border: outerBorder,
        boxShadow: outerShadow,
        transform: isHighlighted ? "scale(1.025)" : undefined,
        transformStyle: "preserve-3d",
        background: bodyBg,
      }}
      onClick={onClick}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {/* Top accent stripe — only on START + ELITE; PRO header is already orange */}
      {!isPro && (
        <div
          className="h-0.5 w-full"
          style={{
            background: `linear-gradient(90deg, ${bodyAccent}, ${bodyAccent}00)`,
          }}
        />
      )}

      {/* Optional ELITE badge */}
      {copy.badge && (
        <div
          className="absolute right-5 top-5 px-2.5 py-1 text-[0.55rem] font-black tracking-[0.28em] uppercase z-10"
          style={{
            background: "rgba(17,17,17,0.92)",
            color: "#F09226",
            border: "1px solid rgba(240,146,38,0.4)",
          }}
        >
          {copy.badge}
        </div>
      )}

      {/* ═══════════ HEAD (orange for PRO) ════════════ */}
      <div
        className="px-7 lg:px-8 pt-7 lg:pt-8 pb-6"
        style={{ background: headBg }}
      >
        <span
          className="text-[0.6rem] font-black tracking-[0.34em] uppercase block"
          style={{ color: headTextMuted }}
        >
          Pack
        </span>
        <div
          className="mt-1 text-[clamp(2.2rem,3.5vw,3.3rem)] font-black leading-[0.92] tracking-[-0.025em]"
          style={{ color: headText }}
        >
          {tier.label}
        </div>
        <p
          className="mt-3.5 text-[0.92rem] leading-[1.5] font-medium max-w-[34ch]"
          style={{ color: headText, opacity: 0.92 }}
        >
          {copy.tagline}
        </p>

        {/* Audience tag inside head */}
        <div
          className="mt-4 inline-flex items-center gap-2 px-2.5 py-1.5"
          style={{
            background: headTagBg,
            border: `1px solid ${
              isPro
                ? "rgba(17,17,17,0.12)"
                : isStart
                  ? "rgba(240,146,38,0.18)"
                  : "rgba(240,146,38,0.25)"
            }`,
          }}
        >
          <span
            className="text-[0.6rem] font-bold tracking-[0.04em]"
            style={{ color: headTagText }}
          >
            {copy.audience}
          </span>
        </div>
      </div>

      {/* ═══════════ BODY (light/white for PRO, premium for ELITE) ════════════ */}
      <div className="flex flex-1 flex-col gap-5 p-7 lg:p-8">
        {/* ── Price ─────────────────────────────────────────────── */}
        <div className="-mt-1">
          <div
            className="text-[0.55rem] font-black tracking-[0.3em] uppercase mb-1 flex items-center gap-2"
            style={{ color: bodyTextMuted }}
          >
            <span>Investimento</span>
            {priceInfo.hasDiscount && (
              <span
                className="px-1.5 py-0.5 text-[0.5rem] font-black tracking-[0.18em]"
                style={{ background: ORANGE, color: "#111" }}
              >
                {priceInfo.promoName ?? "PROMO"}
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-2 flex-wrap">
            {priceInfo.hasDiscount && priceInfo.original && (
              <span
                className="text-[1rem] font-semibold leading-none tabular-nums line-through"
                style={{ color: bodyTextMuted }}
              >
                {priceInfo.original}
              </span>
            )}
            <span
              className="text-[2.1rem] font-black leading-none tracking-[-0.02em] tabular-nums"
              style={{ color: bodyText }}
            >
              {priceDisplay}
            </span>
          </div>
          <div
            className="mt-1.5 text-[0.6rem] font-bold tracking-[0.16em] uppercase"
            style={{ color: bodyTextMuted }}
          >
            {priceInfo.hasDiscount
              ? "IVA inclusa · Promo fino al 30 giugno"
              : "IVA inclusa · Pagamento rateale"}
          </div>
        </div>

        {/* ── Divider ──────────────────────────────────────────── */}
        <div className="h-px w-full" style={{ background: bodyDivider }} />

        {/* ── BLOCKS — always shown, prominent ───────────────── */}
        <div>
          <span
            className="text-[0.58rem] font-black tracking-[0.32em] uppercase mb-3 block"
            style={{ color: bodyTextMuted }}
          >
            Il Percorso · 9 mesi · 6 weekend
          </span>
          <div className="flex flex-col gap-2">
            {BLOCK_SLUGS.map((slug, i) => (
              <div
                key={slug}
                className="flex items-center gap-3 px-3 py-2.5"
                style={{
                  background: blockTileBg,
                  border: `1px solid ${blockTileBorder}`,
                }}
              >
                <span
                  className="shrink-0 flex h-7 w-7 items-center justify-center text-[0.62rem] font-black tabular-nums"
                  style={{
                    border: `1.5px solid ${
                      isElite
                        ? "rgba(240,146,38,0.55)"
                        : "rgba(240,146,38,0.55)"
                    }`,
                    color: bodyAccent,
                    background: isElite
                      ? "rgba(240,146,38,0.06)"
                      : "rgba(240,146,38,0.05)",
                  }}
                >
                  0{i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div
                    className="text-[0.82rem] font-black tracking-[0.04em]"
                    style={{ color: bodyText }}
                  >
                    {BLOCK_LABELS[slug]}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── HERO EXTRAS — dark premium callouts (PRO/ELITE) ── */}
        {copy.heroExtras && copy.heroExtras.length > 0 && (
          <div className="flex flex-col gap-2.5">
            {copy.heroExtras.map((extra, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3.5 p-4"
                style={{
                  background:
                    "linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)",
                  border: "1px solid rgba(240,146,38,0.45)",
                  borderLeft: "3px solid #F09226",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.04), 0 4px 18px rgba(0,0,0,0.25)",
                }}
              >
                <div
                  className="shrink-0 flex h-9 w-9 items-center justify-center"
                  style={{
                    background: "rgba(240,146,38,0.14)",
                    border: "1px solid rgba(240,146,38,0.55)",
                  }}
                >
                  <HeroExtraGlyph icon={extra.icon} />
                </div>

                <div className="min-w-0 flex-1">
                  <div
                    className="text-[0.55rem] font-bold tracking-[0.3em] uppercase"
                    style={{ color: "#F09226" }}
                  >
                    {extra.eyebrow}
                  </div>
                  <div
                    className="mt-1 text-[0.98rem] font-black leading-tight tracking-[-0.005em]"
                    style={{ color: "#ffffff" }}
                  >
                    {extra.text}
                  </div>
                  <p
                    className="mt-1.5 text-[0.72rem] leading-[1.5]"
                    style={{ color: "rgba(255,255,255,0.72)" }}
                  >
                    {extra.sub}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Tier extras (PRO + ELITE) ────────────────────── */}
        {copy.extras.length > 0 && (
          <div>
            <span
              className="text-[0.58rem] font-black tracking-[0.32em] uppercase mb-3 block"
              style={{ color: bodyAccent }}
            >
              {copy.heroExtras && copy.heroExtras.length > 0
                ? "Inoltre"
                : "In più"}
            </span>
            <div className="flex flex-col gap-2.5">
              {copy.extras.map((e, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span
                    className="shrink-0 mt-0.5 flex h-4 w-4 items-center justify-center text-[0.85rem] font-black leading-none"
                    style={{ color: bodyAccent }}
                  >
                    +
                  </span>
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-[0.8rem] font-black leading-tight tracking-[0.02em]"
                      style={{ color: bodyText }}
                    >
                      {e.text}
                    </p>
                    {e.sub && (
                      <p
                        className="mt-0.5 text-[0.68rem] leading-snug"
                        style={{ color: bodyTextSecondary }}
                      >
                        {e.sub}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CTA only ──────────────────────────────────────── */}
        <div className="mt-auto pt-2">
          <button
            type="button"
            className="w-full inline-flex items-center justify-between gap-2 px-5 py-3.5 text-[0.78rem] font-black tracking-[0.14em] uppercase transition-opacity duration-200 hover:opacity-88"
            style={{
              background: isElite ? bodyAccent : isPro ? "#111111" : bodyAccent,
              color: isElite ? "#111111" : isPro ? "#F09226" : "#111111",
              border: isPro ? "1px solid #111111" : "none",
            }}
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            <span>{copy.ctaLabel}</span>
            <span aria-hidden className="text-[0.95rem]">
              →
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Packs Section ────────────────────────────────────────────────────────────

function PacksSection({
  isDark,
  onOpenModal,
}: {
  isDark: boolean;
  onOpenModal: (pack: AcademyProduct) => void;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const bundles = getBundles();
  const th = isDark ? "#f5f5fa" : "#111111";
  const tb = isDark ? "#c7c7cc" : "#555555";

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.from(headRef.current, {
        scrollTrigger: {
          trigger: headRef.current,
          start: "top 85%",
          once: true,
        },
        opacity: 0,
        y: 30,
        duration: 0.7,
        ease: "power3.out",
      });
      const cardEls = Array.from(
        cardsRef.current?.querySelectorAll("[data-pack-card]") ?? [],
      ) as HTMLElement[];
      if (cardEls.length === 3) {
        const [c0, c1, c2] = cardEls;
        gsap.set(cardEls, { opacity: 0 });
        ScrollTrigger.create({
          trigger: cardsRef.current,
          start: "top 92%",
          once: true,
          onEnter: () => {
            const isMobile = window.innerWidth < 981;
            if (isMobile) {
              [c1, c0, c2].forEach((el, i) => {
                gsap.fromTo(
                  el,
                  {
                    y: 80,
                    scale: 0.88,
                    opacity: 0,
                    rotation: i === 0 ? 0 : i === 1 ? -2 : 2,
                  },
                  {
                    y: 0,
                    scale: 1,
                    opacity: 1,
                    rotation: 0,
                    duration: 1.0,
                    delay: i * 0.22,
                    ease: "expo.out",
                  },
                );
              });
            } else {
              const tl = gsap.timeline({
                onComplete: () => {
                  gsap.set(cardEls, { clearProps: "zIndex" });
                },
              });
              tl.fromTo(
                c1,
                {
                  scale: 0.82,
                  rotation: 0,
                  opacity: 0,
                  xPercent: 0,
                  zIndex: 3,
                },
                {
                  scale: 1.025,
                  rotation: 0,
                  opacity: 1,
                  xPercent: 0,
                  duration: 1.15,
                  ease: "expo.out",
                },
                0.05,
              )
                .fromTo(
                  c0,
                  {
                    scale: 0.82,
                    rotation: 18,
                    opacity: 0,
                    xPercent: 60,
                    zIndex: 1,
                  },
                  {
                    scale: 1,
                    rotation: 0,
                    opacity: 1,
                    xPercent: 0,
                    duration: 1.05,
                    ease: "expo.out",
                  },
                  0.35,
                )
                .fromTo(
                  c2,
                  {
                    scale: 0.82,
                    rotation: -18,
                    opacity: 0,
                    xPercent: -60,
                    zIndex: 2,
                  },
                  {
                    scale: 1,
                    rotation: 0,
                    opacity: 1,
                    xPercent: 0,
                    duration: 1.05,
                    ease: "expo.out",
                  },
                  0.52,
                );
            }
          },
        });
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="section-packs"
      className="themed-section relative overflow-hidden py-24 md:py-32"
    >
      <div className="absolute inset-0 section-bg" />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(ellipse, rgba(240,146,38,0.03) 0%, transparent 70%)",
        }}
      />
      <div className="relative z-10 mx-auto max-w-[1440px] px-[5%] md:px-10">
        <div ref={headRef} className="mb-8">
          <span className="label-tag mb-3 block">I Pacchetti Formativi</span>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <h2
              className="text-[clamp(1.9rem,4vw,3.5rem)] font-black leading-[1.05] tracking-tight"
              style={{ color: th }}
            >
              Costruisci il tuo <span className="gradient-text">percorso.</span>
            </h2>
            <p
              className="max-w-sm text-sm leading-relaxed"
              style={{ color: tb }}
            >
              Tre livelli di accesso allo stesso percorso d&apos;eccellenza.
              Clicca su un pack per scoprire tutti i dettagli.
            </p>
          </div>
        </div>

        {/* ── Scarcity strip — between title and pack grid ─────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-12 flex flex-col gap-3 md:flex-row md:items-center md:justify-between px-5 py-4"
          style={{
            border: "1px solid rgba(240,146,38,0.45)",
            background: isDark
              ? "rgba(240,146,38,0.07)"
              : "rgba(240,146,38,0.06)",
            boxShadow: "inset 0 0 32px rgba(240,146,38,0.05)",
          }}
        >
          <div className="flex items-center gap-3">
            {/* Pulsing dot */}
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span
                className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
                style={{ background: "#F09226" }}
              />
              <span
                className="relative inline-flex h-2.5 w-2.5 rounded-full"
                style={{
                  background: "#F09226",
                  boxShadow: "0 0 10px rgba(240,146,38,0.8)",
                }}
              />
            </span>
            <span
              className="text-[0.7rem] md:text-[0.78rem] font-black tracking-[0.18em] uppercase tabular-nums"
              style={{ color: "#F09226" }}
            >
              Solo {SEATS_TOTAL} posti disponibili
            </span>
            <span
              className="hidden md:inline text-[0.62rem] font-bold tracking-[0.18em] uppercase"
              style={{ color: tb }}
            >
              · Edizione 2026/27 · Iscrizioni aperte
            </span>
          </div>
          <span
            className="md:hidden text-[0.6rem] font-bold tracking-[0.18em] uppercase"
            style={{ color: tb }}
          >
            Edizione 2026/27 · Iscrizioni aperte
          </span>
        </motion.div>

        <div
          ref={cardsRef}
          className="grid gap-4 min-[981px]:grid-cols-3"
          style={{ perspective: "1200px" }}
        >
          {bundles.map((pack) => (
            <PackCard
              key={pack.slug}
              pack={pack}
              isDark={isDark}
              onClick={() => onOpenModal(pack)}
            />
          ))}
        </div>
        {/* ─── Certificazioni — prominent dual cards (mirror home + percorso) ── */}
        <div className="mt-16 md:mt-20">
          <div className="mb-8 max-w-3xl">
            <span
              className="text-[0.7rem] font-black tracking-[0.34em] uppercase mb-3 block"
              style={{ color: "#F09226" }}
            >
              — Le Due Certificazioni
            </span>
            <h3
              className="font-black tracking-[-0.025em] leading-[0.95]"
              style={{
                fontSize: "clamp(1.7rem, 3.4vw, 2.6rem)",
                color: th,
              }}
            >
              Due titoli <span className="gradient-text">riconosciuti</span>.
              <br />
              Una carriera reale.
            </h3>
            <p
              className="mt-5 max-w-2xl text-[0.95rem] leading-relaxed"
              style={{ color: tb }}
            >
              Al termine del percorso ricevi due certificazioni distinte. Una è
              inclusa in qualunque pack, l&apos;altra è riservata ai pack PRO ed
              ELITE per chi vuole il riconoscimento FIPE ufficiale.
            </p>
          </div>
          <CertificationsCards isDark={isDark} />
        </div>
      </div>
    </section>
  );
}

// ─── Masterclass Section — Horizontal Minimal List ──────────────────────────

function MasterclassSection({ isDark }: { isDark: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-60px" });

  const th = isDark ? "#f5f5fa" : "#0a0a1a";
  const tb = isDark ? "rgba(180,180,200,0.65)" : "#555555";
  const ts = isDark ? "rgba(120,120,140,0.5)" : "#888888";
  const rowBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)";

  const masterclasses = getPublicMasterclassProducts();

  async function handleBuy(product: AcademyProduct) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const dest = `/checkout?pack=${product.slug}`;
    if (!user) {
      localStorage.setItem("pending_checkout", dest);
      window.location.href = `/auth/register?next=${encodeURIComponent(dest)}`;
      return;
    }
    window.location.href = dest;
  }

  return (
    <section
      ref={sectionRef}
      className="themed-section relative overflow-hidden py-20 md:py-28"
    >
      <div className="absolute inset-0 section-bg-alt" />
      <div className="relative z-10 mx-auto max-w-[1440px] px-[5%] md:px-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.62 }}
          className="mb-10"
        >
          <span className="label-tag mb-3 block">Approfondimento</span>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <h2
              className="text-[clamp(1.7rem,3.5vw,2.8rem)] font-black leading-[1.05] tracking-tight"
              style={{ color: th }}
            >
              Masterclass
            </h2>
            <p
              className="max-w-xs text-[0.82rem] leading-relaxed"
              style={{ color: tb }}
            >
              Sessioni intensive in presenza con specialisti di caratura
              internazionale, aperte a tutti.
            </p>
          </div>
        </motion.div>

        {/* Horizontal minimal list — no boxes */}
        <div
          className="flex flex-col"
          style={{ borderTop: `1px solid ${rowBorder}` }}
        >
          {masterclasses.map((product, i) => {
            const workshop = product.workshopSlug
              ? getWorkshopBySlug(product.workshopSlug)
              : undefined;
            const trainerLabel = workshop?.trainerLabel ?? "";
            const isTbd = workshop?.tbd ?? product.priceCents === 0;
            const num = String(i + 1).padStart(2, "0");

            return (
              <motion.div
                key={product.slug}
                initial={{ opacity: 0, y: 12 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.45, delay: i * 0.04 }}
                style={{
                  borderBottom: `1px solid ${rowBorder}`,
                  opacity: isTbd ? 0.55 : 1,
                }}
                className="group"
              >
                <button
                  type="button"
                  onClick={isTbd ? undefined : () => handleBuy(product)}
                  disabled={isTbd}
                  className={`w-full text-left transition-opacity duration-200 ${
                    isTbd ? "cursor-default" : "hover:opacity-70 cursor-pointer"
                  }`}
                >
                  <div className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_2fr_2fr_auto_auto] items-center gap-x-4 md:gap-x-8 py-5 md:py-6">
                    {/* Number */}
                    <span
                      className="text-[0.62rem] md:text-[0.68rem] font-black tracking-[0.32em] tabular-nums uppercase shrink-0"
                      style={{ color: ts, minWidth: "2.5rem" }}
                    >
                      {num}
                    </span>

                    {/* Title */}
                    <h3
                      className="text-[0.95rem] md:text-[1.05rem] font-black tracking-tight leading-tight"
                      style={{ color: th }}
                    >
                      {product.name.replace(/^Masterclass\s+/i, "")}
                    </h3>

                    {/* Trainer — desktop column */}
                    <span
                      className="hidden md:block text-[0.78rem] font-semibold leading-snug truncate"
                      style={{
                        color: isDark
                          ? "rgba(240,146,38,0.7)"
                          : "rgba(180,80,0,0.7)",
                      }}
                    >
                      {trainerLabel || "Trainer da definire"}
                    </span>

                    {/* Price — desktop column */}
                    <span
                      className="hidden md:block text-[0.85rem] font-black tabular-nums whitespace-nowrap"
                      style={{ color: th }}
                    >
                      {product.priceCents > 0
                        ? formatPrice(product.priceCents)
                        : "—"}
                    </span>

                    {/* CTA */}
                    {isTbd ? (
                      <span
                        className="text-[0.6rem] font-bold tracking-[0.18em] uppercase whitespace-nowrap"
                        style={{ color: ts }}
                      >
                        Prossimamente
                      </span>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1.5 text-[0.7rem] font-black tracking-[0.18em] uppercase whitespace-nowrap transition-colors duration-200"
                        style={{ color: "#F09226" }}
                      >
                        <span className="hidden sm:inline">Acquista</span>
                        <span aria-hidden className="text-[0.95rem]">
                          →
                        </span>
                      </span>
                    )}
                  </div>

                  {/* Mobile-only secondary line: trainer + price */}
                  <div className="md:hidden flex items-center justify-between pl-12 pb-4 -mt-3">
                    <span
                      className="text-[0.7rem] font-semibold"
                      style={{
                        color: isDark
                          ? "rgba(240,146,38,0.7)"
                          : "rgba(180,80,0,0.7)",
                      }}
                    >
                      {trainerLabel || "Trainer da definire"}
                    </span>
                    <span
                      className="text-[0.78rem] font-black tabular-nums"
                      style={{ color: th }}
                    >
                      {product.priceCents > 0
                        ? formatPrice(product.priceCents)
                        : "—"}
                    </span>
                  </div>
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-6 text-[0.66rem] font-bold tracking-[0.22em] uppercase"
          style={{ color: ts }}
        >
          2 Masterclass a scelta incluse nei pack PRO ed ELITE
        </motion.p>
      </div>
    </section>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function PackComparison() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [activeModal, setActiveModal] = useState<AcademyProduct | null>(null);
  const [openBlock, setOpenBlock] = useState<BlockSlug | null>(null);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [selectedPack, setSelectedPack] = useState<AcademyProduct | null>(null);

  async function handleBuy(pack: AcademyProduct) {
    setActiveModal(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const dest = `/checkout?pack=${pack.slug}`;
    if (!user) {
      localStorage.setItem("pending_checkout", dest);
      window.location.href = `/auth/register?next=${encodeURIComponent(dest)}`;
      return;
    }
    if ((pack.masterclassSelectionCount ?? 0) > 0) {
      setSelectedPack(pack);
      setSelectorOpen(true);
    } else {
      window.location.href = dest;
    }
  }

  function handleSelectorConfirm(slugs: string[]) {
    setSelectorOpen(false);
    if (!selectedPack) return;
    const params = new URLSearchParams({ pack: selectedPack.slug });
    if (slugs[0]) params.set("mc1", slugs[0]);
    if (slugs[1]) params.set("mc2", slugs[1]);
    router.push(`/checkout?${params.toString()}`);
  }

  return (
    <>
      <HeroSection isDark={isDark} onOpenBlock={setOpenBlock} />
      <JourneySection isDark={isDark} onOpenBlock={setOpenBlock} />
      <PacksSection isDark={isDark} onOpenModal={setActiveModal} />
      <MasterclassSection isDark={isDark} />

      {/* Block detail modal */}
      {openBlock && (
        <BlockModal
          slug={openBlock}
          onClose={() => setOpenBlock(null)}
          ctaHref="#section-packs"
        />
      )}

      {/* Pack modal */}
      {activeModal && (
        <PackModal
          pack={activeModal}
          isDark={isDark}
          onClose={() => setActiveModal(null)}
          onBuy={handleBuy}
        />
      )}

      {/* Masterclass selector */}
      {selectorOpen && selectedPack && (
        <MasterclassSelector
          packSlug={selectedPack.slug}
          count={selectedPack.masterclassSelectionCount ?? 2}
          onConfirm={handleSelectorConfirm}
          onClose={() => setSelectorOpen(false)}
        />
      )}
    </>
  );
}
