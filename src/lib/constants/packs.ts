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
    priceCents: 0,
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
    priceCents: 0,
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
    priceCents: 0,
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
];

// I master si trovano in workshops.ts — sono anch'essi acquistabili singolarmente

export function getProductBySlug(slug: string): AcademyProduct | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

// Legacy alias per compatibilità con codice esistente
export const PACKS = PRODUCTS;
export type Pack = AcademyProduct;
export const getPackBySlug = getProductBySlug;
