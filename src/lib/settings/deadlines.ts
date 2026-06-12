/**
 * Configurable deadlines for the pack/caparra flow. Stored in the site_settings
 * key/value table (public read, admin write) so they can be changed from the
 * admin UI without a deploy. This module is pure/isomorphic: `getDeadlines`
 * takes a Supabase client (browser or admin) and never imports server-only code.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

export const DEADLINE_KEYS = {
  /** Last day a pack can be bought WITH a caparra. */
  depositPurchase: "deposit_purchase_deadline",
  /** Last day a paid caparra can be settled. */
  depositBalance: "deposit_balance_deadline",
  /** Last day a pack can be bought at all (masterclasses: no limit). */
  packPurchase: "pack_purchase_deadline",
} as const;

export interface Deadlines {
  /** ISO date YYYY-MM-DD */
  depositPurchase: string;
  depositBalance: string;
  packPurchase: string;
}

/** Fallbacks used when site_settings is unreachable or a key is missing. */
export const DEFAULT_DEADLINES: Deadlines = {
  depositPurchase: "2026-07-31",
  depositBalance: "2026-08-07",
  packPurchase: "2026-09-10",
};

/** True if `now` is past the end of the given ISO day (Europe/Rome local). */
export function isPastDeadline(
  dateStr: string,
  now: number = Date.now(),
): boolean {
  const end = new Date(`${dateStr}T23:59:59`).getTime();
  if (Number.isNaN(end)) return false;
  return now > end;
}

/** Human date, e.g. "31 luglio 2026". */
export function formatDeadline(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00`);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Read the three deadlines, falling back to defaults per-key. */
export async function getDeadlines(
  supabase: SupabaseClient,
): Promise<Deadlines> {
  try {
    const { data } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", Object.values(DEADLINE_KEYS));
    const map = new Map(
      ((data ?? []) as { key: string; value: string }[]).map((r) => [
        r.key,
        r.value,
      ]),
    );
    return {
      depositPurchase:
        map.get(DEADLINE_KEYS.depositPurchase) ??
        DEFAULT_DEADLINES.depositPurchase,
      depositBalance:
        map.get(DEADLINE_KEYS.depositBalance) ??
        DEFAULT_DEADLINES.depositBalance,
      packPurchase:
        map.get(DEADLINE_KEYS.packPurchase) ?? DEFAULT_DEADLINES.packPurchase,
    };
  } catch {
    return DEFAULT_DEADLINES;
  }
}
