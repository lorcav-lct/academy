"use client";

import { useEffect, useState } from "react";
import {
  computePromoPricing,
  getPromoTypeForSlug,
  type PromoPricing,
  type PromoProductType,
  type PromoRow,
} from "./types";

type PromoMap = Partial<Record<PromoProductType, PromoRow>>;

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

/** Promo attiva per una categoria (null se nessuna) */
export function usePromoForType(type: PromoProductType): PromoRow | null {
  const { promos } = useActivePromos();
  return promos[type] ?? null;
}

/** Promo attiva per uno slug (deduce la categoria, null se slug non promo-able) */
export function usePromoForSlug(slug: string): PromoRow | null {
  const type = getPromoTypeForSlug(slug);
  const { promos } = useActivePromos();
  if (!type) return null;
  return promos[type] ?? null;
}

/** Pricing scontato per uno slug, applicando la promo della sua categoria */
export function usePromoPricing(
  slug: string,
  originalCents: number,
): (PromoPricing & { promo: PromoRow }) | null {
  const promo = usePromoForSlug(slug);
  if (!promo || originalCents <= 0) return null;
  return { ...computePromoPricing(promo, originalCents), promo };
}
