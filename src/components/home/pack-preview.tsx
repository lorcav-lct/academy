"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/providers/theme-provider";
import { getBundles, type AcademyProduct } from "@/lib/constants/packs";
import { getTeachersByCourse, type Teacher } from "@/lib/constants/teachers";
import { MasterclassSelector } from "@/components/packs/masterclass-selector";
import { ProgramAccordion } from "@/components/packs/program-accordion";
import { CertificationsCards } from "@/components/shared/certifications-cards";
import { TeacherPortrait } from "@/components/shared/teacher-portrait";
import { PUBLIC_WORKSHOPS as WORKSHOPS } from "@/lib/constants/workshops";
import { createClient } from "@/lib/supabase/client";

// ─── Constants (mirror /pack page, simplified — no price) ───────────────────

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

const BLOCK_SLUGS = ["function", "strength", "science"] as const;
const BLOCK_LABELS: Record<string, string> = {
  function: "FUNCTION",
  strength: "STRENGTH",
  science: "SCIENCE",
};

function getBundleTeachers(): Record<string, Teacher[]> {
  return {
    function: getTeachersByCourse("function"),
    strength: getTeachersByCourse("strength"),
    science: getTeachersByCourse("science"),
  };
}

// ─── Card copy ───────────────────────────────────────────────────────────────

type HeroExtraIcon = "bed" | "masterclass";

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
    ctaLabel: "Scopri START",
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
    ctaLabel: "Scopri PRO",
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
    ctaLabel: "Scopri ELITE",
  },
};

// ─── Modal copy ──────────────────────────────────────────────────────────────

type ModalCopy = {
  eyebrow: string;
  headline: string;
  promise: string;
  guarantees: { label: string; sub: string }[];
};

