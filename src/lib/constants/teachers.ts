export interface Teacher {
  slug: string;
  name: string;
  role: string;
  bio: string;
  courses: string[];
  image_url?: string;
  color: string;
}

export const TEACHERS: Teacher[] = [
  // CORPUS — course: "corpus"
  {
    slug: "guido-belli",
    name: "Guido Belli",
    role: "Functional Training",
    bio: "Esperto di functional training e preparazione fisica con esperienza pluriennale nel settore.",
    courses: ["corpus"],
    color: "#F09226",
  },
  {
    slug: "francesco-campa",
    name: "Francesco Campa",
    role: "Docente Universitario — Scienze Motorie",
    bio: "PhD, Professore Associato all'Università di Padova.",
    courses: ["corpus"],
    color: "#D4AF37",
  },
  {
    slug: "samuele-marcora",
    name: "Samuele Marcora",
    role: "Fisiologia dell'Esercizio",
    bio: "Professore di Fisiologia dell'Esercizio all'Università di Bologna, tra i ricercatori più citati al mondo nel settore.",
    courses: ["corpus"],
    color: "#C0C0C0",
  },
  {
    slug: "juri-chechi",
    name: "Juri Chechi",
    role: "Campione Olimpico — Ginnastica",
    bio: "Campione Olimpico ad Atlanta 1996, plurimedagliato mondiale nella ginnastica artistica.",
    courses: ["corpus"],
    color: "#F09226",
  },
  {
    slug: "matteo-romanazzi",
    name: "Matteo Romanazzi",
    role: "Ricercatore in Biomeccanica",
    bio: "Ricercatore in biomeccanica e analisi del movimento 3D applicata a sport, riabilitazione e fitness — Università di Torino.",
    courses: ["corpus"],
    color: "#D4AF37",
  },
  {
    slug: "marco-bani",
    name: "Marco Bani",
    role: "Docente Universitario",
    bio: "Docente presso l'Università di Ferrara (UNIFE), esperto di metodologia dell'allenamento.",
    courses: ["corpus", "master-functional-bulgarian"],
    color: "#C0C0C0",
  },
  {
    slug: "pierluigi-mauro",
    name: "Pierluigi Mauro",
    role: "Kettlebell & Functional Expert",
    bio: "Primo ad introdurre in Italia l'utilizzo della Macebell; ideatore di un metodo basato su esercizi e protocolli a corpo libero, con Clubbell e Kettlebell.",
    courses: ["corpus", "master-functional-bulgarian"],
    color: "#CD7F32",
  },

  // VIS — course: "vis"
  {
    slug: "sandro-bartolomei",
    name: "Sandro Bartolomei",
    role: "Strength & Conditioning Researcher",
    bio: "Ricercatore Tenure Track in Exercise Physiology & Strength Training all'Università di Bologna.",
    courses: ["vis"],
    color: "#F09226",
  },
  {
    slug: "giuseppe-coratella",
    name: "Giuseppe Coratella",
    role: "Strength Specialist",
    bio: "World Top-2% most cited professor, specialista in Strength & Conditioning — Università di Milano.",
    courses: ["vis"],
    color: "#D4AF37",
  },
  {
    slug: "andrea-quarto",
    name: "Andrea Quarto",
    role: "Powerlifting Coach",
    bio: "Atleta olimpico e coach di ParaPowerlifting, specialista in tecnica avanzata di forza.",
    courses: ["vis", "master-strength"],
    color: "#C0C0C0",
  },
  {
    slug: "antonio-squillante",
    name: "Antonio Squillante",
    role: "Strength & Conditioning Coach",
    bio: "Preparatore atletico, docente e ricercatore universitario, tra le figure più influenti nello Strength & Conditioning italiano.",
    courses: ["vis"],
    color: "#F09226",
  },
  {
    slug: "luca-cerri",
    name: "Luca Cerri",
    role: "S&C Coach Internazionale",
    bio: "Co-founder FitFam, formatore di Strength & Conditioning con riconoscimento internazionale.",
    courses: ["vis"],
    color: "#D4AF37",
  },
  {
    slug: "tommaso-mazzia",
    name: "Tommaso Mazzia",
    role: "S&C Coach Internazionale",
    bio: "Co-founder FitFam, formatore di Strength & Conditioning con riconoscimento internazionale.",
    courses: ["vis"],
    color: "#C0C0C0",
  },
  {
    slug: "matteo-ferrari",
    name: "Matteo Ferrari",
    role: "Tennis S&C Coach ATP/WTA",
    bio: "Preparatore atletico ufficiale nel circuito professionistico ATP e WTA.",
    courses: ["vis"],
    color: "#F09226",
  },
  {
    slug: "massimiliano-febbi",
    name: "Massimiliano Febbi",
    role: "Fisioterapista & Ricercatore PhD",
    bio: "Fisioterapista, laureato in Scienze Motorie e PhD, titolare di cattedre universitarie e coordinatore del corso in Fisioterapia.",
    courses: ["vis"],
    color: "#D4AF37",
  },
  {
    slug: "angelo-zullo",
    name: "Angelo Zullo",
    role: "Forze Speciali & Athletic Performance Coach",
    bio: "Preparatore atletico per le Forze Speciali dell'Esercito Italiano, CFSC Athletic Performance Coach, Master in human movement optimization — Università di Pisa.",
    courses: ["vis"],
    color: "#CD7F32",
  },

  // VICTOR — course: "victor"
  {
    slug: "giacomo-zennaro",
    name: "Giacomo Zennaro",
    role: "Business & Performance",
    bio: "Esperto di business development e performance nel settore fitness e benessere.",
    courses: ["victor"],
    color: "#F09226",
  },
  {
    slug: "riccardo-capello",
    name: "Riccardo Capello",
    role: "Fitness Entrepreneur",
    bio: "Imprenditore nel settore fitness, fondatore di strutture di allenamento di riferimento.",
    courses: ["victor"],
    color: "#D4AF37",
  },
  {
    slug: "simone-doti",
    name: "Simone Doti",
    role: "Longevity & Lifestyle Coach",
    bio: "Longevity e Lifestyle Coach, esperto in crioterapia e protocolli di recupero avanzati.",
    courses: ["victor"],
    color: "#C0C0C0",
  },
  {
    slug: "elisabetta-borgia",
    name: "Elisabetta Borgia",
    role: "Sport Psychologist",
    bio: "Clinical & Sport Psychologist, Head of Psychology del team LidlTrek, Mental Support Coordinator Federciclismo.",
    courses: ["victor"],
    color: "#F09226",
  },
  {
    slug: "luca-bondi-elisa-sibilla",
    name: "Luca Bondi & Elisa Sibilla",
    role: "Psicologi Clinici",
    bio: "Psicologi e psicoterapeuti nel team dell'Oncologia Medica del Policlinico di Milano.",
    courses: ["victor"],
    color: "#D4AF37",
  },
  {
    slug: "filippo-ongaro",
    name: "Filippo Ongaro",
    role: "Medico Anti-Aging & ESA",
    bio: "Medico degli astronauti presso l'Agenzia Spaziale Europea (ESA) dal 2000 al 2007, primo medico italiano certificato in medicina anti-aging in USA (ABAARM), autore bestseller.",
    courses: ["victor"],
    color: "#C0C0C0",
  },
  {
    slug: "enrico-dellacasa",
    name: "Enrico Della Casa",
    role: "Imprenditore & Brand Strategist",
    bio: "Dirigente e imprenditore con oltre vent'anni di esperienza internazionale in sviluppo di brand, crescita aziendale e partnership nei settori lusso, mobilità, real estate e wellness.",
    courses: ["victor"],
    color: "#F09226",
  },
  {
    slug: "matteo-seghedoni",
    name: "Matteo Seghedoni",
    role: "Creative Director",
    bio: "Creative Director presso Ciao Comunicazione, leader nel settore della comunicazione strategica.",
    courses: ["victor"],
    color: "#D4AF37",
  },
  {
    slug: "jonata-raffaeli",
    name: "Jonata Raffaeli & Anna",
    role: "CEO & Founder Centro Aura",
    bio: "CEO e founder del Centro Aura, struttura di riferimento per il benessere integrato.",
    courses: ["victor"],
    color: "#C0C0C0",
  },
  {
    slug: "fabrizio-bramati",
    name: "Fabrizio Bramati",
    role: "CEO Att1tud — Ex Calciatore Pro",
    bio: "CEO e founder di Att1tud, ex calciatore professionista riconvertito in imprenditore del fitness.",
    courses: ["victor"],
    color: "#CD7F32",
  },
  {
    slug: "ettore-mendicino",
    name: "Ettore Mendicino",
    role: "FIGC Leadership & Performance",
    bio: "Responsabile tecnico FIGC per Leadership, Performance & Change.",
    courses: ["victor"],
    color: "#F09226",
  },

  // Masterclass-only teachers
  {
    slug: "ivan-ivanov",
    name: "Ivan Ivanov",
    role: "Bulgarian Method Specialist",
    bio: "Esperto internazionale del metodo bulgaro e del functional movement avanzato.",
    courses: ["master-functional-bulgarian"],
    color: "#D4AF37",
  },
  {
    slug: "emanuela-romano",
    name: "Emanuela Romano",
    role: "Strength Coach",
    bio: "Coach specializzata in strength training e preparazione atletica femminile.",
    courses: ["master-strength"],
    color: "#C0C0C0",
  },
  {
    slug: "mino-fulco",
    name: "Mino Fulco",
    role: "Elite Football Performance Coach",
    bio: "Performance Manager al Real Madrid, Everton FC, Napoli e Bayern Monaco. Dal 2025 Performance Coach della Nazionale del Brasile per la Coppa del Mondo.",
    courses: ["master-calcio"],
    color: "#F09226",
  },
  {
    slug: "oscar-berti",
    name: "Oscar Berti",
    role: "Volleyball S&C Coach",
    bio: "Strength & Conditioning Coach di Modena Volley e della Nazionale Italiana di Pallavolo.",
    courses: ["master-volley"],
    color: "#D4AF37",
  },
  {
    slug: "giovanni-benzon",
    name: "Giovanni Benzon",
    role: "Hyrox Specialist",
    bio: "Specialista in preparazione e performance per competizioni Hyrox.",
    courses: ["master-hyrox"],
    color: "#C0C0C0",
  },
  {
    slug: "fitri",
    name: "Fitri",
    role: "Running Coach",
    bio: "Coach specializzato in running performance e collaboratore del Running Club Parma.",
    courses: ["master-running"],
    color: "#F09226",
  },
];

export function getTeacherBySlug(slug: string): Teacher | undefined {
  return TEACHERS.find((t) => t.slug === slug);
}

export function getTeachersByCourse(courseSlug: string): Teacher[] {
  return TEACHERS.filter((t) => t.courses.includes(courseSlug));
}
