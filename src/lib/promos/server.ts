/**
 * Server-side helpers per leggere le promo attive dal DB.
 * Logica di priorità: una promo product-specific (slug = X) batte sempre
 * la category-wide (slug = NULL) sullo stesso product_type.
 */
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getPromoTypeForSlug,
  isPromoLive,
  type PromoProductType,
  type PromoRow,
} from "./types";

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
  return isPromoLive(row) ? row : null;
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
  return isPromoLive(row) ? row : null;
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
  for (const row of data as unknown as PromoRow[]) {
    if (!isPromoLive(row)) continue;
    if (row.slug) bySlug[row.slug] = row;
    else byType[row.product_type] = row;
  }
  return { byType, bySlug };
}
