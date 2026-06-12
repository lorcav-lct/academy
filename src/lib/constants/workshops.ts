import type { MasterclassVisibilityMap } from "@/lib/settings/masterclass-visibility";

export interface Workshop {
  slug: string;
  title: string;
  subtitle: string;
  focus: string;
  duration: string;
  date: string;
  teacherSlugs: string[];
  sortOrder: number;
  trainerLabel: string;
  tbd?: boolean;
  /** Se true, viene escluso da listing pubbliche e selezione bundle.
   *  La pagina detail resta accessibile via URL diretto. */
  hidden?: boolean;
  /** Se true, l'admin può abilitare/disabilitare questa masterclass dalla UI. */
  adminToggleable?: boolean;
}

export const WORKSHOPS: Workshop[] = [
  {
    slug: "master-functional-bulgarian",
    title: "Functional Movement & Bulgarian",
    subtitle: "Masterclass — Metodo Bulgaro e Functional Training",
    focus: "Metodo bulgaro avanzato e pattern di movimento funzionale",
    duration: "1-2 giornate",
    date: "18-19-20 Settembre 2026",
    teacherSlugs: ["ivan-ivanov"],
    trainerLabel: "Ivan Ivanov",
    sortOrder: 1,
    adminToggleable: true,
  },
  {
    slug: "master-strength",
    title: "Strength Avanzato",
    subtitle:
      "Advanced Strength Programming — Programmazione dell'Allenamento della Forza",
    focus: "Tecnica avanzata di forza, programmazione e performance",
    duration: "1-2 giornate",
    date: "Sabato 23 Gennaio 2027",
    teacherSlugs: ["andrea-quarto"],
    trainerLabel: "Andrea Quarto",
    sortOrder: 2,
    adminToggleable: true,
  },
  {
    slug: "master-calcio",
    title: "Preparazione Fisica Calcio",
    subtitle:
      "Elite Football Rehab Master — Prevenzione, Recupero e Ritorno alla Massima Performance",
    focus: "Preparazione atletica e performance management nel calcio d'élite",
    duration: "1-2 giornate",
    date: "Sabato 17 Aprile 2027",
    teacherSlugs: ["luca-collino"],
    trainerLabel: "Luca Collino",
    sortOrder: 3,
    adminToggleable: true,
  },
  {
    slug: "master-volley",
    title: "Preparazione Fisica Pallavolo",
    subtitle:
      "Jump Higher, Play Stronger — la Preparazione Atletica nella Pallavolo",
    focus: "Strength & Conditioning specifico per la pallavolo di alto livello",
    duration: "1-2 giornate",
    date: "Sabato 17 Ottobre 2026",
    teacherSlugs: ["oscar-berti"],
    trainerLabel: "Oscar Berti",
    sortOrder: 4,
    adminToggleable: true,
  },
  {
    slug: "master-tennis",
    title: "Preparazione Fisica Tennis",
    subtitle: "Masterclass — Performance e Preparazione Atletica nel Tennis",
    focus:
      "Preparazione fisica, performance e metodologie applicate al tennis di alto livello",
    duration: "1-2 giornate",
    date: "Da definire",
    teacherSlugs: [],
    trainerLabel: "Ospite internazionale",
    sortOrder: 5,
    hidden: true,
    adminToggleable: true,
  },
  {
    slug: "master-rugby",
    title: "Rugby",
    subtitle: "Masterclass — Preparazione Fisica Rugby",
    focus: "Preparazione atletica specifica per il rugby",
    duration: "1-2 giornate",
    date: "Da definire",
    teacherSlugs: [],
    trainerLabel: "Ospite internazionale",
    sortOrder: 6,
    hidden: true,
    adminToggleable: true,
  },
  {
    slug: "master-running",
    title: "Running",
    subtitle:
      "Running Science Master — Tecnica, Performance e Prevenzione Infortuni",
    focus: "Performance e metodologia di allenamento per la corsa",
    duration: "1-2 giornate",
    date: "Sabato 28 Novembre 2026",
    teacherSlugs: ["ivan-pellizzari"],
    trainerLabel: "Ivan Pellizzari",
    sortOrder: 7,
    adminToggleable: true,
  },
  {
    slug: "master-nuoto",
    title: "Nuoto",
    subtitle: "Masterclass — S&C per il Nuoto d'élite",
    focus:
      "Preparazione fisica per il nuoto agonistico, dalla nazionale ai giovani talenti",
    duration: "1 giornata",
    date: "Sabato 27 Febbraio 2027",
    teacherSlugs: ["marco-magnani", "riccardo-aimini"],
    trainerLabel: "Marco Magnani + Riccardo Aimini",
    sortOrder: 9,
    adminToggleable: true,
  },
  // Permanently hidden — not admin-toggleable
  {
    slug: "sostieni-progetto",
    title: "Sostieni il Progetto",
    subtitle: "Un contributo che fa la differenza",
    focus:
      "Una donazione simbolica per supportare la crescita di Lacertosus Academy",
    duration: "Una tantum",
    date: "—",
    teacherSlugs: [],
    trainerLabel: "Il team Lacertosus Academy",
    sortOrder: 999,
    hidden: true,
  },
];

/** Lista pubblica statica — esclude le voci con `hidden: true`. */
export const PUBLIC_WORKSHOPS = WORKSHOPS.filter((w) => !w.hidden);

/** Tutte le masterclass che l'admin può attivare/disattivare dalla UI. */
export const ADMIN_TOGGLEABLE_WORKSHOPS = WORKSHOPS.filter(
  (w) => w.adminToggleable,
);

/**
 * Lista pubblica con visibilità admin-configurabile.
 * Per ogni workshop con adminToggleable=true, il valore in `visibility` ha
 * priorità sul flag statico `hidden`. Worksho senza chiave → default statico.
 * Permanentemente hidden (sostieni-progetto) restano sempre esclusi.
 */
export function resolvePublicWorkshops(
  visibility: MasterclassVisibilityMap,
): Workshop[] {
  return WORKSHOPS.filter((w) => {
    if (!w.adminToggleable) return !w.hidden; // not toggleable: use static
    return visibility[w.slug] ?? !w.hidden; // toggleable: DB value or static default
  });
}

export function getWorkshopBySlug(slug: string): Workshop | undefined {
  return WORKSHOPS.find((w) => w.slug === slug);
}
