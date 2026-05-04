"use client";

import { useEffect, useState } from "react";
import {
  computePromoPricing,
  getPromoTypeForSlug,
  type PromoPricing,
  type PromoProductType,
  type PromoRow,
} from "./types";

type PromoBundle = {
  byType: Partial<Record<PromoProductType, PromoRow>>;
  bySlug: Record<string, PromoRow>;
};

const emptyBundle: PromoBundle = { byType: {}, bySlug: {} };

let cache: PromoBundle | null = null;
let inflight: Promise<PromoBundle> | null = null;

async function fetchPromos(): Promise<PromoBundle> {
  if (cache) return cache;
  if (inflight) return inflight;
  inflight = fetch("/api/promos/active", { cache: "no-store" })
    .then((r) => r.json())
    .then((data) => {
      cache = (data?.promos ?? emptyBundle) as PromoBundle;
      return cache;
    })
    .catch(() => {
      cache = emptyBundle;
      return emptyBundle;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

/** Hook: ritorna il bundle promo live (vuoto mentre carica) */
export function useActivePromos(): { promos: PromoBundle; loading: boolean } {
  const [promos, setPromos] = useState<PromoBundle>(cache ?? emptyBundle);
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

/**
 * Promo applicabile a uno slug, con priorità:
 *   1. promo product-specific (slug = X)
 *   2. promo category-wide della categoria di X
 */
export function usePromoForSlug(slug: string): PromoRow | null {
  const { promos } = useActivePromos();
  if (promos.bySlug[slug]) return promos.bySlug[slug];
  const type = getPromoTypeForSlug(slug);
  if (!type) return null;
  return promos.byType[type] ?? null;
}

/** Pricing scontato per uno slug */
export function usePromoPricing(
  slug: string,
  originalCents: number,
): (PromoPricing & { promo: PromoRow }) | null {
  const promo = usePromoForSlug(slug);
  if (!promo || originalCents <= 0) return null;
  return { ...computePromoPricing(promo, originalCents), promo };
}
