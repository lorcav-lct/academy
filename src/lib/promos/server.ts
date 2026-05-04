/**
 * Server-side helpers per leggere le promo attive dal DB.
 * Usato dall'endpoint /api/checkout/session per applicare automaticamente
 * il coupon Stripe corretto.
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { isPromoLive, type PromoRow } from "./types";

/** Promo attiva (live) per uno slug — null se nessuna */
export async function getActivePromoForSlug(
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

/** Mappa slug → promo per tutte le promo attive (per UI lista) */
export async function getActivePromosMap(): Promise<Record<string, PromoRow>> {
  const supabase = createAdminClient();
  const { data } = await supabase.from("promos").select("*").eq("active", true);
  if (!data) return {};
  const map: Record<string, PromoRow> = {};
  for (const row of data as unknown as PromoRow[]) {
    if (isPromoLive(row)) map[row.slug] = row;
  }
  return map;
}
