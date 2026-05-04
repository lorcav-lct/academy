"use client";

import { useEffect, useState } from "react";
import { computePromoPricing, type PromoPricing, type PromoRow } from "./types";

type PromoMap = Record<string, PromoRow>;

let cache: PromoMap | null = null;
let inflight: Promise<PromoMap> | null = null;

async function fetchPromos(): Promise<PromoMap> {
  if (cache) return cache;
  if (inflight) return inflight;
  inflight = fetch("/api/promos/active", { cache: "no-store" })
    .then((r) => r.json())
    .then((data) => {
      cache = (data?.promos ?? {}) as PromoMap;
      return cache;
    })
    .catch(() => {
      const empty: PromoMap = {};
      cache = empty;
      return empty;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

/** Hook: ritorna la mappa promo (vuota mentre carica) */
export function useActivePromos(): { promos: PromoMap; loading: boolean } {
  const [promos, setPromos] = useState<PromoMap>(cache ?? {});
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    let cancelled = false;
    fetchPromos().then((data) => {
      if (!cancelled) {
        setPromos(data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { promos, loading };
}

/** Promo per un singolo slug (null se nessuna attiva) */
export function usePromoForSlug(slug: string): PromoRow | null {
  const { promos } = useActivePromos();
  return promos[slug] ?? null;
}

/** Pricing scontato + originale per uno slug (null se nessuna promo) */
export function usePromoPricing(
  slug: string,
  originalCents: number,
): (PromoPricing & { promo: PromoRow }) | null {
  const promo = usePromoForSlug(slug);
  if (!promo || originalCents <= 0) return null;
  return { ...computePromoPricing(promo, originalCents), promo };
}
