"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { useTheme } from "@/components/providers/theme-provider";
import { PUBLIC_WORKSHOPS, type Workshop } from "@/lib/constants/workshops";
import { getPublicMasterclassProducts } from "@/lib/constants/packs";
import { fadeUp, staggerContainer } from "@/lib/animations/variants";

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
  /** Marquee feature flag — only top 2-3 deserve this */
  featured?: boolean;
  /** Domain tag — eyebrow on the card */
  domain: string;
};

const CREDENTIALS: Record<string, Credential> = {
  "master-functional-bulgarian": {
    domain: "Functional × Bulgarian",
    headline: "Ivan Ivanov + Pierluigi Mauro",
    pitch:
      "Specialista internazionale del metodo bulgaro × pioniere italiano di Macebell e Clubbell.",
    promise:
      "Pattern motori, protocolli del metodo bulgaro e applicazione del functional al massimo livello.",
    featured: true,
  },
  "master-strength": {
    domain: "Strength Avanzato",
    headline: "Andrea Quarto",
    pitch:
      "Atleta della Nazionale Italiana di Para Powerlifting, ex Ufficiale Incursore, coach di Stato Maggiore Marina Militare.",
    promise:
      "Tecnica avanzata, programmazione e gestione della forza nei massimali e nello sport di prestazione.",
  },
  "master-calcio": {
    domain: "Performance Calcio",
    headline: "Luca Collino",
    pitch:
      "Sport Therapist della Juventus, specializzato nella riatletizzazione e nel ritorno alla massima performance.",
    promise:
      "Prevenzione, recupero e ritorno alla massima performance dei calciatori d'élite. Protocolli applicati sul campo professionistico.",
    featured: true,
  },
  "master-volley": {
    domain: "S&C Pallavolo",
    headline: "Oscar Berti",
    pitch:
      "Strength & Conditioning Coach di Modena Volley e della Nazionale Italiana di Pallavolo.",
    promise:
      "Il modello S&C di una squadra di SuperLega: forza esplosiva, salto, gestione del carico stagionale.",
    featured: true,
  },
  "master-hyrox": {
    domain: "Hyrox",
    headline: "Faculty da definire",
    pitch:
      "Programma in costruzione con specialisti riconosciuti nella preparazione Hyrox.",
    promise:
      "Strutturare una preparazione Hyrox completa: stazioni, transizioni e gestione del pacing in gara.",
  },
  "master-running": {
    domain: "Running Performance",
    headline: "Ivan Pellizzari",
    pitch:
      "Tecnico Allenatore della Federazione Italiana Triathlon (F.I.T.R.I.), specialista in running performance.",
    promise:
      "Tecnica, performance e prevenzione infortuni nella corsa: zone, ritmi, periodizzazione e dosaggio della fatica.",
  },
  "master-nuoto": {
    domain: "S&C Nuoto",
    headline: "Marco Magnani + Riccardo Aimini",
    pitch:
      "Strength & Conditioning Coach della Federazione Italiana Nuoto. Oltre un decennio nella Nazionale.",
    promise:
      "Il modello S&C che ha contribuito a Martinenghi (Oro Olimpico Parigi 2024), Rivolta (Mondiale vasca corta) e atleti di livello internazionale.",
    featured: true,
  },
  "master-rugby": {
    domain: "S&C Rugby",
    headline: "Faculty da definire",
    pitch:
      "Programma in costruzione con preparatori atletici di livello internazionale.",
    promise:
      "Modello fisico del rugbista moderno: forza, contatto, velocità e prevenzione infortuni nei reparti.",
  },
  "master-sport-combattimento": {
    domain: "Combat Sports",
    headline: "Faculty da definire",
    pitch:
      "Programma in costruzione con preparatori di MMA, boxe e arti marziali.",
    promise:
      "Forza esplosiva, condizionamento metabolico e gestione del peso per fight night al massimo della forma.",
  },
};

