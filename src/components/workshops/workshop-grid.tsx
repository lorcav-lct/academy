"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/providers/theme-provider";
import {
  MASTERCLASS_LOCATION,
  PUBLIC_STANDARD_WORKSHOPS,
  type Workshop,
} from "@/lib/constants/workshops";
import { smoothScrollTo } from "@/lib/scroll";
import { getMasterclassProducts } from "@/lib/constants/packs";
import { getTeacherBySlug } from "@/lib/constants/teachers";
import { TeacherPortrait } from "@/components/shared/teacher-portrait";
import { fadeUp, staggerContainer } from "@/lib/animations/variants";
import { usePromoForSlug } from "@/lib/promos/client";
import { computePromoPricing, type PromoRow } from "@/lib/promos/types";
import { PromoCountdown } from "@/components/shared/promo-countdown";
import {
  SalesCountdown,
  SalesExitModal,
  SalesFloatingBar,
  useMasterclassPromo,
} from "./sales-mode";

/* ──────────────────────────────────────────────────────────────
   Sales credentials per masterclass — single source of truth
─────────────────────────────────────────────────────────────── */
type Credential = {
  /** Trainer headline name(s) — bold, big */
  headline: string;
  /** One-line trainer credibility — sells why this trainer */
  pitch: string;
  /** Used in the body — short, sells the deliverable */
  promise: string;
  /** Marquee feature flag — drives the orange gradient card styling */
  featured?: boolean;
  /** Domain tag — eyebrow on the card */
  domain: string;
  /** Distinctive label rendered as a badge — each master has its own identity */
  badge: string;
  /** Tooltip text shown on badge hover — explains why this master is special */
  badgeTooltip: string;
};

const CREDENTIALS: Record<string, Credential> = {
  "master-functional-bulgarian": {
    domain: "Functional × Bulgarian",
    headline: "Ivan Ivanov",
    pitch:
      "Specialista internazionale del metodo bulgaro applicato al functional training.",
    promise:
      "Pattern motori, protocolli del metodo bulgaro e applicazione del functional al massimo livello.",
    featured: true,
    badge: "Iconic",
    badgeTooltip:
      "Ivan Ivanov, founder Suples, è il riferimento internazionale del Bulgarian Bag Training System nel mondo.",
  },
  "master-strength": {
    domain: "Strength Avanzato",
    headline: "Andrea Quarto",
    pitch:
      "Atleta della Nazionale Italiana di Para Powerlifting, ex Ufficiale Incursore, coach di Stato Maggiore Marina Militare.",
    promise:
      "Tecnica avanzata, programmazione e gestione della forza nei massimali e nello sport di prestazione.",
    badge: "Militare",
    badgeTooltip:
      "Coach Ufficiale di Stato Maggiore Marina Militare ed ex Ufficiale Incursore: forza applicata ai contesti più estremi.",
  },
  "master-calcio": {
    domain: "Performance Calcio",
    headline: "Luca Collino",
    pitch:
      "Sport Therapist della Juventus, specializzato nella riatletizzazione e nel ritorno alla massima performance.",
    promise:
      "Prevenzione, recupero e ritorno alla massima performance dei calciatori d'élite. Protocolli applicati sul campo professionistico.",
    featured: true,
    badge: "Juventus",
    badgeTooltip:
      "Sport Therapist della Juventus: protocolli di riatletizzazione applicati sul campo professionistico di Serie A.",
  },
  "master-volley": {
    domain: "S&C Pallavolo",
    headline: "Oscar Berti",
    pitch:
      "Strength & Conditioning Coach di Modena Volley e della Nazionale Italiana di Pallavolo.",
    promise:
      "Il modello S&C di una squadra di SuperLega: forza esplosiva, salto, gestione del carico stagionale.",
    featured: true,
    badge: "SuperLega",
    badgeTooltip:
      "S&C Coach di Modena Volley: il modello fisico di una squadra di vertice della SuperLega italiana.",
  },
  "master-tennis": {
    domain: "Performance Tennis",
    headline: "Ospite internazionale",
    pitch:
      "Programma in costruzione con preparatori atletici di livello internazionale nel tennis.",
    promise:
      "Performance e preparazione atletica nel tennis di alto livello: integrazione di tecnica, fisico e programmazione su atleti d'élite.",
    badge: "Prossimamente",
    badgeTooltip:
      "Faculty in finalizzazione: stiamo selezionando preparatori atletici di livello internazionale nel tennis.",
  },
  "master-running": {
    domain: "Running Performance",
    headline: "Ivan Pellizzari",
    pitch:
      "Tecnico Allenatore della Federazione Italiana Triathlon (F.I.T.R.I.), specialista in running performance.",
    promise:
      "Tecnica, performance e prevenzione infortuni nella corsa: zone, ritmi, periodizzazione e dosaggio della fatica.",
    badge: "Federale",
    badgeTooltip:
      "Tecnico Allenatore F.I.T.R.I. — Federazione Italiana Triathlon: metodologia federale applicata al running.",
  },
  "master-nuoto": {
    domain: "S&C Nuoto",
    headline: "Marco Magnani + Riccardo Aimini",
    pitch:
      "S&C che preparano da oltre un decennio atleti della nazionale italiana di nuoto.",
    promise:
      "Il modello S&C che ha contribuito a Martinenghi (Oro Olimpico Parigi 2024) e ad altri atleti di livello internazionale.",
    featured: true,
    badge: "Olimpico",
    badgeTooltip:
      "S&C Coach FIN: tra gli atleti seguiti Nicolò Martinenghi, Oro Olimpico Parigi 2024 nei 100m rana.",
  },
  "master-rugby": {
    domain: "S&C Rugby",
    headline: "Ospite internazionale",
    pitch:
      "Programma in costruzione con preparatori atletici di livello internazionale.",
    promise:
      "Modello fisico del rugbista moderno: forza, contatto, velocità e prevenzione infortuni nei reparti.",
    badge: "Prossimamente",
    badgeTooltip:
      "Faculty in finalizzazione: stiamo selezionando preparatori atletici di livello internazionale nel rugby.",
  },
  "master-strength-conditioning-int": {
    domain: "International — Strength & Conditioning",
    headline: "Alexander Puig",
    pitch:
      "Certified personal trainer & strength coach: oltre 7 anni di esperienza in strength & conditioning basato sull'evidenza.",
    promise:
      "Metodi di forza e condizionamento science-based e time-tested, applicati alla performance reale sul campo.",
    featured: true,
    badge: "International",
    badgeTooltip:
      "Faculty internazionale: metodi science-based di strength & conditioning dall'esperienza sul campo negli USA.",
  },
};

