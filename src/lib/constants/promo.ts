/**
 * Promo di lancio pack — sconto applicato automaticamente al checkout.
 *
 * Per attivarla/disattivarla manualmente: cambia `LAUNCH_PROMO.active`.
 * Si auto-disattiva comunque oltre `endsAt`.
 *
 * Le coupon ID Stripe sono quelle generate da scripts/setup-stripe-launch-promo.mjs.
 * In produzione il checkout passa `discounts: [{ coupon: <id> }]` per il pack
 * corrispondente; lato sito si mostra il prezzo barrato + il prezzo promo.
 */

export type LaunchPromoEntry = {
  /** Stripe coupon ID — usato dal checkout per applicare lo sconto */
  couponId: string;
  /** Prezzo originale in centesimi (allineato a packs.ts) */
  originalCents: number;
  /** Prezzo dopo applicazione coupon */
  discountedCents: number;
};

export type LaunchPromo = {
  active: boolean;
  /** Etichetta breve mostrata in badge / banner (es. "LANCIO PACK") */
  label: string;
  /** Headline da banner */
  headline: string;
  /** Sottotitolo del banner */
  subtitle: string;
  /** Data di fine in ISO 8601 (timezone Europe/Rome) */
  endsAt: string;
  /** Mapping pack-slug → coupon */
  byPack: Record<string, LaunchPromoEntry>;
};

export const LAUNCH_PROMO: LaunchPromo = {
  active: true,
  label: "LANCIO PACK",
  headline: "Sconto di lancio attivo",
  subtitle: "Prezzo speciale fino al 30 giugno 2026",
  endsAt: "2026-06-30T23:59:59+02:00",
  byPack: {
    start: {
      couponId: "C8cXtgEQ",
      originalCents: 330000,
      discountedCents: 250000,
    },
    pro: {
      couponId: "GWRd4aIj",
      originalCents: 470000,
      discountedCents: 390000,
    },
    elite: {
      couponId: "OjI2H0vs",
      originalCents: 700000,
      discountedCents: 590000,
    },
  },
};

/** True se la promo è attiva e non scaduta */
export function isLaunchActive(): boolean {
  if (!LAUNCH_PROMO.active) return false;
  return new Date(LAUNCH_PROMO.endsAt).getTime() > Date.now();
}

/** Restituisce i dati promo per uno slug pack se la promo è attiva e copre il pack */
export function getLaunchEntry(slug: string): LaunchPromoEntry | null {
  if (!isLaunchActive()) return null;
  return LAUNCH_PROMO.byPack[slug] ?? null;
}

/**
 * Calcolo prezzo per UI:
 *   - se promo attiva sul pack → { final, original, discount } centesimi
 *   - altrimenti → null (UI mostra solo il prezzo originale)
 */
export function getLaunchPricing(
  slug: string,
  fallbackOriginalCents: number,
): { final: number; original: number; discount: number } | null {
  const entry = getLaunchEntry(slug);
  if (!entry) return null;
  // Allineamento di sicurezza: se in packs.ts il prezzo cambia, prevale quello.
  const original =
    fallbackOriginalCents > 0 ? fallbackOriginalCents : entry.originalCents;
  const final = entry.discountedCents;
  return { final, original, discount: original - final };
}
