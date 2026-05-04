/**
 * Tipi condivisi promo (admin UI, API, sito).
 * Una promo può essere:
 *   - category-wide  (slug = null)        → tutti i prodotti della categoria
 *   - product-specific (slug = "master-…") → solo quello slug
 * Priorità in lookup: specific > category-wide.
 */
import { getPackBySlug } from "@/lib/constants/packs";

export type PromoProductType = "pack" | "masterclass";
export type PromoDiscountType = "amount" | "percent";

export interface PromoRow {
  id: string;
  product_type: PromoProductType;
  /** null → category-wide; valorizzato → solo questo slug */
  slug: string | null;
  active: boolean;
  name: string;
  headline: string | null;
  subtitle: string | null;
  discount_type: PromoDiscountType;
  /** cents per amount, 1..100 per percent */
  discount_value: number;
  starts_at: string | null;
  ends_at: string | null;
  max_redemptions: number | null;
  stripe_coupon_id: string | null;
  stripe_product_id: string | null;
  created_at: string;
  updated_at: string;
}

/** Calcolo prezzo display */
export interface PromoPricing {
  /** Prezzo finale dopo sconto (cents) */
  final: number;
  /** Prezzo originale (cents) */
  original: number;
  /** Sconto applicato (cents) */
  discount: number;
}

export function computePromoPricing(
  promo: Pick<PromoRow, "discount_type" | "discount_value">,
  originalCents: number,
): PromoPricing {
  let discount = 0;
  if (promo.discount_type === "amount") {
    discount = Math.min(originalCents, promo.discount_value);
  } else if (promo.discount_type === "percent") {
    discount = Math.round((originalCents * promo.discount_value) / 100);
  }
  return {
    final: Math.max(0, originalCents - discount),
    original: originalCents,
    discount,
  };
}

/** Vero se la promo è "live" adesso (active + finestra date OK) */
export function isPromoLive(promo: PromoRow): boolean {
  if (!promo.active) return false;
  const now = Date.now();
  if (promo.starts_at && new Date(promo.starts_at).getTime() > now)
    return false;
  if (promo.ends_at && new Date(promo.ends_at).getTime() <= now) return false;
  return true;
}

/**
 * Mappa uno slug prodotto → categoria promo.
 * - bundle (start/pro/elite) → "pack"
 * - workshop (master-*)      → "masterclass"
 * - course (function/strength/...) → null (no promo applicabile)
 */
export function getPromoTypeForSlug(slug: string): PromoProductType | null {
  const product = getPackBySlug(slug);
  if (!product) return null;
  if (product.type === "bundle") return "pack";
  if (product.type === "workshop") return "masterclass";
  return null;
}
