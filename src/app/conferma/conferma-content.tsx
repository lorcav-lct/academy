"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import QRCode from "qrcode";
import { createClient } from "@/lib/supabase/client";
import { getPackBySlug, type AcademyProduct } from "@/lib/constants/packs";
import { getWorkshopBySlug } from "@/lib/constants/workshops";
import { getCourseBySlug } from "@/lib/constants/courses";
import {
  ORANGE,
  ORANGE_RGB,
  TIER_LABEL,
  formatEur,
  getDisplayCents,
  isBundleSlug,
  splitVat,
  useTierTokens,
  type TierTokens,
} from "@/lib/checkout/theme";

/* ──────────────────────────────────────────────────────────────
   Types
─────────────────────────────────────────────────────────────── */
interface OrderRow {
  id: string;
  status: "pending" | "paid" | "cancelled" | "refunded";
  amount_cents: number;
  tax_cents: number | null;
  pack_id: string | null;
  selected_workshop_ids: string[] | null;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  billing_name: string | null;
  billing_email: string | null;
  created_at: string;
  updated_at: string;
}

interface TicketRow {
  id: string;
  course_id: string | null;
  is_used: boolean;
  qr_image_url: string | null;
}

/* ──────────────────────────────────────────────────────────────
   Helpers
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

function formatDateLong(iso: string): string {
  return new Date(iso).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function shortId(id: string): string {
  return id.split("-")[0].toUpperCase();
}

function firstName(full: string | null | undefined): string {
  if (!full) return "";
  return full.trim().split(/\s+/)[0] ?? "";
}

/* ──────────────────────────────────────────────────────────────
   Inline icons
─────────────────────────────────────────────────────────────── */
function IconCheckCircle({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

function IconMail({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="3" y="5" width="18" height="14" rx="1.5" />
      <path d="m3.5 6 8.5 7 8.5-7" />
    </svg>
  );
}

function IconQR({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path d="M14 14h3v3h-3zM20 14v3M14 20h7" />
    </svg>
  );
}

function IconCalendar({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="3" y="5" width="18" height="16" rx="1.5" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}

function IconLock({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="3.5" y="8" width="11" height="7.5" rx="1" />
      <path d="M6 8V5.5a3 3 0 0 1 6 0V8" />
      <circle cx="9" cy="11.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconShieldCheck({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M9 1.8 2.5 4v4.5c0 4 2.8 7 6.5 7.7 3.7-.7 6.5-3.7 6.5-7.7V4L9 1.8z" />
      <path d="m6.3 9 1.9 1.9 3.5-3.6" />
    </svg>
  );
}

function IconCopy({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="6" y="6" width="9" height="9" rx="1.2" />
      <path d="M12 6V4.5a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h1.5" />
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────────
   Order Summary card (right column) — mirrors /checkout
─────────────────────────────────────────────────────────────── */
function OrderSummary({
  pack,
  selectedWorkshopSlugs,
  amountCents,
  taxCents,
  t,
}: {
  pack: AcademyProduct | null;
  selectedWorkshopSlugs: string[];
  amountCents: number;
  taxCents: number | null;
  t: TierTokens;
}) {
  const grossCents =
    amountCents > 0 ? amountCents : pack ? getDisplayCents(pack) : 0;
  const split = splitVat(grossCents);
  const taxAmount = taxCents != null && taxCents > 0 ? taxCents : split.vat;
  const netAmount = grossCents - taxAmount;
  const tierLabel = pack ? (TIER_LABEL[pack.slug] ?? pack.name) : "Ordine";
  const itemLabel = pack
    ? pack.type === "bundle"
      ? `Pack ${tierLabel}`
      : pack.name
    : "Prodotto";

  const selectedWorkshops = selectedWorkshopSlugs
    .map((s) => getWorkshopBySlug(s))
    .filter((w): w is NonNullable<ReturnType<typeof getWorkshopBySlug>> =>
      Boolean(w),
    );

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
            {pack && (
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
            )}
            <div className="min-w-0 flex-1">
              <p
                className="text-[0.95rem] font-bold leading-tight"
                style={{ color: t.th }}
              >
                {itemLabel}
              </p>
              {pack?.subtitle && (
                <p
                  className="mt-0.5 text-[0.72rem] leading-snug"
                  style={{ color: t.ts }}
                >
                  {pack.subtitle}
                </p>
              )}
            </div>
            <span
              className="shrink-0 text-[0.95rem] font-black tabular-nums"
              style={{ color: t.th }}
            >
              {grossCents > 0 ? formatEur(grossCents) : "—"}
            </span>
          </div>

          {selectedWorkshops.map((w) => (
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
                  {w.trainerLabel}
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
                {formatEur(netAmount, true)}
              </span>
            </div>
            <div className="flex items-baseline justify-between text-[0.78rem]">
              <span style={{ color: t.tb }}>IVA</span>
              <span
                className="font-semibold tabular-nums"
                style={{ color: t.tb }}
              >
                {formatEur(taxAmount, true)}
              </span>
            </div>
          </div>
        )}

        {/* Total paid */}
        <div
          className="mt-5 flex items-baseline justify-between border-t pt-5"
          style={{ borderColor: t.border }}
        >
          <span
            className="text-[0.66rem] font-black uppercase tracking-[0.28em]"
            style={{ color: t.ts }}
          >
            Totale pagato
          </span>
          <span
            className="text-[1.6rem] font-black leading-none tracking-[-0.02em] tabular-nums"
            style={{ color: t.th }}
          >
            {grossCents > 0 ? formatEur(grossCents) : "—"}
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
        <Link
          href="/account/tickets"
          className="mt-6 inline-flex w-full items-center justify-between gap-3 px-6 py-4 text-[0.78rem] font-black uppercase tracking-[0.16em] transition-all duration-200 hover:opacity-90"
          style={{ background: ORANGE, color: "#111" }}
        >
          <span>Vai ai miei ticket</span>
          <span aria-hidden className="text-base">
            →
          </span>
        </Link>
        <Link
          href="/account"
          className="mt-2 inline-flex w-full items-center justify-center gap-2 px-6 py-3 text-[0.7rem] font-bold uppercase tracking-[0.16em] transition-opacity hover:opacity-70"
          style={{
            background: "transparent",
            color: t.tb,
            border: `1px solid ${t.border}`,
          }}
        >
          Vai al mio account
        </Link>
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
          {
            Icon: IconShieldCheck,
            title: "14 giorni di recesso",
            desc: "Cancellazione gratuita prima dell'inizio",
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
   Confirmation hero card — left column top
─────────────────────────────────────────────────────────────── */
function ConfirmationHero({
  order,
  t,
  onCopyOrderId,
  copied,
}: {
  order: OrderRow;
  t: TierTokens;
  onCopyOrderId: () => void;
  copied: boolean;
}) {
  const paidAt = order.updated_at || order.created_at;
  return (
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
        <div className="flex flex-wrap items-start gap-5">
          <span
            className="flex h-14 w-14 shrink-0 items-center justify-center"
            style={{
              background: `rgba(${ORANGE_RGB},0.12)`,
              border: `1px solid rgba(${ORANGE_RGB},0.32)`,
              color: ORANGE,
            }}
          >
            <IconCheckCircle className="h-7 w-7" />
          </span>
          <div className="min-w-0 flex-1">
            <p
              className="text-[0.6rem] font-black uppercase tracking-[0.32em]"
              style={{ color: ORANGE }}
            >
              — Pagamento ricevuto
            </p>
            <h2
              className="mt-2 font-black leading-tight tracking-[-0.02em]"
              style={{
                fontSize: "clamp(1.3rem, 2.6vw, 1.8rem)",
                color: t.th,
              }}
            >
              Sei dentro. Benvenutə in Lacertosus Academy.
            </h2>
            <p
              className="mt-2 text-[0.92rem] leading-snug"
              style={{ color: t.tb }}
            >
              Abbiamo ricevuto il pagamento e generato i tuoi ticket QR. Una
              copia della conferma è già nella tua casella email.
            </p>
          </div>
        </div>

        <div
          className="mt-6 grid gap-px overflow-hidden"
          style={{
            background: t.border,
            border: `1px solid ${t.border}`,
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          }}
        >
          <div className="px-4 py-3" style={{ background: t.surfaceSolid }}>
            <p
              className="text-[0.55rem] font-black uppercase tracking-[0.28em]"
              style={{ color: t.ts }}
            >
              Ordine
            </p>
            <button
              type="button"
              onClick={onCopyOrderId}
              className="mt-1 inline-flex items-center gap-1.5 text-left font-mono text-[0.85rem] font-bold transition-colors hover:opacity-80"
              style={{ color: t.th }}
              title="Copia codice ordine"
            >
              <span>#{shortId(order.id)}</span>
              <IconCopy className="h-3.5 w-3.5 opacity-50" />
              {copied && (
                <span
                  className="text-[0.6rem] font-bold uppercase tracking-[0.18em]"
                  style={{ color: ORANGE }}
                >
                  Copiato
                </span>
              )}
            </button>
          </div>
          <div className="px-4 py-3" style={{ background: t.surfaceSolid }}>
            <p
              className="text-[0.55rem] font-black uppercase tracking-[0.28em]"
              style={{ color: t.ts }}
            >
              Data
            </p>
            <p
              className="mt-1 text-[0.85rem] font-bold tabular-nums"
              style={{ color: t.th }}
            >
              {formatDateLong(paidAt)}
            </p>
            <p className="text-[0.66rem] tabular-nums" style={{ color: t.ts }}>
              {formatTime(paidAt)}
            </p>
          </div>
          <div className="px-4 py-3" style={{ background: t.surfaceSolid }}>
            <p
              className="text-[0.55rem] font-black uppercase tracking-[0.28em]"
              style={{ color: t.ts }}
            >
              Email conferma
            </p>
            <p
              className="mt-1 truncate text-[0.85rem] font-bold"
              style={{ color: t.th }}
              title={order.billing_email ?? ""}
            >
              {order.billing_email ?? "—"}
            </p>
          </div>
          <div className="px-4 py-3" style={{ background: t.surfaceSolid }}>
            <p
              className="text-[0.55rem] font-black uppercase tracking-[0.28em]"
              style={{ color: t.ts }}
            >
              Metodo
            </p>
            <p
              className="mt-1 text-[0.85rem] font-bold"
              style={{ color: t.th }}
            >
              Stripe
            </p>
            <p className="text-[0.66rem]" style={{ color: t.ts }}>
              Pagamento sicuro
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Next steps timeline
─────────────────────────────────────────────────────────────── */
function NextSteps({
  t,
  email,
  ticketCount,
}: {
  t: TierTokens;
  email: string | null;
  ticketCount: number;
}) {
  const steps = [
    {
      Icon: IconMail,
      title: "Controlla la tua email",
      body: email
        ? `Abbiamo inviato la conferma a ${email}. Se non la vedi entro qualche minuto, controlla lo spam.`
        : "Abbiamo inviato la conferma alla tua casella di posta. Se non la vedi entro qualche minuto, controlla lo spam.",
    },
    {
      Icon: IconQR,
      title:
        ticketCount > 0
          ? `${ticketCount} ticket QR pronti nel tuo account`
          : "I tuoi ticket QR saranno pronti a breve",
      body: "Mostra il QR al check-in di ogni weekend. Li trovi sempre nell'area Ticket.",
    },
    {
      Icon: IconCalendar,
      title: "Salva le date in calendario",
      body: "Riceverai una email con calendario e indicazioni operative prima di ogni weekend formativo.",
    },
  ];

  return (
    <div
      className="overflow-hidden"
      style={{
        background: t.surface,
        border: `1px solid ${t.border}`,
      }}
    >
      <div className="p-6 md:p-7">
        <p
          className="mb-5 text-[0.6rem] font-black uppercase tracking-[0.32em]"
          style={{ color: ORANGE }}
        >
          — Cosa succede ora
        </p>
        <ol className="space-y-4">
          {steps.map(({ Icon, title, body }, i) => (
            <li key={title} className="flex items-start gap-4">
              <span
                className="relative flex h-9 w-9 shrink-0 items-center justify-center"
                style={{
                  background: `rgba(${ORANGE_RGB},0.1)`,
                  border: `1px solid rgba(${ORANGE_RGB},0.28)`,
                  color: ORANGE,
                }}
              >
                <Icon className="h-4 w-4" />
                <span
                  className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center text-[0.5rem] font-black"
                  style={{ background: ORANGE, color: "#111" }}
                >
                  {i + 1}
                </span>
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className="text-[0.92rem] font-bold leading-tight"
                  style={{ color: t.th }}
                >
                  {title}
                </p>
                <p
                  className="mt-1 text-[0.78rem] leading-snug"
                  style={{ color: t.tb }}
                >
                  {body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Tickets card — list with QR preview
─────────────────────────────────────────────────────────────── */
function TicketsCard({ tickets, t }: { tickets: TicketRow[]; t: TierTokens }) {
  const [qrMap, setQrMap] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const map: Record<string, string> = {};
      await Promise.all(
        tickets.map(async (ticket) => {
          map[ticket.id] = await QRCode.toDataURL(ticket.id, {
            width: 240,
            margin: 1,
            color: { dark: "#111111", light: "#ffffff" },
          });
        }),
      );
      if (!cancelled) setQrMap(map);
    })();
    return () => {
      cancelled = true;
    };
  }, [tickets]);

  return (
    <div
      className="overflow-hidden"
      style={{
        background: t.surface,
        border: `1px solid ${t.border}`,
      }}
    >
      <div className="flex items-baseline justify-between gap-3 px-6 pt-6 md:px-7">
        <p
          className="text-[0.6rem] font-black uppercase tracking-[0.32em]"
          style={{ color: ORANGE }}
        >
          — I tuoi ticket · {tickets.length}
        </p>
        <Link
          href="/account/tickets"
          className="text-[0.66rem] font-bold uppercase tracking-[0.22em] transition-opacity hover:opacity-70"
          style={{ color: ORANGE }}
        >
          Vedi tutti →
        </Link>
      </div>

      {tickets.length === 0 ? (
        <div className="px-6 pb-6 pt-4 md:px-7">
          <div
            className="flex items-center gap-3 px-4 py-4"
            style={{
              border: `1px dashed ${t.border}`,
              background: t.tipBg,
            }}
          >
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center"
              style={{
                background: `rgba(${ORANGE_RGB},0.1)`,
                color: ORANGE,
              }}
            >
              <IconQR className="h-4 w-4" />
            </span>
            <p className="text-[0.82rem] leading-snug" style={{ color: t.tb }}>
              Generazione ticket in corso. Compariranno qui e nella tua area
              Ticket entro pochi secondi.
            </p>
          </div>
        </div>
      ) : (
        <ul className="grid gap-3 p-5 md:p-6">
          {tickets.map((ticket) => {
            const course = getCourseBySlug(ticket.course_id ?? "");
            const product = ticket.course_id
              ? getPackBySlug(ticket.course_id)
              : null;
            const title =
              course?.title ?? product?.name ?? ticket.course_id ?? "Ticket";
            const subtitle = course?.subtitle ?? product?.subtitle ?? "";
            const dataUrl = qrMap[ticket.id];

            return (
              <li
                key={ticket.id}
                className="flex flex-col overflow-hidden"
                style={{
                  background: t.surfaceSolid,
                  border: `1px solid ${t.border}`,
                }}
              >
                <div
                  className="flex items-center justify-center bg-white px-4 py-5"
                  style={{
                    borderBottom: `1px solid ${t.border}`,
                  }}
                >
                  {dataUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={dataUrl}
                      alt={`QR ${title}`}
                      className="h-32 w-32"
                    />
                  ) : (
                    <div
                      className="flex h-32 w-32 items-center justify-center text-[0.62rem] font-bold uppercase tracking-[0.2em]"
                      style={{
                        background: "#f5f5f5",
                        color: "#aaa",
                      }}
                    >
                      QR…
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p
                    className="text-[0.6rem] font-black uppercase tracking-[0.28em]"
                    style={{ color: ORANGE }}
                  >
                    Lacertosus Academy
                  </p>
                  <p
                    className="mt-1 truncate text-[0.92rem] font-bold leading-tight"
                    style={{ color: t.th }}
                    title={title}
                  >
                    {title}
                  </p>
                  {subtitle && (
                    <p
                      className="mt-0.5 truncate text-[0.7rem]"
                      style={{ color: t.ts }}
                      title={subtitle}
                    >
                      {subtitle}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Loading / error full-screen states
─────────────────────────────────────────────────────────────── */
function FullScreenState({
  t,
  variant,
  onRetry,
}: {
  t: TierTokens;
  variant: "loading" | "polling" | "missing" | "notfound";
  onRetry?: () => void;
}) {
  const messages: Record<typeof variant, { title: string; body: string }> = {
    loading: {
      title: "Carico la conferma…",
      body: "Recupero i dettagli del tuo ordine.",
    },
    polling: {
      title: "Stiamo confermando il pagamento…",
      body: "Stripe ci sta notificando l'incasso. Di solito impiega meno di 10 secondi.",
    },
    missing: {
      title: "Sessione non trovata",
      body: "Apri questa pagina solo dopo aver completato il checkout. Nel frattempo controlla la tua area account.",
    },
    notfound: {
      title: "Ordine non trovato",
      body: "Non vediamo ancora l'ordine collegato a questa sessione. Riprova tra qualche secondo o vai ai tuoi ordini.",
    },
  };
  const { title, body } = messages[variant];
  const isWaiting = variant === "loading" || variant === "polling";

  return (
    <section
      className="relative flex min-h-screen items-center pt-24"
      style={{ background: t.bg }}
    >
      <div className="mx-auto max-w-md px-[5%] text-center md:px-10">
        <div
          className="mx-auto mb-5 flex h-14 w-14 items-center justify-center"
          style={{
            background: `rgba(${ORANGE_RGB},0.1)`,
            border: `1px solid rgba(${ORANGE_RGB},0.3)`,
            color: ORANGE,
          }}
        >
          {isWaiting ? (
            <svg
              viewBox="0 0 24 24"
              width="22"
              height="22"
              fill="none"
              className="animate-spin"
            >
              <circle
                cx="12"
                cy="12"
                r="9"
                stroke="currentColor"
                strokeWidth="2"
                strokeOpacity="0.25"
              />
              <path
                d="M21 12a9 9 0 0 0-9-9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <IconCheckCircle className="h-6 w-6" />
          )}
        </div>
        <p
          className="mb-2 text-[0.6rem] font-black uppercase tracking-[0.34em]"
          style={{ color: ORANGE }}
        >
          — Conferma ordine
        </p>
        <h1
          className="mb-3 font-black tracking-[-0.02em]"
          style={{
            fontSize: "clamp(1.4rem, 3vw, 2rem)",
            color: t.th,
          }}
        >
          {title}
        </h1>
        <p className="text-[0.95rem]" style={{ color: t.tb }}>
          {body}
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-5 py-3 text-[0.7rem] font-black uppercase tracking-[0.18em] transition-opacity hover:opacity-90"
              style={{ background: ORANGE, color: "#111" }}
            >
              Riprova
            </button>
          )}
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-2 px-5 py-3 text-[0.7rem] font-bold uppercase tracking-[0.18em] transition-opacity hover:opacity-70"
            style={{
              border: `1px solid ${t.border}`,
              color: t.tb,
            }}
          >
            Vai ai miei ordini
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────
   Main
─────────────────────────────────────────────────────────────── */
const POLL_INTERVAL_MS = 1500;
const POLL_TIMEOUT_MS = 25000;

export function ConfermaContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [order, setOrder] = useState<OrderRow | null>(null);
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [phase, setPhase] = useState<
    "loading" | "polling" | "missing" | "notfound" | "ready"
  >(sessionId ? "loading" : "missing");
  const [copied, setCopied] = useState(false);

  // Theme tokens — guess from URL fallback while loading, then update once order is in
  const packSlugForTheme = order?.pack_id ?? "default";
  const t = useTierTokens(packSlugForTheme, isBundleSlug(packSlugForTheme));

  const startedAtRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    async function tick() {
      const supabase = createClient();
      const { data: orderRow } = await supabase
        .from("orders")
        .select(
          "id, status, amount_cents, tax_cents, pack_id, selected_workshop_ids, stripe_checkout_session_id, stripe_payment_intent_id, billing_name, billing_email, created_at, updated_at",
        )
        .eq("stripe_checkout_session_id", sessionId)
        .maybeSingle();

      if (cancelled) return;

      if (!orderRow) {
        if (Date.now() - startedAtRef.current > POLL_TIMEOUT_MS) {
          setPhase("notfound");
          return;
        }
        setPhase("polling");
        timer = setTimeout(tick, POLL_INTERVAL_MS);
        return;
      }

      const typed = orderRow as unknown as OrderRow;
      setOrder(typed);

      if (typed.status === "paid") {
        const { data: ticketRows } = await supabase
          .from("tickets")
          .select("id, course_id, is_used, qr_image_url")
          .eq("order_id", typed.id)
          .order("created_at", { ascending: true });
        if (!cancelled) {
          setTickets((ticketRows as unknown as TicketRow[]) ?? []);
          setPhase("ready");
        }
        return;
      }

      // Order exists but webhook hasn't flipped to paid yet → keep polling
      if (Date.now() - startedAtRef.current > POLL_TIMEOUT_MS) {
        // Show whatever we have anyway — webhook may be delayed
        setPhase("ready");
        return;
      }
      setPhase("polling");
      timer = setTimeout(tick, POLL_INTERVAL_MS);
    }

    tick();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [sessionId]);

  const pack = useMemo(() => {
    if (!order?.pack_id) return null;
    return getPackBySlug(order.pack_id) ?? null;
  }, [order?.pack_id]);

  async function handleCopyOrderId() {
    if (!order) return;
    try {
      await navigator.clipboard?.writeText(order.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }

  // ── Early states ─────────────────────────────────────────────
  if (phase === "missing") return <FullScreenState t={t} variant="missing" />;
  if (phase === "loading") return <FullScreenState t={t} variant="loading" />;
  if (phase === "polling" && !order)
    return <FullScreenState t={t} variant="polling" />;
  if (phase === "notfound")
    return (
      <FullScreenState
        t={t}
        variant="notfound"
        onRetry={() => {
          startedAtRef.current = Date.now();
          setPhase("loading");
        }}
      />
    );

  if (!order) return <FullScreenState t={t} variant="loading" />;

  const customerName = firstName(order.billing_name);
  const selectedWorkshopSlugs = order.selected_workshop_ids ?? [];
  const isPolling = phase === "polling";

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
            href="/account"
            className="inline-flex items-center gap-2 text-[0.66rem] font-bold uppercase tracking-[0.22em] transition-opacity hover:opacity-70"
            style={{ color: t.tb }}
          >
            <span aria-hidden>←</span>
            <span>Vai al tuo account</span>
          </Link>
          <div className="hidden items-center gap-2 text-[0.62rem] font-bold uppercase tracking-[0.22em] md:flex">
            <span style={{ color: t.ts }}>1. Riepilogo</span>
            <span style={{ color: t.ts }}>·</span>
            <span style={{ color: t.ts }}>2. Pagamento</span>
            <span style={{ color: t.ts }}>·</span>
            <span style={{ color: ORANGE }}>3.</span>
            <span style={{ color: t.th }}>Conferma</span>
          </div>
          <div
            className="text-[0.62rem] font-bold uppercase tracking-[0.22em]"
            style={{ color: ORANGE }}
          >
            ✓ Confermato
          </div>
        </div>
      </div>

      {/* ─── Main grid ─────────────────────────────────────────── */}
      <section
        className="relative pb-24 pt-12 md:pt-16"
        style={{ background: t.bg }}
      >
        <div className="mx-auto max-w-[1280px] px-[5%] md:px-10">
          {/* Page header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 md:mb-10"
          >
            <span
              className="mb-3 block text-[0.7rem] font-black uppercase tracking-[0.34em]"
              style={{ color: ORANGE }}
            >
              — Ordine confermato · #{shortId(order.id)}
            </span>
            <h1
              className="font-black leading-[0.98] tracking-[-0.025em]"
              style={{
                fontSize: "clamp(1.8rem, 4.4vw, 3.2rem)",
                color: t.th,
              }}
            >
              {customerName ? `Grazie ${customerName}.` : "Grazie."}{" "}
              <span style={{ color: t.tb, fontWeight: 800 }}>
                Il tuo posto è confermato.
              </span>
            </h1>
            <p
              className="mt-3 text-[0.95rem] leading-[1.65]"
              style={{ color: t.tb }}
            >
              {pack
                ? `Hai acquistato il ${
                    pack.type === "bundle"
                      ? `Pack ${TIER_LABEL[pack.slug] ?? pack.name}`
                      : pack.name
                  }. Sotto trovi i dettagli, i tuoi ticket e i prossimi passi.`
                : "Sotto trovi i dettagli del tuo ordine, i tuoi ticket e i prossimi passi."}
            </p>
          </motion.div>

          {/* Polling banner — shown if webhook is still finalizing */}
          {isPolling && (
            <div
              className="mb-6 flex items-center gap-3 px-5 py-3"
              style={{
                background: `rgba(${ORANGE_RGB},0.08)`,
                border: `1px solid rgba(${ORANGE_RGB},0.3)`,
              }}
            >
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                className="shrink-0 animate-spin"
                style={{ color: ORANGE }}
              >
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeOpacity="0.25"
                />
                <path
                  d="M21 12a9 9 0 0 0-9-9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <p
                className="text-[0.78rem] leading-snug"
                style={{ color: t.tb }}
              >
                Stiamo finalizzando il pagamento con Stripe — i ticket
                compariranno tra pochi secondi. Puoi rimanere su questa pagina.
              </p>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-[1fr_320px] md:gap-8 lg:grid-cols-[1fr_400px] lg:gap-10">
            {/* ═══ LEFT — Confirmation + tickets + next steps ═══ */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="space-y-5"
            >
              <ConfirmationHero
                order={order}
                t={t}
                onCopyOrderId={handleCopyOrderId}
                copied={copied}
              />

              <TicketsCard tickets={tickets} t={t} />

              <NextSteps
                t={t}
                email={order.billing_email}
                ticketCount={tickets.length}
              />

              {/* Support callout */}
              <div
                className="px-6 py-5 text-[0.78rem] leading-[1.65]"
                style={{
                  background: t.tipBg,
                  border: `1px dashed ${t.border}`,
                  color: t.tb,
                }}
              >
                <p className="font-bold" style={{ color: t.th }}>
                  Hai bisogno di aiuto?
                </p>
                <p className="mt-1">
                  Scrivici a{" "}
                  <a
                    href="mailto:academy@lacertosus.com"
                    style={{ color: ORANGE, textDecoration: "underline" }}
                  >
                    academy@lacertosus.com
                  </a>{" "}
                  citando il codice ordine{" "}
                  <span className="font-mono font-bold" style={{ color: t.th }}>
                    #{shortId(order.id)}
                  </span>
                  . Ti rispondiamo entro 24h lavorative.
                </p>
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
                selectedWorkshopSlugs={selectedWorkshopSlugs}
                amountCents={order.amount_cents}
                taxCents={order.tax_cents}
                t={t}
              />
            </motion.aside>
          </div>
        </div>
      </section>
    </>
  );
}
