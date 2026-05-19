export interface Teacher {
  slug: string;
  name: string;
  role: string;
  bio: string;
  courses: string[];
  image_url?: string;
  color: string;
  /** Titolo dell'intervento del docente all'interno dell'Academy */
  talkTitle?: string;
}

const BRAND = "#F09226";

export const TEACHERS: Teacher[] = [
  // ───────── FUNCTION ─────────
  {
    slug: "guido-belli",
    name: "Guido Belli",
    role: "PhD. Ricercatore (RTT), Chinesiologo, Massofisioterapista",
    bio: "Ricercatore e chinesiologo, esperto di kinesiologia applicata al movimento e alla preparazione funzionale.",
    courses: ["function"],
    image_url: "/docenti/guido-belli.webp",
    color: BRAND,
    talkTitle: "Chinesiologia applicata al movimento",
  },
  {
    slug: "francesco-campa",
    name: "Francesco Campa",
    role: "Professore Associato — Università degli Studi di Padova",
    bio: "Responsabile dell'insegnamento di Composizione Corporea nel Corso di Laurea in Scienze Motorie all'Università di Padova. Autore di oltre 100 pubblicazioni scientifiche internazionali, è riconosciuto tra i principali esperti a livello globale nella metodologia di valutazione della composizione corporea. La sua ricerca integra rigore scientifico e applicazione pratica con implicazioni in ambito clinico, sportivo e della performance umana.",
    courses: ["function"],
    image_url: "/docenti/francesco-campa.webp",
    color: BRAND,
    talkTitle:
      "Metodologie avanzate per la valutazione della composizione corporea e loro applicazioni in ambito clinico e sportivo",
  },
  {
    slug: "samuele-marcora",
    name: "Samuele Marcora",
    role: "Professore Ordinario di Scienze dell'Esercizio Fisico e dello Sport",
    bio: "Dopo una lunga carriera accademica in UK, dal 2020 è a Bologna a tempo pieno. La sua ricerca interdisciplinare integra fisiologia e psicologia per comprendere la prestazione umana. Autore di numerose pubblicazioni sulla fatica fisica e mentale, percezione dello sforzo, endurance, carico di allenamento e calcio. Nel 2025 Presidente del congresso annuale dell'European College of Sport Science. Consulente di CONI, FIGC, Federazione Ciclistica Italiana, Juventus, Arsenal, Bath Rugby, MAPEI Sport, Honda Racing e ASICS. Dal 2024 CrossFit Level 1 Trainer.",
    courses: ["function"],
    image_url: "/docenti/samuele-marcora.webp",
    color: BRAND,
    talkTitle:
      "Framework aggiornato per la programmazione e il monitoraggio dell'allenamento fisico",
  },
  {
    slug: "marco-bani",
    name: "Marco Bani",
    role: "Chinesiologo, Preparatore Fisico e Docente",
    bio: "Più di 15 anni di esperienza tra palestre, campi da basket e tennis, università e studi professionali, con un approccio al movimento che mette al centro la persona prima dello sport o della prestazione. Laurea in Scienze Motorie e Magistrale in Scienze e Tecniche dell'Attività Motoria Preventiva ed Adattata. Preparatore fisico per la Pallacanestro Mantovana e la Bonfiglioli Ferrara Basket; ex giocatore di basket fino alla Serie A. Specializzato con la Federazione Italiana Tennis e nel campo posturale avanzato (Metodo Canali e Souchard). Oggi titolare dello studio professionale “Educazione al Movimento” a Ferrara, dove integra prestazione, postura, rieducazione e prevenzione. Dal 2021 docente di seminario all'Università degli Studi di Ferrara.",
    courses: ["function", "master-functional-bulgarian"],
    image_url: "/docenti/marco-bani.webp",
    color: BRAND,
    talkTitle:
      "Specificità dell'allenamento e adattamenti del controllo posturale: basi teoriche e implicazioni applicative nelle scienze motorie",
  },
  {
    slug: "matteo-romanazzi",
    name: "Matteo Romanazzi",
    role: "PhD, Docente a contratto presso Università degli Studi di Torino",
    bio: "Docente di Chinesiologia e ricercatore in biomeccanica e analisi del movimento presso la SUISM (Università degli Studi di Torino). Vanta pubblicazioni in atti di convegni e riviste scientifiche sia nazionali che internazionali su argomenti riguardanti l'allenamento della forza, controllo motorio e biomeccanica. La sua ricerca si è concentrata sulle metodiche del Resistance Training oltre che sulle caratteristiche biomeccaniche di alcuni movimenti fondamentali contribuendo alla realizzazione e progettazione di attrezzature sportive.",
    courses: ["function"],
    image_url: "/docenti/matteo-romanazzi.webp",
    color: BRAND,
    talkTitle:
      "Analisi biomeccanica strumentale degli esercizi per l'ottimizzazione della performance e la prevenzione degli infortuni",
  },
  {
    slug: "luca-cerri",
    name: "Luca Cerri",
    role: "International Performance Coach | Co-Founder FitFam Sport & Conditioning",
    bio: "Co-fondatore di FitFam Sport & Conditioning, formatore di S&C con riconoscimento internazionale.",
    courses: ["function"],
    image_url: "/docenti/luca-cerri.webp",
    color: BRAND,
    talkTitle:
      "Teoria e applicazione dell'allenamento funzionale per la general population",
  },
  // ───────── STRENGTH ─────────
  {
    slug: "sandro-bartolomei",
    name: "Sandro Bartolomei",
    role: "Assistant Professor — Università di Bologna",
    bio: "Assistant Professor in tenure track presso il Dipartimento di Scienze per la Qualità della Vita dell'Università di Bologna. PhD, MS, CPO.",
    courses: ["strength"],
    image_url: "/docenti/sandro-bartolomei.webp",
    color: BRAND,
    talkTitle:
      "Periodizzazione dell'allenamento e cambiamenti nell'architettura muscolare conseguenti all'allenamento di forza",
  },
  {
    slug: "giuseppe-coratella",
    name: "Giuseppe Coratella",
    role: "Professore Associato — Università degli Studi di Milano",
    bio: "Docente di Teoria e Metodologia dell'Allenamento all'Università di Milano. Autore di più di 140 articoli scientifici sulle maggiori riviste internazionali del settore; dal 2023 è nel TOP-2% mondiale dell'intera area Sports Science. Nel 2025 insignito della Palma d'Oro CONI al merito tecnico per il suo contributo come preparatore fisico a tre record del mondo individuali femminili nel ciclismo su pista.",
    courses: ["strength"],
    image_url: "/docenti/giuseppe-coratella.webp",
    color: BRAND,
    talkTitle: "La complessità dell'allenamento di forza e ipertrofia",
  },
  {
    slug: "andrea-quarto",
    name: "Andrea Quarto",
    role: "Fitness & Sport Entrepreneur — Atleta Nazionale Italiana Para Powerlifting",
    bio: "Atleta della Nazionale Italiana di Para Powerlifting, ex Ufficiale Incursore, coach ufficiale di Stato Maggiore Marina Militare e imprenditore nel settore fitness.",
    courses: ["strength", "master-strength"],
    image_url: "/docenti/andrea-quarto.webp",
    color: BRAND,
    talkTitle:
      "Fondamentali di Squat, Panca e Stacco: errori, schemi motori e varianti",
  },
  {
    slug: "tommaso-mazzia",
    name: "Tommaso Mazzia",
    role: "International Performance Coach | Co-Founder FitFam Sport & Conditioning",
    bio: "Co-fondatore di FitFam Sport & Conditioning, formatore di S&C con riconoscimento internazionale.",
    courses: ["strength"],
    image_url: "/docenti/tommaso-mazzia.webp",
    color: BRAND,
    talkTitle: "Strength & Conditioning per lo sviluppo dell'atleta moderno",
  },
  {
    slug: "antonio-squillante",
    name: "Antonio Squillante",
    role: "Professore Associato di Kinesiologia — Point Loma Nazarene University",
    bio: "Professore Associato di Kinesiologia presso la Point Loma Nazarene University di San Diego e PhD in Fisiologia dell'Esercizio (USC). Quasi vent'anni di esperienza come preparatore atletico nello sport universitario e professionistico in Europa e Nord America. Nel 2026 gli è stato conferito il riconoscimento di Educator of the Year dalla NSCA. Dal 2023 membro del Consiglio di Amministrazione NSCA. Autore di pubblicazioni e relatore internazionale.",
    courses: ["strength"],
    image_url: "/docenti/antonio-squillante.webp",
    color: BRAND,
    talkTitle:
      "Allenamento della forza in preparazione atletica & Principi di programmazione e periodizzazione",
  },
  {
    slug: "massimiliano-febbi",
    name: "Massimiliano Febbi",
    role: "Professore Ordinario ACS College Malta",
    bio: "Professore Ordinario di Fisioterapia, Direttore del Corso di Laurea in Fisioterapia presso ACS Asomi College of Health Sciences, Direttore della Tactical Performance Academy e Head of Performance & Rehab Services della Nazionale Italiana di Pugilato.",
    courses: ["strength"],
    image_url: "/docenti/massimiliano-febbi.webp",
    color: BRAND,
    talkTitle:
      "Forza, condizionamento, prehab e recovery per la prontezza operativa nel lungo termine",
  },
  {
    slug: "angelo-zullo",
    name: "Angelo Zullo",
    role: "Maresciallo Paracadutisti dell'Esercito Italiano — S&C Coach Forze Speciali",
    bio: "Maresciallo Paracadutisti dell'Esercito Italiano, Strength & Conditioning Coach presso il Comando delle Forze Speciali.",
    courses: ["strength"],
    image_url: "/docenti/angelo-zullo.webp",
    color: BRAND,
    talkTitle:
      "Forza, condizionamento, prehab e recovery per la prontezza operativa nel lungo termine",
  },

  // ───────── SCIENCE ─────────
  {
    slug: "giacomo-zennaro",
    name: "Giacomo Zennaro",
    role: "Nutrizionista Sportivo & Performance Specialist",
    bio: "Biologo nutrizionista specializzato in nutrizione sportiva e ottimizzazione della performance. Lavora con atleti di discipline endurance, strength e sport ibridi, con un approccio basato su evidenze scientifiche e altamente applicativo. Traduce la complessità della nutrizione in strategie concrete per migliorare composizione corporea, performance e recupero.",
    courses: ["science"],
    image_url: "/docenti/giacomo-zennaro.webp",
    color: BRAND,
    talkTitle:
      "Nutrizione applicata alla performance: come strutturare l'alimentazione per allenamento, recupero e gara",
  },
  {
    slug: "riccardo-capello",
    name: "Riccardo Capello",
    role: "Osteopata | Esperto in Salute Posturale — Masso-fisioterapista Juventus FC",
    bio: "Osteopata ed esperto in salute posturale, masso-fisioterapista della Juventus FC. Lavora nel mondo del calcio professionistico ad alto livello con focus sulla prevenzione, il recupero e l'ottimizzazione fisica dell'atleta.",
    courses: ["science"],
    image_url: "/docenti/riccardo-capello.webp",
    color: BRAND,
  },
  {
    slug: "luca-bondi",
    name: "Luca Bondi",
    role: "Psicologo",
    bio: "Psicologo con esperienza in ambito ospedaliero e privato, aiuta adolescenti, adulti e sportivi ad affrontare momenti di difficoltà, stress, cambiamento e crescita personale. Si occupa anche della gestione dell'ambulatorio di psico-oncologia, accompagnando pazienti e familiari lungo il percorso di cura.",
    courses: ["science"],
    image_url: "/docenti/luca-bondi.webp",
    color: BRAND,
    talkTitle:
      "Psicologia del movimento: come l'attività fisica influenza mente e alimentazione",
  },
  {
    slug: "rosalba-romano",
    name: "Rosalba Romano",
    role: "Sport Psychologist",
    bio: "Psicologa dello sport esperta in mindset, performance e gestione mentale dell'atleta.",
    courses: ["science"],
    image_url: "/docenti/rosalba-romano.webp",
    color: BRAND,
    talkTitle: "Vinci o Impari: il mindset che cambia tutto",
  },
  {
    slug: "simone-doti",
    name: "Simone Doti",
    role: "Lifestyle & Longevity Coach | Cryotherapy Expert",
    bio: "Lifestyle & Longevity Coach esperto in crioterapia e protocolli di recupero avanzati.",
    courses: ["science"],
    image_url: "/docenti/simone-doti.webp",
    color: BRAND,
    talkTitle:
      "L'importanza del recupero: strumenti potenti per velocizzare il recupero, migliorare longevità e performance",
  },
  {
    slug: "margherita-fonsato",
    name: "Margherita Fonsato",
    role: "Fisioterapista specializzata nei Disordini del Movimento",
    bio: "Margherita Fonsato, Fisioterapista specializzata nei Disordini del Movimento: Laureata in Fisioterapia nel 2013 presso l'Università degli Studi di Ferrara, negli anni ha perfezionato la propria preparazione nel trattamento delle patologie neurologiche attraverso numerosi percorsi formativi. Recentemente, ha consolidato il suo profilo accademico conseguendo il Master di I Livello in Neuroscienze presso l'Università degli Studi di Genova. Svolge la propria attività clinica a Ferrara, dove si occupa del trattamento riabilitativo di pazienti con patologie neurologiche, con una specifica competenza nella Malattia di Parkinson. Parallelamente alla pratica professionale, ha ricoperto incarichi di docenza relativi alla Malattia di Parkinson per enti quali la Movement Disorder Society, Fondazione Limpe e FRESCO Foundation. Attualmente, collabora con l'Università di Ferrara in qualità di tutor per l'Attività Formativa Professionalizzante (AFP) rivolta agli studenti del terzo anno, approfondendo gli aspetti clinici legati alla Malattia di Parkinson.",
    courses: ["science"],
    image_url: "/docenti/margherita-fonsato.webp",
    color: BRAND,
    talkTitle: "Attività fisica e malattie neurodegenerative",
  },
  {
    slug: "gionata-raffaelli",
    name: "Gionata Raffaelli",
    role: "Co-Founder — Centro Aura",
    bio: "Co-founder del Centro Aura, struttura di riferimento per il benessere integrato.",
    courses: ["science"],
    image_url: "/docenti/gionata-raffaelli.webp",
    color: BRAND,
  },
  {
    slug: "anna-desi",
    name: "Anna Deisi",
    role: "Co-Founder — Centro Aura",
    bio: "Co-founder del Centro Aura, struttura di riferimento per il benessere integrato.",
    courses: ["science"],
    image_url: "/docenti/anna-desi.webp",
    color: BRAND,
  },
  {
    slug: "alex-lodovisi",
    name: "Alex Lodovisi",
    role: "Multi-Club Owner — Fitness Centers",
    bio: "Imprenditore nel settore fitness, multi-club owner di centri di allenamento.",
    courses: ["science"],
    image_url: "/docenti/alex-lodovisi.webp",
    color: BRAND,
  },
  {
    slug: "fabrizio-bramati",
    name: "Fabrizio Bramati",
    role: "Founder ATT1TUD",
    bio: "Founder di ATT1TUD, esperto di metodo, relazione e precisione nell'allenamento.",
    courses: ["science"],
    image_url: "/docenti/fabrizio-bramati.webp",
    color: BRAND,
    talkTitle: "ATT1TUD — Metodo, relazione e precisione",
  },
  {
    slug: "ettore-mendicino",
    name: "Ettore Mendicino",
    role: "Performance & Leadership",
    bio: "Esperto di performance, leadership e change management applicati allo sport e alle organizzazioni.",
    courses: ["science"],
    image_url: "/docenti/ettore-mendicino.webp",
    color: BRAND,
  },
  {
    slug: "enrico-dellacasa",
    name: "Enrico Della Casa",
    role: "International Business Leader | Brand Image, Positioning & Strategic Growth",
    bio: "Oltre vent'anni di esperienza internazionale nello sviluppo dell'immagine e del posizionamento strategico, nella crescita aziendale e nelle partnership internazionali. Ha lavorato in contesti di alto livello tra Europa e Stati Uniti, collaborando con realtà operative nei settori lusso, mobilità e servizi ad alto valore aggiunto, con family office internazionali a Boston e progetti immobiliari di alta gamma tra New York, Berlino, Siena, Amagansett e Ulaanbaatar.",
    courses: ["science"],
    image_url: "/docenti/enrico-dellacasa.webp",
    color: BRAND,
    talkTitle:
      "Gestire l'immagine: strategie di posizionamento e creazione del valore",
  },
  {
    slug: "matteo-seghedoni",
    name: "Matteo Seghedoni",
    role: "Marketing & Business Strategist",
    bio: "Esperto di marketing strategico e brand building nel settore del business.",
    courses: ["science"],
    image_url: "/docenti/matteo-seghedoni.webp",
    color: BRAND,
    talkTitle:
      "Costruire un brand che genera valore: strategie tra marketing e business",
  },

  // ───────── MASTERCLASS ─────────
  {
    slug: "ivan-ivanov",
    name: "Ivan Ivanov",
    role: "Founder & President of Suples | Master Educator, Entrepreneur",
    bio: "Founder e President di Suples, master educator internazionale del Bulgarian Bag Training System.",
    courses: ["master-functional-bulgarian"],
    image_url: "/docenti/ivan-ivanov.webp",
    color: BRAND,
    talkTitle:
      "Bulgarian Bag Training System: Strength, Power & Conditioning Masterclass",
  },
  {
    slug: "oscar-berti",
    name: "Oscar Berti",
    role: "Strength & Conditioning Coach — Modena Volley",
    bio: "Strength & Conditioning Coach di Modena Volley, tra i migliori preparatori nel panorama internazionale della pallavolo.",
    courses: ["master-volley"],
    image_url: "/docenti/oscar-berti.webp",
    color: BRAND,
    talkTitle:
      "Jump Higher, Play Stronger: la preparazione atletica nella pallavolo",
  },
  {
    slug: "ivan-pellizzari",
    name: "Ivan Pellizzari",
    role: "Tecnico Allenatore F.I.T.R.I.",
    bio: "Tecnico Allenatore della Federazione Italiana Triathlon, specialista in running performance, tecnica e prevenzione infortuni.",
    courses: ["master-running"],
    image_url: "/docenti/ivan-pellizzari.webp",
    color: BRAND,
    talkTitle:
      "Running Science Master — Tecnica, Performance e Prevenzione Infortuni",
  },
  {
    slug: "marco-magnani",
    name: "Marco Magnani",
    role: "S&C Coach Nuoto",
    bio: "Strength & Conditioning Coach specializzato nel nuoto agonistico. Segue da anni atleti del nuoto agonistico e giovani velocisti emergenti come Francesco Lazzari, Davide Lazzari e Mattia Morello. Il suo approccio integra forza, condizionamento e sviluppo della performance nel lungo termine.",
    courses: ["master-nuoto"],
    image_url: "/docenti/marco-magnani.webp",
    color: BRAND,
  },
  {
    slug: "riccardo-aimini",
    name: "Riccardo Aimini",
    role: "S&C Coach Nuoto",
    bio: "Strength & Conditioning Coach specializzato nel nuoto agonistico con atleti di interesse nazionale ed internazionale. Ha fatto parte in diverse occasioni dello staff tecnico della Nazionale Italiana di Nuoto lavorando al fianco di Marco Pedoja. Tra gli atleti seguiti: Nicolò Martinenghi (Oro Olimpico Parigi 2024), Matteo Rivolta, Alessandro Pinzuti e Ludovico Viberti.",
    courses: ["master-nuoto"],
    image_url: "/docenti/riccardo-aimini.webp",
    color: BRAND,
  },
  {
    slug: "piatti-tennis-center",
    name: "Piatti Tennis Center",
    role: "Centro di Alta Specializzazione Tennistica",
    bio: "Il Piatti Tennis Center, fondato da Riccardo Piatti, è un centro di riferimento internazionale per la formazione di tennisti d'élite, dove allenamento tecnico, preparazione fisica e performance management vengono integrati con un approccio scientifico al servizio del tennis di alto livello.",
    courses: ["master-tennis"],
    image_url: "/docenti/piatti-tennis-center.webp",
    color: BRAND,
    talkTitle: "Performance e Preparazione Atletica nel Tennis di Alto Livello",
  },
  {
    slug: "luca-collino",
    name: "Luca Collino",
    role: "Sport Therapist — Juventus",
    bio: "Sport Therapist presso la Juventus, specializzato nella prevenzione, recupero e ritorno alla massima performance dei calciatori d'élite.",
    courses: ["master-calcio"],
    image_url: "/docenti/luca-collino.webp",
    color: BRAND,
    talkTitle:
      "Elite Football Rehab Master — Prevenzione, Recupero e Ritorno alla Massima Performance",
  },
];

