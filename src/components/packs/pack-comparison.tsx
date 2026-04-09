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
  getMasterclassProducts,
  type AcademyProduct,
} from "@/lib/constants/packs";
import { getTeachersByCourse, type Teacher } from "@/lib/constants/teachers";
import { getWorkshopBySlug } from "@/lib/constants/workshops";
import { formatPrice } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { MasterclassSelector } from "./masterclass-selector";
import { BlockModal, type BlockSlug } from "@/components/shared/block-modal";
import dynamic from "next/dynamic";

const HeroScene = dynamic(
  () => import("./hero-scene").then((m) => m.HeroScene),
  { ssr: false },
);

// ─── Constants ────────────────────────────────────────────────────────────────

const TIER: Record<
  string,
  { color: string; rgb: string; label: string; roman: string }
> = {
  bronzo: { color: "#CD7F32", rgb: "205,127,50", label: "BRONZO", roman: "I" },
  argento: {
    color: "#C0C0C0",
    rgb: "192,192,192",
    label: "ARGENTO",
    roman: "II",
  },
  oro: { color: "#D4AF37", rgb: "212,175,55", label: "ORO", roman: "III" },
};

// Example prices for display (bundles have priceCents:0 in catalog — TBD)
const PACK_PRICE_DISPLAY: Record<string, string> = {
  bronzo: "€ 1.200",
  argento: "€ 1.600",
  oro: "€ 2.200",
};

const BLOCK_SLUGS = ["corpus", "vis", "victor"] as const;
const BLOCK_LABELS: Record<string, string> = {
  corpus: "CORPUS",
  vis: "VIS",
  victor: "VICTOR",
};

