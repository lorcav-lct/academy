export interface Workshop {
  slug: string;
  title: string;
  focus: string;
  duration: string;
  date: string;
  icon: string;
  sortOrder: number;
}

export const WORKSHOPS: Workshop[] = [
  {
    slug: "master-hyrox",
    title: "Master Hyrox",
    focus: "Preparazione e tecnica per gare Hyrox",
    duration: "1-2 giornate",
    date: "26 Settembre",
    icon: "🏃",
    sortOrder: 1,
  },
  {
    slug: "master-calcio",
    title: "Master Preparazione Atletica nel Calcio",
    focus: "Programmazione, forza e condizionamento per il calcio",
    duration: "1-2 giornate",
    date: "24 Ottobre",
    icon: "⚽",
    sortOrder: 2,
  },
  {
    slug: "master-functional",
    title: "Master Functional Training",
    focus: "Approfondimento avanzato Functional Training",
    duration: "1-2 giornate",
    date: "28 Novembre",
    icon: "💪",
    sortOrder: 3,
  },
  {
    slug: "master-endurance",
    title: "Master Endurance",
    focus: "Allenamento di resistenza e capacità aerobica",
    duration: "1-2 giornate",
    date: "19 Dicembre",
    icon: "🫀",
    sortOrder: 4,
  },
  {
    slug: "master-nuoto",
    title: "Master Nuoto",
    focus: "Tecniche di allenamento e programmazione in acqua",
    duration: "1-2 giornate",
    date: "30 Gennaio",
    icon: "🏊",
    sortOrder: 5,
  },
  {
    slug: "master-rugby",
    title: "Master Rugby",
    focus: "Allenamento specifico per il rugby",
    duration: "1-2 giornate",
    date: "27 Febbraio",
    icon: "🏉",
    sortOrder: 6,
  },
  {
    slug: "master-volley",
    title: "Master Volley",
    focus: "Allenamento e prevenzione per il volley",
    duration: "1-2 giornate",
    date: "27 Marzo",
    icon: "🏐",
    sortOrder: 7,
  },
  {
    slug: "master-combattimento",
    title: "Master Sport da Combattimento",
    focus: "Preparazione atletica per arti marziali e combattimento",
    duration: "1-2 giornate",
    date: "24 Aprile",
    icon: "🥊",
    sortOrder: 8,
  },
];

export function getWorkshopBySlug(slug: string): Workshop | undefined {
  return WORKSHOPS.find((w) => w.slug === slug);
}
