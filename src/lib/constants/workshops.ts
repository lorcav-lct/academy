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
    title: "Strength",
    subtitle: "Masterclass — Strength Training Avanzato",
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
    subtitle: "Masterclass — Performance nel Calcio Professionistico",
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
    subtitle: "Masterclass — S&C per la Pallavolo",
    focus: "Strength & Conditioning specifico per la pallavolo di alto livello",
    duration: "1-2 giornate",
    date: "Da definire",
    teacherSlugs: ["oscar-berti"],
    trainerLabel: "Oscar Berti",
    sortOrder: 4,
  },
  {
    slug: "master-hyrox",
    title: "Hyrox",
    subtitle: "Masterclass — Preparazione Hyrox",
    focus: "Preparazione atletica e tecnica per competizioni Hyrox",
    duration: "1-2 giornate",
    date: "Da definire",
    teacherSlugs: [],
    trainerLabel: "Da definire",
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
    subtitle: "Masterclass — Running Performance",
    focus: "Performance e metodologia di allenamento per la corsa",
    duration: "1-2 giornate",
    date: "Da definire",
    teacherSlugs: ["ivan-pellizzari"],
    trainerLabel: "Ivan Pellizzari",
    sortOrder: 7,
  },
  {
    slug: "master-sport-combattimento",
    title: "Sport da Combattimento",
    subtitle: "Masterclass — Preparazione Atletica Arti Marziali",
    focus:
      "Preparazione fisica e atletica per sport da combattimento e arti marziali",
    duration: "1-2 giornate",
    date: "Da definire",
    teacherSlugs: [],
    trainerLabel: "Da definire",
    sortOrder: 8,
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
];

export function getWorkshopBySlug(slug: string): Workshop | undefined {
  return WORKSHOPS.find((w) => w.slug === slug);
}
