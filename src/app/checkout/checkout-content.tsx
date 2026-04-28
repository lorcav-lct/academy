"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTheme } from "@/components/providers/theme-provider";
import { getPackBySlug, type AcademyProduct } from "@/lib/constants/packs";
import { getWorkshopBySlug, type Workshop } from "@/lib/constants/workshops";
import { createClient } from "@/lib/supabase/client";
import { MasterclassSelector } from "@/components/packs/masterclass-selector";

/* ──────────────────────────────────────────────────────────────
   Constants
─────────────────────────────────────────────────────────────── */
const ORANGE = "#F09226";
const ORANGE_RGB = "240,146,38";

/* Display prices for bundles (catalog priceCents=0 → TBD) */
const BUNDLE_PRICE_DISPLAY: Record<string, number> = {
  start: 120000,
  pro: 160000,
  elite: 220000,
};

const TIER_LABEL: Record<string, string> = {
  start: "START",
  pro: "PRO",
  elite: "ELITE",
};

/* ──────────────────────────────────────────────────────────────
   Helpers
─────────────────────────────────────────────────────────────── */
function formatEur(cents: number, withDecimals = false): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: withDecimals ? 2 : 0,
    maximumFractionDigits: withDecimals ? 2 : 0,
  }).format(cents / 100);
}

function getDisplayCents(pack: AcademyProduct): number {
  if (pack.priceCents > 0) return pack.priceCents;
  return BUNDLE_PRICE_DISPLAY[pack.slug] ?? 0;
}

function splitVat(grossCents: number): { net: number; vat: number } {
  // IVA 22% inclusa (assumed) → net = gross / 1.22
  const net = Math.round(grossCents / 1.22);
  const vat = grossCents - net;
  return { net, vat };
}

/* ──────────────────────────────────────────────────────────────
   Theme tokens hook
─────────────────────────────────────────────────────────────── */
function useTokens() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return {
    isDark,
    th: isDark ? "#f5f5fa" : "#0a0a1a",
    tb: isDark ? "rgba(180,180,200,0.65)" : "#555555",
    ts: isDark ? "rgba(120,120,140,0.55)" : "#888888",
    border: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)",
    borderStrong: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)",
    surface: isDark ? "rgba(6,6,16,0.55)" : "rgba(250,250,252,0.7)",
    surfaceSolid: isDark ? "rgba(10,10,20,0.92)" : "rgba(255,255,255,0.97)",
  };
}

