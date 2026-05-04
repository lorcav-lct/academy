/**
 * Lacertosus Academy — Prodotti acquistabili.
 * Bundle (Start/Pro/Elite) come offerta principale + singoli blocchi e masterclass.
 */
export interface AcademyProduct {
  slug: string;
  name: string;
  subtitle: string;
  type: "course" | "certification" | "workshop" | "bundle";
  priceCents: number; // 0 = prezzo da definire
  stripePriceId: string; // ID Stripe Price — da collegare dopo setup prodotti
  includes: string[];
  /** Corso/blocco corrispondente (solo per type=course) */
  courseSlug?: string;
  /** Workshop corrispondente (solo per type=workshop) */
  workshopSlug?: string;
  /** Numero di masterclass selezionabili (bundle Pro/Elite = 2, Start = 0) */
  masterclassSelectionCount?: number;
  /** Vitto e alloggio inclusi (solo bundle Elite) */
  includesAccommodation?: boolean;
  highlighted?: boolean;
  sortOrder: number;
}

export const PRODUCTS: AcademyProduct[] = [
  // ─── Bundle ──────────────────────────────────────────────────────────────
  {
    slug: "start",
    name: "START",
    subtitle: "Il percorso completo — 3 blocchi formativi",
    type: "bundle",
    priceCents: 0,
    stripePriceId: "",
    includes: [
      "FUNCTION — Blocco I: Functional Training (2 weekend)",
      "STRENGTH — Blocco II: Strength & Conditioning (2 weekend)",
      "SCIENCE — Blocco III: Business & Performance (2 weekend)",
      "Attestazione Functional Strength Master Coach",
      "9 mesi di formazione in presenza",
      "Materiale didattico digitale",
      "Accesso alla community Lacertosus",
    ],
    masterclassSelectionCount: 0,
    sortOrder: 1,
  },
  {
    slug: "pro",
    name: "PRO",
    subtitle:
      "Il percorso completo + Personal Trainer FIPE × Lacertosus + 2 Masterclass",
    type: "bundle",
    priceCents: 0,
    stripePriceId: "",
    includes: [
      "FUNCTION — Blocco I: Functional Training (2 weekend)",
      "STRENGTH — Blocco II: Strength & Conditioning (2 weekend)",
      "SCIENCE — Blocco III: Business & Performance (2 weekend)",
      "Attestazione Functional Strength Master Coach",
      "Certificazione Personal Trainer FIPE × Lacertosus",
      "2 Masterclass a scelta tra le 9 disponibili",
      "9 mesi di formazione in presenza",
      "Materiale didattico digitale",
      "Accesso alla community Lacertosus",
    ],
    masterclassSelectionCount: 2,
    highlighted: true,
    sortOrder: 2,
  },
  {
    slug: "elite",
    name: "ELITE",
    subtitle: "L'esperienza completa — con vitto e alloggio inclusi",
    type: "bundle",
    priceCents: 0,
    stripePriceId: "",
    includes: [
      "FUNCTION — Blocco I: Functional Training (2 weekend)",
      "STRENGTH — Blocco II: Strength & Conditioning (2 weekend)",
      "SCIENCE — Blocco III: Business & Performance (2 weekend)",
      "Attestazione Functional Strength Master Coach",
      "Certificazione Personal Trainer FIPE × Lacertosus",
      "2 Masterclass a scelta tra le 9 disponibili",
      "Vitto e alloggio inclusi per tutta la durata",
      "9 mesi di formazione in presenza",
      "Materiale didattico digitale",
      "Accesso prioritario alla community Lacertosus",
    ],
    masterclassSelectionCount: 2,
    includesAccommodation: true,
    sortOrder: 3,
  },

  // ─── Blocchi formativi (acquistabili separatamente) ───────────────────────
  {
    slug: "function",
    name: "FUNCTION",
    subtitle: "Blocco I — Functional Training",
    type: "course",
    priceCents: 150000,
    stripePriceId: "price_1T7tseCGgXzYzpRp7P4QCO5G",
    courseSlug: "function",
    includes: [
      "2 weekend di formazione in presenza",
      "Anatomia e biomeccanica applicata",
      "Programmazione Functional Training",
      "Materiale didattico digitale",
      "Accesso alla community",
    ],
    sortOrder: 10,
  },
  {
    slug: "strength",
    name: "STRENGTH",
    subtitle: "Blocco II — Strength & Conditioning",
    type: "course",
    priceCents: 250000,
    stripePriceId: "price_1T7txACGgXzYzpRppAoYRDE5",
    courseSlug: "strength",
    includes: [
      "2 weekend di formazione in presenza",
      "Fisiologia della forza e S&C",
      "Tecnica con bilanciere e sprint",
      "Programmazione atleta tattico",
      "Materiale didattico digitale",
    ],
    highlighted: false,
    sortOrder: 11,
  },
  {
    slug: "science",
    name: "SCIENCE",
    subtitle: "Blocco III — Business & Performance",
    type: "course",
    priceCents: 500000,
    stripePriceId: "price_1T7tz9CGgXzYzpRpHDJ3UpuO",
    courseSlug: "science",
    includes: [
      "2 weekend di formazione in presenza",
      "Alimentazione e performance",
      "Strategie di business e branding",
      "Gestione clienti e processi",
      "Materiale didattico digitale",
    ],
    sortOrder: 12,
  },

  // ─── Certificazione ───────────────────────────────────────────────────────
  {
    slug: "certificazione-fipe",
    name: "Personal Trainer FIPE × Lacertosus",
    subtitle: "Riconoscimento nazionale e internazionale",
    type: "certification",
    priceCents: 0,
    stripePriceId: "",
    includes: [
      "Esame di certificazione FIPE × Lacertosus",
      "Riconoscimento nazionale e internazionale",
      "Spendibile in palestre e strutture sportive in Italia e all'estero",
      "Accesso al registro professionisti",
    ],
    sortOrder: 13,
  },

  // ─── Masterclass (acquistabili separatamente) ─────────────────────────────
  {
    slug: "master-functional-bulgarian",
    name: "Masterclass Functional Movement & Bulgarian",
    subtitle: "Metodo bulgaro e functional training avanzato",
    type: "workshop",
    priceCents: 49000,
    stripePriceId: "price_1TTHXTCGgXzYzpRpk3Y3FOt2",
    workshopSlug: "master-functional-bulgarian",
    includes: [
      "1-2 giornate in presenza",
      "Ivan Ivanov + Pierluigi Mauro",
      "Materiale didattico",
      "Attestato di partecipazione",
    ],
    sortOrder: 20,
  },
  {
    slug: "master-strength",
    name: "Masterclass Strength",
    subtitle: "Strength training avanzato e performance",
    type: "workshop",
    priceCents: 49000,
    stripePriceId: "price_1TTHXUCGgXzYzpRpPsx2IlXK",
    workshopSlug: "master-strength",
    includes: [
      "1-2 giornate in presenza",
      "Andrea Quarto + Emanuela Romano",
      "Materiale didattico",
      "Attestato di partecipazione",
    ],
    sortOrder: 21,
  },
  {
    slug: "master-calcio",
    name: "Masterclass Calcio",
    subtitle: "Preparazione fisica nel calcio professionistico",
    type: "workshop",
    priceCents: 49000,
    stripePriceId: "price_1TTHXVCGgXzYzpRpzFkpuUDO",
    workshopSlug: "master-calcio",
    includes: [
      "1-2 giornate in presenza",
      "Mino Fulco",
      "Materiale didattico",
      "Attestato di partecipazione",
    ],
    sortOrder: 22,
  },
  {
    slug: "master-volley",
    name: "Masterclass Pallavolo",
    subtitle: "S&C per la pallavolo di alto livello",
    type: "workshop",
    priceCents: 49000,
    stripePriceId: "price_1TTHXXCGgXzYzpRpyPbR688D",
    workshopSlug: "master-volley",
    includes: [
      "1-2 giornate in presenza",
      "Oscar Berti",
      "Materiale didattico",
      "Attestato di partecipazione",
    ],
    sortOrder: 23,
  },
  {
    slug: "master-hyrox",
    name: "Masterclass Hyrox",
    subtitle: "Preparazione e performance per Hyrox",
    type: "workshop",
    priceCents: 49000,
    stripePriceId: "price_1TTHXYCGgXzYzpRpSShW9Ewg",
    workshopSlug: "master-hyrox",
    includes: [
      "1-2 giornate in presenza",
      "Giovanni Benzon",
      "Materiale didattico",
      "Attestato di partecipazione",
    ],
    sortOrder: 24,
  },
  {
    slug: "master-rugby",
    name: "Masterclass Rugby",
    subtitle: "Preparazione atletica specifica per il rugby",
    type: "workshop",
    priceCents: 49000,
    stripePriceId: "price_1TTHXZCGgXzYzpRpss0BrkXN",
    workshopSlug: "master-rugby",
    includes: [
      "1-2 giornate in presenza",
      "Trainer da definire",
      "Materiale didattico",
      "Attestato di partecipazione",
    ],
    sortOrder: 25,
  },
  {
    slug: "master-running",
    name: "Masterclass Running",
    subtitle: "Performance e metodologia per la corsa",
    type: "workshop",
    priceCents: 49000,
    stripePriceId: "price_1TTHXbCGgXzYzpRp8SZ9K655",
    workshopSlug: "master-running",
    includes: [
      "1-2 giornate in presenza",
      "Fitri — Running Club Parma",
      "Materiale didattico",
      "Attestato di partecipazione",
    ],
    sortOrder: 26,
  },
  {
    slug: "master-sport-combattimento",
    name: "Masterclass Sport da Combattimento",
    subtitle: "Preparazione atletica per arti marziali",
    type: "workshop",
    priceCents: 49000,
    stripePriceId: "price_1TTHXcCGgXzYzpRp6FSkEbcO",
    workshopSlug: "master-sport-combattimento",
    includes: [
      "1-2 giornate in presenza",
      "Trainer da definire",
      "Materiale didattico",
      "Attestato di partecipazione",
    ],
    sortOrder: 27,
  },
  {
    slug: "master-nuoto",
    name: "Masterclass Nuoto",
    subtitle: "S&C per il nuoto agonistico d'élite",
    type: "workshop",
    priceCents: 49000,
    stripePriceId: "price_1TTHXeCGgXzYzpRpzy1i6LMB",
    workshopSlug: "master-nuoto",
    includes: [
      "1-2 giornate in presenza",
      "Marco Magnani + Riccardo Aimini",
      "Materiale didattico",
      "Attestato di partecipazione",
    ],
    sortOrder: 28,
  },
];

export function getProductBySlug(slug: string): AcademyProduct | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getBundles(): AcademyProduct[] {
  return PRODUCTS.filter((p) => p.type === "bundle");
}

export function getMasterclassProducts(): AcademyProduct[] {
  return PRODUCTS.filter((p) => p.type === "workshop");
}

export function getCourseProducts(): AcademyProduct[] {
  return PRODUCTS.filter((p) => p.type === "course");
}

// Legacy aliases
export const PACKS = PRODUCTS;
export type Pack = AcademyProduct;
export const getPackBySlug = getProductBySlug;
