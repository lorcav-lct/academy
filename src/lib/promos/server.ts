/**
 * Server-side helpers per leggere le promo attive dal DB.
 * Logica di priorità: una promo product-specific (slug = X) batte sempre
 * la category-wide (slug = NULL) sullo stesso product_type.
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe/client";
import {
  getPromoTypeForSlug,
  isPromoLive,
  type PromoProductType,
  type PromoRow,
} from "./types";

/* ──────────────────────────────────────────────────────────────
   Coupon validation cache
   I coupon Stripe sono per-account: un coupon creato in modalità
   live non esiste nell'account test (e viceversa). Filtriamo quindi
   le promo che fanno riferimento a coupon non risolvibili nell'env
   Stripe corrente, per evitare 500 al checkout su staging quando il
   DB Supabase è condiviso tra ambienti.
─────────────────────────────────────────────────────────────── */

type CouponCacheEntry = { valid: boolean; expiresAt: number };
const COUPON_CACHE_TTL_MS = 5 * 60 * 1000;
const couponValidationCache = new Map<string, CouponCacheEntry>();

async function isCouponValidForCurrentEnv(
  couponId: string | null,
): Promise<boolean> {
  // Promo senza stripe_coupon_id: passa, gestita altrove
  if (!couponId) return true;

  const cached = couponValidationCache.get(couponId);
  if (cached && cached.expiresAt > Date.now()) return cached.valid;

  let valid = false;
  try {
    await getStripe().coupons.retrieve(couponId);
    valid = true;
  } catch {
    valid = false;
  }
  couponValidationCache.set(couponId, {
    valid,
    expiresAt: Date.now() + COUPON_CACHE_TTL_MS,
  });
  return valid;
}

async function isPromoUsable(promo: PromoRow): Promise<boolean> {
  if (!isPromoLive(promo)) return false;
  return isCouponValidForCurrentEnv(promo.stripe_coupon_id);
}

/** Promo attiva category-wide per una categoria — null se nessuna */
export async function getActivePromoForType(
  type: PromoProductType,
): Promise<PromoRow | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("promos")
    .select("*")
    .eq("product_type", type)
    .is("slug", null)
    .eq("active", true)
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  const row = data as unknown as PromoRow;
  return (await isPromoUsable(row)) ? row : null;
}

/** Promo attiva product-specific per uno slug — null se nessuna */
export async function getActivePromoForSpecificSlug(
  slug: string,
): Promise<PromoRow | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("promos")
    .select("*")
    .eq("slug", slug)
    .eq("active", true)
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  const row = data as unknown as PromoRow;
  return (await isPromoUsable(row)) ? row : null;
}

/**
 * Promo applicabile a uno slug, con priorità:
 *   1. promo product-specific (slug = X)
 *   2. promo category-wide della categoria di X
 */
export async function getActivePromoForProduct(
  slug: string,
): Promise<PromoRow | null> {
  const specific = await getActivePromoForSpecificSlug(slug);
  if (specific) return specific;
  const type = getPromoTypeForSlug(slug);
  if (!type) return null;
  return getActivePromoForType(type);
}

/** Tutte le promo live: { byType: {pack?, masterclass?}, bySlug: {slug: PromoRow} } */
export async function getActivePromosBundle(): Promise<{
  byType: Partial<Record<PromoProductType, PromoRow>>;
  bySlug: Record<string, PromoRow>;
}> {
  const supabase = createAdminClient();
  const { data } = await supabase.from("promos").select("*").eq("active", true);
  const byType: Partial<Record<PromoProductType, PromoRow>> = {};
  const bySlug: Record<string, PromoRow> = {};
  if (!data) return { byType, bySlug };

  // Validazione coupon in parallelo per non bloccare la response.
  const rows = data as unknown as PromoRow[];
  const usable = await Promise.all(
    rows.map(async (row) => ({ row, ok: await isPromoUsable(row) })),
  );

  for (const { row, ok } of usable) {
    if (!ok) continue;
    if (row.slug) bySlug[row.slug] = row;
    else byType[row.product_type] = row;
  }
  return { byType, bySlug };
}
