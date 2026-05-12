/**
 * Centralized certification data — source of truth used by:
 *   - components/shared/certifications-cards.tsx
 *   - components/percorso/percorso-certifications.tsx
 *   - app/certificazioni/page.tsx
 *
 * Logo paths point to /public/certificazioni/. Until brand assets land,
 * the same CSEN webp acts as placeholder for every issuer.
 */

export type CertPacks = "all" | "pro-elite";

export interface Certification {
  id: "master-trainer" | "nsca" | "fipe-elite";
  title: string;
  /** Short visual title (orange highlight). */
  titleAccent: string;
  issuer: string;
  issuerFull: string;
  /** Path to issuer logo (in /public). */
  logo: string;
  /** Cert type — for visual tagging. */
  kind: "diploma" | "credits" | "diploma-international";
  recognition: string;
  packs: CertPacks;
  packsLabel: string;
  /** One-paragraph description (used on /certificazioni page). */
  description: string;
  /** Short description used on cards. */
  shortDescription: string;
  attests: string[];
  validity: string[];
  /** Description of the issuing body (for /certificazioni page). */
  issuerAbout: string;
}

export const CERTIFICATIONS: Certification[] = [
  {
    id: "master-trainer",
    title: "Functional Strength",
    titleAccent: "Master Trainer",
    issuer: "CSEN",
    issuerFull: "Centro Sportivo Educativo Nazionale",
    logo: "/certificazioni/csen.webp",
    kind: "diploma",
    recognition: "Riconoscimento Nazionale",
    packs: "all",
    packsLabel: "Start · Pro · Elite",
    description:
      "Diploma da Istruttore CSEN con Tesserino tecnico e iscrizione nell'albo nazionale degli istruttori sportivi riconosciuti. Al termine dei 9 mesi attesta competenze tecniche avanzate nella progettazione di programmi di Functional Training e Strength & Conditioning, capacità di valutazione e analisi del movimento, conoscenze approfondite di anatomia, biomeccanica e fisiologia applicata.",
    shortDescription:
      "Diploma da Istruttore CSEN con Tesserino tecnico e iscrizione all'albo nazionale degli istruttori sportivi. Spendibile immediatamente in palestre, studi e centri fitness.",
    attests: [
      "Functional Training: anatomia, biomeccanica, pattern motori",
      "Strength & Conditioning: tecnica, programmazione, periodizzazione",
      "Valutazione funzionale e screening posturale del cliente",
      "Conduzione di sessioni di allenamento in presenza",
      "Gestione professionale del cliente e del percorso",
    ],
    validity: [
      "Validità su tutto il territorio nazionale italiano",
      "Iscrizione all'albo nazionale CSEN degli istruttori sportivi",
      "Spendibile in palestre, studi e centri fitness",
      "Esercizio della professione di personal trainer certificato",
      "Apre opportunità in training hub e centri sportivi",
    ],
    issuerAbout:
      "CSEN — Centro Sportivo Educativo Nazionale — è un ente di promozione sportiva riconosciuto dal CONI dal 1976. Forma istruttori e tecnici sportivi in tutta Italia, con un albo nazionale e procedure standardizzate per le qualifiche tecniche.",
  },
  {
    id: "nsca",
    title: "NSCA",
    titleAccent: "CEU Provider",
    issuer: "NSCA",
    issuerFull: "National Strength and Conditioning Association",
    logo: "/certificazioni/csen.webp",
    kind: "credits",
    recognition: "Riconoscimento Internazionale",
    packs: "all",
    packsLabel: "Start · Pro · Elite",
    description:
      "Lacertosus Academy è ufficialmente riconosciuta come NSCA CEU Provider. La partecipazione completa al percorso dà diritto a 2.0 CEU (Continuing Education Units) riconosciuti dalla National Strength and Conditioning Association, una delle più autorevoli organizzazioni internazionali nel settore della preparazione atletica e dello Strength & Conditioning. Questo riconoscimento certifica l'elevato livello scientifico e professionale del percorso.",
    shortDescription:
      "Il percorso vale 2.0 CEU NSCA — Continuing Education Units — riconosciuti a livello internazionale per il mantenimento delle certificazioni NSCA e l'aggiornamento professionale.",
    attests: [
      "Aggiornamento professionale continuo riconosciuto",
      "Livello scientifico e professionale del percorso",
      "Conformità agli standard internazionali NSCA",
      "Spendibilità internazionale del profilo professionale",
    ],
    validity: [
      "Validi per il mantenimento delle certificazioni NSCA",
      "Riconosciuti a livello internazionale",
      "Rafforzano il profilo per il mercato estero",
      "Si integrano con il diploma Master Trainer CSEN",
    ],
    issuerAbout:
      "NSCA — National Strength and Conditioning Association — è l'autorità di riferimento mondiale nello Strength & Conditioning. Le sue certificazioni (CSCS, NSCA-CPT) sono lo standard internazionale per preparatori atletici e personal trainer. Essere NSCA CEU Provider significa che l'NSCA ha valutato e validato i contenuti del percorso.",
  },
  {
    id: "fipe-elite",
    title: "Personal Elite Trainer",
    titleAccent: "FIPE",
    issuer: "FIPE",
    issuerFull: "Federazione Italiana Pesistica",
    logo: "/certificazioni/csen.webp",
    kind: "diploma-international",
    recognition: "Riconoscimento Nazionale e Internazionale",
    packs: "pro-elite",
    packsLabel: "Pro · Elite",
    description:
      "Certificazione ufficiale rilasciata dalla Federazione Italiana Pesistica al termine del modulo FIPE incluso nei pack Pro ed Elite. Attesta competenze avanzate di allenamento della forza, programmazione avanzata e tecnica del sollevamento, applicazioni pratiche per diversi sport e contesti professionali — con supporto diretto dei docenti FIPE durante il percorso.",
    shortDescription:
      "Certificazione ufficiale FIPE che attesta competenze elite nello Strength & Conditioning. Spendibile in palestre, strutture federali e accademie internazionali.",
    attests: [
      "Competenze avanzate di allenamento della forza",
      "Programmazione avanzata e tecnica del sollevamento",
      "Applicazioni pratiche su diversi sport e contesti",
      "Profilo conforme agli standard internazionali FIPE",
      "Completa il profilo di Functional Strength Master Trainer",
    ],
    validity: [
      "Valida in Italia: palestre, centri sportivi, strutture federali",
      "Valida all'estero: accademie e strutture di performance",
      "Iscrizione al registro nazionale dei professionisti FIPE",
      "Profilo competitivo per ruoli di responsabilità tecnica",
      "Aggiunge un livello elite di specializzazione",
    ],
    issuerAbout:
      "FIPE — Federazione Italiana Pesistica — è la federazione sportiva nazionale affiliata al CONI che regolamenta la pesistica olimpica in Italia. È l'ente federale di riferimento per la formazione di tecnici e atleti nello Strength & Conditioning ed è membro dell'IWF (International Weightlifting Federation).",
  },
];

export function getCertById(
  id: Certification["id"],
): Certification | undefined {
  return CERTIFICATIONS.find((c) => c.id === id);
}
