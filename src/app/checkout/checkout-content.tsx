"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  getPackBySlug,
  isDepositEligible,
  DEPOSIT_PRICE_CENTS,
  type AcademyProduct,
} from "@/lib/constants/packs";
import {
  getDeadlines,
  formatDeadline,
  isPastDeadline,
  DEFAULT_DEADLINES,
  type Deadlines,
} from "@/lib/settings/deadlines";
import {
  getWorkshopBySlug,
  resolvePublicWorkshops,
  PUBLIC_WORKSHOPS,
  type Workshop,
} from "@/lib/constants/workshops";
import { getMasterclassVisibility } from "@/lib/settings/masterclass-visibility";
import { createClient } from "@/lib/supabase/client";
import { MasterclassSelector } from "@/components/packs/masterclass-selector";
import {
  ORANGE,
  ORANGE_RGB,
  BUNDLE_PRICE_DISPLAY,
  BUNDLE_SLUGS,
  TIER_LABEL,
  TIER_TAGLINE,
  formatEur,
  formatPriceClean,
  getDisplayCents,
  isBundleSlug,
  splitVat,
  useTierTokens,
  type TierTokens,
} from "@/lib/checkout/theme";
import { usePromoPricing } from "@/lib/promos/client";

/* ──────────────────────────────────────────────────────────────
   Error handling — typed error + server error mapper
─────────────────────────────────────────────────────────────── */
type CheckoutErrorKind =
  | "network"
  | "auth"
  | "validation"
  | "unavailable"
  | "server"
  | "unknown";

interface CheckoutError {
  kind: CheckoutErrorKind;
  title: string;
  message: string;
  hint: string;
  /** Se true, il banner mostra un countdown e ricarica la pagina automaticamente. */
  autoReload: boolean;
}

function mapCheckoutError(
  serverMessage: string | null | undefined,
  status: number,
  detail?: string | null,
): CheckoutError {
  // Detail from server (staging/dev only): mostra il vero errore Stripe/DB
  // come hint per diagnosi rapida.
  const detailHint = detail ? ` Dettaglio tecnico: ${detail}` : "";
  // Connessione assente / fetch fallito
  if (status === 0) {
    return {
      kind: "network",
      title: "Connessione interrotta",
      message:
        "Non riusciamo a raggiungere i nostri server. Verifica la connessione internet e riprova.",
      hint: "Se la rete è stabile, prova a ricaricare la pagina.",
      autoReload: true,
    };
  }

  const msg = (serverMessage || "").toLowerCase();

  if (status === 401 || msg.includes("non autenticato")) {
    return {
      kind: "auth",
      title: "Sessione scaduta",
      message:
        "La tua sessione è scaduta. Per completare l'acquisto effettua di nuovo il login.",
      hint: "Ti reindirizzeremo automaticamente al login fra pochi secondi.",
      autoReload: true,
    };
  }

  if (msg.includes("non disponibile") || msg.includes("modalità")) {
    return {
      kind: "unavailable",
      title: "Prodotto non acquistabile",
      message:
        "Questo prodotto non è disponibile per l'acquisto in questo momento.",
      hint: "Se pensi sia un errore contattaci a academy@lacertosus.com.",
      autoReload: false,
    };
  }

  if (
    msg.includes("masterclass") ||
    msg.includes("selezione") ||
    msg.includes("non valido") ||
    msg.includes("non valida")
  ) {
    return {
      kind: "validation",
      title: "Selezione incompleta",
      message:
        serverMessage ||
        "Alcuni dati dell'ordine non sono validi. Verifica le scelte e riprova.",
      hint: "Torna indietro per modificare la selezione.",
      autoReload: false,
    };
  }

  if (msg.includes("creazione") || status >= 500) {
    return {
      kind: "server",
      title: "Errore del server",
      message:
        "Qualcosa è andato storto durante la creazione del tuo ordine. Nessun addebito è stato effettuato.",
      hint:
        "La pagina si aggiornerà automaticamente per riprovare." + detailHint,
      autoReload: true,
    };
  }

  return {
    kind: "unknown",
    title: "Errore imprevisto",
    message:
      serverMessage ||
      "Si è verificato un errore inatteso durante il checkout.",
    hint: "Se persiste contattaci a academy@lacertosus.com." + detailHint,
    autoReload: true,
  };
}

/* ──────────────────────────────────────────────────────────────
   Product icons (per pack tier + default for everything else)
─────────────────────────────────────────────────────────────── */
function getProductIcon(slug: string): string {
  switch (slug) {
    case "start":
      return "/prodotto-academy-start.jpg";
    case "pro":
      return "/prodotto-academy-pro.jpg";
    case "elite":
      return "/prodotto-academy-elite.jpg";
    default:
      return "/prodotto-academy.jpg";
  }
}

/* ──────────────────────────────────────────────────────────────
   Payment brand logos (compact inline SVG)
─────────────────────────────────────────────────────────────── */
type PaymentBrand = "visa" | "mastercard" | "amex" | "applepay" | "googlepay";

