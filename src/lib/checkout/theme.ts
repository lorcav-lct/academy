"use client";

/**
 * Shared theming and helpers for checkout + order confirmation pages.
 * Tier-aware palette so /checkout and /conferma share the exact same look.
 */
import { useTheme } from "@/components/providers/theme-provider";
import type { AcademyProduct } from "@/lib/constants/packs";

export const ORANGE = "#F09226";
export const ORANGE_RGB = "240,146,38";

/** Display prices for bundles (catalog priceCents=0 → TBD) */
export const BUNDLE_PRICE_DISPLAY: Record<string, number> = {
  start: 120000,
  pro: 160000,
  elite: 220000,
};

export const TIER_LABEL: Record<string, string> = {
  start: "START",
  pro: "PRO",
  elite: "ELITE",
};

export const TIER_TAGLINE: Record<string, string> = {
  start: "3 blocchi formativi",
  pro: "+ FIPE + 2 Masterclass",
  elite: "+ Vitto e alloggio",
};

export const BUNDLE_SLUGS = ["start", "pro", "elite"] as const;
export type BundleSlug = (typeof BUNDLE_SLUGS)[number];

export function isBundleSlug(slug: string): slug is BundleSlug {
  return (BUNDLE_SLUGS as readonly string[]).includes(slug);
}

export function formatEur(cents: number, withDecimals = false): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: withDecimals ? 2 : 0,
    maximumFractionDigits: withDecimals ? 2 : 0,
  }).format(cents / 100);
}

export function formatPriceClean(cents: number): string {
  return `€ ${new Intl.NumberFormat("it-IT").format(Math.round(cents / 100))}`;
}

export function getDisplayCents(pack: AcademyProduct): number {
  if (pack.priceCents > 0) return pack.priceCents;
  return BUNDLE_PRICE_DISPLAY[pack.slug] ?? 0;
}

export function splitVat(grossCents: number): { net: number; vat: number } {
  // IVA 22% inclusa → net = gross / 1.22
  const net = Math.round(grossCents / 1.22);
  const vat = grossCents - net;
  return { net, vat };
}

export type TierTokens = {
  tier: "start" | "pro" | "elite" | "default";
  isDark: boolean;
  bg: string;
  th: string;
  tb: string;
  ts: string;
  border: string;
  borderStrong: string;
  surface: string;
  surfaceSolid: string;
  headerBg: string;
  shadow: string;
  chipBg: string;
  tipBg: string;
};

/**
 * Tier-aware palette
 * - START: bianco / testi scuri
 * - PRO: cream + arancio / testi scuri
 * - ELITE: brushed steel dark / testi bianchi
 * - default (singoli/workshop): segue il tema utente
 */
export function useTierTokens(packSlug: string, isBundle: boolean): TierTokens {
  const { theme } = useTheme();
  const isDarkUser = theme === "dark";

  if (!isBundle) {
    return {
      tier: "default",
      isDark: isDarkUser,
      bg: isDarkUser ? "#1a1a1a" : "#ffffff",
      th: isDarkUser ? "#f5f5fa" : "#0a0a1a",
      tb: isDarkUser ? "rgba(180,180,200,0.65)" : "#555555",
      ts: isDarkUser ? "rgba(120,120,140,0.55)" : "#888888",
      border: isDarkUser ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)",
      borderStrong: isDarkUser ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)",
      surface: isDarkUser ? "rgba(6,6,16,0.55)" : "rgba(250,250,252,0.7)",
      surfaceSolid: isDarkUser
        ? "rgba(10,10,20,0.92)"
        : "rgba(255,255,255,0.97)",
      headerBg: isDarkUser ? "rgba(10,10,16,0.85)" : "rgba(255,255,255,0.92)",
      shadow: isDarkUser
        ? `0 0 60px rgba(${ORANGE_RGB},0.05)`
        : "0 8px 32px rgba(0,0,0,0.04)",
      chipBg: isDarkUser ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.02)",
      tipBg: isDarkUser ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)",
    };
  }

  if (packSlug === "elite") {
    return {
      tier: "elite",
      isDark: true,
      bg: "linear-gradient(165deg, #1f1f1f 0%, #141414 50%, #050505 100%)",
      th: "#ffffff",
      tb: "rgba(255,255,255,0.7)",
      ts: "rgba(255,255,255,0.42)",
      border: "rgba(255,255,255,0.1)",
      borderStrong: "rgba(255,255,255,0.18)",
      surface: "rgba(255,255,255,0.04)",
      surfaceSolid: "rgba(20,20,24,0.94)",
      headerBg: "rgba(8,8,10,0.88)",
      shadow: "0 0 60px rgba(0,0,0,0.4), 0 24px 80px rgba(0,0,0,0.5)",
      chipBg: "rgba(255,255,255,0.04)",
      tipBg: "rgba(255,255,255,0.025)",
    };
  }

  if (packSlug === "pro") {
    return {
      tier: "pro",
      isDark: false,
      bg: "#F5F5F7",
      th: "#0a0a14",
      tb: "#3d3d44",
      ts: "#7a7a82",
      border: "rgba(240,146,38,0.22)",
      borderStrong: "rgba(240,146,38,0.45)",
      surface: "#ffffff",
      surfaceSolid: "#ffffff",
      headerBg: "rgba(245,245,247,0.92)",
      shadow: `0 0 60px rgba(${ORANGE_RGB},0.12), 0 8px 32px rgba(0,0,0,0.04)`,
      chipBg: "rgba(17,17,17,0.03)",
      tipBg: `rgba(${ORANGE_RGB},0.05)`,
    };
  }

  // start
  return {
    tier: "start",
    isDark: false,
    bg: "#ffffff",
    th: "#0a0a14",
    tb: "#3d3d44",
    ts: "#7a7a82",
    border: "rgba(0,0,0,0.08)",
    borderStrong: "rgba(0,0,0,0.14)",
    surface: "#fafafa",
    surfaceSolid: "#ffffff",
    headerBg: "rgba(255,255,255,0.94)",
    shadow: "0 8px 32px rgba(0,0,0,0.04)",
    chipBg: "rgba(0,0,0,0.025)",
    tipBg: "rgba(0,0,0,0.015)",
  };
}