const MODAL_COPY: Record<string, ModalCopy> = {
  start: {
    eyebrow: "Edizione 2026/27",
    headline: "Costruisci le fondamenta di un vero professionista del fitness.",
    promise:
      "9 mesi di formazione in presenza con i migliori docenti italiani. Tre blocchi progressivi e attestazione Functional Strength Master Coach a fine percorso.",
    guarantees: [
      { label: "Master Coach", sub: "Functional Strength · Lacertosus" },
      { label: "33+ docenti", sub: "Tutti professionisti attivi" },
      { label: "Materiale a vita", sub: "Slide, registrazioni, schede" },
    ],
  },
  pro: {
    eyebrow: "Edizione 2026/27",
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
    eyebrow: "Edizione 2026/27",
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

// ─── Pack Modal — mirror /pack modal, without price ─────────────────────────

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
  const totalTeachers = BLOCK_SLUGS.reduce(
    (acc, s) => acc + teachers[s].length,
    0,
  );

  // ── Mixed theme palette (mirror /pack modal) ────────────────────────
  const isProSlug = pack.slug === "pro";
  const isEliteSlug = pack.slug === "elite";

  const modalBg = isEliteSlug ? "#0a0a14" : "rgb(43 43 43 / 94%)";
  const stickyBarBg = isEliteSlug
    ? "rgba(10,10,20,0.92)"
    : "rgb(43 43 43 / 92%)";

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

  // Light tokens (value stack, guarantees, faculty)
  const lightBg = "#F8F8FA";
  const lightSurface = "#ffffff";
  const lightBorder = "rgba(17,17,17,0.09)";
  const lightTextH = "#111111";
  const lightTextB = "rgba(17,17,17,0.66)";
  const lightTextMuted = "rgba(17,17,17,0.45)";

  const ORANGE = "#F09226";
  const ORANGE_RGB = "240,146,38";

  void isProSlug;
  void isDark;

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
          {/* ── 1. HERO — eyebrow + headline + promise + CTA (no price) ── */}
          <section
            className="relative px-6 md:px-10 pt-8 pb-9 md:pt-10 md:pb-12"
            style={{
              background:
                "radial-gradient(ellipse at 50% 0%, rgba(240,146,38,0.07) 0%, transparent 60%)",
            }}
          >
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

            <h2
              className="font-black tracking-[-0.025em] leading-[1.02] text-[clamp(1.7rem,3.4vw,2.6rem)] max-w-[24ch]"
              style={{ color: textH }}
            >
              {copy.headline}
            </h2>

            <p
              className="mt-5 text-[0.95rem] md:text-[1rem] leading-[1.65] max-w-[58ch]"
              style={{ color: textB }}
            >
              {copy.promise}
            </p>

            {/* CTA — no price */}
            <div className="mt-7">
              <button
                onClick={() => onBuy(pack)}
                className="inline-flex items-center justify-between gap-3 px-6 py-4 text-[0.78rem] font-black tracking-[0.16em] uppercase transition-all duration-200 hover:opacity-90"
                style={{ background: ORANGE, color: "#111111" }}
              >
                <span>Scegli {tier.label}</span>
                <span aria-hidden className="text-base">
                  →
                </span>
              </button>
            </div>
          </section>

          {/* ── 2. VIDEO inline ─────────────────────────────────── */}
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

          {/* ── 3. VALUE STACK — LIGHT ─────────────────────────── */}
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

            <div className="mt-7">
              <ProgramAccordion scopeId={`home-pack-${pack.slug}`} />
            </div>

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

          {/* ── 3b. ELITE EXCLUSIVE — Vitto & Alloggio luxury ── */}
          {isElite && (
            <section
              className="relative overflow-hidden px-6 md:px-10 py-14 md:py-20"
              style={{
                background: `${BRUSHED_STEEL_OVERLAY}, linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 60%, #1a1a1a 100%)`,
                borderTop: `1px solid ${surfaceBorderStrong}`,
                borderBottom: `1px solid ${surfaceBorderStrong}`,
              }}
            >
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

          {/* ── 4. GUARANTEES — LIGHT ────────────────────────── */}
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

          {/* ── 4b. MASTERCLASS — LIGHT (solo PRO / ELITE) ───────────── */}
          {(pack.masterclassSelectionCount ?? 0) > 0 && (
            <section
              className="px-6 md:px-10 py-10 md:py-14"
              style={{
                background: lightSurface,
                borderTop: `1px solid ${lightBorder}`,
              }}
            >
              <div className="mb-7">
                <p
                  className="mb-2 text-[0.6rem] font-black tracking-[0.3em] uppercase"
                  style={{ color: ORANGE }}
                >
                  — Le Masterclass
                </p>
                <h3
                  className="font-black tracking-[-0.02em] leading-[1.05] text-[clamp(1.3rem,2.4vw,1.9rem)]"
                  style={{ color: lightTextH }}
                >
                  {pack.masterclassSelectionCount} a scelta su{" "}
                  {WORKSHOPS.length} specializzazioni.
                </h3>
                <p
                  className="mt-3 max-w-[58ch] text-[0.88rem] leading-[1.6]"
                  style={{ color: lightTextMuted }}
                >
                  Sessioni esclusive con i top trainer della community.
                  Personalizza il tuo percorso scegliendo le specializzazioni
                  che disegnano la tua identità professionale.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {WORKSHOPS.map((w, i) => (
                  <div
                    key={w.slug}
                    className="group relative flex items-start gap-3.5 p-4 transition-colors"
                    style={{
                      background: lightBg,
                      border: `1px solid ${lightBorder}`,
                    }}
                  >
                    {/* Index */}
                    <span
                      className="shrink-0 text-[0.62rem] font-black tracking-[0.18em] tabular-nums leading-none mt-1"
                      style={{ color: ORANGE }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4
                          className="text-[0.92rem] font-black leading-[1.2] tracking-[-0.01em]"
                          style={{ color: lightTextH }}
                        >
                          {w.title}
                        </h4>
                        {w.tbd && (
                          <span
                            className="shrink-0 px-1.5 py-0.5 text-[0.5rem] font-black tracking-[0.18em] uppercase"
                            style={{
                              border: `1px solid ${lightBorder}`,
                              color: lightTextMuted,
                            }}
                          >
                            TBD
                          </span>
                        )}
                      </div>
                      <p
                        className="mt-1 text-[0.72rem] leading-snug font-semibold"
                        style={{ color: ORANGE }}
                      >
                        {w.trainerLabel}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── 5. FACULTY — LIGHT ────────────────────────── */}
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
                    className="mb-4 text-[0.62rem] font-black tracking-[0.3em] uppercase"
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

          {/* ── 6. FINAL CTA — DARK (no price) ─────────────── */}
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
              Inizia il percorso{" "}
              <span style={{ color: ORANGE }}>{tier.label}</span>.
            </h3>
            <p
              className="mt-4 mx-auto max-w-[44ch] text-[0.85rem] leading-[1.6]"
              style={{ color: textB }}
            >
              Una decisione. 9 mesi di formazione in presenza con i migliori
              docenti del settore.
            </p>
            <div className="mt-7 flex flex-col items-center gap-2.5">
              <button
                onClick={() => onBuy(pack)}
                className="inline-flex items-center justify-between gap-3 px-7 py-4 text-[0.78rem] font-black tracking-[0.16em] uppercase transition-all duration-200 hover:opacity-90 min-w-[280px]"
                style={{ background: ORANGE, color: "#111111" }}
              >
                <span>Scegli {tier.label}</span>
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

        {/* ════ STICKY BOTTOM BAR (no price) ════ */}
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
              className="text-[0.55rem] font-bold tracking-[0.18em] uppercase"
              style={{ color: textMuted }}
            >
              Pack
            </span>
            <span
              className="text-[1.05rem] font-black leading-none tracking-[-0.01em]"
              style={{ color: textH }}
            >
              {tier.label}
            </span>
          </div>
          <button
            onClick={() => onBuy(pack)}
            className="shrink-0 inline-flex items-center gap-2 px-4 sm:px-5 py-3 text-[0.7rem] font-black tracking-[0.14em] uppercase transition-opacity hover:opacity-90"
            style={{ background: ORANGE, color: "#111111" }}
          >
            <span>Scegli {tier.label}</span>
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

// ─── Hero extra icon glyphs ──────────────────────────────────────────────────

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
  // masterclass — graduation cap
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

// ─── Pack Card — mirror /pack card, NO PRICE ────────────────────────────────

function PackCard({
  pack,
  isDark,
  onClick,
}: {
  pack: AcademyProduct;
  isDark: boolean;
  onClick: () => void;
}) {
  void isDark;
  const tier = TIER[pack.slug] ?? TIER.start;
  const isHighlighted = pack.highlighted;
  const copy = CARD_COPY[pack.slug] ?? CARD_COPY.start;
  const isPro = pack.slug === "pro";
  const isElite = pack.slug === "elite";
  const isStart = pack.slug === "start";

  /* ── Theme tokens per tier (mirror /pack) ─────────────────────── */
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
      {!isPro && (
        <div
          className="h-0.5 w-full"
          style={{
            background: `linear-gradient(90deg, ${bodyAccent}, ${bodyAccent}00)`,
          }}
        />
      )}

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

      {/* ═══════════ HEAD ════════════ */}
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

      {/* ═══════════ BODY (NO PRICE) ════════════ */}
      <div className="flex flex-1 flex-col gap-5 p-7 lg:p-8">
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
                    border: `1.5px solid rgba(240,146,38,0.55)`,
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

        {/* ── HERO EXTRAS — dark premium callouts (PRO/ELITE) ─── */}
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
                : "Inclusi"}
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

        {/* ── CTA full-width (no price) ────────────────────── */}
        <div
          className="mt-auto pt-2"
          style={{ borderTop: `1px solid ${bodyDivider}` }}
        >
          <button
            type="button"
            className="mt-5 w-full inline-flex items-center justify-between gap-2 px-5 py-3.5 text-[0.78rem] font-black tracking-[0.14em] uppercase transition-opacity duration-200 hover:opacity-88"
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

// ─── Main export ──────────────────────────────────────────────────────────────

export function PackPreview() {
  const router = useRouter();
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const { theme } = useTheme();
  const d = theme === "dark";

  const [activeModal, setActiveModal] = useState<AcademyProduct | null>(null);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [selectedPack, setSelectedPack] = useState<AcademyProduct | null>(null);

  const bundles = getBundles();

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
        const [c0, c1, c2] = cardEls; // START · PRO · ELITE

        gsap.set(cardEls, { opacity: 0 });

        ScrollTrigger.create({
          trigger: cardsRef.current,
          start: "top 92%",
          once: true,
          onEnter: () => {
            const isMobile = window.innerWidth < 981;

            if (isMobile) {
              const order = [c1, c0, c2];
              order.forEach((el, i) => {
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

  const th = d ? "#f5f5fa" : "#111111";
  const tb = d ? "#c7c7cc" : "#555555";

  return (
    <>
      <section
        ref={sectionRef}
        id="pack"
        className="themed-section relative overflow-hidden py-24 md:py-32"
      >
        <div className="absolute inset-0 section-bg-alt" />
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(ellipse, rgba(240,146,38,0.03) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 mx-auto max-w-[1440px] px-[5%] md:px-10">
          {/* Header */}
          <div ref={headRef} className="mb-14">
            <span className="label-tag mb-3 block">I Pacchetti Formativi</span>
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <h2
                className="text-[clamp(1.9rem,4vw,3.5rem)] font-black leading-[1.05] tracking-tight"
                style={{ color: th }}
              >
                Costruisci il tuo{" "}
                <span className="gradient-text">percorso.</span>
              </h2>
              <p
                className="max-w-sm text-sm leading-relaxed text-academy-gray-400"
                style={{ color: tb }}
              >
                Tre livelli di accesso allo stesso percorso d&apos;eccellenza.
                Clicca su un pack per scoprire tutti i dettagli.
              </p>
            </div>
          </div>

          {/* Cards */}
          <div
            ref={cardsRef}
            className="grid gap-4 min-[981px]:grid-cols-3"
            style={{ perspective: "1200px" }}
          >
            {bundles.map((pack) => (
              <PackCard
                key={pack.slug}
                pack={pack}
                isDark={d}
                onClick={() => setActiveModal(pack)}
              />
            ))}
          </div>

          {/* Certifications block — rich shared component */}
          <div className="mt-12 md:mt-16">
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
            </div>
            <CertificationsCards isDark={d} />
          </div>
        </div>
      </section>

      {/* Modal */}
      {activeModal && (
        <PackModal
          pack={activeModal}
          isDark={d}
          onClose={() => setActiveModal(null)}
          onBuy={handleBuy}
        />
      )}

      {/* Masterclass selector (for PRO/ELITE) */}
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
