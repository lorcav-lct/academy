/**
 * Admin-configurable visibility for masterclass workshops.
 * Stored in site_settings as a JSON object { [slug]: boolean }.
 * A masterclass is public if visibility[slug] ?? !workshop.hidden.
 * Works with any Supabase client (browser or server/admin).
 */
import type { SupabaseClient } from "@supabase/supabase-js";

export const MASTERCLASS_VISIBILITY_KEY = "masterclass_enabled_overrides";

export type MasterclassVisibilityMap = Record<string, boolean>;

/**
 * Returns the visibility map from DB. Missing keys fall back to the
 * workshop's static default (!w.hidden). Use resolvePublicWorkshops()
 * or resolvePublicMasterclassProducts() to apply the map.
 */
export async function getMasterclassVisibility(
  supabase: SupabaseClient,
): Promise<MasterclassVisibilityMap> {
  try {
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", MASTERCLASS_VISIBILITY_KEY)
      .maybeSingle();

    if (!data?.value) return {};
    const parsed = JSON.parse(data.value as string);
    if (typeof parsed !== "object" || Array.isArray(parsed)) return {};
    // Coerce to { [slug]: boolean }
    const map: MasterclassVisibilityMap = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (typeof v === "boolean") map[k] = v;
    }
    return map;
  } catch {
    return {};
  }
}

export async function setMasterclassVisibility(
  supabase: SupabaseClient,
  visibility: MasterclassVisibilityMap,
): Promise<{ error?: string }> {
  const { error } = await supabase.from("site_settings").upsert(
    {
      key: MASTERCLASS_VISIBILITY_KEY,
      value: JSON.stringify(visibility),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" },
  );
  return error ? { error: error.message } : {};
}
