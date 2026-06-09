/**
 * Tipi condivisi per i "codici coupon" gestiti dall'admin.
 *
 * A differenza delle promo automatiche (src/lib/promos), un codice coupon è uno
 * Stripe *promotion code* (codice digitabile al checkout) collegato a un coupon.
 * La fonte di verità è Stripe: nessuna tabella DB. Stripe traccia da sé usi,
 * scadenza e stato.
 */
export type CouponDiscountType = "amount" | "percent";

/** Vista normalizzata di un promotion code Stripe per l'admin UI. */
export interface CouponCodeRow {
  /** promotion_code id (`promo_...`) */
  id: string;
  /** Codice digitabile dal cliente (es. "WELCOME10") */
  code: string;
  active: boolean;
  discount_type: CouponDiscountType;
  /** cents per amount, 1..100 per percent */
  discount_value: number;
  currency: string | null;
  /** null = utilizzi illimitati */
  max_redemptions: number | null;
  times_redeemed: number;
  /** ISO string, null = nessuna scadenza */
  expires_at: string | null;
  /** Slug prodotto se ristretto a un singolo prodotto, null = qualsiasi prodotto */
  product_slug: string | null;
  created_at: string;
}