function PaymentLogo({ brand }: { brand: PaymentBrand }) {
  const baseChip =
    "flex h-[26px] w-[42px] shrink-0 items-center justify-center";
  const lightChip = {
    background: "#ffffff",
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: "3px",
  };

  if (brand === "visa") {
    return (
      <span className={baseChip} style={lightChip} role="img" aria-label="Visa">
        <svg viewBox="0 0 38 12" width="34" height="11" aria-hidden="true">
          <text
            x="19"
            y="10"
            textAnchor="middle"
            fontFamily="Arial, Helvetica, sans-serif"
            fontWeight={900}
            fontSize={11}
            fontStyle="italic"
            letterSpacing="0.02em"
            fill="#1A1F71"
          >
            VISA
          </text>
        </svg>
      </span>
    );
  }

  if (brand === "mastercard") {
    return (
      <span
        className={baseChip}
        style={lightChip}
        role="img"
        aria-label="Mastercard"
      >
        <svg viewBox="0 0 32 20" width="26" height="16" aria-hidden="true">
          <circle cx="12" cy="10" r="7.2" fill="#EB001B" />
          <circle cx="20" cy="10" r="7.2" fill="#F79E1B" />
          <path
            d="M16 4.6c1.6 1.3 2.6 3.2 2.6 5.4S17.6 14.1 16 15.4c-1.6-1.3-2.6-3.2-2.6-5.4S14.4 5.9 16 4.6z"
            fill="#FF5F00"
          />
        </svg>
      </span>
    );
  }

  if (brand === "amex") {
    return (
      <span
        className={baseChip}
        style={{
          background: "#1F72CD",
          border: "1px solid rgba(0,0,0,0.08)",
          borderRadius: "3px",
        }}
        role="img"
        aria-label="American Express"
      >
        <svg viewBox="0 0 38 12" width="34" height="10" aria-hidden="true">
          <text
            x="19"
            y="10"
            textAnchor="middle"
            fontFamily="Arial, Helvetica, sans-serif"
            fontWeight={900}
            fontSize={9.5}
            letterSpacing="0.05em"
            fill="#ffffff"
          >
            AMEX
          </text>
        </svg>
      </span>
    );
  }

  if (brand === "applepay") {
    return (
      <span
        className={baseChip}
        style={lightChip}
        role="img"
        aria-label="Apple Pay"
      >
        <svg viewBox="0 0 36 14" width="32" height="12" aria-hidden="true">
          {/* Apple silhouette */}
          <path
            fill="#000"
            transform="translate(2 1)"
            d="M8.4 1.43c0 .58-.21 1.13-.62 1.55-.45.5-1.16.88-1.74.84-.07-.55.2-1.13.59-1.5.43-.46 1.18-.81 1.77-.89zM10.6 9.5c-.36.55-.74 1.05-1.34 1.06-.59.01-.78-.34-1.45-.34-.67 0-.88.34-1.44.36-.58.02-1.02-.6-1.39-1.14-.74-1.07-1.31-3.04-.55-4.37.39-.66 1.07-1.07 1.81-1.08.56-.01 1.1.39 1.45.39.35 0 1.01-.48 1.7-.41.29.01 1.11.12 1.64.88-.04.03-.99.58-.98 1.72.01 1.36 1.18 1.81 1.2 1.82-.02.04-.18.65-.65 1.11z"
          />
          {/* "Pay" wordmark */}
          <text
            x="14"
            y="10"
            fontFamily="Arial, Helvetica, sans-serif"
            fontWeight={700}
            fontSize={7.5}
            fill="#000"
            letterSpacing="0.02em"
          >
            Pay
          </text>
        </svg>
      </span>
    );
  }

  // googlepay
  return (
    <span
      className={baseChip}
      style={lightChip}
      role="img"
      aria-label="Google Pay"
    >
      <svg viewBox="0 0 36 14" width="32" height="12" aria-hidden="true">
        {/* Multicolor G + "Pay" */}
        <text
          x="2"
          y="10"
          fontFamily="Arial, Helvetica, sans-serif"
          fontWeight={700}
          fontSize={9}
          letterSpacing="-0.01em"
        >
          <tspan fill="#4285F4">G</tspan>
        </text>
        <text
          x="11"
          y="10"
          fontFamily="Arial, Helvetica, sans-serif"
          fontWeight={700}
          fontSize={7.8}
          fill="#3C4043"
          letterSpacing="0.01em"
        >
          Pay
        </text>
      </svg>
    </span>
  );
}

/* ──────────────────────────────────────────────────────────────
   Trust icons (inline SVG)
─────────────────────────────────────────────────────────────── */
function IconLock({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 18 18"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3.5" y="8" width="11" height="7.5" rx="1" />
      <path d="M6 8V5.5a3 3 0 0 1 6 0V8" />
      <circle cx="9" cy="11.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconRefund({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 18 18"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 9a6 6 0 0 1 11-3.5" />
      <path d="M14 3v3h-3" />
      <path d="M15 9a6 6 0 0 1-11 3.5" />
      <path d="M4 15v-3h3" />
    </svg>
  );
}

