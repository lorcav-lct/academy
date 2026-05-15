import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CERTIFICATIONS } from "@/lib/constants/certifications";

const ORANGE = "#F09226";

export const metadata: Metadata = {
  title: "Le Certificazioni — CSEN · NSCA · FIPE",
  description:
    "Le 3 certificazioni della Lacertosus Academy: diploma Functional Strength Master Trainer rilasciato da CSEN, 2.0 CEU NSCA di valore internazionale e certificazione Personal Elite Trainer FIPE. Riconoscimenti spendibili in Italia e all'estero.",
  keywords: [
    "certificazione personal trainer",
    "diploma CSEN istruttore",
    "NSCA CEU Italia",
    "FIPE Personal Elite Trainer",
    "Functional Strength Master Trainer",
    "certificazione fitness riconosciuta",
  ],
};

export default function CertificazioniPage() {
  return (
    <>
      {/* ═══════════ HERO ═══════════ */}
      <section className="themed-section relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="absolute inset-0 section-bg" />
        {/* Subtle radial accents (light) */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 68% 42%, rgba(212,98,42,0.05) 0%, transparent 55%), radial-gradient(ellipse at 18% 76%, rgba(42,95,168,0.035) 0%, transparent 50%)",
          }}
        />
        {/* Diagonal hairline */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute h-px w-[200%] -left-1/2"
            style={{
              top: "62%",
              background:
                "linear-gradient(90deg, transparent, rgba(240,146,38,0.18), transparent)",
              transform: "rotate(-6deg)",
            }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-[1440px] px-[5%] md:px-10">
          <span className="label-tag mb-6 block">
            — Le 3 Certificazioni Lacertosus
          </span>

          <h1
            className="font-black tracking-[-0.035em] leading-[0.95] max-w-5xl text-academy-gray-100"
            style={{ fontSize: "clamp(2.4rem, 6.5vw, 6.4rem)" }}
          >
            Tre titoli.
            <br />
            <span style={{ color: ORANGE }}>Una professione</span>
            <br />
            riconosciuta.
          </h1>

          <p className="mt-8 max-w-2xl text-[clamp(1rem,1.2vw,1.15rem)] leading-[1.7] text-academy-gray-400">
            Al termine dei 9 mesi di percorso esci con tre riconoscimenti
            distinti che insieme costruiscono un profilo professionale completo,
            spendibile in Italia e all&apos;estero. Una{" "}
            <em>cornice istituzionale</em> che rende concreto
            l&apos;investimento formativo.
          </p>

          {/* Logo row — 3 real issuer logos */}
          <div
            className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-10 max-w-4xl"
            aria-label="Enti certificatori"
          >
            {[
              {
                src: "/certificazioni/csen.webp",
                label: "CSEN",
                sub: "Centro Sportivo Educativo Nazionale",
              },
              {
                src: "/certificazioni/nsca.webp",
                label: "NSCA",
                sub: "National Strength & Conditioning Association",
              },
              {
                src: "/certificazioni/fipe.webp",
                label: "FIPE",
                sub: "Federazione Italiana Pesistica",
              },
            ].map((b) => (
              <div key={b.label} className="flex flex-col items-center gap-4">
                <Image
                  src={b.src}
                  alt={b.label}
                  width={192}
                  height={192}
                  className="h-36 w-36 md:h-48 md:w-48 object-contain"
                />
                <p className="text-center text-[0.82rem] md:text-[0.9rem] font-black tracking-tight text-academy-gray-100">
                  {b.label}
                </p>
                <p className="text-center text-[0.62rem] tracking-[0.18em] uppercase text-academy-gray-500 leading-tight">
                  {b.sub}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ STAT STRIP (dark anchor) ═══════════ */}
      <section
        className="relative py-12 md:py-16"
        style={{ background: "#111111" }}
      >
        <div className="relative z-10 mx-auto max-w-[1440px] px-[5%] md:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-academy-orange/15">
            {[
              { val: "3", label: "Enti certificatori" },
              { val: "9", label: "Mesi di percorso" },
              { val: "2.0", label: "CEU NSCA internazionali" },
              { val: "100%", label: "Formazione in presenza" },
            ].map((s) => (
              <div
                key={s.label}
                className="flex flex-col items-center justify-center gap-2 px-4 py-8 md:py-10"
                style={{ background: "#0a0a0a" }}
              >
                <span
                  className="text-[clamp(2.2rem,4vw,3.6rem)] font-black leading-none tabular-nums"
                  style={{ color: ORANGE }}
                >
                  {s.val}
                </span>
                <span className="text-center text-[0.62rem] md:text-[0.7rem] font-black tracking-[0.22em] uppercase text-academy-gray-400">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CERTIFICATION DETAIL SECTIONS ═══════════ */}
      {CERTIFICATIONS.map((cert, idx) => {
        const isEven = idx % 2 === 1;
        const isFipe = cert.id === "fipe-elite";
        const useAltBg = idx % 2 === 1;
        return (
          <section
            key={cert.id}
            className="themed-section relative overflow-hidden py-20 md:py-28"
          >
            <div
              className={`absolute inset-0 ${useAltBg ? "section-bg-alt" : "section-bg"}`}
            />

            <div className="relative z-10 mx-auto max-w-[1440px] px-[5%] md:px-10">
              <div
                className={`grid items-start gap-10 md:gap-16 lg:grid-cols-2 ${isEven ? "lg:[&>*:first-child]:order-2" : ""}`}
              >
                {/* Logo side */}
                <div className="flex flex-col items-center lg:items-start">
                  <span
                    className="text-[0.7rem] font-black tracking-[0.32em] uppercase mb-5"
                    style={{ color: ORANGE }}
                  >
                    {String(idx + 1).padStart(2, "0")} ·{" "}
                    {cert.kind === "credits"
                      ? "Crediti formativi"
                      : "Certificazione"}
                  </span>

                  {/* BIG LOGO — bare */}
                  <Image
                    src={cert.logo}
                    alt={`${cert.issuer} — ${cert.issuerFull}`}
                    width={420}
                    height={420}
                    className="h-auto w-full max-w-[420px] object-contain"
                    priority={idx === 0}
                  />

                  {/* Issuer caption */}
                  <div className="mt-5 max-w-md text-center lg:text-left">
                    <p
                      className="text-[0.72rem] font-black tracking-[0.26em] uppercase"
                      style={{ color: ORANGE }}
                    >
                      {cert.issuer}
                    </p>
                    <p className="mt-1 text-[0.95rem] font-black text-academy-gray-100">
                      {cert.issuerFull}
                    </p>
                  </div>
                </div>

                {/* Content side */}
                <div>
                  {/* Pack pill */}
                  <span
                    className="inline-block px-3 py-1.5 text-[0.62rem] font-black tracking-[0.22em] uppercase mb-5"
                    style={
                      isFipe
                        ? { color: "#111", background: ORANGE }
                        : {
                            color: ORANGE,
                            background: "rgba(240,146,38,0.1)",
                            border: "1px solid rgba(240,146,38,0.4)",
                          }
                    }
                  >
                    {cert.packs === "all"
                      ? "✦ Inclusa in tutti i pack"
                      : "★ Solo Pack Pro & Elite"}{" "}
                    · {cert.packsLabel}
                  </span>

                  {/* Title */}
                  <h2
                    className="font-black tracking-[-0.03em] leading-[0.98] text-academy-gray-100"
                    style={{ fontSize: "clamp(1.9rem, 4vw, 3.4rem)" }}
                  >
                    {cert.title}
                    <br />
                    <span style={{ color: ORANGE }}>{cert.titleAccent}</span>
                  </h2>

                  {/* Recognition */}
                  <p
                    className="mt-4 text-[0.82rem] font-black tracking-[0.24em] uppercase"
                    style={{ color: ORANGE }}
                  >
                    {cert.recognition}
                  </p>

                  {/* Description */}
                  <p className="mt-6 text-[1.02rem] leading-[1.7] text-academy-gray-400">
                    {cert.description}
                  </p>

                  {/* Attests + Validity grid */}
                  <div className="mt-10 grid gap-8 md:grid-cols-2">
                    <div>
                      <p
                        className="text-[0.64rem] font-black tracking-[0.3em] uppercase mb-4"
                        style={{ color: ORANGE }}
                      >
                        Cosa Attesta
                      </p>
                      <ul className="flex flex-col gap-2.5">
                        {cert.attests.map((item, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-3 text-[0.92rem] leading-[1.55] text-academy-gray-400"
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
                        className="text-[0.64rem] font-black tracking-[0.3em] uppercase mb-4"
                        style={{ color: ORANGE }}
                      >
                        Dove Vale
                      </p>
                      <ul className="flex flex-col gap-2.5">
                        {cert.validity.map((item, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-3 text-[0.92rem] leading-[1.55] text-academy-gray-400"
                          >
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
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {/* ═══════════ ABOUT THE ISSUERS ═══════════ */}
      <section className="themed-section relative py-20 md:py-28">
        <div className="absolute inset-0 section-bg-alt" />

        <div className="relative z-10 mx-auto max-w-[1440px] px-[5%] md:px-10">
          <div className="mb-12 max-w-3xl">
            <span className="label-tag mb-3 block">Gli Enti Certificatori</span>
            <h2 className="text-[clamp(1.7rem,3.5vw,2.8rem)] font-black leading-[1.05] tracking-tight text-academy-gray-100">
              Chi rilascia le certificazioni.
            </h2>
            <p className="mt-4 text-[0.98rem] leading-relaxed text-academy-gray-400">
              Tre istituzioni di riferimento — una nazionale, una federale, una
              internazionale — che validano singolarmente i contenuti del
              percorso Academy.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {CERTIFICATIONS.map((cert) => (
              <article
                key={cert.id}
                className="flex flex-col gap-5 p-7"
                style={{
                  background: "rgba(0,0,0,0.025)",
                  border: "1px solid rgba(0,0,0,0.08)",
                }}
              >
                <Image
                  src={cert.logo}
                  alt={`${cert.issuer} — ${cert.issuerFull}`}
                  width={96}
                  height={96}
                  className="h-20 w-20 object-contain"
                />
                <div>
                  <p
                    className="text-[0.6rem] font-black tracking-[0.26em] uppercase mb-1"
                    style={{ color: ORANGE }}
                  >
                    {cert.issuer}
                  </p>
                  <p className="text-[1.05rem] font-black leading-tight text-academy-gray-100">
                    {cert.issuerFull}
                  </p>
                </div>
                <p className="text-[0.88rem] leading-[1.65] text-academy-gray-400">
                  {cert.issuerAbout}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ PACK MATRIX ═══════════ */}
      <section className="themed-section relative py-20 md:py-28">
        <div className="absolute inset-0 section-bg" />

        <div className="relative z-10 mx-auto max-w-[1440px] px-[5%] md:px-10">
          <div className="mb-12 max-w-3xl">
            <span className="label-tag mb-3 block">In Quale Pack</span>
            <h2 className="text-[clamp(1.7rem,3.5vw,2.8rem)] font-black leading-[1.05] tracking-tight text-academy-gray-100">
              Cosa ottieni in ciascun pack.
            </h2>
            <p className="mt-4 text-[0.98rem] leading-relaxed text-academy-gray-400">
              Master Trainer e CEU NSCA sono inclusi in ogni pack. La
              certificazione FIPE Personal Elite Trainer è riservata ai pack PRO
              ed ELITE.
            </p>
          </div>

          {/* Matrix */}
          <div
            className="overflow-hidden"
            style={{
              border: "1px solid rgba(0,0,0,0.08)",
            }}
          >
            <div className="grid grid-cols-4 text-[0.7rem] font-black tracking-[0.22em] uppercase text-academy-gray-400">
              <div
                className="p-4 md:p-5"
                style={{ background: "rgba(0,0,0,0.03)" }}
              >
                CERT.
              </div>
              {(["START", "PRO", "ELITE"] as const).map((p) => (
                <div
                  key={p}
                  className="p-4 md:p-5 text-center"
                  style={{
                    background:
                      p === "PRO"
                        ? "rgba(240,146,38,0.14)"
                        : "rgba(0,0,0,0.03)",
                    color: p === "PRO" ? ORANGE : undefined,
                  }}
                >
                  {p}
                </div>
              ))}
            </div>

            {CERTIFICATIONS.map((cert) => (
              <div
                key={cert.id}
                className="grid grid-cols-4"
                style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
              >
                <div className="p-4 md:p-5">
                  <p className="text-[0.92rem] font-black text-academy-gray-100 leading-tight">
                    {cert.title} {cert.titleAccent}
                  </p>
                  <p className="mt-1 text-[0.7rem] tracking-[0.18em] uppercase text-academy-gray-500">
                    {cert.issuer}
                  </p>
                </div>
                {(["start", "pro", "elite"] as const).map((tier) => {
                  const included =
                    cert.packs === "all" ||
                    (cert.packs === "pro-elite" &&
                      (tier === "pro" || tier === "elite"));
                  const isProCell = tier === "pro";
                  return (
                    <div
                      key={tier}
                      className="flex items-center justify-center p-4 md:p-5"
                      style={{
                        background: isProCell
                          ? "rgba(240,146,38,0.06)"
                          : undefined,
                      }}
                    >
                      {included ? (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          className="h-6 w-6"
                          style={{ color: ORANGE }}
                          aria-label="Incluso"
                        >
                          <path
                            d="M5 12l5 5L20 7"
                            stroke="currentColor"
                            strokeWidth={2.5}
                            strokeLinecap="square"
                          />
                        </svg>
                      ) : (
                        <span className="text-[1rem] text-academy-gray-600">
                          —
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-center md:justify-start">
            <Link
              href="/pack"
              className="inline-flex items-center gap-2 px-6 py-3 text-[0.78rem] font-black tracking-[0.18em] uppercase"
              style={{ color: "#111", background: ORANGE }}
            >
              Confronta i Pack
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

      {/* ═══════════ FAQ ═══════════ */}
      <section className="themed-section relative py-20 md:py-28">
        <div className="absolute inset-0 section-bg-alt" />

        <div className="relative z-10 mx-auto max-w-[1100px] px-[5%] md:px-10">
          <div className="mb-12 max-w-3xl">
            <span className="label-tag mb-3 block">Domande Frequenti</span>
            <h2 className="text-[clamp(1.7rem,3.5vw,2.8rem)] font-black leading-[1.05] tracking-tight text-academy-gray-100">
              Tutto sulle certificazioni.
            </h2>
          </div>

          <div className="flex flex-col">
            {CERT_FAQS.map((faq, i) => (
              <details
                key={i}
                className="group"
                style={{
                  borderTop: "1px solid rgba(0,0,0,0.1)",
                  ...(i === CERT_FAQS.length - 1
                    ? { borderBottom: "1px solid rgba(0,0,0,0.1)" }
                    : {}),
                }}
              >
                <summary className="flex cursor-pointer items-center justify-between gap-6 py-6 md:py-7 list-none">
                  <h3 className="text-[1rem] md:text-[1.1rem] font-black text-academy-gray-100">
                    {faq.q}
                  </h3>
                  <span
                    className="shrink-0 transition-transform group-open:rotate-45"
                    style={{ color: ORANGE }}
                    aria-hidden
                  >
                    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
                      <path
                        d="M8 2v12M2 8h12"
                        stroke="currentColor"
                        strokeWidth={2}
                      />
                    </svg>
                  </span>
                </summary>
                <p className="pb-7 pr-10 text-[0.95rem] leading-[1.7] text-academy-gray-400">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FINAL CTA (dark anchor — blurred video bg like home P4) ═══════════ */}
      <section
        className="relative overflow-hidden py-24 md:py-32"
        style={{ background: "#0a0a0a" }}
      >
        {/* Vimeo blurred bg — same pattern used by home hero Panel 4 (cert) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        >
          <iframe
            src="https://player.vimeo.com/video/1188018710?background=1&autoplay=1&loop=1&muted=1&quality=360p&dnt=1"
            title="Certificazioni background"
            loading="lazy"
            allow="autoplay; fullscreen"
            suppressHydrationWarning
            className="absolute left-1/2 top-1/2 min-h-full min-w-full"
            style={{
              aspectRatio: "16 / 9",
              border: 0,
              filter: "blur(14px) brightness(0.6) saturate(1.05)",
              transform: "translate(-50%, -50%) scale(1.08)",
            }}
          />
          {/* Dark tint */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(10,10,14,0.6) 0%, rgba(10,10,14,0.82) 100%)",
            }}
          />
          {/* Spotlight radiale centrale */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 55% 55% at 50% 50%, rgba(240,146,38,0.08) 0%, transparent 60%)",
            }}
          />
        </div>
        {/* Orange grid overlay (like home P4) */}
        <div
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(240,146,38,0.16) 1px, transparent 1px)," +
              "linear-gradient(90deg, rgba(240,146,38,0.16) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage:
              "radial-gradient(ellipse 70% 65% at 50% 50%, transparent 0%, transparent 50%, rgba(0,0,0,0.4) 75%, black 92%, black 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 70% 65% at 50% 50%, transparent 0%, transparent 50%, rgba(0,0,0,0.4) 75%, black 92%, black 100%)",
          }}
        />
        <div className="relative z-10 mx-auto max-w-[1100px] px-[5%] md:px-10 text-center">
          <span className="label-tag mb-5 block">— Edizione 2026/27</span>
          <h2
            className="font-black tracking-[-0.03em] leading-[0.95] text-white"
            style={{ fontSize: "clamp(2rem, 5vw, 4.6rem)" }}
          >
            Pronto a costruire un profilo
            <br />
            <span style={{ color: ORANGE }}>davvero certificato?</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-[1.02rem] leading-[1.7] text-academy-gray-300">
            I posti sono limitati a 30 partecipanti per garantire qualità
            didattica e accesso reale alle certificazioni. Scopri il pack che fa
            per te e inizia il percorso.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/pack"
              className="inline-flex items-center gap-2 px-8 py-4 text-[0.82rem] font-black tracking-[0.2em] uppercase"
              style={{ color: "#111", background: ORANGE }}
            >
              Scegli il tuo Pack
              <svg
                viewBox="0 0 16 16"
                fill="none"
                className="h-4 w-4"
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
              href="/percorso"
              className="inline-flex items-center gap-2 px-8 py-4 text-[0.82rem] font-black tracking-[0.2em] uppercase text-white"
              style={{
                border: "1.5px solid rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              Esplora il Percorso
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

const CERT_FAQS = [
  {
    q: "Quali certificazioni ottengo al termine del percorso?",
    a: "In tutti i pack ricevi il diploma Functional Strength Master Trainer rilasciato da CSEN (con Tesserino tecnico e iscrizione all'albo nazionale degli istruttori sportivi) e i 2.0 CEU NSCA — Lacertosus Academy è ufficialmente NSCA CEU Provider. Nei pack PRO ed ELITE si aggiunge la certificazione Personal Elite Trainer FIPE, rilasciata dalla Federazione Italiana Pesistica.",
  },
  {
    q: "Cosa significa che Lacertosus è NSCA CEU Provider?",
    a: "La NSCA — National Strength and Conditioning Association — è una delle organizzazioni internazionali più autorevoli nello Strength & Conditioning. Essere CEU Provider significa che la NSCA ha valutato e validato i contenuti del percorso. Completando i 9 mesi ottieni 2.0 CEU (Continuing Education Units) validi per il mantenimento delle certificazioni NSCA, l'aggiornamento professionale continuo e la spendibilità internazionale del tuo profilo.",
  },
  {
    q: "Il diploma CSEN ha valore legale come qualifica di Personal Trainer?",
    a: "Sì. Il Diploma da Istruttore CSEN, accompagnato dal Tesserino tecnico e dall'iscrizione nell'albo nazionale CSEN degli istruttori sportivi, è il riconoscimento standard nel settore fitness italiano. CSEN è un ente di promozione sportiva riconosciuto dal CONI dal 1976. È spendibile in palestre, studi e centri fitness su tutto il territorio nazionale.",
  },
  {
    q: "La certificazione FIPE Personal Elite Trainer è valida anche all'estero?",
    a: "Sì. È rilasciata dalla Federazione Italiana Pesistica, federazione sportiva nazionale affiliata al CONI e membro dell'IWF (International Weightlifting Federation). È spendibile in palestre, centri sportivi e strutture federali in Italia, e in accademie e strutture di performance internazionali. Dà accesso al registro nazionale dei professionisti FIPE.",
  },
  {
    q: "Posso ottenere le certificazioni acquistando solo un singolo blocco?",
    a: "No. Master Trainer CSEN e CEU NSCA richiedono il completamento integrale dei 3 blocchi (FUNCTION, STRENGTH, SCIENCE). La certificazione FIPE è inclusa esclusivamente nei bundle PRO ed ELITE. I singoli blocchi e le masterclass standalone offrono attestazione di partecipazione, non titoli certificati.",
  },
  {
    q: "Cosa succede se non posso essere presente a tutti i weekend?",
    a: "La presenza è fondamentale per l'accesso alle certificazioni. Il percorso è in presenza per garantire la qualità formativa e il rilascio dei titoli. In caso di assenza documentata per cause straordinarie valutiamo individualmente la possibilità di recupero nelle edizioni successive.",
  },
];