export function getTeacherBySlug(slug: string): Teacher | undefined {
  return TEACHERS.find((t) => t.slug === slug);
}

export function getTeachersByCourse(courseSlug: string): Teacher[] {
  return TEACHERS.filter((t) => t.courses.includes(courseSlug));
}

/**
 * Slugs to surface first in public-facing showcases (home carousel, /docenti grid).
 * Order matters — first slug becomes the first card. Slugs not listed keep their
 * original order from TEACHERS after the featured ones.
 */
export const FEATURED_TEACHER_ORDER: readonly string[] = [
  "andrea-quarto",
  "antonio-squillante",
  "angelo-zullo",
  "luca-collino",
  "samuele-marcora",
];

/**
 * TEACHERS reordered with the featured slugs first (in FEATURED_TEACHER_ORDER
 * order), followed by every other teacher in the original declaration order.
 */
export function getOrderedTeachers(): Teacher[] {
  const featured = FEATURED_TEACHER_ORDER.map((s) =>
    TEACHERS.find((t) => t.slug === s),
  ).filter((t): t is Teacher => Boolean(t));
  const featuredSet = new Set(featured.map((t) => t.slug));
  const rest = TEACHERS.filter((t) => !featuredSet.has(t.slug));
  return [...featured, ...rest];
}