function IconShieldCheck({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 18 18"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M9 1.8 2.5 4v4.5c0 4 2.8 7 6.5 7.7 3.7-.7 6.5-3.7 6.5-7.7V4L9 1.8z" />
      <path d="m6.3 9 1.9 1.9 3.5-3.6" />
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────────
   Promo type
─────────────────────────────────────────────────────────────── */
type AppliedPromo = {
  id: string;
  code: string;
  label: string;
  percentOff: number | null;
  amountOffCents: number | null;
};

function computeDiscountCents(
  gross: number,
  promo: AppliedPromo | null,
): number {
  if (!promo || gross <= 0) return 0;
  if (promo.percentOff != null) {
    return Math.round((gross * promo.percentOff) / 100);
  }
  if (promo.amountOffCents != null) {
    return Math.min(gross, promo.amountOffCents);
  }
  return 0;
}

type PaymentPlan = "full" | "deposit";

/* ──────────────────────────────────────────────────────────────
   Payment plan toggle (bundle only) — full upfront vs 500€ deposit
─────────────────────────────────────────────────────────────── */
function PaymentPlanToggle({
  value,
  onChange,
  balanceCents,
  balanceDeadline,
  t,
}: {
  value: PaymentPlan;
  onChange: (p: PaymentPlan) => void;
  balanceCents: number;
  balanceDeadline: string;
  t: TierTokens;
}) {
  const options: { id: PaymentPlan; title: string; sub: string }[] = [
    { id: "full", title: "Tutto subito", sub: "Paghi l'intero importo ora" },
    {
      id: "deposit",
      title: "Solo caparra · 500€",
      sub: `Saldo ${formatEur(balanceCents)} entro il ${formatDeadline(balanceDeadline)}`,
    },
  ];
  return (
    <div className="mb-5">
      <p
        className="mb-2.5 text-[0.6rem] font-black uppercase tracking-[0.28em]"
        style={{ color: t.ts }}
      >
        Modalità di pagamento
      </p>
      <div className="grid grid-cols-1 gap-2">
        {options.map((o) => {
          const active = value === o.id;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => onChange(o.id)}
              aria-pressed={active}
              className="flex items-start gap-3 px-3.5 py-3 text-left transition-all"
              style={{
                background: active ? `rgba(${ORANGE_RGB},0.08)` : t.surface,
                border: `1px solid ${active ? ORANGE : t.border}`,
                outline: active ? `1px solid ${ORANGE}` : "none",
              }}
            >
              <span
                className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
                style={{
                  border: `2px solid ${active ? ORANGE : t.border}`,
                  background: active ? ORANGE : "transparent",
                }}
                aria-hidden
              >
                {active && (
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: "#111" }}
                  />
                )}
              </span>
              <span className="min-w-0">
                <span
                  className="block text-[0.82rem] font-bold leading-tight"
                  style={{ color: t.th }}
                >
                  {o.title}
                </span>
                <span
                  className="mt-0.5 block text-[0.7rem] leading-snug"
                  style={{ color: t.ts }}
                >
                  {o.sub}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      {value === "deposit" && (
        <p className="mt-2 text-[0.66rem] leading-snug" style={{ color: t.ts }}>
          La caparra di 500€ (IVA inclusa) blocca il posto ma{" "}
          <strong style={{ color: t.tb }}>non è rimborsabile</strong>.
          L&apos;iscrizione si attiva al saldo.
        </p>
      )}
    </div>
  );
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
  t,
  promo,
  promoInput,
  promoError,
  promoLoading,
  onPromoInputChange,
  onApplyPromo,
  onRemovePromo,
  paymentPlan,
  onPaymentPlanChange,
  depositCredit,
  depositOpen,
  packClosed,
  balanceDeadline,
}: {
  pack: AcademyProduct;
  selectedMc: Workshop[];
  loading: boolean;
  unavailable: boolean;
  onCheckout: () => void;
  t: TierTokens;
  promo: AppliedPromo | null;
  promoInput: string;
  promoError: string;
  promoLoading: boolean;
  onPromoInputChange: (v: string) => void;
  onApplyPromo: () => void;
  onRemovePromo: () => void;
  paymentPlan: PaymentPlan;
  onPaymentPlanChange: (p: PaymentPlan) => void;
  depositCredit: boolean;
  /** Caparra purchase still open (before its deadline). */
  depositOpen: boolean;
  /** Pack purchase window closed (after pack deadline, not settling). */
  packClosed: boolean;
  balanceDeadline: string;
}) {
  const grossCents = getDisplayCents(pack);
  const depositEligible = isDepositEligible(pack);
  // Settling an existing caparra: -500€ credit auto-applied by the server.
  const showCredit = depositCredit && depositEligible;
  // Offer the caparra only while its purchase window is open and no caparra is
  // already being settled.
  const canDeposit = depositEligible && !showCredit && depositOpen;
  // Don't offer a new caparra while one is open.
  const isDeposit = canDeposit && paymentPlan === "deposit";
  const depositBalanceCents = Math.max(0, grossCents - DEPOSIT_PRICE_CENTS);
  const creditedTotalCents = Math.max(0, grossCents - DEPOSIT_PRICE_CENTS);
  const launch = usePromoPricing(pack.slug, grossCents);
  // Auto-promo (server-side) overrides any manual user code (no stacking on Stripe).
  const launchDiscountCents = launch ? launch.discount : 0;
  const manualDiscountCents = launch
    ? 0
    : computeDiscountCents(grossCents, promo);
  const totalDiscountCents = launchDiscountCents + manualDiscountCents;
  const finalGrossCents = Math.max(0, grossCents - totalDiscountCents);
  const { net, vat } = splitVat(finalGrossCents);
  const tierLabel = TIER_LABEL[pack.slug] ?? pack.name;
  const isBundle = pack.type === "bundle";
  const itemLabel = isBundle ? `Pack ${tierLabel}` : pack.name;

  return (
    <div
      className="overflow-hidden"
      style={{
        background: t.surfaceSolid,
        border: `1px solid ${t.borderStrong}`,
        boxShadow: t.shadow,
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
          <div className="flex items-start justify-between gap-3">
            <div
              className="relative aspect-square shrink-0 overflow-hidden"
              style={{
                width: "44px",
                border: `1px solid ${t.border}`,
              }}
            >
              <Image
                src={getProductIcon(pack.slug)}
                alt={pack.name}
                fill
                sizes="44px"
                className="object-cover"
              />
            </div>
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

        {/* Payment plan toggle — bundle only, while the caparra window is open
            and no caparra is being settled. */}
        {canDeposit && (
          <PaymentPlanToggle
            value={paymentPlan}
            onChange={onPaymentPlanChange}
            balanceCents={depositBalanceCents}
            balanceDeadline={balanceDeadline}
            t={t}
          />
        )}

        {/* ── Deposit summary (caparra) ── */}
        {showCredit ? (
          <div
            className="flex items-start gap-3 px-3 py-2.5"
            style={{
              background: `rgba(${ORANGE_RGB},0.1)`,
              border: `1px solid rgba(${ORANGE_RGB},0.4)`,
            }}
          >
            <span
              className="mt-0.5 inline-flex items-center justify-center px-2 py-0.5 text-[0.55rem] font-black uppercase tracking-[0.22em]"
              style={{ background: ORANGE, color: "#111" }}
            >
              Caparra
            </span>
            <div className="min-w-0 flex-1">
              <p
                className="text-[0.78rem] font-bold leading-tight"
                style={{ color: t.th }}
              >
                Credito caparra applicato
              </p>
              <p
                className="mt-0.5 text-[0.7rem] leading-snug"
                style={{ color: t.ts }}
              >
                Hai già versato {formatEur(DEPOSIT_PRICE_CENTS)}: lo scaliamo
                dal saldo di questo pack.
              </p>
            </div>
            <span
              className="shrink-0 text-[0.85rem] font-black tabular-nums"
              style={{ color: ORANGE }}
            >
              −{formatEur(DEPOSIT_PRICE_CENTS)}
            </span>
          </div>
        ) : isDeposit ? (
          <>
            <div className="space-y-1.5">
              <div className="flex items-baseline justify-between text-[0.82rem]">
                <span className="font-bold" style={{ color: t.th }}>
                  Caparra oggi
                </span>
                <span
                  className="font-black tabular-nums"
                  style={{ color: t.th }}
                >
                  {formatEur(DEPOSIT_PRICE_CENTS)}
                </span>
              </div>
              <div className="flex items-baseline justify-between text-[0.78rem]">
                <span style={{ color: t.ts }}>
                  Saldo entro il {formatDeadline(balanceDeadline)}
                </span>
                <span
                  className="font-semibold tabular-nums"
                  style={{ color: t.ts }}
                >
                  {formatEur(depositBalanceCents)}
                </span>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Launch promo banner — auto-applied, no user action required */}
            {launch && (
              <div
                className="mb-3 flex items-start gap-3 px-3 py-2.5"
                style={{
                  background: `rgba(${ORANGE_RGB},0.1)`,
                  border: `1px solid rgba(${ORANGE_RGB},0.4)`,
                }}
              >
                <span
                  className="mt-0.5 inline-flex items-center justify-center px-2 py-0.5 text-[0.55rem] font-black uppercase tracking-[0.22em]"
                  style={{ background: ORANGE, color: "#111" }}
                >
                  {launch.promo.name}
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className="text-[0.78rem] font-bold leading-tight"
                    style={{ color: t.th }}
                  >
                    {launch.promo.headline ?? "Sconto applicato"}
                  </p>
                  <p
                    className="mt-0.5 text-[0.7rem] leading-snug"
                    style={{ color: t.ts }}
                  >
                    Risparmi {formatEur(launch.discount)}
                    {launch.promo.subtitle ? ` · ${launch.promo.subtitle}` : ""}
                  </p>
                </div>
              </div>
            )}

            {/* Manual promo code section — hidden during launch (no stacking) */}
            {grossCents > 0 && !launch && (
              <PromoSection
                t={t}
                promo={promo}
                input={promoInput}
                error={promoError}
                loading={promoLoading}
                onChange={onPromoInputChange}
                onApply={onApplyPromo}
                onRemove={onRemovePromo}
              />
            )}

            {/* Discount line — launch first, then manual */}
            {launchDiscountCents > 0 && (
              <div className="mt-3 flex items-baseline justify-between text-[0.78rem]">
                <span style={{ color: ORANGE }}>
                  Sconto · {launch?.promo.name}
                </span>
                <span
                  className="font-bold tabular-nums"
                  style={{ color: ORANGE }}
                >
                  −{formatEur(launchDiscountCents, true)}
                </span>
              </div>
            )}
            {manualDiscountCents > 0 && (
              <div className="mt-3 flex items-baseline justify-between text-[0.78rem]">
                <span style={{ color: ORANGE }}>
                  Sconto · {promo?.code ?? ""}
                </span>
                <span
                  className="font-bold tabular-nums"
                  style={{ color: ORANGE }}
                >
                  −{formatEur(manualDiscountCents, true)}
                </span>
              </div>
            )}

            {/* VAT breakdown */}
            {finalGrossCents > 0 && (
              <div className="mt-3 space-y-1.5">
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
          </>
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
            {isDeposit ? "Da pagare oggi" : showCredit ? "Saldo" : "Totale"}
          </span>
          <span className="flex items-baseline gap-2">
            {((!isDeposit && totalDiscountCents > 0) || showCredit) && (
              <span
                className="text-[0.85rem] font-semibold tabular-nums line-through"
                style={{ color: t.ts }}
              >
                {formatEur(grossCents)}
              </span>
            )}
            <span
              className="text-[1.6rem] font-black leading-none tracking-[-0.02em] tabular-nums"
              style={{ color: t.th }}
            >
              {isDeposit
                ? formatEur(DEPOSIT_PRICE_CENTS)
                : showCredit
                  ? formatEur(creditedTotalCents)
                  : finalGrossCents > 0
                    ? formatEur(finalGrossCents)
                    : "TBD"}
            </span>
          </span>
        </div>
        {(isDeposit || showCredit || finalGrossCents > 0) && (
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
          disabled={loading || unavailable || packClosed}
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
          ) : packClosed ? (
            <>
              <span>Iscrizioni chiuse</span>
              <span aria-hidden className="text-base">
                ·
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
              <span>
                {isDeposit
                  ? "Versa la caparra"
                  : showCredit
                    ? "Salda il pack"
                    : "Paga con Stripe"}
              </span>
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
        <div className="mt-6 space-y-2.5">
          <span
            className="block text-[0.55rem] font-black uppercase tracking-[0.22em]"
            style={{ color: t.ts }}
          >
            Accettiamo
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            <PaymentLogo brand="visa" />
            <PaymentLogo brand="mastercard" />
            <PaymentLogo brand="amex" />
            <PaymentLogo brand="applepay" />
            <PaymentLogo brand="googlepay" />
          </div>
        </div>
      </div>

      {/* Trust strip */}
      <div
        className="border-t"
        style={{
          borderColor: t.border,
          background: t.surfaceSolid,
        }}
      >
        {[
          {
            Icon: IconLock,
            title: "Pagamento crittografato",
            desc: "Stripe · standard PCI-DSS Level 1",
          },
          isDeposit
            ? {
                Icon: IconRefund,
                title: "Caparra non rimborsabile",
                desc: `Saldo entro il ${formatDeadline(balanceDeadline)} per attivare l'iscrizione`,
              }
            : {
                Icon: IconRefund,
                title: "14 giorni di recesso",
                desc: "Cancellazione gratuita prima dell'inizio",
              },
          {
            Icon: IconShieldCheck,
            title: "Pagamento flessibile",
            desc: "Rateizzazione disponibile su richiesta",
          },
        ].map(({ Icon, title, desc }, i) => (
          <div
            key={title}
            className="flex items-start gap-3.5 px-6 py-4 md:px-7"
            style={{
              borderTop: i > 0 ? `1px solid ${t.border}` : "none",
            }}
          >
            <span
              className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center"
              style={{
                background: `rgba(${ORANGE_RGB},0.1)`,
                border: `1px solid rgba(${ORANGE_RGB},0.22)`,
                color: ORANGE,
              }}
            >
              <Icon />
            </span>
            <div className="min-w-0">
              <p
                className="text-[0.78rem] font-bold leading-tight"
                style={{ color: t.th }}
              >
                {title}
              </p>
              <p
                className="mt-1 text-[0.7rem] leading-snug"
                style={{ color: t.ts }}
              >
                {desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Promo code section
─────────────────────────────────────────────────────────────── */
function PromoSection({
  t,
  promo,
  input,
  error,
  loading,
  onChange,
  onApply,
  onRemove,
}: {
  t: TierTokens;
  promo: AppliedPromo | null;
  input: string;
  error: string;
  loading: boolean;
  onChange: (v: string) => void;
  onApply: () => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);

  // If a promo is applied, show the applied state regardless of `open`
  if (promo) {
    return (
      <div
        className="flex items-center justify-between gap-3 px-3 py-2.5"
        style={{
          background: `rgba(${ORANGE_RGB},0.08)`,
          border: `1px solid rgba(${ORANGE_RGB},0.32)`,
        }}
      >
        <div className="min-w-0 flex-1">
          <p
            className="text-[0.6rem] font-black uppercase tracking-[0.22em]"
            style={{ color: ORANGE }}
          >
            Codice applicato
          </p>
          <p
            className="mt-0.5 truncate text-[0.85rem] font-bold"
            style={{ color: t.th }}
          >
            <span className="font-mono">{promo.code}</span>
            <span className="ml-2" style={{ color: ORANGE }}>
              {promo.label}
            </span>
          </p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="shrink-0 px-2 py-1 text-[0.6rem] font-bold uppercase tracking-[0.18em] transition-opacity hover:opacity-70"
          style={{ color: t.tb }}
          aria-label="Rimuovi codice promo"
        >
          Rimuovi
        </button>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-[0.7rem] font-bold uppercase tracking-[0.18em] transition-opacity hover:opacity-70"
        style={{ color: ORANGE }}
      >
        <span aria-hidden>+</span>
        <span>Hai un codice promo?</span>
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <p
        className="text-[0.6rem] font-black uppercase tracking-[0.22em]"
        style={{ color: t.ts }}
      >
        Codice promo
      </p>
      <div className="flex items-stretch gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (input.trim()) onApply();
            }
          }}
          placeholder="ES. EARLYBIRD"
          autoFocus
          className="min-w-0 flex-1 px-3 py-2.5 text-[0.85rem] font-mono uppercase tracking-[0.08em] outline-none transition-colors focus:border-academy-orange"
          style={{
            background: t.surface,
            color: t.th,
            border: `1px solid ${t.border}`,
            letterSpacing: "0.08em",
          }}
        />
        <button
          type="button"
          onClick={onApply}
          disabled={loading || !input.trim()}
          className="shrink-0 px-4 py-2.5 text-[0.7rem] font-black uppercase tracking-[0.18em] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ background: ORANGE, color: "#111" }}
        >
          {loading ? "…" : "Applica"}
        </button>
      </div>
      {error && (
        <p className="text-[0.7rem]" style={{ color: "#dc2626" }}>
          {error}
        </p>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Error alert — shown above the pack card. Optionally counts down
   and reloads the page (or redirects to login for auth errors).
─────────────────────────────────────────────────────────────── */
const ERROR_RELOAD_SECONDS = 5;

function ErrorAlert({
  error,
  onDismiss,
  t,
}: {
  error: CheckoutError;
  onDismiss: () => void;
  t: TierTokens;
}) {
  const [secondsLeft, setSecondsLeft] = useState(ERROR_RELOAD_SECONDS);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!error.autoReload || paused) return;
    if (secondsLeft <= 0) {
      if (error.kind === "auth") {
        window.location.href = "/auth/login";
      } else {
        window.location.reload();
      }
      return;
    }
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [secondsLeft, paused, error.autoReload, error.kind]);

  // Reset countdown when a new error replaces this one
  useEffect(() => {
    setSecondsLeft(ERROR_RELOAD_SECONDS);
    setPaused(false);
  }, [error]);

  const reloadLabel =
    error.kind === "auth" ? "Vai al login ora" : "Riprova subito";

  function handleReloadNow() {
    if (error.kind === "auth") {
      window.location.href = "/auth/login";
    } else {
      window.location.reload();
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      role="alert"
      aria-live="assertive"
      className="overflow-hidden"
      style={{
        background: t.isDark ? "rgba(220,40,40,0.10)" : "rgba(220,40,40,0.06)",
        border: `1px solid rgba(220,40,40,${t.isDark ? "0.45" : "0.35"})`,
      }}
    >
      <div className="px-5 py-4 md:px-6 md:py-5">
        <div className="flex items-start gap-3">
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center"
            style={{
              background: "rgba(220,40,40,0.18)",
              color: t.isDark ? "#ff8a8a" : "#b00020",
              fontSize: "0.95rem",
              fontWeight: 900,
            }}
            aria-hidden
          >
            !
          </div>
          <div className="min-w-0 flex-1">
            <p
              className="text-[0.66rem] font-black uppercase tracking-[0.28em]"
              style={{ color: t.isDark ? "#ff8a8a" : "#b00020" }}
            >
              {error.title}
            </p>
            <p
              className="mt-1.5 text-[0.92rem] leading-[1.55]"
              style={{ color: t.th }}
            >
              {error.message}
            </p>
            <p
              className="mt-1 text-[0.78rem] leading-[1.55]"
              style={{ color: t.tb }}
            >
              {error.hint}
            </p>

            {error.autoReload && (
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <p
                  className="text-[0.78rem] tabular-nums"
                  style={{ color: t.tb }}
                >
                  {paused
                    ? "Aggiornamento automatico in pausa."
                    : secondsLeft > 0
                      ? `Aggiornamento automatico in ${secondsLeft}s…`
                      : "Aggiornamento in corso…"}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleReloadNow}
                    className="px-3 py-1.5 text-[0.7rem] font-black uppercase tracking-[0.22em] transition-opacity hover:opacity-85"
                    style={{
                      background: ORANGE,
                      color: "#0a0a1a",
                    }}
                  >
                    {reloadLabel}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaused((p) => !p)}
                    className="px-3 py-1.5 text-[0.7rem] font-black uppercase tracking-[0.22em] transition-opacity hover:opacity-70"
                    style={{
                      background: "transparent",
                      color: t.tb,
                      border: `1px solid ${t.border}`,
                    }}
                  >
                    {paused ? "Riprendi" : "Annulla"}
                  </button>
                </div>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Chiudi avviso"
            className="shrink-0 px-2 py-1 text-[0.95rem] leading-none transition-opacity hover:opacity-60"
            style={{ color: t.tb }}
          >
            ×
          </button>
        </div>
      </div>
    </motion.div>
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
  isDeposit,
  depositCredit,
}: {
  pack: AcademyProduct;
  loading: boolean;
  unavailable: boolean;
  visible: boolean;
  onCheckout: () => void;
  isDeposit: boolean;
  depositCredit: boolean;
}) {
  const grossCents = getDisplayCents(pack);
  const launchRaw = usePromoPricing(pack.slug, grossCents);
  // No launch promo on the caparra or while settling it.
  const launch = isDeposit || depositCredit ? null : launchRaw;
  const finalCents = isDeposit
    ? DEPOSIT_PRICE_CENTS
    : depositCredit
      ? Math.max(0, grossCents - DEPOSIT_PRICE_CENTS)
      : launch
        ? launch.final
        : grossCents;

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: visible ? 0 : 100 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed inset-x-0 bottom-0 z-40 px-3 pb-3 md:hidden"
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
            style={{
              color:
                launch || isDeposit || depositCredit
                  ? ORANGE
                  : "rgba(255,255,255,0.55)",
            }}
          >
            {isDeposit
              ? "Caparra · Oggi"
              : depositCredit
                ? "Saldo · Caparra −500€"
                : launch
                  ? `${launch.promo.name} · Totale`
                  : "Totale"}
          </span>
          <span className="flex items-baseline gap-2">
            {(launch || depositCredit) && (
              <span
                className="text-[0.7rem] font-semibold tabular-nums line-through"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                {formatEur(grossCents)}
              </span>
            )}
            <span
              className="text-[1.1rem] font-black leading-none tabular-nums"
              style={{ color: "#fff" }}
            >
              {finalCents > 0 ? formatEur(finalCents) : "TBD"}
            </span>
          </span>
        </div>
        <button
          onClick={onCheckout}
          disabled={loading || unavailable}
          className="inline-flex shrink-0 items-center gap-2 px-5 py-3 text-[0.7rem] font-black uppercase tracking-[0.14em] transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ background: ORANGE, color: "#111" }}
        >
          <span>
            {loading
              ? "..."
              : unavailable
                ? "Soon"
                : isDeposit
                  ? "Caparra"
                  : "Paga"}
          </span>
          {!loading && !unavailable && <span aria-hidden>→</span>}
        </button>
      </div>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Pack switcher — segmented control con anteprima per tier
─────────────────────────────────────────────────────────────── */
function PackSwitcher({
  currentSlug,
  onSwitch,
  onClose,
  t,
}: {
  currentSlug: string;
  onSwitch: (slug: string) => void;
  onClose: () => void;
  t: TierTokens;
}) {
  return (
    <div
      className="overflow-hidden"
      style={{
        background: t.surface,
        border: `1px solid ${t.border}`,
      }}
    >
      <div className="flex items-baseline justify-between gap-3 px-6 pt-5 md:px-7">
        <p
          className="text-[0.6rem] font-black uppercase tracking-[0.32em]"
          style={{ color: ORANGE }}
        >
          — Scegli un altro pack
        </p>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1.5 text-[0.6rem] font-bold uppercase tracking-[0.22em] transition-opacity hover:opacity-70"
          style={{ color: t.tb }}
          aria-label="Chiudi selettore pack"
        >
          <span aria-hidden className="text-[0.85rem] leading-none">
            ×
          </span>
          <span>Chiudi</span>
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2 p-4 md:p-5">
        {BUNDLE_SLUGS.map((slug) => {
          const active = slug === currentSlug;
          const isElite = slug === "elite";
          const isPro = slug === "pro";
          const previewBg = isElite
            ? "linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 55%, #0a0a0a 100%)"
            : isPro
              ? ORANGE
              : "#ffffff";
          const previewText = isElite ? "#ffffff" : "#111111";
          const previewBorder = isElite
            ? "rgba(255,255,255,0.12)"
            : isPro
              ? "rgba(240,146,38,0.55)"
              : "rgba(0,0,0,0.12)";
          const priceCents = BUNDLE_PRICE_DISPLAY[slug] ?? 0;

          return (
            <button
              key={slug}
              type="button"
              onClick={() => !active && onSwitch(slug)}
              aria-pressed={active}
              className="group relative flex w-full flex-col text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-academy-orange disabled:cursor-default"
              style={{
                outline: active ? `2px solid ${ORANGE}` : "none",
                outlineOffset: active ? "2px" : "0",
                opacity: active ? 1 : 0.62,
                cursor: active ? "default" : "pointer",
              }}
            >
              <div
                className="px-3 py-3 md:px-4"
                style={{
                  background: previewBg,
                  border: `1px solid ${previewBorder}`,
                  borderBottom: "none",
                  color: previewText,
                }}
              >
                <span
                  className="block text-[0.5rem] font-black uppercase tracking-[0.28em]"
                  style={{ opacity: 0.7 }}
                >
                  Pack
                </span>
                <span className="mt-0.5 block text-[1.1rem] font-black leading-none tracking-[-0.01em]">
                  {TIER_LABEL[slug]}
                </span>
              </div>
              <div
                className="px-3 py-2.5 md:px-4 md:py-3"
                style={{
                  background: t.surfaceSolid,
                  border: `1px solid ${previewBorder}`,
                  borderTop: "none",
                  color: t.th,
                }}
              >
                <span className="block text-[0.95rem] font-black tabular-nums leading-none">
                  {formatPriceClean(priceCents)}
                </span>
                <span
                  className="mt-1 block text-[0.6rem] leading-tight"
                  style={{ color: t.ts }}
                >
                  {TIER_TAGLINE[slug]}
                </span>
              </div>
              {active && (
                <span
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center text-[0.6rem] font-black"
                  style={{ background: ORANGE, color: "#111" }}
                  aria-hidden
                >
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Main Checkout
─────────────────────────────────────────────────────────────── */
export function CheckoutContent() {
  const searchParams = useSearchParams();
  const packSlug = searchParams.get("pack") || "function";
  const mc1 = searchParams.get("mc1") ?? "";
  const mc2 = searchParams.get("mc2") ?? "";
  const pack = getPackBySlug(packSlug);
  const t = useTierTokens(packSlug, isBundleSlug(packSlug));

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<CheckoutError | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [paymentPlan, setPaymentPlan] = useState<PaymentPlan>("full");
  // True when the logged-in user has an open caparra (deposit paid, balance
  // unpaid): the server auto-applies the -500€ credit, so reflect it here.
  const [depositCredit, setDepositCredit] = useState(false);
  const [deadlines, setDeadlines] = useState<Deadlines>(DEFAULT_DEADLINES);
  const [availableWorkshops, setAvailableWorkshops] =
    useState<Workshop[]>(PUBLIC_WORKSHOPS);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const [stickyVisible, setStickyVisible] = useState(false);

  // Promo code state
  const [promo, setPromo] = useState<AppliedPromo | null>(null);
  const [promoInput, setPromoInput] = useState("");
  const [promoError, setPromoError] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);

  async function handleApplyPromo() {
    const code = promoInput.trim();
    if (!code) return;
    setPromoLoading(true);
    setPromoError("");
    try {
      const res = await fetch("/api/checkout/validate-promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (data.valid) {
        setPromo({
          id: data.id,
          code: data.code,
          label: data.label,
          percentOff: data.percentOff,
          amountOffCents: data.amountOffCents,
        });
        setPromoInput("");
        setPromoError("");
      } else {
        setPromoError(data.error || "Codice non valido.");
      }
    } catch {
      setPromoError("Errore di connessione, riprova.");
    } finally {
      setPromoLoading(false);
    }
  }

  function handleRemovePromo() {
    setPromo(null);
    setPromoInput("");
    setPromoError("");
  }

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
        // Detect an open caparra to surface the -500€ credit on a bundle checkout.
        if (user) {
          const { data: openDeposit } = await supabase
            .from("orders")
            .select("id")
            .eq("user_id", user.id)
            .eq("payment_plan", "deposit")
            .eq("status", "paid")
            .is("balance_order_id", null)
            .limit(1)
            .maybeSingle();
          if (!cancelled) setDepositCredit(Boolean(openDeposit));
        }
        const d = await getDeadlines(supabase);
        if (!cancelled) setDeadlines(d);
        const visibility = await getMasterclassVisibility(supabase);
        if (!cancelled)
          setAvailableWorkshops(resolvePublicWorkshops(visibility));
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
        className="relative flex min-h-screen items-center pt-24"
        style={{ background: t.bg }}
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

  // ── Deadline-driven availability (bundles only; masterclasses unrestricted) ─
  const depositOpen = !isPastDeadline(deadlines.depositPurchase);
  // A fresh pack purchase is closed past the pack deadline; settling an open
  // caparra (depositCredit) is allowed within its own balance window.
  const packClosed =
    isBundle && !depositCredit && isPastDeadline(deadlines.packPurchase);

  // ── Build URL for post-auth return ────────────────────────────
  function buildCheckoutUrl() {
    const params = new URLSearchParams({ pack: packSlug });
    if (mc1) params.set("mc1", mc1);
    if (mc2) params.set("mc2", mc2);
    return `/checkout?${params.toString()}`;
  }

  async function handleCheckout() {
    if (!pack || unavailable || packClosed) return;
    setLoading(true);
    setError(null);

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
          workshopIds: [],
          masterclassIds,
          promotionCodeId: promo?.id ?? null,
          paymentPlan:
            isDepositEligible(pack) && depositOpen ? paymentPlan : "full",
        }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        if (data.detail) {
          // staging/dev: expose Stripe/DB error in console for diagnosis
          console.error("[checkout] server detail:", data.detail);
        }
        setError(mapCheckoutError(data.error, response.status, data.detail));
        setLoading(false);
      }
    } catch {
      setError(mapCheckoutError(null, 0));
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

  function handleSwitchPack(newSlug: string) {
    if (newSlug === packSlug) return;
    const newPack = getPackBySlug(newSlug);
    const params = new URLSearchParams({ pack: newSlug });
    // Preserve masterclass selections only if the new pack still requires them
    const newRequiresMc =
      newPack?.type === "bundle" &&
      (newPack?.masterclassSelectionCount ?? 0) > 0;
    if (newRequiresMc) {
      if (mc1) params.set("mc1", mc1);
      if (mc2) params.set("mc2", mc2);
    }
    router.replace(`/checkout?${params.toString()}`, { scroll: false });
    setSwitcherOpen(false);
  }

  return (
    <>
      {/* ─── Top breadcrumb bar ───────────────────────────────── */}
      <div
        className="sticky top-0 z-30 border-b"
        style={{
          background: t.headerBg,
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
                : pack.type === "certification"
                  ? "/percorso/fipe-personal-trainer"
                  : `/masterclass/${pack.workshopSlug ?? pack.slug}`
            }
            className="inline-flex items-center gap-2 text-[0.66rem] font-bold uppercase tracking-[0.22em] transition-opacity hover:opacity-70"
            style={{ color: t.tb }}
          >
            <span aria-hidden>←</span>
            <span>Torna indietro</span>
          </Link>
          <div className="hidden items-center gap-2 text-[0.62rem] font-bold uppercase tracking-[0.22em] md:flex">
            <span style={{ color: ORANGE }}>1.</span>
            <span style={{ color: t.th }}>Riepilogo</span>
            <span style={{ color: t.ts }}>·</span>
            <span style={{ color: t.ts }}>2. Pagamento</span>
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
        className="relative pb-32 pt-12 md:pb-24 md:pt-16"
        style={{ background: t.bg }}
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

          <div className="grid gap-6 md:grid-cols-[1fr_320px] md:gap-8 lg:grid-cols-[1fr_400px] lg:gap-10">
            {/* ═══ LEFT — Order detail ═══════════════════════════ */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="space-y-5"
            >
              {/* Error alert (shown above pack card) */}
              <AnimatePresence>
                {error && (
                  <ErrorAlert
                    key={error.kind + error.title}
                    error={error}
                    onDismiss={() => setError(null)}
                    t={t}
                  />
                )}
              </AnimatePresence>

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
                    <div className="flex min-w-0 flex-1 items-start gap-4">
                      {/* Product icon */}
                      <div
                        className="relative aspect-square shrink-0 overflow-hidden"
                        style={{
                          width: "clamp(80px, 14vw, 110px)",
                          border: `1px solid ${t.borderStrong}`,
                        }}
                      >
                        <Image
                          src={getProductIcon(pack.slug)}
                          alt={pack.name}
                          fill
                          sizes="110px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <span
                          className="mb-2 inline-flex items-center gap-2 text-[0.6rem] font-black uppercase tracking-[0.32em]"
                          style={{ color: ORANGE }}
                        >
                          {isBundle
                            ? "Pack"
                            : pack.type === "course"
                              ? "Blocco"
                              : pack.type === "certification"
                                ? "Certificazione"
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
                    </div>
                    {isBundle ? (
                      <button
                        type="button"
                        onClick={() => setSwitcherOpen((v) => !v)}
                        aria-expanded={switcherOpen}
                        aria-controls="pack-switcher"
                        className="inline-flex shrink-0 items-center gap-1.5 px-3 py-2 text-[0.66rem] font-bold uppercase tracking-[0.22em] transition-all hover:opacity-80"
                        style={{
                          color: ORANGE,
                          border: `1px solid rgba(${ORANGE_RGB},0.4)`,
                          background: `rgba(${ORANGE_RGB},0.06)`,
                        }}
                      >
                        <span>Cambia</span>
                        <span
                          aria-hidden
                          className="text-[0.7rem] leading-none transition-transform"
                          style={{
                            transform: switcherOpen ? "rotate(180deg)" : "none",
                          }}
                        >
                          ▾
                        </span>
                      </button>
                    ) : pack.type === "certification" ? null : (
                      <Link
                        href="/masterclass"
                        className="shrink-0 text-[0.66rem] font-bold uppercase tracking-[0.22em] transition-opacity hover:opacity-70"
                        style={{ color: ORANGE }}
                      >
                        Modifica
                      </Link>
                    )}
                  </div>

                  {/* Inline pack switcher (toggled by Cambia) */}
                  <AnimatePresence initial={false}>
                    {isBundle && switcherOpen && (
                      <motion.div
                        id="pack-switcher"
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{
                          opacity: 1,
                          height: "auto",
                          marginTop: 24,
                        }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        transition={{
                          duration: 0.28,
                          ease: [0.25, 0.46, 0.45, 0.94],
                        }}
                        className="overflow-hidden"
                      >
                        <PackSwitcher
                          currentSlug={packSlug}
                          onSwitch={handleSwitchPack}
                          onClose={() => setSwitcherOpen(false)}
                          t={t}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

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

              {/* Error mostrato sopra la pack card via ErrorAlert */}

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
                      href="mailto:academy@lacertosus.com"
                      style={{ color: ORANGE, textDecoration: "underline" }}
                    >
                      academy@lacertosus.com
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
              className="mx-auto w-full max-w-[480px] md:mx-0 md:max-w-none md:sticky md:top-32 md:self-start"
            >
              <OrderSummary
                pack={pack}
                selectedMc={selectedMc}
                loading={loading}
                unavailable={unavailable}
                onCheckout={handleCheckout}
                t={t}
                promo={promo}
                promoInput={promoInput}
                promoError={promoError}
                promoLoading={promoLoading}
                onPromoInputChange={setPromoInput}
                onApplyPromo={handleApplyPromo}
                onRemovePromo={handleRemovePromo}
                paymentPlan={paymentPlan}
                onPaymentPlanChange={setPaymentPlan}
                depositCredit={depositCredit}
                depositOpen={depositOpen}
                packClosed={packClosed}
                balanceDeadline={deadlines.depositBalance}
              />
            </motion.aside>
          </div>
        </div>
      </section>

      {/* Mobile sticky bar */}
      <MobileStickyBar
        pack={pack}
        loading={loading}
        unavailable={unavailable || packClosed}
        visible={stickyVisible}
        onCheckout={handleCheckout}
        isDeposit={
          isDepositEligible(pack) &&
          !depositCredit &&
          depositOpen &&
          paymentPlan === "deposit"
        }
        depositCredit={depositCredit && isDepositEligible(pack)}
      />

      {/* Inline masterclass editor — same modal as pack selection */}
      {editorOpen && requiresMc && (
        <MasterclassSelector
          packSlug={pack.slug}
          count={pack.masterclassSelectionCount ?? 2}
          initialSelected={selectedMc.map((w) => w.slug)}
          onConfirm={handleSelectorConfirm}
          onClose={() => setEditorOpen(false)}
          availableWorkshops={availableWorkshops}
        />
      )}

      {/* Hint that grossCents is computed (avoid unused var lint if extracted) */}
      <span style={{ display: "none" }}>{grossCents}</span>
    </>
  );
}
