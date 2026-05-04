/**
 * Tipi condivisi promo (usati da admin UI, API, lettori sito).
 */
export type PromoProductType = "pack" | "masterclass";
export type PromoDiscountType = "amount" | "percent";

export interface PromoRow {
  id: string;
  slug: string;
  product_type: PromoProductType;
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

export type PromoCreateInput = Omit<
  PromoRow,
  "id" | "stripe_coupon_id" | "stripe_product_id" | "created_at" | "updated_at"
>;

export type PromoUpdateInput = Partial<PromoCreateInput>;

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

/** Vero se la promo è "live" adesso (active + non scaduta + non ancora iniziata se starts_at) */
export function isPromoLive(promo: PromoRow): boolean {
  if (!promo.active) return false;
  const now = Date.now();
  if (promo.starts_at && new Date(promo.starts_at).getTime() > now)
    return false;
  if (promo.ends_at && new Date(promo.ends_at).getTime() <= now) return false;
  return true;
}