const STATS = [
  { value: "9", label: "Specializzazioni" },
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

const ORANGE = "#F09226";
const ORANGE_RGB = "240,146,38";

/* Format like "€ 500" (no decimals, with space) — matches Pack page */
function formatPriceClean(cents: number): string {
  const v = Math.round(cents / 100);
  return `€ ${new Intl.NumberFormat("it-IT").format(v)}`;
}

/* ──────────────────────────────────────────────────────────────
   HERO
─────────────────────────────────────────────────────────────── */
function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-50px" });

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
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="max-w-4xl"
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

          {/* Subline */}
          <motion.p
            variants={fadeUp}
            className="mt-7 max-w-xl text-[1.05rem] leading-[1.65] md:text-[1.1rem]"
            style={{ color: tb }}
          >
            9 masterclass intensive guidate da professionisti che operano ogni
            giorno sul campo della performance reale. Performance coach di
            Nazionali, Strength &amp; Conditioning coach di squadre di SuperLega
            e ricercatori universitari tra i più autorevoli a livello
            internazionale: un corpo docenti che unisce pratica d&rsquo;élite e
            ricerca scientifica applicata. Un confronto diretto con chi
            definisce gli standard del settore, oggi.
          </motion.p>

          {/* Stats */}
          <motion.div variants={fadeUp} className="mt-10 flex flex-wrap gap-3">
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
          </motion.div>

          {/* Headline names — social proof */}
          <motion.div
            variants={fadeUp}
            className="mt-10 flex max-w-3xl flex-wrap items-center gap-x-5 gap-y-2.5"
          >
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
              + altri 9 specialisti
            </span>
          </motion.div>

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
            style={{
              fontSize: "clamp(2rem, 5.2vw, 4.4rem)",
              color: th,
            }}
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
}: {
  workshop: Workshop;
  index: number;
  isDark: boolean;
  isInView: boolean;
}) {
  const cred = CREDENTIALS[workshop.slug];
  const product = getPublicMasterclassProducts().find(
    (p) => p.workshopSlug === workshop.slug,
  );
  const isTbd = workshop.tbd || !product || product.priceCents === 0;
  const featured = cred?.featured;
  const num = String(index + 1).padStart(2, "0");

  const th = isDark ? "#f5f5fa" : "#0a0a1a";
  const tb = isDark ? "rgba(180,180,200,0.65)" : "#555555";
  const ts = isDark ? "rgba(120,120,140,0.5)" : "#888888";
  const borderSubtle = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const numFaint = isDark
    ? `rgba(${ORANGE_RGB},0.18)`
    : `rgba(${ORANGE_RGB},0.32)`;

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

        <div className="relative grid grid-cols-1 items-start gap-5 px-6 py-7 md:grid-cols-[auto_1fr_auto] md:gap-10 md:px-10 md:py-9 md:items-center">
          {/* Numeral block */}
          <div className="flex items-baseline gap-3 md:flex-col md:items-start md:gap-1">
            <span
              className="font-black leading-[0.85] tabular-nums tracking-[-0.04em]"
              style={{
                fontSize: "clamp(3.6rem, 7vw, 6rem)",
                color: numFaint,
                textShadow: featured
                  ? `0 0 40px rgba(${ORANGE_RGB},0.18)`
                  : `0 0 40px rgba(${ORANGE_RGB},0.06)`,
              }}
            >
              {num}
            </span>
            <span
              className="text-[0.6rem] font-black uppercase tracking-[0.32em]"
              style={{ color: ts }}
            >
              Master
            </span>
          </div>

          {/* Body */}
          <div className="min-w-0">
            {/* Top row — domain + featured badge + tbd badge */}
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span
                className="text-[0.62rem] font-black uppercase tracking-[0.28em]"
                style={{ color: ORANGE }}
              >
                {cred?.domain ?? "Masterclass"}
              </span>
              {featured && (
                <span
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[0.55rem] font-black uppercase tracking-[0.22em]"
                  style={{
                    background: ORANGE,
                    color: "#111",
                  }}
                >
                  <span
                    className="inline-block h-1 w-1 rounded-full"
                    style={{ background: "#111" }}
                  />
                  Top
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

            {/* Stats inline */}
            <div className="mt-5 flex flex-wrap items-center gap-2">
              {[
                { v: workshop.duration, l: "" },
                { v: workshop.date, l: "" },
                {
                  v: cred?.headline?.includes("+") ? "2 trainer" : "1 trainer",
                  l: "",
                },
              ].map((s, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[0.6rem] font-bold uppercase tracking-[0.18em] md:text-[0.62rem]"
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
              {!isTbd && product && (
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[0.6rem] font-bold uppercase tracking-[0.18em] md:text-[0.62rem]"
                  style={{
                    border: `1px solid rgba(${ORANGE_RGB},0.45)`,
                    background: `rgba(${ORANGE_RGB},0.08)`,
                    color: ORANGE,
                  }}
                >
                  <span className="font-black tabular-nums">
                    {formatPriceClean(product.priceCents)}
                  </span>
                  <span style={{ opacity: 0.7 }}>singola</span>
                </span>
              )}
            </div>
          </div>

          {/* CTA right */}
          <div className="hidden shrink-0 flex-col items-end gap-2 md:flex">
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
          </div>

          {/* Mobile CTA */}
          <div className="flex items-center gap-2 pt-1 md:hidden">
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
        </div>
      </Link>
    </motion.div>
  );
}

function MasterclassListSection({ isDark }: { isDark: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const th = isDark ? "#f5f5fa" : "#0a0a1a";
  const tb = isDark ? "rgba(180,180,200,0.65)" : "#555555";

  const sorted = [...PUBLIC_WORKSHOPS].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );

  return (
    <section
      ref={sectionRef}
      className="themed-section relative overflow-hidden py-24 md:py-32"
    >
      <div className="absolute inset-0 section-bg" />

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
            — Tutti i Masterclass
          </span>
          <h2
            className="font-black leading-[0.95] tracking-[-0.03em]"
            style={{
              fontSize: "clamp(2.2rem, 5vw, 4.2rem)",
              color: th,
            }}
          >
            Otto verticali.
            <br />
            <span className="gradient-text">Otto modi</span> di diventare il
            riferimento.
          </h2>
          <p
            className="mt-6 max-w-2xl text-[1rem] leading-[1.7] md:text-[1.05rem]"
            style={{ color: tb }}
          >
            Ogni Masterclass è acquistabile separatamente o incluso nel
            pacchetto PRO/ELITE (2 a scelta). Verticali nel dominio, intensivi
            nel formato, applicabili dal lunedì successivo.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="flex flex-col gap-5 md:gap-6">
          {sorted.map((ws, i) => (
            <MasterclassCard
              key={ws.slug}
              workshop={ws}
              index={i}
              isDark={isDark}
              isInView={isInView}
            />
          ))}
        </div>
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
                window.scrollTo({ top: 0, behavior: "smooth" });
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
              { v: "9", l: "Masterclass disponibili" },
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
export function WorkshopGrid() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <>
      <HeroSection />
      <ManifestoSection isDark={isDark} />
      <MasterclassListSection isDark={isDark} />
      <FinalCTA isDark={isDark} />
    </>
  );
}