const STATS = [
  { value: "8", label: "Specializzazioni" },
  { value: "15+", label: "Professionisti" },
  { value: "1-2", label: "Giornate intensive" },
  { value: "100%", label: "In presenza" },
];

const REASONS = [
  {
    number: "01",
    title: "Impara da chi lo fa, non da chi lo racconta.",
    body: "Lo Sport Therapist della Juventus, l'S&C Coach di Modena Volley, un preparatore delle Forze Speciali, i preparatori di nuotatori olimpici e delle Nazionali: portano il campo in aula, condividendo esperienza pratica, protocolli reali e strategie che funzionano davvero.",
  },
  {
    number: "02",
    title: "Quello che i libri non possono insegnare.",
    body: "La differenza tra un coach qualunque e un professionista d'élite sta nei dettagli operativi. Errori reali, protocolli testati sul campo e soluzioni nate dall'esperienza ad alta pressione: tutto ciò che serve per allenare al massimo livello.",
  },
  {
    number: "03",
    title: "Verticale. Intensivo. Trasformativo.",
    body: "Formazione mirata, poche giornate ma totale immersione. Nessun generalismo, nessun rumore di fondo. Un formato che accelera il cambiamento nel modo di pensare, programmare e allenare, portandoti direttamente al livello dei top coach.",
  },
];

/* Featured names rendered as social proof in the hero */
const FEATURED_NAMES = [
  "Luca Collino",
  "Oscar Berti",
  "Ivan Ivanov",
  "Andrea Quarto",
  "Marco Magnani",
  "Antonio Squillante",
];

/* Trainer portraits shown in the desktop hero (right column) — fills the space
   with the actual faculty, the strongest social proof for a masterclass page. */
const HERO_FACULTY: { slug: string; tag: string }[] = [
  { slug: "luca-collino", tag: "Sport Therapist · Juventus" },
  { slug: "oscar-berti", tag: "S&C · Modena Volley" },
  { slug: "andrea-quarto", tag: "Nazionale Para Powerlifting" },
  { slug: "ivan-ivanov", tag: "Founder · Suples" },
];

const ORANGE = "#F09226";
const ORANGE_RGB = "240,146,38";

function formatPriceClean(cents: number): string {
  return `€ ${new Intl.NumberFormat("it-IT").format(Math.round(cents / 100))}`;
}

/** Lowest masterclass price among displayed workshops, with promo applied
 *  where applicable — the "da €" hook for hero and exit modal. */
function getFromPricing(
  workshops: Workshop[] | undefined,
  promo: PromoRow | null,
): { original: number; final: number } | null {
  const list = workshops ?? PUBLIC_STANDARD_WORKSHOPS;
  const products = getMasterclassProducts().filter(
    (p) =>
      p.priceCents > 0 && list.some((w) => w.slug === p.workshopSlug && !w.tbd),
  );
  if (products.length === 0) return null;

  let original = Infinity;
  let final = Infinity;
  for (const p of products) {
    const applies = promo && (promo.slug === null || promo.slug === p.slug);
    const f = applies
      ? computePromoPricing(promo, p.priceCents).final
      : p.priceCents;
    original = Math.min(original, p.priceCents);
    final = Math.min(final, f);
  }
  return { original, final };
}

/* ──────────────────────────────────────────────────────────────
   CATEGORY NAV — Masterclass | International
   Non è un toggle: entrambe le sezioni sono sempre visibili in pagina.
   I due bottoni scrollano (link in-page) alla sezione dedicata; lo stato
   "attivo" segue la sezione correntemente in vista (scrollspy).
─────────────────────────────────────────────────────────────── */
const SECTION_PRO = "tutti-i-master";
const SECTION_INTL = "masterclass-international";

const NAV_ITEMS: { id: string; label: string }[] = [
  { id: SECTION_PRO, label: "Pro" },
  { id: SECTION_INTL, label: "International" },
];

/** Ritorna l'id della sezione correntemente più in vista tra quelle passate. */
function useActiveSection(ids: string[], fallback: string): string {
  const [active, setActive] = useState(fallback);
  const key = ids.join(",");

  useEffect(() => {
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (els.length === 0) return;

    const ratios = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          ratios.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0);
        }
        let best = fallback;
        let bestRatio = -1;
        for (const [id, r] of ratios) {
          if (r > bestRatio) {
            bestRatio = r;
            best = id;
          }
        }
        if (bestRatio > 0) setActive(best);
      },
      { threshold: [0, 0.15, 0.35, 0.6, 1] },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, fallback]);

  return active;
}

function CategoryNav({
  activeId,
  isDark,
  className,
}: {
  activeId: string;
  isDark: boolean;
  className?: string;
}) {
  const trackBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)";
  const trackBorder = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
  const inactiveColor = isDark ? "rgba(180,180,200,0.7)" : "#555555";

  return (
    <nav
      aria-label="Categorie masterclass"
      className={`inline-flex flex-wrap gap-1 p-1 ${className ?? ""}`}
      style={{ background: trackBg, border: `1px solid ${trackBorder}` }}
    >
      {NAV_ITEMS.map((o) => {
        const active = activeId === o.id;
        return (
          <a
            key={o.id}
            href={`#${o.id}`}
            aria-current={active ? "true" : undefined}
            onClick={(e) => {
              e.preventDefault();
              smoothScrollTo(`#${o.id}`, { offset: -70 });
            }}
            className="px-4 py-2.5 text-[0.66rem] font-black uppercase tracking-[0.16em] transition-all duration-200 md:text-[0.72rem] md:tracking-[0.18em]"
            style={
              active
                ? { background: ORANGE, color: "#111" }
                : { color: inactiveColor, background: "transparent" }
            }
          >
            {o.label}
          </a>
        );
      })}
    </nav>
  );
}

