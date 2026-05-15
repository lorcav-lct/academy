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
}

export const WORKSHOPS: Workshop[] = [
  {
    slug: "master-functional-bulgarian",
    title: "Functional Movement & Bulgarian",
    subtitle: "Masterclass — Metodo Bulgaro e Functional Training",
    focus: "Metodo bulgaro avanzato e pattern di movimento funzionale",
    duration: "1-2 giornate",
    date: "Da definire",
    teacherSlugs: ["ivan-ivanov", "pierluigi-mauro"],
    trainerLabel: "Ivan Ivanov + Pierluigi Mauro",
    sortOrder: 1,
  },
  {
    slug: "master-strength",
    title: "Strength Avanzato",
    subtitle:
      "Advanced Strength Programming — Programmazione dell'Allenamento della Forza",
    focus: "Tecnica avanzata di forza, programmazione e performance",
    duration: "1-2 giornate",
    date: "Da definire",
    teacherSlugs: ["andrea-quarto"],
    trainerLabel: "Andrea Quarto",
    sortOrder: 2,
  },
  {
    slug: "master-calcio",
    title: "Preparazione Fisica Calcio",
    subtitle:
      "Elite Football Rehab Master — Prevenzione, Recupero e Ritorno alla Massima Performance",
    focus: "Preparazione atletica e performance management nel calcio d'élite",
    duration: "1-2 giornate",
    date: "Da definire",
    teacherSlugs: ["luca-collino"],
    trainerLabel: "Luca Collino",
    sortOrder: 3,
  },
  {
    slug: "master-volley",
    title: "Preparazione Fisica Pallavolo",
    subtitle:
      "Jump Higher, Play Stronger — la Preparazione Atletica nella Pallavolo",
    focus: "Strength & Conditioning specifico per la pallavolo di alto livello",
    duration: "1-2 giornate",
    date: "Da definire",
    teacherSlugs: ["oscar-berti"],
    trainerLabel: "Oscar Berti",
    sortOrder: 4,
  },
  {
    slug: "master-tennis",
    title: "Preparazione Fisica Tennis",
    subtitle: "Masterclass — Performance e Preparazione Atletica nel Tennis",
    focus:
      "Preparazione fisica, performance e metodologie applicate al tennis di alto livello",
    duration: "1-2 giornate",
    date: "Da definire",
    teacherSlugs: ["piatti-tennis-center"],
    trainerLabel: "Piatti Tennis Center",
    sortOrder: 5,
  },
  {
    slug: "master-rugby",
    title: "Rugby",
    subtitle: "Masterclass — Preparazione Fisica Rugby",
    focus: "Preparazione atletica specifica per il rugby",
    duration: "1-2 giornate",
    date: "Da definire",
    teacherSlugs: [],
    trainerLabel: "Da definire",
    sortOrder: 6,
  },
  {
    slug: "master-running",
    title: "Running",
    subtitle:
      "Running Science Master — Tecnica, Performance e Prevenzione Infortuni",
    focus: "Performance e metodologia di allenamento per la corsa",
    duration: "1-2 giornate",
    date: "Da definire",
    teacherSlugs: ["ivan-pellizzari"],
    trainerLabel: "Ivan Pellizzari",
    sortOrder: 7,
  },
  {
    slug: "master-nuoto",
    title: "Nuoto",
    subtitle: "Masterclass — S&C per il Nuoto d'élite",
    focus:
      "Preparazione fisica per il nuoto agonistico, dalla nazionale ai giovani talenti",
    duration: "1-2 giornate",
    date: "Da definire",
    teacherSlugs: ["marco-magnani", "riccardo-aimini"],
    trainerLabel: "Marco Magnani + Riccardo Aimini",
    sortOrder: 9,
  },
  // Hidden — accessibile solo via URL diretto /masterclass/sostieni-progetto
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

/** Lista pubblica — esclude le voci con `hidden: true`. Usare ovunque la lista
 *  è mostrata all'utente (grid, preview, selettori bundle, sitemap, footer). */
export const PUBLIC_WORKSHOPS = WORKSHOPS.filter((w) => !w.hidden);

export function getWorkshopBySlug(slug: string): Workshop | undefined {
  return WORKSHOPS.find((w) => w.slug === slug);
}
