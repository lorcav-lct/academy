"use client";

import Image from "next/image";

/**
 * CertificationsCards — shared block:
 *   1. Full-width NSCA "endorsement strip" on top (international recognition,
 *      included in all packs).
 *   2. Two cert cards below:
 *        - Functional Strength Master Trainer (CSEN) — all packs
 *        - Personal Elite Trainer FIPE — PRO/ELITE only (emphasized)
 *
 * Logos render without containers/boxes (bare image).
 *
 * Used in:
 *   - /                 (home pack-preview, below the 3 pack cards)
 *   - /pack             (pack-comparison Journey section, below block panels)
 *   - /percorso/[slug]  (percorso-block-detail, certifications section)
 */

const ORANGE = "#F09226";

const CERT_LOGOS = [
  {
    src: "/certificazioni/fsmt.webp",
    alt: "Functional Strength Master Trainer — Lacertosus Academy",
  },
  {
    src: "/certificazioni/csen.webp",
    alt: "CSEN — Centro Sportivo Educativo Nazionale",
  },
  {
    src: "/certificazioni/fipe.webp",
    alt: "FIPE — Federazione Italiana Pesistica",
  },
  {
    src: "/certificazioni/nsca.webp",
    alt: "NSCA — National Strength and Conditioning Association",
  },
] as const;

interface Props {
  isDark: boolean;
}

