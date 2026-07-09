/**
 * Admin-configurable "Sales Mode" for the /masterclass page.
 * Stored in site_settings as "true"/"false". When enabled, the masterclass
 * listing switches to a conversion-focused layout: hero countdown + pricing,
 * prominent prices with direct buy CTAs on cards, exit-intent urgency modal.
 * Works with any Supabase client (browser or server/admin).
 */
import type { SupabaseClient } from "@supabase/supabase-js";

export const MASTERCLASS_SALES_MODE_KEY = "masterclass_sales_mode";

export async function getMasterclassSalesMode(
  supabase: SupabaseClient,
): Promise<boolean> {
  try {
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", MASTERCLASS_SALES_MODE_KEY)
      .maybeSingle();
    return data?.value === "true";
  } catch {
    return false;
  }
}

export async function setMasterclassSalesMode(
  supabase: SupabaseClient,
  enabled: boolean,
): Promise<{ error?: string }> {
  const { error } = await supabase.from("site_settings").upsert(
    {
      key: MASTERCLASS_SALES_MODE_KEY,
      value: enabled ? "true" : "false",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" },
  );
  return error ? { error: error.message } : {};
}
