/**
 * Lacertosus Academy — Prodotti acquistabili singolarmente.
 * Nessun tier: ogni blocco, la certificazione e ogni master si acquistano individualmente.
 */
export interface AcademyProduct {
  slug: string;
  name: string;
  subtitle: string;
  type: "course" | "certification" | "workshop";
  priceCents: number;          // 0 = prezzo da definire
  stripePriceId: string;       // ID Stripe Price — da collegare dopo setup prodotti
  includes: string[];
  /** Corso/blocco corrispondente (solo per type=course) */
  courseSlug?: string;
  /** Workshop corrispondente (solo per type=workshop) */
  workshopSlug?: string;
  highlighted?: boolean;
  sortOrder: number;
}

export const PRODUCTS: AcademyProduct[] = [
  // ─── Blocchi formativi ───────────────────────────────────────────────
  {
    slug: "primal",
    name: "PRIMAL",
    subtitle: "Blocco I — Functional Training",
    type: "course",
    priceCents: 150000,
    stripePriceId: "",
    courseSlug: "primal",
    includes: [
      "2 weekend di formazione in presenza",
      "Anatomia e biomeccanica applicata",
      "Programmazione Functional Training",
      "Materiale didattico digitale",
      "Accesso alla community",
    ],
    sortOrder: 1,
  },
  {
    slug: "vis",
    name: "VIS",
    subtitle: "Blocco II — Strength & Conditioning",
    type: "course",
    priceCents: 250000,
    stripePriceId: "",
    courseSlug: "vis",
    includes: [
      "2 weekend di formazione in presenza",
      "Fisiologia della forza e S&C",
      "Tecnica con bilanciere e sprint",
      "Programmazione atleta tattico",
      "Materiale didattico digitale",
    ],
    highlighted: true,
    sortOrder: 2,
  },
  {
    slug: "victor",
    name: "VICTOR",
    subtitle: "Blocco III — Business & Performance",
    type: "course",
    priceCents: 500000,
    stripePriceId: "",
    courseSlug: "victor",
    includes: [
      "2 weekend di formazione in presenza",
      "Alimentazione e performance",
      "Strategie di business e branding",
      "Gestione clienti e processi",
      "Materiale didattico digitale",
    ],
    sortOrder: 3,
  },
  // ─── Certificazione ──────────────────────────────────────────────────
  {
    slug: "certificazione-fipe",
    name: "Certificazione FIPE",
    subtitle: "FipexLacertosus — Riconoscimento professionale",
    type: "certification",
    priceCents: 0,
    stripePriceId: "",
    includes: [
      "3 sessioni formative FipexLacertosus",
      "Certificato Personal Trainer FipexLacertosus",
      "Riconoscimento professionale nel settore",
      "Valutazione teorico-pratica delle competenze",
    ],
    sortOrder: 4,
  },
  // ─── Master (workshops acquistabili) ─────────────────────────────────
  {
    slug: "master-hyrox",
    name: "Master Hyrox",
    subtitle: "Workshop — Preparazione Hyrox",
    type: "workshop",
    priceCents: 50000,
    stripePriceId: "",
    workshopSlug: "master-hyrox",
    includes: ["1-2 giornate in presenza", "Materiale didattico", "Attestato di partecipazione"],
    sortOrder: 10,
  },
  {
    slug: "master-calcio",
    name: "Master Calcio",
    subtitle: "Workshop — Preparazione Atletica nel Calcio",
    type: "workshop",
    priceCents: 50000,
    stripePriceId: "",
    workshopSlug: "master-calcio",
    includes: ["1-2 giornate in presenza", "Materiale didattico", "Attestato di partecipazione"],
    sortOrder: 11,
  },
  {
    slug: "master-functional",
    name: "Master Functional Training",
    subtitle: "Workshop — Functional Training Avanzato",
    type: "workshop",
    priceCents: 50000,
    stripePriceId: "",
    workshopSlug: "master-functional",
    includes: ["1-2 giornate in presenza", "Materiale didattico", "Attestato di partecipazione"],
    sortOrder: 12,
  },
  {
    slug: "master-endurance",
    name: "Master Endurance",
    subtitle: "Workshop — Resistenza e Capacità Aerobica",
    type: "workshop",
    priceCents: 50000,
    stripePriceId: "",
    workshopSlug: "master-endurance",
    includes: ["1-2 giornate in presenza", "Materiale didattico", "Attestato di partecipazione"],
    sortOrder: 13,
  },
  {
    slug: "master-nuoto",
    name: "Master Nuoto",
    subtitle: "Workshop — Allenamento in Acqua",
    type: "workshop",
    priceCents: 50000,
    stripePriceId: "",
    workshopSlug: "master-nuoto",
    includes: ["1-2 giornate in presenza", "Materiale didattico", "Attestato di partecipazione"],
    sortOrder: 14,
  },
  {
    slug: "master-rugby",
    name: "Master Rugby",
    subtitle: "Workshop — Allenamento Specifico Rugby",
    type: "workshop",
    priceCents: 50000,
    stripePriceId: "",
    workshopSlug: "master-rugby",
    includes: ["1-2 giornate in presenza", "Materiale didattico", "Attestato di partecipazione"],
    sortOrder: 15,
  },
  {
    slug: "master-volley",
    name: "Master Volley",
    subtitle: "Workshop — Allenamento e Prevenzione Volley",
    type: "workshop",
    priceCents: 50000,
    stripePriceId: "",
    workshopSlug: "master-volley",
    includes: ["1-2 giornate in presenza", "Materiale didattico", "Attestato di partecipazione"],
    sortOrder: 16,
  },
  {
    slug: "master-combattimento",
    name: "Master Sport da Combattimento",
    subtitle: "Workshop — Preparazione Atletica Arti Marziali",
    type: "workshop",
    priceCents: 50000,
    stripePriceId: "",
    workshopSlug: "master-combattimento",
    includes: ["1-2 giornate in presenza", "Materiale didattico", "Attestato di partecipazione"],
    sortOrder: 17,
  },
];

export function getProductBySlug(slug: string): AcademyProduct | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

// Legacy alias per compatibilità con codice esistente
export const PACKS = PRODUCTS;
export type Pack = AcademyProduct;
export const getPackBySlug = getProductBySlug;
