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
  /** Long-form description shown on the percorso page block section */
  description: string;
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
    description:
      "Dalle basi scientifiche del movimento fino all'applicazione avanzata del Functional Training: un blocco formativo progettato per sviluppare una comprensione completa del corpo umano, della biomeccanica e delle metodologie di allenamento funzionale per la general population. Un percorso altamente pratico dove valutazione, programmazione e analisi del movimento si integrano per costruire coach capaci di leggere, correggere e migliorare la performance reale attraverso il Functional Training moderno.",
    curriculum: [
      "Chinesiologia applicata al Functional Training",
      "Metodologie avanzate per la valutazione della composizione corporea",
      "Framework aggiornato per la programmazione e il monitoraggio dell'allenamento",
      "Analisi biomeccanica strumentale: performance e prevenzione infortuni",
      "Allenamento funzionale per la general population: teoria e applicazione",
      "La Forza Circolare: i due tools cardinali",
    ],
    curriculumDescs: [
      "Studio del movimento umano applicato al Functional Training: leve, articolazioni, catene cinetiche e loro ottimizzazione nella pratica professionale.",
      "Tecniche avanzate (bioimpedenza, plicometria, antropometria) per misurare e monitorare la composizione corporea in ambito clinico e sportivo.",
      "Modello concettuale aggiornato per progettare, somministrare e monitorare l'allenamento fisico con rigore scientifico.",
      "Strumenti di analisi del movimento per ottimizzare la performance e ridurre il rischio di infortuni negli esercizi cardine.",
      "Costruire programmi di allenamento funzionale efficaci e sostenibili per persone non atlete: principi, progressioni e applicazione pratica.",
      "Giornata di studio e pratica sui due tools cardinali della Forza Circolare: applicazioni, varianti e progressioni didattiche.",
    ],
    dates: ["11-12 Settembre", "9-10 Ottobre"],
    teacherSlugs: [
      "guido-belli",
      "francesco-campa",
      "samuele-marcora",
      "marco-bani",
      "matteo-romanazzi",
      "luca-cerri",
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
    description:
      "Un blocco formativo dedicato allo sviluppo della forza e della preparazione atletica moderna, dove teoria, metodologia e applicazione pratica si integrano per costruire competenze avanzate nel Strength & Conditioning. Dalla periodizzazione dell'allenamento alla gestione della performance, il percorso approfondisce i principi che guidano lo sviluppo di forza, potenza, ipertrofia e condizionamento per atleti e operatori tattici, con un approccio concreto orientato alla prestazione reale.",
    curriculum: [
      "Periodizzazione dell'allenamento e architettura muscolare",
      "La complessità dell'allenamento di forza e ipertrofia",
      "Fondamentali di Squat, Panca e Stacco: errori, schemi motori e varianti",
      "Strength & Conditioning per lo sviluppo dell'atleta moderno",
      "Allenamento della forza in preparazione atletica e principi di periodizzazione",
      "Forza, condizionamento, prehab e recovery per la prontezza operativa",
    ],
    curriculumDescs: [
      "Periodizzazione, mesocicli e adattamenti dell'architettura muscolare conseguenti all'allenamento di forza.",
      "Variabili, principi e gestione delle complessità nei programmi di forza e ipertrofia di alto livello.",
      "Esecuzione tecnica dei tre fondamentali di powerlifting: schemi motori, errori comuni e varianti per ogni biotipo.",
      "Programmazione S&C per atleti di sport diversi: forza, potenza e velocità in chiave moderna.",
      "Periodizzazione della forza in preparazione atletica e principi di programmazione verso la gara.",
      "Forza, condizionamento, prehab e recovery per operatori tattici: prontezza operativa nel lungo termine.",
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
    description:
      "Un blocco formativo dedicato agli aspetti che completano il profilo del coach moderno: nutrizione, recupero, psicologia del movimento e sviluppo professionale. Dalla performance alla gestione del proprio brand, il percorso approfondisce tutte le competenze necessarie per costruire un professionista preparato, autorevole e capace di creare valore nel mondo fitness e performance.",
    curriculum: [
      "Nutrizione applicata alla performance",
      "Psicologia del movimento: attività fisica, mente e alimentazione",
      "L'importanza del recupero: longevità e performance",
      "Attività fisica e malattie neurodegenerative",
      "Strategia e crescita: sviluppare un progetto imprenditoriale solido",
      "Gestire l'immagine: posizionamento e creazione del valore",
      "Costruire un brand che genera valore",
      "Fare impresa oggi: strumenti e strategie per distinguersi",
    ],
    curriculumDescs: [
      "Strutturare alimentazione e integrazione per allenamento, recupero e prestazione di gara con basi scientifiche.",
      "Come l'attività fisica influenza mente e alimentazione: psicologia applicata al movimento e ai comportamenti del cliente.",
      "Strumenti potenti per velocizzare il recupero, migliorare la longevità e sostenere la performance nel tempo.",
      "Ruolo dell'esercizio fisico nella prevenzione e gestione delle malattie neurodegenerative: evidenze e protocolli.",
      "Strategia di posizionamento e crescita: dalla visione al modello operativo per costruire un'attività solida e sostenibile.",
      "Personal branding e gestione dell'immagine: strategie di posizionamento per distinguersi e creare valore percepito nel mercato.",
      "Costruire un brand che genera valore reale: incontro tra marketing, identità e business nel settore fitness.",
      "Fare impresa nel fitness oggi: strumenti, strategie e leve operative per distinguersi davvero dalla concorrenza.",
    ],
    dates: ["12-13 Marzo", "9-10 Aprile"],
    teacherSlugs: [
      "giacomo-zennaro",
      "riccardo-capello",
      "luca-bondi",
      "rosalba-romano",
      "simone-doti",
      "margherita-fonsato",
      "gionata-raffaelli",
      "anna-desi",
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
