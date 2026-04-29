export interface Course {
  slug: string;
  title: string;
  subtitle: string;
  type: "block" | "fipe_session";
  blockNumber: number;
  blockName: "FUNCTION" | "STRENGTH" | "SCIENCE";
  curriculumLabel: string;
  area: string;
  duration: string;
  objective: string;
  curriculum: string[];
  /** One-sentence description for each curriculum item (parallel array) */
  curriculumDescs: string[];
  dates: string[];
  /** Slugs of teachers involved in this course block */
  teacherSlugs: string[];
  sortOrder: number;
}

export const COURSES: Course[] = [
  {
    slug: "function",
    title: "FUNCTION",
    subtitle: "Blocco I — Le Fondamenta",
    type: "block",
    blockNumber: 1,
    blockName: "FUNCTION",
    curriculumLabel: "FUNCTION",
    area: "Functional Training",
    duration: "2 weekend",
    objective:
      "Fondamenti anatomici, biomeccanici e metodologici del movimento funzionale.",
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
    curriculumDescs: [
      "Sistema muscolo-scheletrico, principali gruppi muscolari e loro ruolo nei movimenti compound.",
      "Analisi di forze, leve e articolazioni per ottimizzare sicurezza ed efficacia degli esercizi.",
      "I 7 pattern primari — push, pull, hinge, squat, carry, rotation, gait — base di ogni programmazione.",
      "Metabolismo energetico e substrati utilizzati durante sessioni di allenamento funzionale ad alta intensità.",
      "Screening posturale e analisi del movimento per individuare limitazioni e asimmetrie nel soggetto.",
      "Struttura del microciclo, mesociclo e macrociclo applicata al Functional Training.",
      "Trasferimento delle competenze teoriche nella costruzione di sessioni reali, progressive ed efficaci.",
      "Utilizzo avanzato di TRX, kettlebell, sandbag, slam ball e parallette nel contesto funzionale.",
    ],
    dates: ["11-12 Settembre", "9-10 Ottobre"],
    teacherSlugs: [
      "guido-belli",
      "francesco-campa",
      "samuele-marcora",
      "marco-bani",
      "matteo-romanazzi",
      "luca-cerri",
      "pierluigi-mauro",
    ],
    sortOrder: 1,
  },
  {
    slug: "strength",
    title: "STRENGTH",
    subtitle: "Blocco II — La Forza",
    type: "block",
    blockNumber: 2,
    blockName: "STRENGTH",
    curriculumLabel: "STRENGTH",
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
    curriculumDescs: [
      "Meccanismi neuromuscolari, tipologie di fibre muscolari e adattamenti fisiologici all'allenamento della forza.",
      "Fondamenti metodologici dell'S&C: intensità, volume, densità e specificità nel disegno del programma.",
      "Esecuzione tecnica di squat, stacco, distensione, clean e jerk — analisi e correzione con video.",
      "Meccanica dello sprint, accelerazione, decelerazione e allenamento pliometrico per la potenza esplosiva.",
      "Periodizzazione avanzata: block periodization, undulating periodization e gestione del taper.",
      "Personalizzazione del programma in base al profilo atletico, discipline sportiva e obiettivi specifici.",
      "Preparazione fisica per forze dell'ordine, militari e operatori in contesti ad alto stress operativo.",
    ],
    dates: ["11-12 Dicembre", "15-16 Gennaio"],
    teacherSlugs: [
      "sandro-bartolomei",
      "giuseppe-coratella",
      "andrea-quarto",
      "antonio-squillante",
      "tommaso-mazzia",
      "massimiliano-febbi",
      "angelo-zullo",
    ],
    sortOrder: 3,
  },
  {
    slug: "science",
    title: "SCIENCE",
    subtitle: "Blocco III — La Vittoria",
    type: "block",
    blockNumber: 3,
    blockName: "SCIENCE",
    curriculumLabel: "SCIENCE",
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
    curriculumDescs: [
      "Nutrizione sportiva applicata: timing dei macronutrienti, integrazione e strategie per la composizione corporea.",
      "Modelli di lavoro interdisciplinare con medici, fisioterapisti e nutrizionisti nella gestione del cliente.",
      "Protocolli di riatletizzazione: dalla fase riabilitativa al ritorno progressivo alla performance sportiva.",
      "Fisiologia cardiovascolare e metodologie di allenamento aerobico e HIIT per diverse popolazioni.",
      "Comunicazione efficace, motivazione intrinseca e gestione della relazione professionale nel lungo periodo.",
      "Posizionamento professionale, costruzione del brand personale e strategie di marketing nel settore fitness.",
      "Gestione operativa dello studio: flussi di lavoro, strumenti digitali e automazione dei processi.",
      "Finanza base per il professionista: pricing, break-even, modelli di revenue e KPI da monitorare.",
      "Il modello Lacertosus: nascita, valori fondanti, metodologia e visione imprenditoriale del brand.",
    ],
    dates: ["12-13 Marzo", "9-10 Aprile"],
    teacherSlugs: [
      "giacomo-zennaro",
      "riccardo-capello",
      "luca-bondi-elisa-sibilla",
      "elisabetta-borgia",
      "simone-doti",
      "margherita-fonsato",
      "jonata-raffaeli",
      "alex-lodovisi",
      "fabrizio-bramati",
      "ettore-mendicino",
      "enrico-dellacasa",
      "matteo-seghedoni",
    ],
    sortOrder: 5,
  },
];

export const FIPE_SESSIONS = [
  {
    slug: "fipe-1",
    title: "Sessione FIPE I",
    dates: ["13-14 Novembre"],
    afterBlock: "FUNCTION",
    sortOrder: 2,
  },
  {
    slug: "fipe-2",
    title: "Sessione FIPE II",
    dates: ["12-13 Febbraio"],
    afterBlock: "STRENGTH",
    sortOrder: 4,
  },
  {
    slug: "fipe-3",
    title: "Sessione FIPE III",
    dates: ["14-15 Maggio"],
    afterBlock: "SCIENCE",
    sortOrder: 6,
  },
];

export function getCourseBySlug(slug: string): Course | undefined {
  return COURSES.find((c) => c.slug === slug);
}
