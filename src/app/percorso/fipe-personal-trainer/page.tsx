import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FipeProgramAccordion } from "@/components/shared/fipe-program-accordion";
import {
  FIPE_COURSE_TITLE,
  FIPE_PROGRAM_HEADING,
  FIPE_PROGRAM_META,
  FIPE_WEEKENDS,
  getWeekendHours,
} from "@/lib/constants/fipe-program";

const ORANGE = "#F09226";
const ORANGE_RGB = "240,146,38";

export const metadata: Metadata = {
  title: `${FIPE_COURSE_TITLE} — Lacertosus Academy`,
  description:
    "Programma ufficiale FIPE: Istruttore Sala Pesi e Pesistica · Personal Trainer I Livello. 3 weekend, 16 ore di teoria, 24 ore di pratica, esame finale. Incluso nei pack Pro ed Elite.",
};

export default function FipePersonalTrainerPage() {
  const stats = [
    { value: FIPE_PROGRAM_META.weekends, label: "Weekend in presenza" },
    { value: FIPE_PROGRAM_META.daysTotal, label: "Giornate" },
    { value: FIPE_PROGRAM_META.hoursTheory, label: "Ore di teoria" },
    { value: FIPE_PROGRAM_META.hoursPractice, label: "Ore di pratica" },
  ];

  return (
    <>
      {/* HERO — dark */}
      <section
        className="relative overflow-hidden pt-32 md:pt-40 pb-20 md:pb-28"
        style={{ background: "#0a0a0a" }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at 20% 20%, rgba(${ORANGE_RGB},0.08) 0%, transparent 55%), radial-gradient(ellipse at 80% 80%, rgba(${ORANGE_RGB},0.06) 0%, transparent 55%)`,
          }}
        />
        <div className="relative z-10 mx-auto max-w-[1200px] px-[5%] md:px-10">
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="mb-8 flex items-center gap-2 text-[0.65rem] font-bold tracking-[0.22em] uppercase"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            <Link
              href="/percorso"
              className="transition-colors hover:text-academy-orange"
            >
              Il Percorso
            </Link>
            <span>/</span>
            <span style={{ color: ORANGE }}>FIPE Personal Trainer</span>
          </nav>

          <div className="grid lg:grid-cols-[1fr_auto] gap-10 items-start">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <Image
                  src="/certificazioni/fipe.webp"
                  alt="FIPE — Federazione Italiana Pesistica"
                  width={64}
                  height={64}
                  className="h-16 w-16 object-contain"
                />
                <span
                  className="text-[0.6rem] font-black tracking-[0.32em] uppercase"
                  style={{ color: ORANGE }}
                >
                  Federazione Italiana Pesistica · I Livello
                </span>
              </div>

              <h1
                className="text-[clamp(2rem,4.5vw,3.6rem)] font-black leading-[1.02] tracking-tight"
                style={{ color: "#f5f5fa" }}
              >
                Istruttore Sala Pesi e Pesistica
                <br />
                <span style={{ color: ORANGE }}>
                  Personal Trainer I Livello
                </span>
              </h1>

              <p
                className="mt-6 max-w-2xl text-[1rem] leading-relaxed"
                style={{ color: "rgba(255,255,255,0.66)" }}
              >
                Il titolo tecnico ufficiale rilasciato dalla Federazione
                Italiana Pesistica all&apos;interno del percorso Lacertosus
                Academy. Tre weekend in presenza, 40 ore complessive tra teoria
                e pratica, con esame finale per l&apos;abilitazione.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/pack"
                  className="inline-flex items-center gap-2 px-6 py-3.5 text-[0.78rem] font-black tracking-[0.18em] uppercase transition-opacity hover:opacity-85"
                  style={{ color: "#111", background: ORANGE }}
                >
                  Scegli un Pack
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    className="h-3.5 w-3.5"
                    aria-hidden
                  >
                    <path
                      d="M4 8h8m0 0L8 4m4 4l-4 4"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="square"
                    />
                  </svg>
                </Link>
                <Link
                  href="/certificazioni"
                  className="inline-flex items-center gap-2 px-6 py-3.5 text-[0.78rem] font-black tracking-[0.18em] uppercase transition-colors"
                  style={{
                    color: "#f5f5fa",
                    border: `1.5px solid rgba(${ORANGE_RGB},0.5)`,
                  }}
                >
                  Tutte le certificazioni
                </Link>
              </div>
            </div>
          </div>

          {/* Stats strip */}
          <div
            className="mt-12 md:mt-16 grid grid-cols-2 md:grid-cols-4 gap-px"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            {stats.map((s) => (
              <div
                key={s.label}
                className="p-5 md:p-6"
                style={{ background: "#0a0a0a" }}
              >
                <div
                  className="text-[2.2rem] md:text-[2.8rem] font-black leading-none tabular-nums tracking-tight"
                  style={{ color: "#f5f5fa" }}
                >
                  {s.value}
                </div>
                <div
                  className="mt-2 text-[0.62rem] font-bold tracking-[0.22em] uppercase"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROGRAM — light */}
      <section
        className="relative overflow-hidden py-20 md:py-28"
        style={{ background: "#f7f5f1" }}
      >
        <div className="relative z-10 mx-auto max-w-[1200px] px-[5%] md:px-10">
          <div className="mb-10 md:mb-12 max-w-2xl">
            <span
              className="text-[0.58rem] font-black tracking-[0.32em] uppercase mb-3 block"
              style={{ color: ORANGE }}
            >
              {FIPE_PROGRAM_HEADING}
            </span>
            <h2
              className="text-[clamp(1.8rem,3.6vw,2.8rem)] font-black leading-[1.05] tracking-tight"
              style={{ color: "#111" }}
            >
              Il programma, weekend per weekend.
            </h2>
            <p
              className="mt-4 text-[0.98rem] leading-relaxed"
              style={{ color: "rgba(17,17,17,0.66)" }}
            >
              {FIPE_PROGRAM_META.hoursTheory} ore di lezioni teoriche,{" "}
              {FIPE_PROGRAM_META.hoursPractice} ore di lezioni pratiche, esame
              finale al sesto giorno per il rilascio del titolo FIPE di I
              livello.
            </p>
          </div>

          <FipeProgramAccordion
            scopeId="fipe-page"
            defaultOpen={1}
            showEyebrow={false}
          />
        </div>
      </section>

      {/* PURCHASE — light alt */}
      <section
        className="relative overflow-hidden py-20 md:py-28"
        style={{ background: "#ffffff" }}
      >
        <div className="relative z-10 mx-auto max-w-[1200px] px-[5%] md:px-10">
          <div className="mb-10 md:mb-12 max-w-2xl">
            <span
              className="text-[0.58rem] font-black tracking-[0.32em] uppercase mb-3 block"
              style={{ color: ORANGE }}
            >
              Acquista la certificazione
            </span>
            <h2
              className="text-[clamp(1.8rem,3.6vw,2.8rem)] font-black leading-[1.05] tracking-tight"
              style={{ color: "#111" }}
            >
              Iscriviti al solo percorso FIPE.
            </h2>
            <p
              className="mt-4 text-[0.98rem] leading-relaxed"
              style={{ color: "rgba(17,17,17,0.66)" }}
            >
              Se ti interessa unicamente la certificazione FIPE, puoi iscriverti
              al percorso standalone — 3 weekend, esame finale, titolo
              ufficiale. Pagamento sicuro tramite Stripe.
            </p>
          </div>

          <div className="grid lg:grid-cols-[1.2fr_1fr] gap-8 lg:gap-12 items-start">
            {/* Includes column */}
            <div
              className="p-7 md:p-9"
              style={{
                background: "#f7f5f1",
                border: "1.5px solid rgba(17,17,17,0.08)",
                borderLeft: `4px solid ${ORANGE}`,
              }}
            >
              <span
                className="text-[0.58rem] font-black tracking-[0.3em] uppercase mb-4 block"
                style={{ color: ORANGE }}
              >
                Cosa è incluso
              </span>
              <ul className="grid sm:grid-cols-2 gap-3.5 list-none p-0 m-0">
                {[
                  "3 weekend in presenza (40 ore)",
                  "16 ore di teoria + 24 ore di pratica",
                  "Esame finale FIPE",
                  "Certificazione FIPE I Livello",
                  "Riconoscimento nazionale e internazionale",
                  "Materiale didattico digitale",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-[0.92rem] leading-snug"
                    style={{ color: "rgba(17,17,17,0.86)" }}
                  >
                    <span
                      className="shrink-0 mt-0.5 flex h-4 w-4 items-center justify-center"
                      style={{ color: ORANGE }}
                      aria-hidden
                    >
                      <svg
                        viewBox="0 0 16 16"
                        fill="none"
                        width="13"
                        height="13"
                      >
                        <path
                          d="M13.5 4.5L6 12L2.5 8.5"
                          stroke="currentColor"
                          strokeWidth={2.2}
                          strokeLinecap="square"
                        />
                      </svg>
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              {/* Bundles disclaimer */}
              <div
                className="mt-7 flex items-start gap-3 px-4 py-3.5"
                style={{
                  background: "#ffffff",
                  border: `1px solid rgba(${ORANGE_RGB},0.32)`,
                }}
              >
                <span
                  className="shrink-0 mt-0.5 text-[0.55rem] font-black tracking-[0.22em] uppercase px-1.5 py-0.5"
                  style={{ background: ORANGE, color: "#111" }}
                >
                  Tip
                </span>
                <p
                  className="text-[0.82rem] leading-snug"
                  style={{ color: "rgba(17,17,17,0.78)" }}
                >
                  La certificazione FIPE è già{" "}
                  <strong>inclusa nei pack PRO ed Elite</strong>: valuta un pack
                  se vuoi anche FUNCTION, STRENGTH e SCIENCE.
                  <Link
                    href="/pack"
                    className="ml-1.5 font-bold underline underline-offset-2 transition-opacity hover:opacity-70"
                    style={{ color: ORANGE }}
                  >
                    Confronta i pack →
                  </Link>
                </p>
              </div>
            </div>

            {/* Price + CTA column */}
            <div
              className="p-7 md:p-9 sticky top-32"
              style={{
                background: "#0a0a0a",
                border: `1.5px solid rgba(${ORANGE_RGB},0.32)`,
              }}
            >
              <span
                className="text-[0.58rem] font-black tracking-[0.3em] uppercase mb-2 block"
                style={{ color: ORANGE }}
              >
                Prezzo
              </span>
              <div className="flex items-baseline gap-2">
                <span
                  className="text-[3rem] md:text-[3.4rem] font-black leading-none tabular-nums tracking-tight"
                  style={{ color: "#f5f5fa" }}
                >
                  €790
                </span>
                <span
                  className="text-[0.78rem] font-bold tracking-wider uppercase"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  IVA inclusa
                </span>
              </div>
              <p
                className="mt-3 text-[0.86rem] leading-relaxed"
                style={{ color: "rgba(255,255,255,0.66)" }}
              >
                Pagamento sicuro Stripe — carta, Apple Pay, Google Pay.
                Riceverai conferma via email immediata.
              </p>

              <Link
                href="/checkout?pack=fipe-personal-trainer"
                className="mt-7 inline-flex w-full items-center justify-between gap-3 px-6 py-4 text-[0.78rem] font-black tracking-[0.18em] uppercase transition-opacity hover:opacity-90"
                style={{ color: "#111", background: ORANGE }}
              >
                <span>Acquista ora</span>
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  className="h-3.5 w-3.5"
                  aria-hidden
                >
                  <path
                    d="M4 8h8m0 0L8 4m4 4l-4 4"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="square"
                  />
                </svg>
              </Link>

              {/* Trust micro-row */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                {[
                  { t: "Pagamento sicuro", s: "Stripe · PCI-DSS L1" },
                  { t: "14 giorni recesso", s: "Prima dell'inizio" },
                ].map((it) => (
                  <div
                    key={it.t}
                    className="px-3 py-2.5"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <p
                      className="text-[0.7rem] font-bold leading-tight"
                      style={{ color: "#f5f5fa" }}
                    >
                      {it.t}
                    </p>
                    <p
                      className="mt-1 text-[0.62rem] leading-snug"
                      style={{ color: "rgba(255,255,255,0.5)" }}
                    >
                      {it.s}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK OVERVIEW — light alt */}
      <section
        className="relative overflow-hidden py-20 md:py-24"
        style={{ background: "#f7f5f1" }}
      >
        <div className="relative z-10 mx-auto max-w-[1200px] px-[5%] md:px-10">
          <div className="mb-10 max-w-2xl">
            <span
              className="text-[0.58rem] font-black tracking-[0.32em] uppercase mb-3 block"
              style={{ color: ORANGE }}
            >
              Calendario sintetico
            </span>
            <h2
              className="text-[clamp(1.6rem,3vw,2.4rem)] font-black leading-[1.05] tracking-tight"
              style={{ color: "#111" }}
            >
              I 3 weekend in un colpo d&apos;occhio.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4 md:gap-5">
            {FIPE_WEEKENDS.map((wk, i) => {
              const wkHours = getWeekendHours(wk);
              return (
                <article
                  key={wk.weekend}
                  className="relative flex flex-col p-6 md:p-7"
                  style={{
                    background: "#f7f5f1",
                    border: "1.5px solid rgba(17,17,17,0.08)",
                    borderLeft: `4px solid ${ORANGE}`,
                  }}
                >
                  <span
                    className="text-[0.58rem] font-black tracking-[0.3em] uppercase mb-3"
                    style={{ color: ORANGE }}
                  >
                    {String(i + 1).padStart(2, "0")} · {wk.label}
                  </span>
                  <h3
                    className="text-[1.3rem] font-black leading-tight tracking-tight"
                    style={{ color: "#111" }}
                  >
                    {wk.days.length} giornate
                    <br />
                    <span style={{ color: "rgba(17,17,17,0.6)" }}>
                      {wkHours > 0
                        ? `${wkHours} ore di lezione`
                        : "+ esame finale"}
                    </span>
                  </h3>
                  <ul className="mt-5 flex flex-col gap-2.5 list-none p-0 m-0">
                    {wk.days.map((d) => (
                      <li
                        key={d.day}
                        className="flex items-start gap-3 text-[0.86rem] leading-snug"
                        style={{ color: "rgba(17,17,17,0.78)" }}
                      >
                        <span
                          className="shrink-0 mt-1 inline-block h-1.5 w-1.5"
                          style={{ background: ORANGE }}
                          aria-hidden
                        />
                        <span>
                          <span className="font-black">{d.dayLabel}</span>
                          {d.isExam ? (
                            <> — esame finale</>
                          ) : (
                            <>
                              {" "}
                              ·{" "}
                              {d.lessons.reduce(
                                (s, l) => s + (l.hours || 0),
                                0,
                              )}
                              h
                            </>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA strip — dark */}
      <section
        className="relative overflow-hidden py-16 md:py-20"
        style={{ background: "#0a0a0a" }}
      >
        <div className="relative z-10 mx-auto max-w-[1200px] px-[5%] md:px-10">
          <div
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 p-7 md:p-8"
            style={{
              background: `rgba(${ORANGE_RGB},0.06)`,
              border: `1.5px solid rgba(${ORANGE_RGB},0.4)`,
            }}
          >
            <div>
              <p
                className="text-[0.6rem] font-black tracking-[0.28em] uppercase mb-1"
                style={{ color: ORANGE }}
              >
                Inclusa nei pack
              </p>
              <p
                className="text-[1.1rem] md:text-[1.25rem] font-black leading-tight"
                style={{ color: "#f5f5fa" }}
              >
                La certificazione FIPE è inclusa nei pack Pro ed Elite.
              </p>
            </div>
            <Link
              href="/pack"
              className="inline-flex items-center gap-2 px-6 py-3.5 text-[0.78rem] font-black tracking-[0.18em] uppercase transition-opacity hover:opacity-85 shrink-0"
              style={{ color: "#111", background: ORANGE }}
            >
              Vedi i pack
              <svg
                viewBox="0 0 16 16"
                fill="none"
                className="h-3.5 w-3.5"
                aria-hidden
              >
                <path
                  d="M4 8h8m0 0L8 4m4 4l-4 4"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="square"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
