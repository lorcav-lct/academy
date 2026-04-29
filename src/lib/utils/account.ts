import { getProductBySlug } from "@/lib/constants/packs";
import { getCourseBySlug, COURSES } from "@/lib/constants/courses";

export function formatEUR(cents: number): string {
  if (!cents) return "—";
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

export function getProductLabel(slug: string | null | undefined): string {
  if (!slug) return "Prodotto";
  const product = getProductBySlug(slug);
  return product?.name || slug.toUpperCase();
}

export function getProductSubtitle(
  slug: string | null | undefined,
): string | null {
  if (!slug) return null;
  return getProductBySlug(slug)?.subtitle || null;
}

export function getCourseLabel(slug: string | null | undefined): string {
  if (!slug) return "Corso";
  const course = getCourseBySlug(slug);
  return course?.title || slug.toUpperCase();
}

export function getCourseSubtitle(
  slug: string | null | undefined,
): string | null {
  if (!slug) return null;
  return getCourseBySlug(slug)?.subtitle || null;
}

export function getCourseDates(slug: string | null | undefined): string[] {
  if (!slug) return [];
  return getCourseBySlug(slug)?.dates || [];
}

/** Prossima data formativa dei corsi attivi su cui l'utente ha ticket */
export function getNextCourseDate(
  courseSlugs: string[],
): { course: string; date: string } | null {
  const slugs = Array.from(new Set(courseSlugs.filter(Boolean)));
  if (slugs.length === 0) return null;
  for (const c of COURSES) {
    if (!slugs.includes(c.slug)) continue;
    if (c.dates.length > 0) {
      return { course: c.title, date: c.dates[0] };
    }
  }
  return null;
}

export function greeting(): string {
  const h = new Date().getHours();
  if (h < 6) return "Buonanotte";
  if (h < 12) return "Buongiorno";
  if (h < 18) return "Buon pomeriggio";
  return "Buonasera";
}

export const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: "In attesa",
  paid: "Pagato",
  cancelled: "Annullato",
  refunded: "Rimborsato",
};

export const ORDER_STATUS_TONE: Record<
  string,
  { dot: string; text: string; bg: string }
> = {
  pending: {
    dot: "bg-amber-500",
    text: "text-amber-700",
    bg: "bg-amber-500/10",
  },
  paid: {
    dot: "bg-emerald-500",
    text: "text-emerald-700",
    bg: "bg-emerald-500/10",
  },
  cancelled: {
    dot: "bg-red-500",
    text: "text-red-700",
    bg: "bg-red-500/10",
  },
  refunded: {
    dot: "bg-academy-gray-500",
    text: "text-academy-gray-600",
    bg: "bg-black/[0.04]",
  },
};
