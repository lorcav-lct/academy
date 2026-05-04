/**
 * Server-side helpers per leggere le promo attive dal DB.
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { isPromoLive, type PromoProductType, type PromoRow } from "./types";

/** Promo attiva (live) per categoria — null se nessuna */
export async function getActivePromoForType(
  type: PromoProductType,
): Promise<PromoRow | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("promos")
    .select("*")
    .eq("product_type", type)
    .eq("active", true)
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  const row = data as unknown as PromoRow;
  return isPromoLive(row) ? row : null;
}

/** Mappa product_type → promo per tutte le promo live */
export async function getActivePromosByType(): Promise<
  Partial<Record<PromoProductType, PromoRow>>
> {
  const supabase = createAdminClient();
  const { data } = await supabase.from("promos").select("*").eq("active", true);
  if (!data) return {};
  const map: Partial<Record<PromoProductType, PromoRow>> = {};
  for (const row of data as unknown as PromoRow[]) {
    if (isPromoLive(row)) map[row.product_type] = row;
  }
  return map;
}