function getBundleTeachers(): Record<string, Teacher[]> {
  return {
    corpus: getTeachersByCourse("corpus"),
    vis: getTeachersByCourse("vis"),
    victor: getTeachersByCourse("victor"),
  };
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
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
    <div data-hero-scroll style={{ height: "280vh", position: "relative" }}>
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
  const isInView = useInView(sectionRef, { once: true, margin: "-60px" });

  const th = isDark ? "#f5f5fa" : "#0a0a1a";
  const tb = isDark ? "rgba(180,180,200,0.60)" : "#555555";
  const ts = isDark ? "rgba(120,120,140,0.45)" : "#999999";
  const borderSubtle = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";

  const BLOCKS: {
    num: string;
    label: string;
    area: string;
    objective: string;
    slug: BlockSlug;
  }[] = [
    {
      num: "01",
      label: "CORPUS",
      area: "Functional Training",
      objective:
        "Fondamenti anatomici, biomeccanici e metodologici del movimento funzionale.",
      slug: "corpus",
    },
    {
      num: "02",
      label: "VIS",
      area: "Strength & Conditioning",
      objective:
        "Sviluppo di forza, potenza e condizionamento per l'atleta completo.",
      slug: "vis",
    },
    {
      num: "03",
      label: "VICTOR",
      area: "Business & Performance",
      objective:
        "Formazione completa del professionista: business, branding e performance.",
      slug: "victor",
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="themed-section relative overflow-hidden py-20 md:py-24"
    >
      <div className="absolute inset-0 section-bg-alt" />
      <div className="relative z-10 mx-auto max-w-[1440px] px-[5%] md:px-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-12"
        >
          <span className="label-tag mb-3 block">Il Percorso Formativo</span>
          <h2
            className="text-[clamp(1.7rem,3.5vw,2.8rem)] font-black leading-[1.05] tracking-tight"
            style={{ color: th }}
          >
            Tre blocchi progressivi.
          </h2>
        </motion.div>

        {/* Block rows */}
        <div className="flex flex-col gap-0">
          {BLOCKS.map((b, i) => (
            <motion.div
              key={b.slug}
              initial={{ opacity: 0, y: 18 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.52,
                delay: i * 0.09,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              style={{ borderTop: `1px solid ${borderSubtle}` }}
            >
              <button
                onClick={() => onOpenBlock(b.slug)}
                className="group w-full text-left"
              >
                <div className="flex flex-col gap-4 py-7 sm:flex-row sm:items-center sm:gap-10 transition-opacity duration-200 group-hover:opacity-70">
                  <div
                    className="shrink-0 text-[0.58rem] font-black tracking-[0.38em] tabular-nums uppercase"
                    style={{ color: ts, minWidth: "2rem" }}
                  >
                    {b.num}
                  </div>
                  <div className="shrink-0 sm:w-28">
                    <div
                      className="text-[clamp(1.5rem,2.2vw,2rem)] font-black leading-none tracking-tight"
                      style={{ color: th }}
                    >
                      {b.label}
                    </div>
                  </div>
                  <div className="shrink-0 sm:w-52">
                    <span
                      className="text-[0.68rem] font-bold tracking-[0.2em] uppercase"
                      style={{
                        color: isDark
                          ? "rgba(240,146,38,0.55)"
                          : "rgba(240,146,38,0.7)",
                      }}
                    >
                      {b.area}
                    </span>
                  </div>
                  <p
                    className="flex-1 text-sm leading-relaxed"
                    style={{ color: tb }}
                  >
                    {b.objective}
                  </p>
                  <div
                    className="shrink-0 text-[0.7rem] font-black tracking-[0.18em] uppercase"
                    style={{
                      color: isDark
                        ? "rgba(255,255,255,0.22)"
                        : "rgba(0,0,0,0.22)",
                    }}
                  >
                    Scopri →
                  </div>
                </div>
              </button>
            </motion.div>
          ))}
          <div style={{ borderTop: `1px solid ${borderSubtle}` }} />
        </div>

        {/* Compact info strip — bento style, ~100px height */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.36 }}
          className="mt-5 grid grid-cols-3 gap-[1px]"
          style={{ background: borderSubtle }}
        >
          {/* Masterclass */}
          <div
            className="flex items-center gap-3 px-4 py-3.5"
            style={{
              background: isDark
                ? "rgba(6,6,16,0.95)"
                : "rgba(250,250,252,0.98)",
            }}
          >
            <span
              className="text-[1.5rem] font-black leading-none"
              style={{
                color: isDark ? "rgba(240,146,38,0.75)" : "rgba(200,90,0,0.75)",
              }}
            >
              8
            </span>
            <div>
              <span
                className="text-[0.58rem] font-black tracking-[0.22em] uppercase block"
                style={{
                  color: isDark
                    ? "rgba(240,146,38,0.55)"
                    : "rgba(200,90,0,0.55)",
                }}
              >
                Masterclass
              </span>
              <span
                className="text-[0.54rem] font-bold tracking-[0.15em] uppercase"
                style={{ color: ts }}
              >
                2 incluse in Argento &amp; Oro
              </span>
            </div>
          </div>
          {/* Periodo */}
          <div
            className="flex items-center gap-3 px-4 py-3.5"
            style={{
              background: isDark
                ? "rgba(6,6,16,0.95)"
                : "rgba(250,250,252,0.98)",
            }}
          >
            <span
              className="text-[1.5rem] font-black leading-none"
              style={{ color: th }}
            >
              9
            </span>
            <div>
              <span
                className="text-[0.58rem] font-black tracking-[0.22em] uppercase block"
                style={{ color: ts }}
              >
                Mesi in presenza
              </span>
              <span
                className="text-[0.54rem] font-bold tracking-[0.15em] uppercase"
                style={{ color: ts }}
              >
                Set 2026 → Mag 2027
              </span>
            </div>
          </div>
          {/* Certificazione */}
          <div
            className="flex items-center gap-3 px-4 py-3.5"
            style={{
              background: isDark
                ? "rgba(6,6,16,0.95)"
                : "rgba(250,250,252,0.98)",
            }}
          >
            <span
              className="text-[1.5rem] font-black leading-none"
              style={{
                color: isDark ? "rgba(240,146,38,0.75)" : "rgba(200,90,0,0.75)",
              }}
            >
              ✦
            </span>
            <div>
              <span
                className="text-[0.58rem] font-black tracking-[0.22em] uppercase block"
                style={{
                  color: isDark
                    ? "rgba(240,146,38,0.55)"
                    : "rgba(200,90,0,0.55)",
                }}
              >
                FIPE × Lacertosus
              </span>
              <span
                className="text-[0.54rem] font-bold tracking-[0.15em] uppercase"
                style={{ color: ts }}
              >
                Certificazione ufficiale
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Pack Modal ───────────────────────────────────────────────────────────────

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
  const tier = TIER[pack.slug] ?? TIER.bronzo;
  const teachers = getBundleTeachers();
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);

  const panelLBg = isDark ? "rgba(2,0,32,0.97)" : "rgba(255,255,255,0.99)";
  const panelRBg = isDark ? "rgba(1,0,20,0.98)" : "rgba(244,244,250,0.99)";
  const textH = isDark ? "#ffffff" : "#111111";
  const textB = isDark ? "rgba(180,180,200,0.7)" : "#666666";
  const textSub = isDark ? "rgba(120,120,140,0.7)" : "#aaaaaa";
  const tileBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)";
  const tileBdr = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const statBdr = isDark ? `rgba(${tier.rgb},0.12)` : `rgba(${tier.rgb},0.18)`;
  const closeCl = isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)";
  const closHov = isDark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.85)";
  const inclTxt = isDark ? "rgba(200,200,220,0.8)" : "#444444";
  const overlayBg = isDark ? "rgba(1,0,18,0.88)" : "rgba(0,0,0,0.55)";

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

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[300] flex items-stretch justify-center"
      style={{ background: overlayBg, backdropFilter: "blur(16px)" }}
      onClick={close}
    >
      <div
        ref={panelRef}
        className="relative flex w-full max-w-[1180px] m-auto flex-col lg:flex-row overflow-hidden rounded-sm"
        style={{ border: `1px solid ${tier.color}28`, maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* LEFT */}
        <div
          className="flex flex-col gap-6 overflow-y-auto p-8 lg:w-[44%] lg:p-10"
          style={{ background: panelLBg }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center text-sm font-black"
              style={{ border: `2px solid ${tier.color}60`, color: tier.color }}
            >
              {tier.roman}
            </div>
            <span
              className="text-xs font-black tracking-[0.32em] uppercase"
              style={{ color: tier.color }}
            >
              Pack {tier.label}
            </span>
          </div>
          <div>
            <h2
              className="text-[clamp(1.8rem,3vw,2.6rem)] font-black leading-[0.95] tracking-tight"
              style={{ color: textH }}
            >
              {pack.name}
            </h2>
            <p
              className="mt-2 text-sm leading-relaxed"
              style={{ color: textB }}
            >
              {pack.subtitle}
            </p>
          </div>
          <div>
            <p
              className="mb-3 text-[0.7rem] font-black tracking-[0.3em] uppercase"
              style={{ color: `${tier.color}80` }}
            >
              Cosa include
            </p>
            <ul className="space-y-2.5">
              {pack.includes.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm"
                  style={{ color: inclTxt }}
                >
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    className="mt-0.5 h-4 w-4 shrink-0"
                    style={{ color: tier.color }}
                  >
                    <path
                      d="M13.5 4.5L6 12L2.5 8.5"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="square"
                    />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <button
              onClick={() => onBuy(pack)}
              className="w-full py-3.5 text-center text-sm font-black tracking-[0.18em] uppercase transition-all duration-200"
              style={{
                background: tier.color,
                color: pack.slug === "argento" ? "#111111" : "#010015",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.opacity = "0.88";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.opacity = "1";
              }}
            >
              Scegli {tier.label} →
            </button>
            <p
              className="mt-2 text-center text-[0.68rem]"
              style={{ color: textSub }}
            >
              Nessun pagamento richiesto ora · Completa il profilo per procedere
            </p>
          </div>
          <div>
            <p
              className="mb-4 text-[0.7rem] font-black tracking-[0.3em] uppercase"
              style={{ color: `${tier.color}80` }}
            >
              I Docenti
            </p>
            <div className="space-y-5">
              {BLOCK_SLUGS.map((slug) => (
                <div key={slug}>
                  <p
                    className="mb-2.5 text-[0.65rem] font-black tracking-[0.3em] uppercase"
                    style={{ color: textSub }}
                  >
                    {BLOCK_LABELS[slug]}
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {teachers[slug].map((t) => (
                      <div
                        key={t.slug}
                        className="flex flex-col items-center gap-2 p-3 text-center"
                        style={{
                          background: tileBg,
                          border: `1px solid ${tileBdr}`,
                        }}
                        title={t.role}
                      >
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full text-[0.7rem] font-black"
                          style={{ background: `${t.color}20`, color: t.color }}
                        >
                          {t.image_url ? (
                            <img
                              src={t.image_url}
                              alt={t.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            initials(t.name)
                          )}
                        </div>
                        <div>
                          <p
                            className="text-[0.72rem] font-bold leading-tight"
                            style={{ color: textH }}
                          >
                            {t.name}
                          </p>
                          <p
                            className="mt-0.5 text-[0.6rem] leading-snug line-clamp-2"
                            style={{ color: textSub }}
                          >
                            {t.role}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* RIGHT */}
        <div
          className="relative flex flex-col justify-center lg:w-[56%]"
          style={{ background: panelRBg }}
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: `radial-gradient(ellipse at 60% 40%, rgba(${tier.rgb},0.07) 0%, transparent 65%)`,
            }}
          />
          <div className="relative z-10 p-6 lg:p-10">
            <p
              className="mb-4 text-[0.7rem] font-black tracking-[0.3em] uppercase"
              style={{ color: `${tier.color}80` }}
            >
              L&apos;Academy in 2 minuti
            </p>
            <div
              className="relative w-full overflow-hidden"
              style={{
                paddingBottom: "56.25%",
                background: "#000",
                border: `1px solid ${tier.color}20`,
                boxShadow: `0 0 60px rgba(${tier.rgb},0.08)`,
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
                      background: `rgba(${tier.rgb},0.14)`,
                      border: `1.5px solid rgba(${tier.rgb},0.4)`,
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                      fill={tier.color}
                    >
                      <path d="M8 5.14v14l11-7-11-7z" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                { val: "9", label: "mesi" },
                { val: "100%", label: "in presenza" },
                { val: "33+", label: "docenti" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex flex-col items-center gap-1 p-3 text-center"
                  style={{ border: `1px solid ${statBdr}` }}
                >
                  <span
                    className="text-xl font-black"
                    style={{ color: tier.color }}
                  >
                    {s.val}
                  </span>
                  <span
                    className="text-[0.65rem] font-semibold uppercase tracking-wider"
                    style={{ color: textSub }}
                  >
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <button
          onClick={close}
          className="absolute right-5 top-5 z-20 flex items-center gap-1.5 text-[0.7rem] font-bold tracking-[0.22em] uppercase transition-colors"
          style={{ color: closeCl }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = closHov;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = closeCl;
          }}
        >
          Chiudi <span className="text-lg font-light">×</span>
        </button>
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

function PackCard({
  pack,
  isDark,
  onClick,
}: {
  pack: AcademyProduct;
  isDark: boolean;
  onClick: () => void;
}) {
  const tier = TIER[pack.slug] ?? TIER.bronzo;
  const teachers = getBundleTeachers();
  const totalTeachers = BLOCK_SLUGS.reduce(
    (acc, s) => acc + teachers[s].length,
    0,
  );
  const avatarTeachers = BLOCK_SLUGS.flatMap((s) => teachers[s]).slice(0, 5);
  const isHighlighted = pack.highlighted;
  const priceDisplay = PACK_PRICE_DISPLAY[pack.slug];

  return (
    <div
      data-pack-card
      className="bento-interactive relative flex cursor-pointer flex-col overflow-hidden rounded-sm"
      style={{
        background: isDark
          ? `linear-gradient(160deg, rgba(${tier.rgb},0.06) 0%, rgba(2,0,32,0.95) 100%)`
          : `linear-gradient(160deg, rgba(${tier.rgb},0.08) 0%, rgba(255,255,255,0.98) 100%)`,
        border: isHighlighted
          ? `2px solid ${tier.color}55`
          : `1px solid rgba(${tier.rgb},0.18)`,
        boxShadow: isHighlighted
          ? `0 0 60px rgba(${tier.rgb},0.1), 0 20px 80px rgba(0,0,0,0.3)`
          : undefined,
        transform: isHighlighted ? "scale(1.025)" : undefined,
      }}
      onClick={onClick}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <div
        className="h-0.5 w-full"
        style={{
          background: `linear-gradient(90deg, ${tier.color}, ${tier.color}00)`,
        }}
      />
      {isHighlighted && (
        <div
          className="py-1.5 text-center text-[0.65rem] font-black tracking-[0.25em] uppercase"
          style={{ background: `${tier.color}18`, color: tier.color }}
        >
          Più scelto
        </div>
      )}
      <div className="flex flex-1 flex-col gap-4 p-7 lg:p-8">
        {/* Tier label + roman */}
        <div className="flex items-start justify-between">
          <div>
            <span
              className="text-[0.65rem] font-black tracking-[0.35em] uppercase"
              style={{ color: `${tier.color}80` }}
            >
              Pack
            </span>
            <div
              className="mt-0.5 text-[clamp(2.2rem,3.5vw,3.5rem)] font-black leading-none tracking-tight"
              style={{ color: tier.color }}
            >
              {tier.label}
            </div>
          </div>
          <div
            className="flex h-10 w-10 items-center justify-center text-xl font-black opacity-25"
            style={{ border: `1px solid ${tier.color}`, color: tier.color }}
          >
            {tier.roman}
          </div>
        </div>

        {/* Price + duration */}
        <div className="flex items-end justify-between gap-2">
          <div>
            <div
              className="text-[0.58rem] font-black tracking-[0.25em] uppercase mb-0.5"
              style={{
                color: isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.25)",
              }}
            >
              A partire da
            </div>
            <div
              className="text-[1.6rem] font-black leading-none"
              style={{ color: tier.color }}
            >
              {priceDisplay}
            </div>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <span
              className="text-[0.62rem] font-bold tracking-[0.12em]"
              style={{
                color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)",
              }}
            >
              9 mesi in presenza
            </span>
            <span
              className="text-[0.62rem] font-bold tracking-[0.12em]"
              style={{
                color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)",
              }}
            >
              6 weekend formativi
            </span>
          </div>
        </div>

        {/* Divider */}
        <div
          className="h-px w-full"
          style={{
            background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
          }}
        />

        {/* Subtitle */}
        <p
          className="text-sm leading-relaxed"
          style={{ color: isDark ? "rgba(180,180,190,0.65)" : "#666666" }}
        >
          {pack.subtitle}
        </p>

        {/* Includes */}
        <div className="flex flex-col gap-2">
          {BLOCK_SLUGS.map((slug) => (
            <div key={slug} className="flex items-center gap-2.5">
              <span
                className="h-1 w-1 shrink-0"
                style={{ background: tier.color }}
              />
              <span
                className="text-xs font-bold tracking-[0.18em] uppercase"
                style={{ color: isDark ? "rgba(255,255,255,0.7)" : "#444" }}
              >
                {BLOCK_LABELS[slug]}
              </span>
            </div>
          ))}
          {(pack.masterclassSelectionCount ?? 0) > 0 && (
            <div className="flex items-center gap-2.5">
              <span
                className="h-1 w-1 shrink-0"
                style={{ background: tier.color }}
              />
              <span
                className="text-xs font-bold tracking-[0.18em] uppercase"
                style={{ color: `${tier.color}cc` }}
              >
                {pack.masterclassSelectionCount} Masterclass a scelta
              </span>
            </div>
          )}
          {pack.includesAccommodation && (
            <div className="flex items-center gap-2.5">
              <span
                className="h-1 w-1 shrink-0"
                style={{ background: tier.color }}
              />
              <span
                className="text-xs font-bold tracking-[0.18em] uppercase"
                style={{ color: `${tier.color}cc` }}
              >
                Vitto &amp; Alloggio
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center">
            {avatarTeachers.map((t, i) => (
              <div
                key={t.slug}
                className="flex h-7 w-7 items-center justify-center rounded-full text-[0.55rem] font-black"
                style={{
                  background: `${t.color}22`,
                  border: `1.5px solid ${isDark ? "rgba(1,0,18,0.8)" : "#fff"}`,
                  color: t.color,
                  marginLeft: i === 0 ? 0 : "-8px",
                  zIndex: avatarTeachers.length - i,
                  position: "relative",
                }}
                title={t.name}
              >
                {t.image_url ? (
                  <img
                    src={t.image_url}
                    alt={t.name}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  initials(t.name)
                )}
              </div>
            ))}
            <span
              className="ml-2 text-[0.7rem] font-semibold"
              style={{ color: isDark ? "rgba(180,180,190,0.5)" : "#999" }}
            >
              +{totalTeachers - avatarTeachers.length} docenti
            </span>
          </div>
          <div
            className="text-[0.75rem] font-black tracking-[0.15em] uppercase"
            style={{ color: tier.color }}
          >
            Esplora →
          </div>
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
  const th = isDark ? undefined : "#111111";
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
        <div ref={headRef} className="mb-14">
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
        <div
          className="mt-6 flex items-center gap-3 p-4"
          style={{
            border: "1px solid rgba(212,175,55,0.12)",
            background: isDark
              ? "rgba(212,175,55,0.03)"
              : "rgba(212,175,55,0.04)",
          }}
        >
          <span className="h-1.5 w-1.5 shrink-0 rotate-45 bg-academy-gold" />
          <p className="text-xs" style={{ color: tb }}>
            <span className="font-bold text-academy-gold">
              Certificazione FipexLacertosus
            </span>
            {" — "}inclusa nei pack Argento e Oro. Riconosciuta
            professionalmente a livello nazionale.
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── Masterclass Section — Bento Minimal ─────────────────────────────────────

function MasterclassSection({ isDark }: { isDark: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-60px" });

  const th = isDark ? "#f5f5fa" : "#0a0a1a";
  const tb = isDark ? "rgba(180,180,200,0.65)" : "#555555";
  const ts = isDark ? "rgba(120,120,140,0.5)" : "#888888";
  const borderSubtle = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const cellBg = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.025)";

  const masterclasses = getMasterclassProducts();

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
          className="mb-12"
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

        {/* Bento grid */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {masterclasses.map((product, i) => {
            const workshop = product.workshopSlug
              ? getWorkshopBySlug(product.workshopSlug)
              : undefined;
            const trainerLabel = workshop?.trainerLabel ?? "";
            const isTbd = workshop?.tbd ?? product.priceCents === 0;

            return (
              <motion.div
                key={product.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="flex flex-col"
                style={{
                  background: isTbd ? "transparent" : cellBg,
                  border: `1px solid ${isTbd ? (isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)") : borderSubtle}`,
                  opacity: isTbd ? 0.55 : 1,
                }}
              >
                {/* Top accent */}
                <div
                  className="h-[2px] w-full"
                  style={{
                    background: isDark
                      ? "rgba(255,255,255,0.07)"
                      : "rgba(0,0,0,0.07)",
                  }}
                />

                <div className="flex flex-1 flex-col gap-3 p-5">
                  {/* Number badge */}
                  <div
                    className="text-[0.52rem] font-black tracking-[0.38em] uppercase tabular-nums"
                    style={{ color: ts }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </div>

                  {/* Title */}
                  <div className="flex-1">
                    <h3
                      className="text-[0.9rem] font-black leading-tight"
                      style={{ color: th }}
                    >
                      {product.name}
                    </h3>
                    {trainerLabel && (
                      <p
                        className="mt-1 text-[0.68rem] font-semibold leading-snug"
                        style={{
                          color: isDark
                            ? "rgba(240,146,38,0.65)"
                            : "rgba(180,80,0,0.65)",
                        }}
                      >
                        {trainerLabel}
                      </p>
                    )}
                    <p
                      className="mt-2 text-[0.72rem] leading-relaxed"
                      style={{ color: tb }}
                    >
                      {product.subtitle}
                    </p>
                  </div>

                  {/* Footer */}
                  <div
                    className="flex items-center justify-between pt-3"
                    style={{
                      borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
                    }}
                  >
                    <span
                      className="text-[0.72rem] font-black"
                      style={{
                        color: isDark ? "rgba(255,255,255,0.5)" : "#555",
                      }}
                    >
                      {product.priceCents > 0
                        ? formatPrice(product.priceCents)
                        : "Da definire"}
                    </span>
                    {isTbd ? (
                      <span
                        className="text-[0.6rem] font-bold tracking-[0.15em] uppercase"
                        style={{ color: ts }}
                      >
                        Prossimamente
                      </span>
                    ) : (
                      <button
                        onClick={() => handleBuy(product)}
                        className="text-[0.62rem] font-black tracking-[0.15em] uppercase transition-opacity hover:opacity-60"
                        style={{
                          color: isDark
                            ? "rgba(255,255,255,0.45)"
                            : "rgba(0,0,0,0.4)",
                        }}
                      >
                        Acquista →
                      </button>
                    )}
                  </div>
                </div>
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
          2 Masterclass a scelta incluse nei pack Argento e Oro
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
        <BlockModal slug={openBlock} onClose={() => setOpenBlock(null)} />
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
