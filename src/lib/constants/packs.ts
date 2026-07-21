/**
 * Lacertosus Academy — Prodotti acquistabili.
 * Bundle (Start/Pro/Elite) come offerta principale + singoli blocchi e masterclass.
 */
import type { MasterclassVisibilityMap } from "@/lib/settings/masterclass-visibility";
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
  /** Se true, l'admin può abilitare/disabilitare questo prodotto dalla UI. */
  adminToggleable?: boolean;
  /** Se true (solo type=workshop), è una Masterclass International: categoria
   *  dedicata, NON inclusa nei pack, offerte gestite separatamente. */
  international?: boolean;
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
    subtitle: "Il percorso completo + Personal Trainer FIPE + 2 Masterclass",
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
      "Certificazione Personal Trainer FIPE",
      "2 Masterclass a scelta tra le 8 disponibili",
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
      "Certificazione Personal Trainer FIPE",
      "2 Masterclass a scelta tra le 8 disponibili",
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
    name: "Personal Trainer FIPE",
    subtitle: "Riconoscimento nazionale e internazionale",
    type: "certification",
    priceCents: 0,
    stripePriceId: { test: "", live: "" },
    includes: [
      "Esame di certificazione Personal Trainer FIPE",
      "Riconoscimento nazionale e internazionale",
      "Spendibile in palestre e strutture sportive in Italia e all'estero",
      "Accesso al registro professionisti",
    ],
    sortOrder: 13,
  },
  {
    slug: "fipe-personal-trainer",
    name: "Personal Trainer FIPE",
    subtitle: "Certificazione FIPE I Livello — 3 weekend in presenza",
    type: "certification",
    priceCents: 79000,
    stripePriceId: {
      test: "", // Non disponibile in test mode — acquistabile solo in produzione
      live: "price_1TZSugCE95vjZKhk8EFfwjBM",
    },
    hidden: true,
    includes: [
      "3 weekend in presenza (40 ore: 16h teoria + 24h pratica)",
      "Esame finale FIPE",
      "Certificazione Personal Trainer FIPE I Livello",
      "Riconoscimento nazionale e internazionale",
      "Materiale didattico digitale",
      "Accesso alla community Lacertosus",
    ],
    sortOrder: 14,
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
    adminToggleable: true,
    includes: [
      "1-2 giornate in presenza",
      "Ivan Ivanov",
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
    adminToggleable: true,
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
    adminToggleable: true,
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
    adminToggleable: true,
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
    hidden: true,
    adminToggleable: true,
    includes: [
      "1-2 giornate in presenza",
      "Trainer da definire",
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
    hidden: true,
    adminToggleable: true,
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
    adminToggleable: true,
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
    adminToggleable: true,
    includes: [
      "1 giornata in presenza",
      "Marco Magnani + Riccardo Aimini",
      "Materiale didattico",
      "Attestato di partecipazione",
    ],
    sortOrder: 28,
  },

  // ─── Masterclass International (acquisto singolo, NON nei pack) ────────────
  // TODO(go-live): creare Product+Price su Stripe (test + live) via
  // scripts/setup-stripe-masterclasses.mjs e incollare qui gli ID; poi
  // togliere `tbd: true` dal workshop in constants/workshops.ts.
  {
    slug: "master-strength-conditioning-int",
    name: "Masterclass Science-Based Strength & Conditioning",
    subtitle: "International Masterclass — Alexander Puig",
    type: "workshop",
    priceCents: 49000,
    stripePriceId: {
      test: "", // TODO: creare price su Stripe
      live: "", // TODO: creare price su Stripe
    },
    workshopSlug: "master-strength-conditioning-int",
    international: true,
    adminToggleable: true,
    includes: [
      "1-2 giornate in presenza",
      "Alexander Puig — Strength Coach internazionale",
      "Materiale didattico",
      "Attestato di partecipazione",
    ],
    sortOrder: 30,
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

/** Tutti i prodotti masterclass, inclusi quelli hidden e International.
 *  Utile per lookup per slug nelle pagine detail e per i roster admin.
 *  Per le listing pubbliche usare `getPublicMasterclassProducts()`. */
export function getMasterclassProducts(): AcademyProduct[] {
  return PRODUCTS.filter((p) => p.type === "workshop");
}

/** Solo i prodotti masterclass International (inclusi hidden). */
export function getInternationalMasterclassProducts(): AcademyProduct[] {
  return PRODUCTS.filter((p) => p.type === "workshop" && !!p.international);
}

/** Masterclass Pro pubbliche (International escluse — categoria/offerte a sé). */
export function getPublicMasterclassProducts(): AcademyProduct[] {
  return PRODUCTS.filter(
    (p) => p.type === "workshop" && !p.hidden && !p.international,
  );
}

/**
 * Masterclass Pro pubbliche con visibilità admin-configurabile.
 * Esclude le International (categoria/offerte separate); per ogni prodotto con
 * adminToggleable=true, il valore in `visibility` (chiave = workshopSlug) ha
 * priorità sul flag statico `hidden`.
 */
export function resolvePublicMasterclassProducts(
  visibility: MasterclassVisibilityMap,
): AcademyProduct[] {
  return PRODUCTS.filter((p) => {
    if (p.type !== "workshop" || p.international) return false;
    if (!p.adminToggleable) return !p.hidden;
    const key = p.workshopSlug ?? p.slug;
    return visibility[key] ?? !p.hidden;
  });
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

/* ─── Caparra (deposit) ──────────────────────────────────────────────────────
 * A bundle seat can be secured with a fixed, non-refundable deposit instead of
 * the full price. The deposit is a standalone 500€ product (IVA inclusa); the
 * balance is paid later as a normal pack purchase with a dedicated -500€ coupon.
 */
export const DEPOSIT_PRICE_CENTS = 50000;

/** Stripe Price ID of the 500€ deposit, per mode (tax behavior: inclusive). */
export const DEPOSIT_STRIPE_PRICE_ID: StripePriceMap = {
  test: "price_1Th8ymCGgXzYzpRpqdxSMAB4",
  live: "price_1Th9BgCE95vjZKhk9x0g4BpE",
};

// Deadlines (pack purchase, caparra purchase, balance) are admin-configurable
// and live in site_settings — see src/lib/settings/deadlines.ts.

/** Bundles eligible for the deposit flow. The deposit is only offered on these. */
export function isDepositEligible(product: AcademyProduct): boolean {
  return product.type === "bundle" && !product.hidden;
}

/** Resolve the deposit Price ID for the active Stripe mode (same rule as
 *  resolveStripePriceId). */
export function resolveDepositPriceId(): string {
  const isLive =
    typeof process !== "undefined" &&
    process.env?.STRIPE_SECRET_KEY?.startsWith("sk_live_") === true;
  return isLive ? DEPOSIT_STRIPE_PRICE_ID.live : DEPOSIT_STRIPE_PRICE_ID.test;
}

// Legacy aliases
export const PACKS = PRODUCTS;
export type Pack = AcademyProduct;
export const getPackBySlug = getProductBySlug;
