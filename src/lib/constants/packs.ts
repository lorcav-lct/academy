/**
 * Lacertosus Academy — Prodotti acquistabili.
 * Bundle (Start/Pro/Elite) come offerta principale + singoli blocchi e masterclass.
 */
export interface StripePriceMap {
  /** Price ID dell'account/mode di test (Sandbox) */
  test: string;
  /** Price ID dell'account live Lacertosus (vuoto se non disponibile in live) */
  live: string;
}

export interface AcademyProduct {
  slug: string;
  name: string;
  subtitle: string;
  type: "course" | "certification" | "workshop" | "bundle";
  priceCents: number; // 0 = prezzo da definire
  /** ID Stripe Price separati per modalità: server-side risolve via resolveStripePriceId */
  stripePriceId: StripePriceMap;
  /** Se true, escluso da listing pubbliche e selezione bundle.
   *  Acquistabile solo via URL diretto. */
  hidden?: boolean;
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
    priceCents: 390000,
    stripePriceId: {
      test: "price_1TTKfPCGgXzYzpRpn7ygPM3i",
      live: "price_1TXNWwCE95vjZKhkk4Riao5A",
    },
    includes: [
      "FUNCTION — Blocco I: Functional Training (2 weekend)",
      "STRENGTH — Blocco II: Strength & Conditioning (2 weekend)",
      "SCIENCE — Blocco III: Business & Performance (2 weekend)",
      "Attestazione Functional Strength Master Trainer (rilasciata da CSEN)",
      "Riconoscimento NSCA · 2.0 CEU internazionali",
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
      "Il percorso completo + Personal Elite Trainer FIPE + 2 Masterclass",
    type: "bundle",
    priceCents: 490000,
    stripePriceId: {
      test: "price_1TTKfRCGgXzYzpRpXG0mXIRK",
      live: "price_1TXNV5CE95vjZKhk56HoiUkC",
    },
    includes: [
      "FUNCTION — Blocco I: Functional Training (2 weekend)",
      "STRENGTH — Blocco II: Strength & Conditioning (2 weekend)",
      "SCIENCE — Blocco III: Business & Performance (2 weekend)",
      "Attestazione Functional Strength Master Trainer (rilasciata da CSEN)",
      "Riconoscimento NSCA · 2.0 CEU internazionali",
      "Certificazione Personal Elite Trainer FIPE",
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
    priceCents: 700000,
    stripePriceId: {
      test: "price_1TTKfSCGgXzYzpRpKScATmfz",
      live: "price_1TUNq3CE95vjZKhk4WyHn34S",
    },
    includes: [
      "FUNCTION — Blocco I: Functional Training (2 weekend)",
      "STRENGTH — Blocco II: Strength & Conditioning (2 weekend)",
      "SCIENCE — Blocco III: Business & Performance (2 weekend)",
      "Attestazione Functional Strength Master Trainer (rilasciata da CSEN)",
      "Riconoscimento NSCA · 2.0 CEU internazionali",
      "Certificazione Personal Elite Trainer FIPE",
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
    stripePriceId: {
      test: "price_1T7tseCGgXzYzpRp7P4QCO5G",
      live: "", // Non creato in live mode (singolo blocco non venduto separatamente)
    },
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
    stripePriceId: {
      test: "price_1T7txACGgXzYzpRppAoYRDE5",
      live: "", // Non creato in live mode (singolo blocco non venduto separatamente)
    },
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
    stripePriceId: {
      test: "price_1T7tz9CGgXzYzpRpHDJ3UpuO",
      live: "", // Non creato in live mode (singolo blocco non venduto separatamente)
    },
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
    name: "Personal Elite Trainer FIPE",
    subtitle: "Riconoscimento nazionale e internazionale",
    type: "certification",
    priceCents: 0,
    stripePriceId: { test: "", live: "" },
    includes: [
      "Esame di certificazione Personal Elite Trainer FIPE",
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
    stripePriceId: {
      test: "price_1TTHXTCGgXzYzpRpk3Y3FOt2",
      live: "price_1TUNq9CE95vjZKhknKoRmtwV",
    },
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
    name: "Masterclass Strength Avanzato",
    subtitle:
      "Advanced Strength Programming — Programmazione dell'allenamento della forza",
    type: "workshop",
    priceCents: 49000,
    stripePriceId: {
      test: "price_1TTHXUCGgXzYzpRpPsx2IlXK",
      live: "price_1TUNq9CE95vjZKhkkAzoXj88",
    },
    workshopSlug: "master-strength",
    includes: [
      "1-2 giornate in presenza",
      "Andrea Quarto",
      "Materiale didattico",
      "Attestato di partecipazione",
    ],
    sortOrder: 21,
  },
  {
    slug: "master-calcio",
    name: "Masterclass Calcio",
    subtitle:
      "Elite Football Rehab Master — Prevenzione, recupero e ritorno alla massima performance",
    type: "workshop",
    priceCents: 49000,
    stripePriceId: {
      test: "price_1TTHXVCGgXzYzpRpzFkpuUDO",
      live: "price_1TUNq5CE95vjZKhkMx40Fiog",
    },
    workshopSlug: "master-calcio",
    includes: [
      "1-2 giornate in presenza",
      "Luca Collino — Sport Therapist Juventus",
      "Materiale didattico",
      "Attestato di partecipazione",
    ],
    sortOrder: 22,
  },
  {
    slug: "master-volley",
    name: "Masterclass Pallavolo",
    subtitle:
      "Jump Higher, Play Stronger — la preparazione atletica nella pallavolo",
    type: "workshop",
    priceCents: 49000,
    stripePriceId: {
      test: "price_1TTHXXCGgXzYzpRpyPbR688D",
      live: "price_1TUNq5CE95vjZKhkBBaDE4q2",
    },
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
    slug: "master-tennis",
    name: "Masterclass Tennis",
    subtitle: "Performance e preparazione atletica nel tennis di alto livello",
    type: "workshop",
    priceCents: 49000,
    stripePriceId: {
      test: "price_1TWHrvCGgXzYzpRpNsXfBsWX",
      live: "price_1TWIDnCE95vjZKhk1psEVRqi",
    },
    workshopSlug: "master-tennis",
    includes: [
      "1-2 giornate in presenza",
      "Piatti Tennis Center",
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
    stripePriceId: {
      test: "price_1TTHXZCGgXzYzpRpss0BrkXN",
      live: "price_1TUNq4CE95vjZKhkqzUqdQbe",
    },
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
    subtitle:
      "Running Science Master — Tecnica, Performance e Prevenzione Infortuni",
    type: "workshop",
    priceCents: 49000,
    stripePriceId: {
      test: "price_1TTHXbCGgXzYzpRp8SZ9K655",
      live: "price_1TUNq5CE95vjZKhkVOefqx7O",
    },
    workshopSlug: "master-running",
    includes: [
      "1-2 giornate in presenza",
      "Ivan Pellizzari — Tecnico F.I.T.R.I.",
      "Materiale didattico",
      "Attestato di partecipazione",
    ],
    sortOrder: 26,
  },
  {
    slug: "master-nuoto",
    name: "Masterclass Nuoto",
    subtitle: "S&C per il nuoto agonistico d'élite",
    type: "workshop",
    priceCents: 49000,
    stripePriceId: {
      test: "price_1TTHXeCGgXzYzpRpzy1i6LMB",
      live: "price_1TUNq8CE95vjZKhkj1pp4mih",
    },
    workshopSlug: "master-nuoto",
    includes: [
      "1 giornata in presenza",
      "Marco Magnani + Riccardo Aimini",
      "Materiale didattico",
      "Attestato di partecipazione",
    ],
    sortOrder: 28,
  },

  // ─── Hidden — accessibile solo via URL diretto ────────────────────────────
  {
    slug: "sostieni-progetto",
    name: "Sostieni il Progetto",
    subtitle: "Un contributo che fa la differenza",
    type: "workshop",
    priceCents: 1000,
    stripePriceId: {
      test: "", // Non disponibile in test mode
      live: "price_1TUPpKCE95vjZKhkjZoKYwRP",
    },
    workshopSlug: "sostieni-progetto",
    hidden: true,
    includes: [
      "Contributo simbolico al progetto Lacertosus Academy",
      "Ringraziamento personalizzato via email",
      "Accesso anticipato alle prossime iniziative",
      "Menzione nella community Sostenitori (opzionale)",
    ],
    sortOrder: 999,
  },
];

export function getProductBySlug(slug: string): AcademyProduct | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getBundles(): AcademyProduct[] {
  return PRODUCTS.filter((p) => p.type === "bundle" && !p.hidden);
}

/** Tutti i prodotti masterclass, inclusi quelli hidden. Utile per lookup
 *  per slug nelle pagine detail. Per le listing pubbliche usare
 *  `getPublicMasterclassProducts()`. */
export function getMasterclassProducts(): AcademyProduct[] {
  return PRODUCTS.filter((p) => p.type === "workshop");
}

export function getPublicMasterclassProducts(): AcademyProduct[] {
  return PRODUCTS.filter((p) => p.type === "workshop" && !p.hidden);
}

export function getCourseProducts(): AcademyProduct[] {
  return PRODUCTS.filter((p) => p.type === "course" && !p.hidden);
}

/**
 * Risolve il Stripe Price ID corretto in base alla modalità Stripe attiva
 * (`STRIPE_SECRET_KEY` lato server). Sicuro da chiamare anche in build/test —
 * se la env non è "sk_live_*" ricade automaticamente sul price test.
 *
 * NB: server-side only. Lato client `process.env.STRIPE_SECRET_KEY` è
 * undefined e tornerà sempre il price test (innocuo: il client passa solo
 * il packId, è il server a costruire la session Stripe).
 */
export function resolveStripePriceId(product: AcademyProduct): string {
  const isLive =
    typeof process !== "undefined" &&
    process.env?.STRIPE_SECRET_KEY?.startsWith("sk_live_") === true;
  return isLive ? product.stripePriceId.live : product.stripePriceId.test;
}

// Legacy aliases
export const PACKS = PRODUCTS;
export type Pack = AcademyProduct;
export const getPackBySlug = getProductBySlug;