export function CertificationsCards({ isDark }: Props) {
  const th = isDark ? "#f5f5fa" : "#0a0a1a";
  const tb = isDark ? "rgba(180,180,200,0.7)" : "#444";
  const ts = isDark ? "rgba(140,140,160,0.55)" : "#777";
  const divider = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      {/* ─── 2-CARD GRID ───────────────────────────────────────────────────── */}
      <div className="grid gap-4 md:gap-5 lg:grid-cols-2">
        {/* ─── CARD 1 — Master Trainer (CSEN) ────────────────────────────── */}
        <article
          className="relative flex flex-col p-7 md:p-8 lg:p-10"
          style={{
            background: isDark
              ? "rgba(255,255,255,0.03)"
              : "rgba(255,255,255,0.7)",
            border: "1.5px solid rgba(240,146,38,0.32)",
            borderLeft: "4px solid #F09226",
          }}
        >
          {/* Header — tag pill only */}
          <div className="flex items-start justify-end mb-6">
            <span
              className="shrink-0 px-2.5 py-1 text-[0.62rem] font-black tracking-[0.22em] uppercase"
              style={{
                color: ORANGE,
                background: "rgba(240,146,38,0.1)",
                border: "1px solid rgba(240,146,38,0.4)",
              }}
            >
              Start · Pro · Elite
            </span>
          </div>

          {/* Badge */}
          <span
            className="text-[0.7rem] font-black tracking-[0.3em] uppercase leading-snug mb-3"
            style={{ color: ORANGE }}
          >
            ✦ Inclusa in tutti i pack
          </span>

          {/* Title */}
          <h4
            className="font-black tracking-[-0.02em] leading-[1.05]"
            style={{
              fontSize: "clamp(1.7rem, 3vw, 2.4rem)",
              color: th,
            }}
          >
            Functional Strength
            <br />
            <span style={{ color: ORANGE }}>Master Trainer</span>
          </h4>

          {/* Recognition */}
          <p
            className="mt-3 text-[0.78rem] font-black tracking-[0.22em] uppercase"
            style={{ color: ts }}
          >
            Rilasciata da CSEN · Riconoscimento Nazionale
          </p>

          {/* Description */}
          <p
            className="mt-5 text-[1rem] md:text-[1.05rem] leading-[1.65]"
            style={{ color: tb }}
          >
            Diploma da Istruttore CSEN con Tesserino tecnico e iscrizione
            nell&apos;albo nazionale degli istruttori sportivi riconosciuti.
            Abilita all&apos;esercizio della professione di personal trainer
            certificato.
          </p>

          {/* Divider */}
          <div className="my-7 h-px w-full" style={{ background: divider }} />

          {/* "Cosa attesta" + "Dove vale" */}
          <div className="grid gap-7 md:grid-cols-2">
            <div>
              <p
                className="text-[0.66rem] font-black tracking-[0.28em] uppercase mb-4"
                style={{ color: ORANGE }}
              >
                Cosa Attesta
              </p>
              <ul className="flex flex-col gap-2.5">
                {[
                  "Functional Training: anatomia, biomeccanica, pattern motori",
                  "Strength & Conditioning: tecnica, programmazione, periodizzazione",
                  "Valutazione funzionale e screening posturale del cliente",
                  "Conduzione di sessioni di allenamento in presenza",
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-[0.92rem] leading-[1.55]"
                    style={{ color: tb }}
                  >
                    <span
                      className="shrink-0 mt-2 h-1.5 w-1.5"
                      style={{ background: ORANGE }}
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p
                className="text-[0.66rem] font-black tracking-[0.28em] uppercase mb-4"
                style={{ color: ORANGE }}
              >
                Dove Vale
              </p>
              <ul className="flex flex-col gap-2.5">
                {[
                  "Validità su tutto il territorio nazionale italiano",
                  "Iscrizione all'albo nazionale CSEN degli istruttori sportivi",
                  "Spendibile in palestre, studi e centri fitness",
                  "Esercizio della professione di personal trainer certificato",
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-[0.92rem] leading-[1.55]"
                    style={{ color: tb }}
                  >
                    <CheckIcon />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </article>

        {/* ─── CARD 2 — Personal Elite Trainer FIPE (emphasized) ─────────── */}
        <article
          className="relative flex flex-col p-7 md:p-8 lg:p-10"
          style={{
            background:
              "linear-gradient(135deg, rgba(240,146,38,0.16) 0%, rgba(240,146,38,0.04) 100%)",
            border: "2px solid rgba(240,146,38,0.65)",
            boxShadow: "0 0 32px rgba(240,146,38,0.15)",
          }}
        >
          {/* Header — tag pill only */}
          <div className="flex items-start justify-end mb-6">
            <span
              className="shrink-0 px-2.5 py-1 text-[0.62rem] font-black tracking-[0.22em] uppercase"
              style={{ color: "#111111", background: ORANGE }}
            >
              Pro · Elite
            </span>
          </div>

          {/* Badge */}
          <span
            className="text-[0.7rem] font-black tracking-[0.3em] uppercase leading-snug mb-3"
            style={{ color: ORANGE }}
          >
            ★ Solo Pack Pro & Elite
          </span>

          {/* Title */}
          <h4
            className="font-black tracking-[-0.02em] leading-[1.05]"
            style={{
              fontSize: "clamp(1.7rem, 3vw, 2.4rem)",
              color: th,
            }}
          >
            Personal Elite Trainer
            <br />
            <span style={{ color: ORANGE }}>FIPE</span>
          </h4>

          {/* Recognition */}
          <p
            className="mt-3 text-[0.78rem] font-black tracking-[0.22em] uppercase"
            style={{ color: ORANGE }}
          >
            Rilasciata da FIPE · Riconoscimento Nazionale e Internazionale
          </p>

          {/* Description */}
          <p
            className="mt-5 text-[1rem] md:text-[1.05rem] leading-[1.65]"
            style={{ color: tb }}
          >
            Certificazione ufficiale rilasciata dalla Federazione Italiana
            Pesistica al termine del modulo FIPE. Specializzazione elite sulle
            metodiche avanzate di Strength &amp; Conditioning, programmazione
            della forza e applicazioni in diversi contesti sportivi.
          </p>

          {/* Divider */}
          <div className="my-7 h-px w-full" style={{ background: divider }} />

          {/* "Cosa attesta" + "Dove vale" */}
          <div className="grid gap-7 md:grid-cols-2">
            <div>
              <p
                className="text-[0.66rem] font-black tracking-[0.28em] uppercase mb-4"
                style={{ color: ORANGE }}
              >
                Cosa Attesta
              </p>
              <ul className="flex flex-col gap-2.5">
                {[
                  "Competenze avanzate di allenamento della forza",
                  "Programmazione avanzata e tecnica del sollevamento",
                  "Applicazioni pratiche su diversi sport e contesti",
                  "Profilo conforme agli standard internazionali FIPE",
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-[0.92rem] leading-[1.55]"
                    style={{ color: tb }}
                  >
                    <span
                      className="shrink-0 mt-2 h-1.5 w-1.5"
                      style={{ background: ORANGE }}
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p
                className="text-[0.66rem] font-black tracking-[0.28em] uppercase mb-4"
                style={{ color: ORANGE }}
              >
                Dove Vale
              </p>
              <ul className="flex flex-col gap-2.5">
                {[
                  "Valida in Italia: palestre, centri sportivi, strutture federali",
                  "Valida all'estero: accademie e strutture di performance",
                  "Iscrizione al registro nazionale dei professionisti FIPE",
                  "Profilo competitivo per ruoli di responsabilità tecnica",
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-[0.92rem] leading-[1.55]"
                    style={{ color: tb }}
                  >
                    <CheckIcon />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </article>
      </div>

      {/* ─── NSCA STRIP — muted, sits below the 2 cards ──────────────────── */}
      <NscaStrip isDark={isDark} />
    </div>
  );
}

/**
 * NscaStrip — full-width horizontal endorsement banner.
 * Highlights international NSCA CEU recognition included in all packs.
 */
function NscaStrip({ isDark }: { isDark: boolean }) {
  const th = isDark ? "#f5f5fa" : "#0a0a1a";
  const tb = isDark ? "rgba(180,180,200,0.78)" : "#444";
  const muted = isDark ? "rgba(180,180,200,0.55)" : "#666";
  const bg = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.025)";
  const border = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";
  const accent = isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.18)";
  const pillBg = isDark ? "rgba(240,146,38,0.08)" : "rgba(240,146,38,0.08)";

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        background: bg,
        border: `1px solid ${border}`,
      }}
    >
      {/* Vertical muted accent bar */}
      <div
        className="absolute left-0 top-0 h-full w-1"
        style={{ background: accent }}
        aria-hidden
      />

      <div className="relative flex flex-col md:flex-row md:items-center gap-6 md:gap-8 px-7 md:px-10 py-7 md:py-8">
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap mb-2">
            <span
              className="text-[0.7rem] font-black tracking-[0.3em] uppercase"
              style={{ color: muted }}
            >
              Riconoscimento Internazionale
            </span>
            <span
              className="px-2.5 py-1 text-[0.6rem] font-black tracking-[0.22em] uppercase"
              style={{
                color: ORANGE,
                background: pillBg,
                border: "1px solid rgba(240,146,38,0.4)",
              }}
            >
              Incluso in tutti i pack
            </span>
          </div>
          <h4
            className="font-black tracking-[-0.02em] leading-[1.05]"
            style={{
              fontSize: "clamp(1.4rem, 2.6vw, 2rem)",
              color: th,
            }}
          >
            NSCA CEU Provider · <span style={{ color: ORANGE }}>+2.0 CEU</span>
          </h4>
          <p
            className="mt-3 text-[0.96rem] md:text-[1rem] leading-[1.6]"
            style={{ color: tb }}
          >
            Lacertosus Academy è ufficialmente riconosciuta come{" "}
            <strong>NSCA CEU Provider</strong>. Il percorso vale{" "}
            <strong>2.0 CEU</strong> riconosciuti dalla National Strength and
            Conditioning Association — validi per il mantenimento delle
            certificazioni NSCA e per la spendibilità internazionale del profilo
            professionale.
          </p>
        </div>

        {/* CEU stat badge — right side, desktop only */}
        <div
          className="hidden md:flex flex-col items-center justify-center shrink-0 px-6"
          style={{ borderLeft: `1px solid ${border}` }}
        >
          <span
            className="text-[clamp(2.4rem,3vw,3.4rem)] font-black leading-none tabular-nums"
            style={{ color: ORANGE }}
          >
            2.0
          </span>
          <span
            className="mt-1 text-[0.6rem] font-black tracking-[0.26em] uppercase"
            style={{ color: th }}
          >
            CEU NSCA
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * CertificationsIconRow — horizontal row of issuer logos.
 * Sits next to section title on desktop, below on mobile.
 */
export function CertificationsIconRow() {
  return (
    <div
      className="flex items-center gap-3 md:gap-5 flex-wrap md:flex-nowrap md:justify-end"
      aria-label="Enti certificatori"
    >
      {CERT_LOGOS.map((logo) => (
        <Image
          key={logo.src}
          src={logo.src}
          alt={logo.alt}
          width={72}
          height={72}
          className="shrink-0 h-12 w-12 md:h-14 md:w-14 object-contain"
        />
      ))}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className="shrink-0 mt-1 h-3.5 w-3.5"
      style={{ color: ORANGE }}
      aria-hidden
    >
      <path
        d="M13.5 4.5L6 12L2.5 8.5"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="square"
      />
    </svg>
  );
}
