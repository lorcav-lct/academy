export interface Course {
  slug: string;
  title: string;
  subtitle: string;
  type: "block" | "fipe_session";
  blockNumber: number;
  blockName: "PRIMAL" | "VIS" | "VICTOR";
  curriculumLabel: string;
  area: string;
  duration: string;
  objective: string;
  curriculum: string[];
  dates: string[];
  sortOrder: number;
}

export const COURSES: Course[] = [
  {
    slug: "primal",
    title: "PRIMAL",
    subtitle: "Blocco I — Le Fondamenta",
    type: "block",
    blockNumber: 1,
    blockName: "PRIMAL",
    curriculumLabel: "CORPUS",
    area: "Functional Training",
    duration: "2 weekend",
    objective: "Fondamenti anatomici, biomeccanici e metodologici del movimento funzionale.",
    curriculum: [
      "Basi di anatomia",
      "Biomeccanica applicata al Functional Training",
      "Pattern di movimento fondamentali",
      "Consumo energetico",
      "Valutazione funzionale",
      "Programmazione e periodizzazione",
      "Dalla teoria alla pratica: allenarsi in modo funzionale",
      "Functional Training: gli attrezzi",
    ],
    dates: ["11-12 Settembre", "9-10 Ottobre"],
    sortOrder: 1,
  },
  {
    slug: "vis",
    title: "VIS",
    subtitle: "Blocco II — La Forza",
    type: "block",
    blockNumber: 2,
    blockName: "VIS",
    curriculumLabel: "VIS",
    area: "Strength & Conditioning",
    duration: "2 weekend",
    objective: "Sviluppo di forza, potenza e condizionamento.",
    curriculum: [
      "Fisiologia della forza",
      "Principi dello Strength & Conditioning",
      "Tecnica con bilanciere e manubri",
      "Sprint e potenza",
      "Programmazione S&C",
      "Costruzione del programma atleta",
      "S&C atleta tattico",
    ],
    dates: ["11-12 Dicembre", "15-16 Gennaio"],
    sortOrder: 3,
  },
  {
    slug: "victor",
    title: "VICTOR",
    subtitle: "Blocco III — La Vittoria",
    type: "block",
    blockNumber: 3,
    blockName: "VICTOR",
    curriculumLabel: "VICTOR",
    area: "Integrazione Professionale, Performance e Business",
    duration: "2 weekend",
    objective: "Formazione completa del professionista e imprenditore.",
    curriculum: [
      "Alimentazione e performance",
      "La collaborazione tra professionisti",
      "Recupero funzionale post intervento",
      "Il cuore e come allenarlo",
      "Rapporto con il cliente e il giusto approccio",
      "Strategie e branding",
      "Come ottimizzare i processi della tua attivita",
      "Il controllo dei numeri",
      "La storia di LCT",
    ],
    dates: ["12-13 Marzo", "9-10 Aprile"],
    sortOrder: 5,
  },
];

export const FIPE_SESSIONS = [
  { slug: "fipe-1", title: "Sessione FIPE I", dates: ["13-14 Novembre"], afterBlock: "PRIMAL", sortOrder: 2 },
  { slug: "fipe-2", title: "Sessione FIPE II", dates: ["12-13 Febbraio"], afterBlock: "VIS", sortOrder: 4 },
  { slug: "fipe-3", title: "Sessione FIPE III", dates: ["14-15 Maggio"], afterBlock: "VICTOR", sortOrder: 6 },
];

export function getCourseBySlug(slug: string): Course | undefined {
  return COURSES.find((c) => c.slug === slug);
}