/* ──────────────────────────────────────────────────────────────
   HERO FACULTY CLUSTER — desktop-only right column visual
─────────────────────────────────────────────────────────────── */
function HeroFacultyCluster() {
  const items = HERO_FACULTY.map((f) => ({
    ...f,
    teacher: getTeacherBySlug(f.slug),
  })).filter((x) => x.teacher);
  if (items.length === 0) return null;

  return (
    <div className="relative">
      {/* Accent frame */}
      <div
        className="pointer-events-none absolute -left-4 -top-4 h-16 w-16 border-l border-t"
        style={{ borderColor: `rgba(${ORANGE_RGB},0.5)` }}
      />
      <div
        className="pointer-events-none absolute -bottom-4 -right-4 h-16 w-16 border-b border-r"
        style={{ borderColor: `rgba(${ORANGE_RGB},0.5)` }}
      />

      <div className="grid grid-cols-2 items-start gap-4">
        {items.map((it, i) => (
          <div
            key={it.slug}
            className={`relative overflow-hidden ${i % 2 === 1 ? "mt-10" : ""}`}
            style={{ border: `1px solid rgba(${ORANGE_RGB},0.22)` }}
          >
            <TeacherPortrait
              teacher={it.teacher!}
              overlayName
              overlayRole={it.tag}
              sizes="13rem"
              fallbackTheme="dark"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   HERO
─────────────────────────────────────────────────────────────── */
function HeroSection({
  salesMode,
  workshops,
  activeId,
  hasInternational,
}: {
  salesMode?: boolean;
  workshops?: Workshop[];
  activeId: string;
  hasInternational: boolean;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-50px" });
  const promo = useMasterclassPromo();
  const fromPricing = salesMode ? getFromPricing(workshops, promo) : null;
  const heroDiscount =
    !!fromPricing && fromPricing.final < fromPricing.original;
  // Secondary details (description, stats, faculty names) collapsed behind an
  // "Info" toggle to keep the hero clean and conversion-focused.
  const [infoOpen, setInfoOpen] = useState(false);

  // Forced-dark hero (transparent navbar treatment with white nav text)
  const isDark = true;
  const th = "#f5f5fa";
  const tb = "rgba(180,180,200,0.7)";
  const ts = "rgba(140,140,160,0.6)";
  const borderSubtle = "rgba(255,255,255,0.08)";
  const ghost = "rgba(255,255,255,0.03)";

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[92vh] items-center overflow-hidden pt-24"
      style={{ color: th }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 70% 30%, rgba(240,146,38,0.06) 0%, transparent 55%), linear-gradient(180deg, #0a0a0e 0%, #0d0d12 60%, #0a0a0e 100%)",
        }}
      />

      {/* Orange chrome grid + radial vignette (matches home hero) */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(240,146,38,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(240,146,38,0.25) 1px, transparent 1px)",
          backgroundSize: "88px 88px",
          maskImage:
            "radial-gradient(ellipse 60% 58% at 50% 50%, transparent 0%, transparent 55%, rgba(0,0,0,0.4) 72%, black 88%, black 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 60% 58% at 50% 50%, transparent 0%, transparent 55%, rgba(0,0,0,0.4) 72%, black 88%, black 100%)",
        }}
      />
      {/* Soft orange wash on center (matches home hero) */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 55% at 50% 50%, rgba(240,146,38,0.08) 0%, transparent 60%)",
        }}
      />

      {/* Concentric arc top right */}
      <div
        className="pointer-events-none absolute -right-40 -top-40 h-[700px] w-[700px] rounded-full"
        style={{
          border: `70px solid rgba(${ORANGE_RGB},${isDark ? "0.04" : "0.05"})`,
        }}
      />
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-[500px] w-[500px] rounded-full"
        style={{
          border: `1px solid rgba(${ORANGE_RGB},${isDark ? "0.12" : "0.14"})`,
        }}
      />

      {/* Ghost word — bottom */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
        <span
          className="block text-center font-black uppercase tracking-tighter"
          style={{ fontSize: "clamp(64px, 17vw, 220px)", color: ghost }}
        >
          Masterclass
        </span>
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-[5%] py-24 md:px-10 md:py-32">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_26rem] xl:gap-16">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="max-w-3xl"
          >
            {/* Eyebrow */}
            <motion.div
              variants={fadeUp}
              className="mb-7 flex items-center gap-4"
            >
              <div className="h-px w-10" style={{ background: ORANGE }} />
              <span
                className="text-[0.7rem] font-black tracking-[0.34em] uppercase"
                style={{ color: ORANGE }}
              >
                — Specializzazioni Verticali
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              className="font-black tracking-[-0.025em] leading-[0.92]"
              style={{
                fontSize: "clamp(2.6rem, 8vw, 6.4rem)",
                color: th,
              }}
            >
              L&rsquo;ELITE
              <br />
              <span className="gradient-text">IN AULA CON TE.</span>
            </motion.h1>

            {/* Category nav — Masterclass | International (link in-page) */}
            {hasInternational && (
              <motion.div variants={fadeUp} className="mt-8">
                <CategoryNav activeId={activeId} isDark />
              </motion.div>
            )}

            {/* Sales mode — urgency banner: promo price + countdown, sized to content */}
            {salesMode && fromPricing && (
              <motion.div
                variants={fadeUp}
                className="mt-9 inline-flex w-fit max-w-full flex-wrap items-center gap-x-8 gap-y-5 px-5 py-4 md:px-6 md:py-5"
                style={{
                  background: `linear-gradient(135deg, rgba(${ORANGE_RGB},0.12) 0%, rgba(10,10,14,0.9) 70%)`,
                  border: `1px solid rgba(${ORANGE_RGB},0.55)`,
                  boxShadow: `0 0 60px rgba(${ORANGE_RGB},0.1)`,
                }}
              >
                <div>
                  <span
                    className="inline-block px-2 py-0.5 text-[0.56rem] font-black uppercase tracking-[0.26em]"
                    style={{ background: ORANGE, color: "#111" }}
                  >
                    {promo?.name ?? "Offerta a tempo"}
                  </span>
                  <div className="mt-2.5 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                    <span
                      className="text-[0.64rem] font-black uppercase tracking-[0.22em]"
                      style={{ color: tb }}
                    >
                      Masterclass da
                    </span>
                    <span
                      className="font-black leading-none tabular-nums"
                      style={{
                        fontSize: "clamp(1.9rem, 4vw, 2.8rem)",
                        color: ORANGE,
                      }}
                    >
                      {formatPriceClean(fromPricing.final)}
                    </span>
                    {heroDiscount && (
                      <span
                        className="text-[1rem] font-bold tabular-nums line-through"
                        style={{ color: ts }}
                      >
                        {formatPriceClean(fromPricing.original)}
                      </span>
                    )}
                    <span
                      className="text-[0.58rem] font-bold uppercase tracking-[0.16em]"
                      style={{ color: ts }}
                    >
                      IVA incl.
                    </span>
                  </div>
                </div>

                {promo?.ends_at && (
                  <div>
                    <span
                      className="mb-2 block text-[0.58rem] font-black uppercase tracking-[0.26em]"
                      style={{ color: tb }}
                    >
                      L&rsquo;offerta termina in
                    </span>
                    <SalesCountdown endsAt={promo.ends_at} size="md" />
                  </div>
                )}
              </motion.div>
            )}

            {/* CTA row — primary buy + white "Info" toggle */}
            <motion.div
              variants={fadeUp}
              className="mt-9 flex flex-wrap items-center gap-4"
            >
              <a
                href="#tutti-i-master"
                onClick={(e) => {
                  e.preventDefault();
                  smoothScrollTo("#tutti-i-master", { offset: -70 });
                }}
                className="inline-flex items-center gap-3 px-8 py-4 text-[0.8rem] font-black uppercase tracking-[0.16em] transition-all duration-200 hover:opacity-90"
                style={{ background: ORANGE, color: "#111" }}
              >
                <span>Acquista una Masterclass</span>
                <span aria-hidden>↓</span>
              </a>
              <button
                type="button"
                onClick={() => setInfoOpen((v) => !v)}
                aria-expanded={infoOpen}
                aria-controls="hero-info-panel"
                className="inline-flex items-center gap-2.5 px-7 py-4 text-[0.8rem] font-black uppercase tracking-[0.16em] transition-all duration-200 hover:opacity-90"
                style={{ background: "#f5f5fa", color: "#111" }}
              >
                <span>Info</span>
                <span
                  aria-hidden
                  className="text-[1.1rem] leading-none transition-transform duration-300"
                  style={{ transform: infoOpen ? "rotate(45deg)" : "none" }}
                >
                  +
                </span>
              </button>
            </motion.div>

            {/* Collapsible details — description, stats, faculty names */}
            <AnimatePresence initial={false}>
              {infoOpen && (
                <motion.div
                  id="hero-info-panel"
                  key="hero-info-panel"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{
                    duration: 0.42,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                  className="overflow-hidden"
                >
                  {/* Description */}
                  <p
                    className="mt-8 max-w-xl text-[1.05rem] leading-[1.65] md:text-[1.1rem]"
                    style={{ color: th }}
                  >
                    8 masterclass intensive guidate da professionisti che
                    operano ogni giorno sul campo della performance reale.
                    Performance coach di Nazionali, Strength &amp; Conditioning
                    coach di squadre di SuperLega e ricercatori universitari tra
                    i più autorevoli a livello internazionale: un corpo docenti
                    che unisce pratica d&rsquo;élite e ricerca scientifica
                    applicata. Un confronto diretto con chi definisce gli
                    standard del settore, oggi.
                  </p>

                  {/* Stats */}
                  <div className="mt-8 flex flex-wrap gap-3">
                    {STATS.map((s) => (
                      <div
                        key={s.label}
                        className="flex flex-col items-start px-5 py-3"
                        style={{
                          border: `1px solid ${borderSubtle}`,
                          background: isDark
                            ? "rgba(255,255,255,0.03)"
                            : "rgba(0,0,0,0.02)",
                          minWidth: "150px",
                        }}
                      >
                        <span
                          className="text-[1.6rem] font-black leading-none tabular-nums"
                          style={{ color: ORANGE }}
                        >
                          {s.value}
                        </span>
                        <span
                          className="mt-1.5 text-[0.62rem] font-bold uppercase tracking-[0.2em]"
                          style={{ color: ts }}
                        >
                          {s.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Faculty names — social proof */}
                  <div className="mt-8 flex max-w-3xl flex-wrap items-center gap-x-5 gap-y-2.5">
                    <span
                      className="text-[0.6rem] font-black uppercase tracking-[0.32em]"
                      style={{ color: ORANGE }}
                    >
                      In aula
                    </span>
                    {FEATURED_NAMES.map((n, i) => (
                      <span key={n} className="flex items-center gap-5">
                        <span
                          className="text-[0.95rem] font-bold tracking-tight"
                          style={{ color: th }}
                        >
                          {n}
                        </span>
                        {i < FEATURED_NAMES.length - 1 && (
                          <span
                            className="text-[0.7rem] leading-none"
                            style={{ color: ts }}
                          >
                            •
                          </span>
                        )}
                      </span>
                    ))}
                    <span
                      className="text-[0.85rem] font-semibold"
                      style={{ color: tb }}
                    >
                      + altri 8 specialisti
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Scroll indicator */}
            <motion.div
              variants={fadeUp}
              className="mt-14 hidden items-center gap-3 text-[0.62rem] font-bold uppercase tracking-[0.3em] md:flex"
              style={{ color: ts }}
            >
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="h-8 w-px"
                style={{
                  background: `linear-gradient(to bottom, ${ts}, transparent)`,
                }}
              />
              Scopri tutti i Master
            </motion.div>
          </motion.div>

          {/* Faculty visual — desktop only */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.8,
              delay: 0.35,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="hidden lg:block"
          >
            <HeroFacultyCluster />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────
   MANIFESTO — 3 reasons
─────────────────────────────────────────────────────────────── */
function ManifestoSection({ isDark }: { isDark: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  const th = isDark ? "#f5f5fa" : "#0a0a1a";
  const tb = isDark ? "rgba(180,180,200,0.65)" : "#555555";
  const borderSubtle = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const cardBg = isDark ? "rgba(6,6,16,0.55)" : "rgba(250,250,252,0.7)";

  return (
    <section
      ref={sectionRef}
      className="themed-section relative overflow-hidden py-24 md:py-32"
    >
      <div className="absolute inset-0 section-bg-alt" />

      {/* Ambient blobs */}
      <div
        className="pointer-events-none absolute left-1/4 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full"
        style={{
          background: `radial-gradient(circle, rgba(${ORANGE_RGB},0.05) 0%, transparent 70%)`,
          filter: "blur(120px)",
        }}
      />
      <div
        className="pointer-events-none absolute bottom-0 right-1/4 h-[420px] w-[420px] translate-x-1/3 rounded-full"
        style={{
          background: `radial-gradient(circle, rgba(${ORANGE_RGB},0.04) 0%, transparent 70%)`,
          filter: "blur(110px)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-[1440px] px-[5%] md:px-10">
        {/* Header */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mb-14 md:mb-20"
        >
          <motion.div
            variants={fadeUp}
            className="mb-5 flex items-center gap-3"
          >
            <div
              className="h-px w-8"
              style={{ background: `rgba(${ORANGE_RGB},0.55)` }}
            />
            <span
              className="text-[0.7rem] font-black tracking-[0.34em] uppercase"
              style={{ color: ORANGE }}
            >
              — Il Metodo
            </span>
          </motion.div>

          <motion.h2
            variants={fadeUp}
            className="max-w-4xl font-black leading-[0.98] tracking-[-0.025em]"
            style={{ fontSize: "clamp(2rem, 5.2vw, 4.4rem)", color: th }}
          >
            La specializzazione verticale
            <br />
            non è un&rsquo;opzione.{" "}
            <span className="gradient-text">È un vantaggio.</span>
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="mt-6 max-w-2xl text-[1rem] leading-[1.7] md:text-[1.05rem]"
            style={{ color: tb }}
          >
            In un settore saturo di generalisti, a fare la differenza è chi
            sviluppa competenze profonde e realmente applicabili in
            un&rsquo;area specifica della performance. I Masterclass Lacertosus
            nascono con questo obiettivo: portare ogni professionista dentro un
            livello di specializzazione elevato, guidato da chi quel campo lo
            vive e lo definisce ogni giorno.
          </motion.p>
        </motion.div>

        {/* Reasons grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid gap-5 md:grid-cols-3"
        >
          {REASONS.map((r) => (
            <motion.div
              key={r.number}
              variants={fadeUp}
              className="group relative overflow-hidden p-8"
              style={{
                background: cardBg,
                border: `1px solid ${borderSubtle}`,
                backdropFilter: "blur(2px)",
              }}
            >
              {/* Watermark */}
              <span
                className="pointer-events-none absolute -right-2 -top-4 select-none text-[7rem] font-black leading-none"
                style={{
                  color: isDark
                    ? "rgba(255,255,255,0.035)"
                    : "rgba(0,0,0,0.03)",
                }}
              >
                {r.number}
              </span>

              {/* Top accent bar */}
              <div
                className="mb-6 h-[2px] w-10 transition-all duration-500 group-hover:w-16"
                style={{ background: ORANGE }}
              />

              <span
                className="mb-3 block text-[0.62rem] font-black uppercase tracking-[0.34em]"
                style={{ color: `rgba(${ORANGE_RGB},0.7)` }}
              >
                {r.number}
              </span>

              <h3
                className="mb-4 text-[1.1rem] font-black leading-tight tracking-[-0.01em]"
                style={{ color: th }}
              >
                {r.title}
              </h3>

              <p
                className="text-[0.92rem] leading-[1.65]"
                style={{ color: tb }}
              >
                {r.body}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Faculty callout */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          transition={{ delay: 0.45 }}
          className="mt-6 grid grid-cols-1 gap-5 p-7 md:grid-cols-[auto_1fr] md:items-center md:gap-7 md:p-8"
          style={{
            background: isDark
              ? `linear-gradient(135deg, rgba(${ORANGE_RGB},0.09) 0%, rgba(6,6,16,0.85) 100%)`
              : `linear-gradient(135deg, rgba(${ORANGE_RGB},0.07) 0%, rgba(255,255,255,0.95) 100%)`,
            border: `1px solid rgba(${ORANGE_RGB},0.28)`,
          }}
        >
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full"
            style={{
              background: `rgba(${ORANGE_RGB},0.14)`,
              border: `1.5px solid rgba(${ORANGE_RGB},0.45)`,
            }}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill={ORANGE}
              aria-hidden="true"
            >
              <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" />
            </svg>
          </div>
          <div>
            <p
              className="mb-1.5 text-[0.62rem] font-black uppercase tracking-[0.32em]"
              style={{ color: ORANGE }}
            >
              Chi trovi nei Masterclass
            </p>
            <p
              className="text-[0.95rem] leading-[1.7] md:text-[1rem]"
              style={{ color: tb }}
            >
              Lo Sport Therapist della Juventus. L&rsquo;S&amp;C Coach di Modena
              Volley e della Nazionale Italiana. Gli S&amp;C Coach della
              Nazionale di Nuoto. Un preparatore delle Forze Speciali
              dell&rsquo;Esercito. Ricercatori universitari tra i più citati al
              mondo nel loro campo. Non docenti.{" "}
              <span className="font-semibold" style={{ color: th }}>
                Professionisti in attività, ogni giorno, ad alto livello.
              </span>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────
   MASTERCLASS BIG CARD — full hero panel per masterclass
─────────────────────────────────────────────────────────────── */
function MasterclassCard({
  workshop,
  index,
  isDark,
  isInView,
  salesMode,
}: {
  workshop: Workshop;
  index: number;
  isDark: boolean;
  isInView: boolean;
  salesMode?: boolean;
}) {
  const router = useRouter();
  const cred = CREDENTIALS[workshop.slug];
  const product = getMasterclassProducts().find(
    (p) => p.workshopSlug === workshop.slug,
  );
  // Trainer portrait for the listing card — first faculty member, with a
  // brand-logo fallback when the masterclass has no teacher yet.
  const teacher = workshop.teacherSlugs[0]
    ? getTeacherBySlug(workshop.teacherSlugs[0])
    : undefined;
  const cardTeacher = teacher ?? {
    name: cred?.headline ?? workshop.trainerLabel,
    image_url: undefined,
    color: ORANGE,
  };
  const isTbd = workshop.tbd || !product || product.priceCents === 0;
  const featured = cred?.featured;

  // Prezzo mostrato in card solo quando c'è una promo attiva sulla masterclass.
  const promo = usePromoForSlug(product?.slug ?? "");
  const pricing =
    !isTbd && product && promo
      ? computePromoPricing(promo, product.priceCents)
      : null;
  const hasDiscount = !!pricing && pricing.discount > 0;
  const discountPct =
    hasDiscount && pricing
      ? Math.round((pricing.discount / pricing.original) * 100)
      : 0;

  const buyHref = !isTbd && product ? `/checkout?pack=${product.slug}` : null;
  // Card is wrapped in a Link — the buy CTA must intercept and redirect.
  const goToCheckout = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (buyHref) router.push(buyHref);
  };

  const th = isDark ? "#f5f5fa" : "#0a0a1a";
  const tb = isDark ? "rgba(180,180,200,0.65)" : "#555555";
  const ts = isDark ? "rgba(120,120,140,0.5)" : "#888888";
  const borderSubtle = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";

  const cardBg = featured
    ? isDark
      ? `linear-gradient(135deg, rgba(${ORANGE_RGB},0.07) 0%, rgba(6,6,16,0.85) 75%)`
      : `linear-gradient(135deg, rgba(${ORANGE_RGB},0.05) 0%, rgba(255,255,255,0.97) 75%)`
    : isDark
      ? "rgba(6,6,16,0.55)"
      : "rgba(250,250,252,0.7)";

  const cardBorder = featured ? `rgba(${ORANGE_RGB},0.45)` : borderSubtle;

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.65,
        delay: 0.1 + index * 0.06,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="group relative"
    >
      <Link
        href={`/masterclass/${workshop.slug}`}
        className="block overflow-hidden text-left transition-transform duration-300 hover:-translate-y-[2px]"
        style={{
          background: cardBg,
          border: `1px solid ${cardBorder}`,
          backdropFilter: "blur(2px)",
          boxShadow: featured ? `0 0 60px rgba(${ORANGE_RGB},0.06)` : undefined,
        }}
      >
        {/* Top accent gradient bar */}
        <div
          className="h-[2px] w-full"
          style={{
            background: `linear-gradient(90deg, rgba(${ORANGE_RGB},${featured ? "1" : "0.85"}), rgba(${ORANGE_RGB},0.05))`,
          }}
        />

        <div className="relative grid grid-cols-[5.5rem_1fr] items-start gap-x-4 gap-y-5 px-5 py-6 sm:grid-cols-[7rem_1fr] md:grid-cols-[17rem_1fr_auto] md:items-stretch md:gap-x-8 md:gap-y-0 md:p-0">
          {/* Media — trainer portrait. Mobile: compact 4:5 thumbnail. Desktop:
              full-height, flush to the card's left edge; the wide (~4:5) column
              keeps the crop minimal and frames the subject from the top. */}
          <div
            className="relative aspect-[4/5] w-full overflow-hidden md:aspect-auto md:min-h-[18rem]"
            style={{
              borderRight: `1px solid ${featured ? `rgba(${ORANGE_RGB},0.5)` : borderSubtle}`,
            }}
          >
            {cardTeacher.image_url ? (
              <Image
                src={cardTeacher.image_url}
                alt={cardTeacher.name}
                fill
                sizes="(max-width: 768px) 28vw, 17rem"
                className="object-cover object-top"
              />
            ) : (
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(155deg, rgba(${ORANGE_RGB},0.14) 0%, rgba(20,20,24,0.95) 60%, rgba(10,10,14,1) 100%)`,
                }}
              />
            )}
          </div>

          {/* Body */}
          <div className="min-w-0 md:py-9">
            {/* Top row — domain + featured badge + tbd badge */}
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span
                className="text-[0.62rem] font-black uppercase tracking-[0.28em]"
                style={{ color: ORANGE }}
              >
                {cred?.domain ?? "Masterclass"}
              </span>
              {cred?.badge && (
                <span
                  title={cred.badgeTooltip}
                  aria-label={cred.badgeTooltip}
                  className="inline-flex cursor-help items-center gap-1.5 px-2 py-0.5 text-[0.55rem] font-black uppercase tracking-[0.22em]"
                  style={
                    featured
                      ? { background: ORANGE, color: "#111" }
                      : {
                          background: `rgba(${ORANGE_RGB},0.14)`,
                          color: ORANGE,
                          border: `1px solid rgba(${ORANGE_RGB},0.45)`,
                        }
                  }
                >
                  <span
                    className="inline-block h-1 w-1 rounded-full"
                    style={{ background: featured ? "#111" : ORANGE }}
                  />
                  {cred.badge}
                </span>
              )}
              {isTbd && (
                <span
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[0.55rem] font-black uppercase tracking-[0.22em]"
                  style={{
                    border: `1px solid ${borderSubtle}`,
                    color: ts,
                  }}
                >
                  In definizione
                </span>
              )}
            </div>

            {/* Title */}
            <h3
              className="font-black leading-[0.98] tracking-[-0.025em] transition-colors group-hover:text-[#F09226]"
              style={{
                fontSize: "clamp(1.6rem, 3.4vw, 2.6rem)",
                color: th,
              }}
            >
              {workshop.title}
            </h3>

            {/* Trainer headline */}
            <p
              className="mt-3 text-[0.95rem] font-bold leading-snug md:text-[1.05rem]"
              style={{ color: th }}
            >
              {cred?.headline ?? workshop.trainerLabel}
            </p>
            <p
              className="mt-1 max-w-[58ch] text-[0.85rem] leading-[1.55] md:text-[0.9rem]"
              style={{ color: tb }}
            >
              {cred?.pitch ?? ""}
            </p>

            {/* Body promise */}
            <p
              className="mt-4 max-w-[64ch] text-[0.92rem] leading-[1.65] md:text-[0.98rem]"
              style={{ color: tb }}
            >
              {cred?.promise ?? workshop.focus}
            </p>

            {/* Meta — data (se definita) + luogo sempre indicato sotto la data */}
            <div className="mt-5 flex flex-col gap-2.5">
              {workshop.date && workshop.date !== "Da definire" && (
                <div className="flex items-center gap-2">
                  <span
                    className="w-11 shrink-0 text-[0.6rem] font-black uppercase tracking-[0.28em]"
                    style={{ color: ts }}
                  >
                    Data
                  </span>
                  <span
                    className="inline-flex items-center gap-1.5 text-[0.85rem] font-bold tabular-nums"
                    style={{ color: th }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="12"
                      height="12"
                      fill={ORANGE}
                      aria-hidden="true"
                      className="shrink-0"
                    >
                      <path d="M7 2v2H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2H7zm12 7v10H5V9h14z" />
                    </svg>
                    {workshop.date}
                  </span>
                </div>
              )}
              <div className="flex items-start gap-2">
                <span
                  className="w-11 shrink-0 pt-0.5 text-[0.6rem] font-black uppercase tracking-[0.28em]"
                  style={{ color: ts }}
                >
                  Luogo
                </span>
                <span
                  className="inline-flex items-center gap-1.5 text-[0.85rem] font-bold"
                  style={{ color: th }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="12"
                    height="12"
                    fill={ORANGE}
                    aria-hidden="true"
                    className="shrink-0"
                  >
                    <path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
                  </svg>
                  {MASTERCLASS_LOCATION}
                </span>
              </div>
            </div>

            {/* Prezzo promo — visibile solo con promo attiva */}
            {!salesMode && hasDiscount && pricing && (
              <div className="mt-5 flex flex-wrap items-center gap-2.5">
                <span
                  className="px-2 py-0.5 text-[0.55rem] font-black uppercase tracking-[0.22em]"
                  style={{ background: ORANGE, color: "#111" }}
                >
                  {promo?.name ?? "PROMO"}
                </span>
                <span
                  className="text-[0.95rem] font-semibold tabular-nums line-through"
                  style={{ color: ts }}
                >
                  {formatPriceClean(pricing.original)}
                </span>
                <span
                  className="text-[1.35rem] font-black leading-none tabular-nums"
                  style={{ color: th }}
                >
                  {formatPriceClean(pricing.final)}
                </span>
                <span
                  className="text-[0.6rem] font-bold uppercase tracking-[0.16em]"
                  style={{ color: ts }}
                >
                  IVA incl.
                </span>
                <PromoCountdown
                  endsAt={promo?.ends_at}
                  color={ORANGE}
                  mutedColor={ts}
                />
              </div>
            )}
          </div>

          {/* CTA right */}
          <div className="hidden shrink-0 flex-col items-end justify-center gap-2.5 md:flex md:py-9 md:pr-10">
            {salesMode && buyHref && product ? (
              <>
                {/* Prezzo — sopra la CTA */}
                <div className="flex flex-col items-end gap-1.5">
                  <div className="flex items-baseline gap-2.5">
                    {hasDiscount && (
                      <span
                        className="px-1.5 py-0.5 text-[0.58rem] font-black uppercase tracking-[0.18em]"
                        style={{ background: ORANGE, color: "#111" }}
                      >
                        -{discountPct}%
                      </span>
                    )}
                    {hasDiscount && pricing && (
                      <span
                        className="text-[0.95rem] font-bold tabular-nums line-through"
                        style={{ color: ts }}
                      >
                        {formatPriceClean(pricing.original)}
                      </span>
                    )}
                    <span
                      className="font-black leading-none tabular-nums"
                      style={{
                        fontSize: "clamp(3.6rem, 6vw, 5rem)",
                        color: ORANGE,
                      }}
                    >
                      {formatPriceClean(
                        pricing ? pricing.final : product.priceCents,
                      )}
                    </span>
                  </div>
                  <span
                    className="text-[0.56rem] font-bold uppercase tracking-[0.2em]"
                    style={{ color: ts }}
                  >
                    IVA incl.
                  </span>
                </div>

                <span
                  role="button"
                  tabIndex={0}
                  aria-label={`Acquista ${workshop.title}`}
                  onClick={goToCheckout}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") goToCheckout(e);
                  }}
                  className="mt-1 inline-flex items-center gap-2.5 px-7 py-4 text-[0.76rem] font-black uppercase tracking-[0.16em] transition-all duration-200 hover:opacity-90"
                  style={{ background: ORANGE, color: "#111" }}
                >
                  Acquista ora
                  <span aria-hidden>→</span>
                </span>
                <span
                  className="text-[0.58rem] font-bold uppercase tracking-[0.26em]"
                  style={{ color: ts }}
                >
                  Oppure esplora il Master
                </span>
              </>
            ) : (
              <>
                <span
                  className="text-[0.6rem] font-black uppercase tracking-[0.32em]"
                  style={{ color: ts }}
                >
                  Esplora
                </span>
                <div
                  className="flex h-12 w-12 items-center justify-center transition-all duration-300"
                  style={{
                    border: `1.5px solid rgba(${ORANGE_RGB},0.55)`,
                    background: isDark
                      ? `rgba(${ORANGE_RGB},0.05)`
                      : `rgba(${ORANGE_RGB},0.04)`,
                  }}
                >
                  <svg
                    viewBox="0 0 16 16"
                    width="14"
                    height="14"
                    fill={ORANGE}
                    className="transition-transform duration-300 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  >
                    <path d="M5 3l1.4-1.4L13 8l-6.6 6.4L5 13l5-5z" />
                  </svg>
                </div>
              </>
            )}
          </div>

          {/* Mobile CTA */}
          {salesMode && buyHref && product ? (
            <div className="col-span-2 flex flex-col gap-3 pt-1 md:hidden">
              {/* Prezzo — sopra la CTA */}
              <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                {hasDiscount && (
                  <span
                    className="px-1.5 py-0.5 text-[0.58rem] font-black uppercase tracking-[0.18em]"
                    style={{ background: ORANGE, color: "#111" }}
                  >
                    -{discountPct}%
                  </span>
                )}
                {hasDiscount && pricing && (
                  <span
                    className="text-[0.95rem] font-bold tabular-nums line-through"
                    style={{ color: ts }}
                  >
                    {formatPriceClean(pricing.original)}
                  </span>
                )}
                <span
                  className="font-black leading-none tabular-nums"
                  style={{ fontSize: "4rem", color: ORANGE }}
                >
                  {formatPriceClean(
                    pricing ? pricing.final : product.priceCents,
                  )}
                </span>
                <span
                  className="text-[0.56rem] font-bold uppercase tracking-[0.2em]"
                  style={{ color: ts }}
                >
                  IVA incl.
                </span>
              </div>

              <span
                role="button"
                tabIndex={0}
                aria-label={`Acquista ${workshop.title}`}
                onClick={goToCheckout}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") goToCheckout(e);
                }}
                className="inline-flex w-full items-center justify-center gap-2.5 px-6 py-4 text-[0.78rem] font-black uppercase tracking-[0.16em]"
                style={{ background: ORANGE, color: "#111" }}
              >
                Acquista ora
                <span aria-hidden>→</span>
              </span>
              <span
                className="text-[0.6rem] font-bold uppercase tracking-[0.26em] text-center"
                style={{ color: ts }}
              >
                Oppure esplora il Master
              </span>
            </div>
          ) : (
            <div className="col-span-2 flex items-center gap-2 pt-1 md:hidden">
              <span
                className="text-[0.62rem] font-black uppercase tracking-[0.28em]"
                style={{ color: ORANGE }}
              >
                Esplora il Master
              </span>
              <span
                className="text-[0.85rem] font-black"
                style={{ color: ORANGE }}
              >
                →
              </span>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

function MasterclassListSection({
  isDark,
  workshops,
  salesMode,
  sectionId,
  eyebrow,
  title,
  intro,
  bgAlt = false,
}: {
  isDark: boolean;
  workshops?: Workshop[];
  salesMode?: boolean;
  sectionId: string;
  eyebrow: string;
  title: React.ReactNode;
  intro: string;
  bgAlt?: boolean;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const th = isDark ? "#f5f5fa" : "#0a0a1a";
  const tb = isDark ? "rgba(180,180,200,0.65)" : "#555555";

  const sorted = [...(workshops ?? PUBLIC_STANDARD_WORKSHOPS)].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );

  return (
    <section
      ref={sectionRef}
      id={sectionId}
      className="themed-section relative overflow-hidden py-24 md:py-32"
    >
      <div
        className={`absolute inset-0 ${bgAlt ? "section-bg-alt" : "section-bg"}`}
      />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.022]"
        style={{
          backgroundImage: `linear-gradient(to right, ${isDark ? "#fff" : "#000"} 1px, transparent 1px), linear-gradient(to bottom, ${isDark ? "#fff" : "#000"} 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-[1440px] px-[5%] md:px-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-12 md:mb-16"
        >
          <span
            className="mb-5 block text-[0.7rem] font-black uppercase tracking-[0.34em]"
            style={{ color: ORANGE }}
          >
            {eyebrow}
          </span>
          <h2
            className="font-black leading-[0.95] tracking-[-0.03em]"
            style={{ fontSize: "clamp(2.2rem, 5vw, 4.2rem)", color: th }}
          >
            {title}
          </h2>
          <p
            className="mt-6 max-w-2xl text-[1rem] leading-[1.7] md:text-[1.05rem]"
            style={{ color: tb }}
          >
            {intro}
          </p>
        </motion.div>

        {/* Cards */}
        {sorted.length > 0 ? (
          <div className="flex flex-col gap-5 md:gap-6">
            {sorted.map((ws, i) => (
              <MasterclassCard
                key={ws.slug}
                workshop={ws}
                index={i}
                isDark={isDark}
                isInView={isInView}
                salesMode={salesMode}
              />
            ))}
          </div>
        ) : (
          <p
            className="border border-dashed px-6 py-10 text-center text-[0.95rem]"
            style={{
              color: tb,
              borderColor: isDark
                ? "rgba(255,255,255,0.12)"
                : "rgba(0,0,0,0.12)",
            }}
          >
            Nessuna masterclass disponibile in questa categoria al momento.
          </p>
        )}
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────
   FINAL CTA — bridge to /pack
─────────────────────────────────────────────────────────────── */
function FinalCTA({ isDark }: { isDark: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  const th = isDark ? "#f5f5fa" : "#0a0a1a";
  const tb = isDark ? "rgba(180,180,200,0.65)" : "#555555";
  const ts = isDark ? "rgba(120,120,140,0.5)" : "#888888";
  const borderSubtle = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

  return (
    <section
      ref={sectionRef}
      className="themed-section relative overflow-hidden py-24 md:py-32"
    >
      <div className="absolute inset-0 section-bg-alt" />

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 50%, rgba(${ORANGE_RGB},0.07) 0%, transparent 60%)`,
        }}
      />

      <div className="relative z-10 mx-auto max-w-[1100px] px-[5%] text-center md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <span
            className="mb-5 inline-block text-[0.7rem] font-black uppercase tracking-[0.34em]"
            style={{ color: ORANGE }}
          >
            — Massimizza il Valore
          </span>

          <h2
            className="mx-auto max-w-[20ch] font-black leading-[0.98] tracking-[-0.025em]"
            style={{
              fontSize: "clamp(2rem, 5vw, 3.8rem)",
              color: th,
            }}
          >
            Includine 2 nel tuo
            <br />
            <span className="gradient-text">percorso completo.</span>
          </h2>

          <p
            className="mx-auto mt-6 max-w-2xl text-[1rem] leading-[1.7] md:text-[1.05rem]"
            style={{ color: tb }}
          >
            I pack <strong style={{ color: th }}>PRO</strong> e{" "}
            <strong style={{ color: th }}>ELITE</strong> includono 2 Masterclass
            a scelta su 9. Una scelta progettata per costruire una verticalità
            riconoscibile sul mercato.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/pack"
              className="inline-flex items-center justify-between gap-3 px-7 py-4 text-[0.78rem] font-black uppercase tracking-[0.16em] transition-all duration-200 hover:opacity-90"
              style={{ background: ORANGE, color: "#111" }}
            >
              <span>Confronta i pack</span>
              <span aria-hidden className="text-base">
                →
              </span>
            </Link>
            <Link
              href="#tutti-i-master"
              onClick={(e) => {
                e.preventDefault();
                smoothScrollTo("#tutti-i-master", { offset: -70 });
              }}
              className="inline-flex items-center justify-center gap-2 px-6 py-4 text-[0.74rem] font-bold uppercase tracking-[0.18em] transition-opacity hover:opacity-70"
              style={{
                color: th,
                border: `1px solid ${borderSubtle}`,
              }}
            >
              <span>Torna ai Master</span>
            </Link>
          </div>

          {/* Mini stats strip */}
          <div
            className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-[1px] sm:grid-cols-3"
            style={{ background: borderSubtle }}
          >
            {[
              { v: "8", l: "Masterclass disponibili" },
              { v: "2", l: "Inclusi in PRO &amp; ELITE" },
              { v: "€ 500", l: "Acquisto singolo (da)" },
            ].map((s) => (
              <div
                key={s.l}
                className="flex flex-col items-center gap-1 px-5 py-5"
                style={{
                  background: isDark
                    ? "rgba(6,6,16,0.92)"
                    : "rgba(250,250,252,0.96)",
                }}
              >
                <span
                  className="text-[1.6rem] font-black leading-none tabular-nums"
                  style={{ color: ORANGE }}
                >
                  {s.v}
                </span>
                <span
                  className="text-[0.58rem] font-bold uppercase tracking-[0.22em]"
                  style={{ color: ts }}
                  dangerouslySetInnerHTML={{ __html: s.l }}
                />
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────
   ENTRY
─────────────────────────────────────────────────────────────── */
export function WorkshopGrid({
  workshops,
  internationalWorkshops,
  salesMode,
}: {
  workshops?: Workshop[];
  internationalWorkshops?: Workshop[];
  salesMode?: boolean;
} = {}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const promo = useMasterclassPromo();

  const hasInternational = (internationalWorkshops?.length ?? 0) > 0;
  // Entrambe le sezioni sono sempre in pagina: i selettori sono link in-page,
  // lo stato "attivo" segue la sezione in vista (scrollspy).
  const activeId = useActiveSection(
    hasInternational ? [SECTION_PRO, SECTION_INTL] : [SECTION_PRO],
    SECTION_PRO,
  );

  // Sales-mode urgency (hero banner / floating bar / exit modal) è guidato dalla
  // promo Masterclass Pro; non riguarda le Masterclass International.
  const fromPricing = salesMode ? getFromPricing(workshops, promo) : null;

  return (
    <>
      <HeroSection
        salesMode={salesMode}
        workshops={workshops}
        activeId={activeId}
        hasInternational={hasInternational}
      />
      <ManifestoSection isDark={isDark} />
      <MasterclassListSection
        isDark={isDark}
        workshops={workshops}
        salesMode={salesMode}
        sectionId={SECTION_PRO}
        eyebrow="— Tutti i Masterclass"
        title={
          <>
            Otto verticali.
            <br />
            <span className="gradient-text">Otto modi</span> di diventare il
            riferimento.{" "}
          </>
        }
        intro="Ogni Masterclass è acquistabile separatamente o inclusa nel pacchetto PRO/ELITE (2 a scelta). Verticali nel dominio, intensivi nel formato, applicabili dal lunedì successivo."
      />
      <FinalCTA isDark={isDark} />
      {hasInternational && (
        <MasterclassListSection
          isDark={isDark}
          workshops={internationalWorkshops}
          sectionId={SECTION_INTL}
          eyebrow="— Masterclass International"
          title={
            <>
              L&rsquo;élite{" "}
              <span className="gradient-text">internazionale</span>
              <br />
              in aula con te.
            </>
          }
          intro="Masterclass guidate da coach e specialisti internazionali. Un percorso a sé: acquisto singolo, non incluso nei pack. Formazione in presenza con i riferimenti mondiali dello strength & conditioning."
        />
      )}
      {salesMode && (
        <>
          <SalesFloatingBar promo={promo} />
          <SalesExitModal
            promo={promo}
            fromPriceCents={fromPricing?.final ?? null}
          />
        </>
      )}
    </>
  );
}
