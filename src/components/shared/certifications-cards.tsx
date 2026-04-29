"use client";

/**
 * CertificationsCards — shared 2-card block presenting the two certifications
 * of the Lacertosus Academy path:
 *
 *   1. Functional Strength Master Coach (included in ALL packs, national recognition)
 *   2. Personal Trainer FIPE × Lacertosus (PRO/ELITE only, national + international recognition)
 *
 * Used in:
 *   - /                 (home pack-preview, below the 3 pack cards)
 *   - /pack             (pack-comparison Journey section, below block panels)
 *   - /percorso/[slug]  (percorso-block-detail, certifications section)
 *
 * Cards are intentionally typographically rich (bigger text, structured lists)
 * to mirror the visual weight of the surrounding pack comparison cards.
 */

const ORANGE = "#F09226";

interface Cert {
  badge: string;
  tagPill: string;
  tagPillStyle: "outline" | "filled";
  title: React.ReactNode;
  recognition: string;
  description: string;
  attests: string[];
  validity: string[];
  emphasized: boolean;
}

const CERTS: Cert[] = [
  {
    badge: "✦ Inclusa in tutti i pack",
    tagPill: "Start · Pro · Elite",
    tagPillStyle: "outline",
    title: (
      <>
        Functional Strength
        <br />
        <span style={{ color: ORANGE }}>Master Coach</span>
      </>
    ),
    recognition: "Riconoscimento Nazionale",
    description:
      "Certificazione Lacertosus rilasciata al termine dei 9 mesi di percorso. Attesta competenza nel Functional Strength e abilita all'esercizio della professione di personal trainer certificato.",
    attests: [
      "Functional Training: anatomia, biomeccanica, pattern motori",
      "Strength & Conditioning: tecnica, programmazione, periodizzazione",
      "Valutazione funzionale e screening posturale del cliente",
      "Conduzione di sessioni di allenamento in presenza",
    ],
    validity: [
      "Validità su tutto il territorio nazionale italiano",
      "Spendibile in palestre, studi e centri fitness",
      "Esercizio della professione di personal trainer certificato",
    ],
    emphasized: false,
  },
  {
    badge: "★ Solo Pack Pro & Elite",
    tagPill: "Pro · Elite",
    tagPillStyle: "filled",
    title: (
      <>
        Personal Trainer
        <br />
        <span style={{ color: ORANGE }}>FIPE × Lacertosus</span>
      </>
    ),
    recognition: "Riconoscimento Nazionale e Internazionale",
    description:
      "Certificazione ufficiale FIPE × Lacertosus, riconosciuta dalla Federazione Italiana Pesistica e con valenza internazionale. Il titolo che fa la differenza nel mercato professionale del fitness.",
    attests: [
      "Tutto ciò che attesta il Functional Strength Master Coach",
      "Standard FIPE: programmazione avanzata e tecnica del sollevamento",
      "Doppia validazione: Federazione Italiana Pesistica × Lacertosus",
      "Profilo professionale conforme agli standard internazionali",
    ],
    validity: [
      "Valida in Italia: palestre, centri sportivi e strutture federali",
      "Valida all'estero: accademie e strutture di performance internazionali",
      "Iscrizione al registro nazionale dei professionisti FIPE",
      "Profilo competitivo per ruoli di responsabilità tecnica",
    ],
    emphasized: true,
  },
];

interface Props {
  /** Theme awareness — passed from parent (most callers already track this). */
  isDark: boolean;
}

export function CertificationsCards({ isDark }: Props) {
  const th = isDark ? "#f5f5fa" : "#0a0a1a";
  const tb = isDark ? "rgba(180,180,200,0.7)" : "#444";
  const ts = isDark ? "rgba(140,140,160,0.55)" : "#777";

  return (
    <div className="grid gap-4 md:gap-5 lg:grid-cols-2">
      {CERTS.map((cert, ci) => (
        <article
          key={ci}
          className="relative flex flex-col p-7 md:p-8 lg:p-10"
          style={
            cert.emphasized
              ? {
                  background:
                    "linear-gradient(135deg, rgba(240,146,38,0.16) 0%, rgba(240,146,38,0.04) 100%)",
                  border: "2px solid rgba(240,146,38,0.65)",
                  boxShadow: "0 0 32px rgba(240,146,38,0.15)",
                }
              : {
                  background: isDark
                    ? "rgba(255,255,255,0.03)"
                    : "rgba(255,255,255,0.7)",
                  border: "1.5px solid rgba(240,146,38,0.32)",
                  borderLeft: "4px solid #F09226",
                }
          }
        >
          {/* Header — badge + tag pill */}
          <div className="flex items-start justify-between gap-3 mb-6">
            <span
              className="text-[0.72rem] font-black tracking-[0.3em] uppercase leading-snug"
              style={{ color: ORANGE }}
            >
              {cert.badge}
            </span>
            <span
              className="shrink-0 px-2.5 py-1 text-[0.62rem] font-black tracking-[0.22em] uppercase"
              style={
                cert.tagPillStyle === "filled"
                  ? { color: "#111111", background: ORANGE }
                  : {
                      color: ORANGE,
                      background: "rgba(240,146,38,0.1)",
                      border: "1px solid rgba(240,146,38,0.4)",
                    }
              }
            >
              {cert.tagPill}
            </span>
          </div>

          {/* Title */}
          <h4
            className="font-black tracking-[-0.02em] leading-[1.05]"
            style={{
              fontSize: "clamp(1.7rem, 3vw, 2.4rem)",
              color: th,
            }}
          >
            {cert.title}
          </h4>

          {/* Recognition */}
          <p
            className="mt-3 text-[0.82rem] font-black tracking-[0.22em] uppercase"
            style={{ color: cert.emphasized ? ORANGE : ts }}
          >
            {cert.recognition}
          </p>

          {/* Description */}
          <p
            className="mt-5 text-[1rem] md:text-[1.05rem] leading-[1.65]"
            style={{ color: tb }}
          >
            {cert.description}
          </p>

          {/* Divider */}
          <div
            className="my-7 h-px w-full"
            style={{
              background: isDark
                ? "rgba(255,255,255,0.08)"
                : "rgba(0,0,0,0.08)",
            }}
          />

          {/* "Cosa attesta" + "Dove spendere" inner grid */}
          <div className="grid gap-7 md:grid-cols-2">
            <div>
              <p
                className="text-[0.66rem] font-black tracking-[0.28em] uppercase mb-4"
                style={{ color: ORANGE }}
              >
                Cosa Attesta
              </p>
              <ul className="flex flex-col gap-2.5">
                {cert.attests.map((item, i) => (
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
                {cert.validity.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-[0.92rem] leading-[1.55]"
                    style={{ color: tb }}
                  >
                    <svg
                      viewBox="0 0 16 16"
                      fill="none"
                      className="shrink-0 mt-1 h-3.5 w-3.5"
                      style={{ color: ORANGE }}
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
        </article>
      ))}
    </div>
  );
}