/* ──────────────────────────────────────────────────────────────
   Order Summary card (right column on desktop, top on mobile)
─────────────────────────────────────────────────────────────── */
function OrderSummary({
  pack,
  selectedMc,
  loading,
  unavailable,
  onCheckout,
}: {
  pack: AcademyProduct;
  selectedMc: Workshop[];
  loading: boolean;
  unavailable: boolean;
  onCheckout: () => void;
}) {
  const t = useTokens();
  const grossCents = getDisplayCents(pack);
  const { net, vat } = splitVat(grossCents);
  const tierLabel = TIER_LABEL[pack.slug] ?? pack.name;
  const isBundle = pack.type === "bundle";
  const itemLabel = isBundle ? `Pack ${tierLabel}` : pack.name;

  return (
    <div
      className="overflow-hidden"
      style={{
        background: t.surfaceSolid,
        border: `1px solid ${t.borderStrong}`,
        boxShadow: t.isDark
          ? `0 0 60px rgba(${ORANGE_RGB},0.05)`
          : "0 8px 32px rgba(0,0,0,0.04)",
      }}
    >
      {/* Top accent */}
      <div
        className="h-[2px] w-full"
        style={{
          background: `linear-gradient(90deg, ${ORANGE}, rgba(${ORANGE_RGB},0.08))`,
        }}
      />

      <div className="p-6 md:p-7">
        <p
          className="mb-5 text-[0.6rem] font-black uppercase tracking-[0.34em]"
          style={{ color: ORANGE }}
        >
          — Riepilogo ordine
        </p>

        {/* Line items */}
        <div className="space-y-3">
          <div className="flex items-baseline justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p
                className="text-[0.95rem] font-bold leading-tight"
                style={{ color: t.th }}
              >
                {itemLabel}
              </p>
              <p
                className="mt-0.5 text-[0.72rem] leading-snug"
                style={{ color: t.ts }}
              >
                {pack.subtitle}
              </p>
            </div>
            <span
              className="shrink-0 text-[0.95rem] font-black tabular-nums"
              style={{ color: t.th }}
            >
              {grossCents > 0 ? formatEur(grossCents) : "TBD"}
            </span>
          </div>

          {selectedMc.map((w) => (
            <div
              key={w.slug}
              className="flex items-baseline justify-between gap-4 pt-1"
            >
              <div className="min-w-0 flex-1">
                <p
                  className="text-[0.78rem] font-semibold leading-tight"
                  style={{ color: t.tb }}
                >
                  + {w.title}
                </p>
                <p
                  className="mt-0.5 text-[0.66rem] leading-snug"
                  style={{ color: t.ts }}
                >
                  Inclusa
                </p>
              </div>
              <span
                className="shrink-0 text-[0.78rem] font-bold tabular-nums"
                style={{ color: t.ts }}
              >
                Inclusa
              </span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="my-5 h-px w-full" style={{ background: t.border }} />

        {/* VAT breakdown */}
        {grossCents > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between text-[0.78rem]">
              <span style={{ color: t.tb }}>Imponibile</span>
              <span
                className="font-semibold tabular-nums"
                style={{ color: t.tb }}
              >
                {formatEur(net, true)}
              </span>
            </div>
            <div className="flex items-baseline justify-between text-[0.78rem]">
              <span style={{ color: t.tb }}>IVA 22%</span>
              <span
                className="font-semibold tabular-nums"
                style={{ color: t.tb }}
              >
                {formatEur(vat, true)}
              </span>
            </div>
          </div>
        )}

        {/* Total */}
        <div
          className="mt-5 flex items-baseline justify-between border-t pt-5"
          style={{ borderColor: t.border }}
        >
          <span
            className="text-[0.66rem] font-black uppercase tracking-[0.28em]"
            style={{ color: t.ts }}
          >
            Totale
          </span>
          <span
            className="text-[1.6rem] font-black leading-none tracking-[-0.02em] tabular-nums"
            style={{ color: t.th }}
          >
            {grossCents > 0 ? formatEur(grossCents) : "TBD"}
          </span>
        </div>
        {grossCents > 0 && (
          <p
            className="mt-1 text-right text-[0.62rem] font-semibold"
            style={{ color: t.ts }}
          >
            IVA inclusa
          </p>
        )}

        {/* Primary CTA */}
        <button
          onClick={onCheckout}
          disabled={loading || unavailable}
          className="mt-6 inline-flex w-full items-center justify-between gap-3 px-6 py-4 text-[0.78rem] font-black uppercase tracking-[0.16em] transition-all duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ background: ORANGE, color: "#111" }}
        >
          {loading ? (
            <>
              <span>Reindirizzamento…</span>
              <span aria-hidden>
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  className="animate-spin"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    stroke="#111"
                    strokeWidth="2.5"
                    strokeOpacity="0.25"
                  />
                  <path
                    d="M21 12a9 9 0 0 0-9-9"
                    stroke="#111"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </>
          ) : unavailable ? (
            <>
              <span>Prossimamente</span>
              <span aria-hidden className="text-base">
                ·
              </span>
            </>
          ) : (
            <>
              <span>Paga con Stripe</span>
              <span aria-hidden className="text-base">
                →
              </span>
            </>
          )}
        </button>

        {/* Secondary action */}
        {!unavailable && (
          <p
            className="mt-3 text-center text-[0.66rem]"
            style={{ color: t.ts }}
          >
            Sarai reindirizzato al pagamento sicuro Stripe
          </p>
        )}

        {/* Payment methods */}
        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
          <span
            className="text-[0.55rem] font-black uppercase tracking-[0.22em]"
            style={{ color: t.ts }}
          >
            Accettiamo
          </span>
          <div className="flex items-center gap-2">
            {["VISA", "MC", "AMEX", "AP", "GP"].map((m) => (
              <span
                key={m}
                className="px-2 py-1 text-[0.55rem] font-black tracking-[0.1em]"
                style={{
                  border: `1px solid ${t.border}`,
                  color: t.tb,
                  background: t.isDark
                    ? "rgba(255,255,255,0.025)"
                    : "rgba(0,0,0,0.02)",
                }}
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Trust strip */}
      <div
        className="grid grid-cols-1 gap-[1px] border-t"
        style={{ background: t.border, borderColor: t.border }}
      >
        {[
          { icon: "🔒", text: "Pagamento crittografato Stripe" },
          { icon: "↺", text: "Cancellazione gratuita entro 14 giorni" },
          { icon: "✓", text: "Nessun vincolo: rateizzazione su richiesta" },
        ].map((b) => (
          <div
            key={b.text}
            className="flex items-center gap-3 px-6 py-3 md:px-7"
            style={{ background: t.surfaceSolid }}
          >
            <span
              className="flex h-6 w-6 shrink-0 items-center justify-center text-[0.85rem]"
              style={{
                background: `rgba(${ORANGE_RGB},0.12)`,
                color: ORANGE,
              }}
            >
              {b.icon}
            </span>
            <span
              className="text-[0.72rem] font-semibold leading-tight"
              style={{ color: t.tb }}
            >
              {b.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Mobile sticky bottom bar
─────────────────────────────────────────────────────────────── */
function MobileStickyBar({
  pack,
  loading,
  unavailable,
  visible,
  onCheckout,
}: {
  pack: AcademyProduct;
  loading: boolean;
  unavailable: boolean;
  visible: boolean;
  onCheckout: () => void;
}) {
  const grossCents = getDisplayCents(pack);

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: visible ? 0 : 100 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed inset-x-0 bottom-0 z-40 px-3 pb-3 lg:hidden"
      style={{ pointerEvents: visible ? "auto" : "none" }}
      aria-hidden={!visible}
    >
      <div
        className="mx-auto flex max-w-[640px] items-center justify-between gap-3 px-4 py-3"
        style={{
          background: "rgba(10,10,20,0.95)",
          border: `1px solid rgba(${ORANGE_RGB},0.32)`,
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
        }}
      >
        <div className="min-w-0 flex flex-col">
          <span
            className="text-[0.55rem] font-bold uppercase tracking-[0.18em]"
            style={{ color: "rgba(255,255,255,0.55)" }}
          >
            Totale
          </span>
          <span
            className="text-[1.1rem] font-black leading-none tabular-nums"
            style={{ color: "#fff" }}
          >
            {grossCents > 0 ? formatEur(grossCents) : "TBD"}
          </span>
        </div>
        <button
          onClick={onCheckout}
          disabled={loading || unavailable}
          className="inline-flex shrink-0 items-center gap-2 px-5 py-3 text-[0.7rem] font-black uppercase tracking-[0.14em] transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ background: ORANGE, color: "#111" }}
        >
          <span>{loading ? "..." : unavailable ? "Soon" : "Paga"}</span>
          {!loading && !unavailable && <span aria-hidden>→</span>}
        </button>
      </div>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Main Checkout
─────────────────────────────────────────────────────────────── */
export function CheckoutContent() {
  const t = useTokens();
  const searchParams = useSearchParams();
  const packSlug = searchParams.get("pack") || "function";
  const mc1 = searchParams.get("mc1") ?? "";
  const mc2 = searchParams.get("mc2") ?? "";
  const pack = getPackBySlug(packSlug);

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const [stickyVisible, setStickyVisible] = useState(false);

  // Fetch user info on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!cancelled) {
          setUserEmail(user?.email ?? null);
          setUserLoading(false);
        }
      } catch {
        if (!cancelled) setUserLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Show mobile sticky bar after scroll past sentinel
  useEffect(() => {
    if (!sentinelRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => setStickyVisible(!entry.isIntersecting),
      { threshold: 0 },
    );
    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, []);

  // ── Pack not found ────────────────────────────────────────────
  if (!pack) {
    return (
      <section
        className="themed-section relative flex min-h-screen items-center pt-24"
        style={{ background: "var(--section-bg)" }}
      >
        <div className="mx-auto max-w-md px-[5%] text-center md:px-10">
          <span
            className="mb-4 inline-block text-[0.7rem] font-black uppercase tracking-[0.34em]"
            style={{ color: ORANGE }}
          >
            — Errore
          </span>
          <h1
            className="mb-3 text-[clamp(1.5rem,3vw,2.2rem)] font-black tracking-[-0.02em]"
            style={{ color: t.th }}
          >
            Prodotto non trovato.
          </h1>
          <p className="mb-7 text-[0.95rem]" style={{ color: t.tb }}>
            Il link sembra rotto o il prodotto non è più disponibile.
          </p>
          <Link
            href="/pack"
            className="inline-flex items-center gap-2 px-6 py-3 text-[0.74rem] font-black uppercase tracking-[0.16em]"
            style={{ background: ORANGE, color: "#111" }}
          >
            <span>Vedi i pack</span>
            <span aria-hidden>→</span>
          </Link>
        </div>
      </section>
    );
  }

  // ── Resolve masterclass selections (PRO/ELITE only) ───────────
  const masterclassIds = [mc1, mc2].filter(Boolean);
  const requiresMc =
    pack.type === "bundle" && (pack.masterclassSelectionCount ?? 0) > 0;
  const selectedMc =
    requiresMc && masterclassIds.length > 0
      ? masterclassIds
          .map((slug) => getWorkshopBySlug(slug))
          .filter((w): w is Workshop => Boolean(w))
      : [];

  const grossCents = getDisplayCents(pack);
  const isBundle = pack.type === "bundle";
  const tierLabel = TIER_LABEL[pack.slug] ?? pack.name;
  const unavailable = pack.priceCents === 0; // bundles still TBD on Stripe side

  // ── Build URL for post-auth return ────────────────────────────
  function buildCheckoutUrl() {
    const params = new URLSearchParams({ pack: packSlug });
    if (mc1) params.set("mc1", mc1);
    if (mc2) params.set("mc2", mc2);
    return `/checkout?${params.toString()}`;
  }

  async function handleCheckout() {
    if (!pack || unavailable) return;
    setLoading(true);
    setError("");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const next = buildCheckoutUrl();
      localStorage.setItem("pending_checkout", next);
      window.location.href = `/auth/register?next=${encodeURIComponent(next)}`;
      return;
    }

    try {
      const response = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packId: pack.slug,
          priceId: pack.stripePriceId,
          workshopIds: [],
          masterclassIds,
        }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Errore durante il checkout");
        setLoading(false);
      }
    } catch {
      setError("Errore di connessione. Riprova tra qualche secondo.");
      setLoading(false);
    }
  }

  function handleSelectorConfirm(slugs: string[]) {
    setEditorOpen(false);
    const params = new URLSearchParams({ pack: packSlug });
    if (slugs[0]) params.set("mc1", slugs[0]);
    if (slugs[1]) params.set("mc2", slugs[1]);
    router.replace(`/checkout?${params.toString()}`, { scroll: false });
  }

  return (
    <>
      {/* ─── Top breadcrumb bar ───────────────────────────────── */}
      <div
        className="themed-section sticky top-0 z-30 border-b"
        style={{
          background: t.isDark
            ? "rgba(10,10,16,0.85)"
            : "rgba(255,255,255,0.92)",
          borderColor: t.border,
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          marginTop: "5rem",
        }}
      >
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-[5%] py-3 md:px-10">
          <Link
            href={
              isBundle
                ? "/pack"
                : `/masterclass/${pack.workshopSlug ?? pack.slug}`
            }
            className="inline-flex items-center gap-2 text-[0.66rem] font-bold uppercase tracking-[0.22em] transition-opacity hover:opacity-70"
            style={{ color: t.tb }}
          >
            <span aria-hidden>←</span>
            <span>Torna indietro</span>
          </Link>
          <div className="hidden items-center gap-2 text-[0.62rem] font-bold uppercase tracking-[0.22em] sm:flex">
            <span style={{ color: ORANGE }}>1.</span>
            <span style={{ color: t.th }}>Riepilogo</span>
            <span style={{ color: t.ts }}>·</span>
            <span style={{ color: t.ts }}>2. Pagamento Stripe</span>
            <span style={{ color: t.ts }}>·</span>
            <span style={{ color: t.ts }}>3. Conferma</span>
          </div>
          <div
            className="text-[0.62rem] font-bold uppercase tracking-[0.22em]"
            style={{ color: ORANGE }}
          >
            🔒 Sicuro
          </div>
        </div>
      </div>

      {/* ─── Main grid ─────────────────────────────────────────── */}
      <section
        className="themed-section relative pb-32 pt-12 md:pb-24 md:pt-16"
        style={{ background: "var(--section-bg)" }}
      >
        <div className="mx-auto max-w-[1280px] px-[5%] md:px-10">
          {/* Page header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <span
              className="mb-3 block text-[0.7rem] font-black uppercase tracking-[0.34em]"
              style={{ color: ORANGE }}
            >
              — Checkout · Edizione 2026/27
            </span>
            <h1
              className="font-black leading-[0.98] tracking-[-0.025em]"
              style={{
                fontSize: "clamp(1.8rem, 4.4vw, 3.2rem)",
                color: t.th,
              }}
            >
              Conferma il tuo ordine.
            </h1>
            <p
              className="mt-3 max-w-2xl text-[0.95rem] leading-[1.65]"
              style={{ color: t.tb }}
            >
              Verifica i dettagli qui sotto. Procedendo verrai reindirizzato al
              pagamento sicuro Stripe — torni in Academy a transazione
              completata.
            </p>
          </motion.div>

          <div ref={sentinelRef} />

          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-10">
            {/* ═══ LEFT — Order detail ═══════════════════════════ */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="space-y-5"
            >
              {/* Pack card */}
              <div
                className="overflow-hidden"
                style={{
                  background: t.surface,
                  border: `1px solid ${t.border}`,
                }}
              >
                <div
                  className="h-[2px] w-full"
                  style={{
                    background: `linear-gradient(90deg, ${ORANGE}, rgba(${ORANGE_RGB},0.05))`,
                  }}
                />
                <div className="p-6 md:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span
                        className="mb-2 inline-flex items-center gap-2 text-[0.6rem] font-black uppercase tracking-[0.32em]"
                        style={{ color: ORANGE }}
                      >
                        {isBundle
                          ? "Pack"
                          : pack.type === "course"
                            ? "Blocco"
                            : "Masterclass"}
                        <span style={{ opacity: 0.5 }}>·</span>
                        <span style={{ color: t.ts }}>{tierLabel}</span>
                      </span>
                      <h2
                        className="font-black leading-tight tracking-[-0.02em]"
                        style={{
                          fontSize: "clamp(1.4rem, 3vw, 2rem)",
                          color: t.th,
                        }}
                      >
                        {pack.name}
                      </h2>
                      <p
                        className="mt-2 text-[0.92rem] leading-snug"
                        style={{ color: t.tb }}
                      >
                        {pack.subtitle}
                      </p>
                    </div>
                    <Link
                      href={isBundle ? "/pack" : "/masterclass"}
                      className="shrink-0 text-[0.66rem] font-bold uppercase tracking-[0.22em] transition-opacity hover:opacity-70"
                      style={{ color: ORANGE }}
                    >
                      Modifica
                    </Link>
                  </div>

                  <div
                    className="my-6 h-px w-full"
                    style={{ background: t.border }}
                  />

                  {/* Includes */}
                  <p
                    className="mb-4 text-[0.6rem] font-black uppercase tracking-[0.32em]"
                    style={{ color: t.ts }}
                  >
                    Cosa è incluso
                  </p>
                  <ul className="grid gap-2.5 sm:grid-cols-2">
                    {pack.includes.map((it) => (
                      <li
                        key={it}
                        className="flex items-start gap-2.5 text-[0.88rem] leading-snug"
                        style={{ color: t.th }}
                      >
                        <span
                          className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center"
                          style={{ color: ORANGE }}
                        >
                          <svg
                            viewBox="0 0 16 16"
                            fill="none"
                            width="12"
                            height="12"
                          >
                            <path
                              d="M13.5 4.5L6 12L2.5 8.5"
                              stroke="currentColor"
                              strokeWidth={2.2}
                              strokeLinecap="square"
                            />
                          </svg>
                        </span>
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Selected masterclasses (PRO/ELITE) */}
              {requiresMc && (
                <div
                  className="overflow-hidden"
                  style={{
                    background: t.surface,
                    border: `1px solid ${t.border}`,
                  }}
                >
                  <div className="p-6 md:p-7">
                    <div className="flex items-baseline justify-between gap-3">
                      <p
                        className="text-[0.6rem] font-black uppercase tracking-[0.32em]"
                        style={{ color: ORANGE }}
                      >
                        Le tue Masterclass · {selectedMc.length} di{" "}
                        {pack.masterclassSelectionCount}
                      </p>
                      <button
                        type="button"
                        onClick={() => setEditorOpen(true)}
                        className="text-[0.66rem] font-bold uppercase tracking-[0.22em] transition-opacity hover:opacity-70"
                        style={{ color: ORANGE }}
                      >
                        Modifica
                      </button>
                    </div>

                    {selectedMc.length > 0 ? (
                      <ul className="mt-4 space-y-2.5">
                        {selectedMc.map((w) => (
                          <li
                            key={w.slug}
                            className="flex items-start gap-3 px-4 py-3"
                            style={{
                              background: t.isDark
                                ? "rgba(255,255,255,0.025)"
                                : "rgba(0,0,0,0.02)",
                              border: `1px solid ${t.border}`,
                            }}
                          >
                            <span
                              className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center"
                              style={{
                                background: `rgba(${ORANGE_RGB},0.14)`,
                                color: ORANGE,
                              }}
                            >
                              <svg
                                viewBox="0 0 16 16"
                                fill="none"
                                width="11"
                                height="11"
                              >
                                <path
                                  d="M13.5 4.5L6 12L2.5 8.5"
                                  stroke="currentColor"
                                  strokeWidth={2.2}
                                  strokeLinecap="square"
                                />
                              </svg>
                            </span>
                            <div className="min-w-0 flex-1">
                              <p
                                className="text-[0.92rem] font-bold leading-tight"
                                style={{ color: t.th }}
                              >
                                {w.title}
                              </p>
                              <p
                                className="mt-0.5 text-[0.72rem] leading-snug"
                                style={{ color: t.ts }}
                              >
                                {w.trainerLabel} · {w.duration}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div
                        className="mt-4 px-4 py-5 text-center"
                        style={{
                          border: `1px dashed ${t.border}`,
                          background: t.isDark
                            ? "rgba(255,255,255,0.02)"
                            : "rgba(0,0,0,0.015)",
                        }}
                      >
                        <p
                          className="text-[0.85rem] font-semibold"
                          style={{ color: t.tb }}
                        >
                          Non hai ancora selezionato le tue Masterclass.
                        </p>
                        <button
                          type="button"
                          onClick={() => setEditorOpen(true)}
                          className="mt-3 inline-flex items-center gap-2 text-[0.7rem] font-bold uppercase tracking-[0.18em] transition-opacity hover:opacity-70"
                          style={{ color: ORANGE }}
                        >
                          <span>Selezionale ora</span>
                          <span aria-hidden>→</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Account row */}
              <div
                className="flex flex-wrap items-center justify-between gap-3 px-6 py-5 md:px-7"
                style={{
                  background: t.surface,
                  border: `1px solid ${t.border}`,
                }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center text-[0.85rem] font-black"
                    style={{
                      background: `rgba(${ORANGE_RGB},0.14)`,
                      color: ORANGE,
                    }}
                  >
                    ✓
                  </span>
                  <div className="min-w-0">
                    <p
                      className="text-[0.6rem] font-black uppercase tracking-[0.32em]"
                      style={{ color: t.ts }}
                    >
                      Account
                    </p>
                    <p
                      className="text-[0.88rem] font-bold leading-tight"
                      style={{ color: t.th }}
                    >
                      {userLoading ? "..." : (userEmail ?? "Non autenticato")}
                    </p>
                  </div>
                </div>
                <Link
                  href="/account"
                  className="text-[0.66rem] font-bold uppercase tracking-[0.22em] transition-opacity hover:opacity-70"
                  style={{ color: t.tb }}
                >
                  Account
                </Link>
              </div>

              {/* Error */}
              {error && (
                <div
                  className="px-5 py-4 text-[0.88rem]"
                  style={{
                    background: "rgba(220,40,40,0.08)",
                    border: "1px solid rgba(220,40,40,0.35)",
                    color: t.isDark ? "#ff8a8a" : "#b00020",
                  }}
                >
                  <p className="font-bold">Errore</p>
                  <p className="mt-0.5 text-[0.82rem] opacity-90">{error}</p>
                </div>
              )}

              {/* Trust paragraph */}
              <div
                className="px-6 py-5 text-[0.78rem] leading-[1.65]"
                style={{
                  background: t.isDark
                    ? "rgba(255,255,255,0.02)"
                    : "rgba(0,0,0,0.015)",
                  border: `1px dashed ${t.border}`,
                  color: t.tb,
                }}
              >
                <p className="font-bold" style={{ color: t.th }}>
                  Pagamento e iscrizione, in sintesi.
                </p>
                <ul className="mt-2 space-y-1.5">
                  <li>
                    · Procedendo vieni reindirizzato al pagamento sicuro Stripe
                    (carta, Apple Pay, Google Pay).
                  </li>
                  <li>
                    · A transazione conclusa ricevi conferma via email e accesso
                    immediato all&rsquo;area account.
                  </li>
                  <li>
                    · Hai 14 giorni di recesso (Codice del Consumo) prima
                    dell&rsquo;inizio del percorso.
                  </li>
                  <li>
                    · Per assistenza:{" "}
                    <a
                      href="mailto:webmaster@lacertosus.com"
                      style={{ color: ORANGE, textDecoration: "underline" }}
                    >
                      webmaster@lacertosus.com
                    </a>
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* ═══ RIGHT — Sticky summary ═══════════════════════ */}
            <motion.aside
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:sticky lg:top-32 lg:self-start"
            >
              <OrderSummary
                pack={pack}
                selectedMc={selectedMc}
                loading={loading}
                unavailable={unavailable}
                onCheckout={handleCheckout}
              />
            </motion.aside>
          </div>
        </div>
      </section>

      {/* Mobile sticky bar */}
      <MobileStickyBar
        pack={pack}
        loading={loading}
        unavailable={unavailable}
        visible={stickyVisible}
        onCheckout={handleCheckout}
      />

      {/* Inline masterclass editor — same modal as pack selection */}
      {editorOpen && requiresMc && (
        <MasterclassSelector
          packSlug={pack.slug}
          count={pack.masterclassSelectionCount ?? 2}
          initialSelected={selectedMc.map((w) => w.slug)}
          onConfirm={handleSelectorConfirm}
          onClose={() => setEditorOpen(false)}
        />
      )}

      {/* Hint that grossCents is computed (avoid unused var lint if extracted) */}
      <span style={{ display: "none" }}>{grossCents}</span>
    </>
  );
}
