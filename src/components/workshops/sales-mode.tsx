"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useActivePromos } from "@/lib/promos/client";
import { isPromoLive, type PromoRow } from "@/lib/promos/types";
import { smoothScrollTo } from "@/lib/scroll";

const ORANGE = "#F09226";
const ORANGE_RGB = "240,146,38";

/* ──────────────────────────────────────────────────────────────
   Promo lookup — the masterclass promo driving sales mode.
   Category-wide promo wins; otherwise first live masterclass
   slug-specific promo (drives the countdown deadline).
─────────────────────────────────────────────────────────────── */
export function useMasterclassPromo(): PromoRow | null {
  const { promos } = useActivePromos();
  const category = promos.byType.masterclass;
  if (category && isPromoLive(category)) return category;
  const specific = Object.values(promos.bySlug).find(
    (p) => p.product_type === "masterclass" && isPromoLive(p),
  );
  return specific ?? null;
}

/* ──────────────────────────────────────────────────────────────
   Big countdown — tile-based, maximum visibility.
─────────────────────────────────────────────────────────────── */
function useRemaining(endsAt: string | null | undefined): number | null {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!endsAt) return;
    const target = new Date(endsAt).getTime();
    if (Number.isNaN(target)) return;
    const tick = () => setRemaining(Math.max(0, target - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  return remaining;
}

export function SalesCountdown({
  endsAt,
  size = "lg",
  className,
}: {
  endsAt: string | null | undefined;
  /** lg = hero, md = modal, sm = compact (card / floating bar) */
  size?: "lg" | "md" | "sm";
  className?: string;
}) {
  const remaining = useRemaining(endsAt);
  if (remaining === null || remaining <= 0) return null;

  const totalSec = Math.floor(remaining / 1000);
  const segments = [
    { v: Math.floor(totalSec / 86400), u: size === "sm" ? "GG" : "Giorni" },
    { v: Math.floor((totalSec % 86400) / 3600), u: "Ore" },
    { v: Math.floor((totalSec % 3600) / 60), u: "Min" },
    { v: totalSec % 60, u: "Sec" },
  ];
  const pad = (n: number) => String(n).padStart(2, "0");

  const numSize =
    size === "lg"
      ? "clamp(2rem, 5vw, 3.4rem)"
      : size === "md"
        ? "clamp(1.4rem, 3vw, 2rem)"
        : "1rem";
  const tilePad =
    size === "lg"
      ? "px-4 py-3 md:px-6 md:py-4"
      : size === "md"
        ? "px-3 py-2.5"
        : "px-2 py-1.5";
  const tileMinW =
    size === "sm" ? "min-w-[42px]" : "min-w-[64px] md:min-w-[84px]";
  const gap = size === "sm" ? "gap-1.5" : "gap-2 md:gap-3";

  return (
    <div className={`flex items-stretch ${gap} ${className ?? ""}`}>
      {segments.map((s) => (
        <div
          key={s.u}
          className={`flex flex-col items-center justify-center ${tileMinW} ${tilePad}`}
          style={{
            background: `rgba(${ORANGE_RGB},0.1)`,
            border: `1px solid rgba(${ORANGE_RGB},0.45)`,
          }}
        >
          <span
            className="font-black leading-none tabular-nums"
            style={{ fontSize: numSize, color: ORANGE }}
          >
            {pad(s.v)}
          </span>
          <span
            className={`font-black uppercase ${size === "sm" ? "mt-0.5 text-[0.46rem] tracking-[0.16em]" : "mt-1.5 text-[0.56rem] tracking-[0.24em]"}`}
            style={{ color: `rgba(${ORANGE_RGB},0.75)` }}
          >
            {s.u}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Floating bar — slim, bottom center, purchase-focused urgency.
─────────────────────────────────────────────────────────────── */
export function SalesFloatingBar({ promo }: { promo: PromoRow | null }) {
  const [dismissed, setDismissed] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const remaining = useRemaining(promo?.ends_at);

  // Appare solo dopo aver superato l'hero (~92vh)
  useEffect(() => {
    const onScroll = () =>
      setPastHero(window.scrollY > window.innerHeight * 0.9);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (dismissed || !promo?.ends_at || remaining === null || remaining <= 0) {
    return null;
  }

  return (
    <AnimatePresence>
      {pastHero && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-4 left-1/2 z-[300] w-[calc(100%-2rem)] max-w-[660px] -translate-x-1/2"
          role="complementary"
          aria-label="Offerta in scadenza"
        >
          <div
            className="relative px-5 py-4 md:px-8 md:py-5"
            style={{
              background: "rgba(10,10,14,0.92)",
              border: `1px solid rgba(${ORANGE_RGB},0.55)`,
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              boxShadow: `0 12px 40px rgba(0,0,0,0.55), 0 0 30px rgba(${ORANGE_RGB},0.12)`,
            }}
          >
            <button
              onClick={() => setDismissed(true)}
              aria-label="Chiudi barra offerta"
              className="absolute right-3 top-2.5 text-lg leading-none transition-opacity hover:opacity-60"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              ×
            </button>

            {/* Countdown — riga propria, sopra al testo */}
            <div className="flex justify-center">
              <SalesCountdown endsAt={promo.ends_at} size="sm" />
            </div>

            {/* Titolo — riga propria, full width */}
            <p
              className="mt-3 pr-6 text-center text-[0.88rem] font-black uppercase tracking-[0.12em] leading-tight md:text-[0.95rem]"
              style={{ color: "#f5f5fa" }}
            >
              Il prezzo scontato sta per scadere —{" "}
              <span style={{ color: ORANGE }}>blocca ora il tuo posto</span>
            </p>

            {/* CTA — riga propria, centrata */}
            <div className="mt-4 flex justify-center">
              <button
                onClick={() =>
                  smoothScrollTo("#tutti-i-master", { offset: -70 })
                }
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 text-[0.76rem] font-black uppercase tracking-[0.14em] transition-all duration-200 hover:opacity-90"
                style={{ background: ORANGE, color: "#111" }}
              >
                <span>Acquista ora</span>
                <span aria-hidden>→</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ──────────────────────────────────────────────────────────────
   Exit-intent modal — urgency popup, once per session.
─────────────────────────────────────────────────────────────── */
const EXIT_MODAL_STORAGE_KEY = "mc_sales_exit_shown";

export function SalesExitModal({
  promo,
  fromPriceCents,
}: {
  promo: PromoRow | null;
  /** Lowest discounted masterclass price (cents), for the "da €" hook */
  fromPriceCents: number | null;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let armed = false;
    // Grace period: don't fire on accidental mouse-outs right after load
    const armTimer = setTimeout(() => {
      armed = true;
    }, 4000);

    let shown = false;
    const onMouseOut = (e: MouseEvent) => {
      if (!armed || shown || e.relatedTarget) return;
      if (e.clientY > 0) return; // only when leaving through the top edge
      try {
        if (sessionStorage.getItem(EXIT_MODAL_STORAGE_KEY)) return;
        sessionStorage.setItem(EXIT_MODAL_STORAGE_KEY, "1");
      } catch {
        // sessionStorage unavailable → the in-memory flag still limits to once
      }
      shown = true;
      setOpen(true);
    };

    document.addEventListener("mouseout", onMouseOut);
    return () => {
      clearTimeout(armTimer);
      document.removeEventListener("mouseout", onMouseOut);
    };
  }, []);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close]);

  const goToList = () => {
    close();
    window.setTimeout(
      () => smoothScrollTo("#tutti-i-master", { offset: -70 }),
      150,
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[500] flex items-center justify-center p-5"
          style={{
            background: "rgba(0,0,0,0.82)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label="Offerta in scadenza"
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-[560px] overflow-hidden p-8 text-center md:p-10"
            style={{
              background:
                "linear-gradient(160deg, rgba(240,146,38,0.10) 0%, #0b0b10 55%)",
              border: `1px solid rgba(${ORANGE_RGB},0.5)`,
              boxShadow: `0 30px 90px rgba(0,0,0,0.7), 0 0 60px rgba(${ORANGE_RGB},0.12)`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top accent */}
            <div
              className="absolute inset-x-0 top-0 h-[3px]"
              style={{
                background: `linear-gradient(90deg, ${ORANGE}, rgba(${ORANGE_RGB},0.15))`,
              }}
            />

            <button
              onClick={close}
              aria-label="Chiudi"
              className="absolute right-4 top-4 text-xl leading-none transition-opacity hover:opacity-60"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              ×
            </button>

            <span
              className="inline-block px-3 py-1 text-[0.6rem] font-black uppercase tracking-[0.3em]"
              style={{ background: ORANGE, color: "#111" }}
            >
              {promo?.name ?? "Offerta a tempo"}
            </span>

            <h3
              className="mt-5 font-black leading-[1.02] tracking-[-0.02em]"
              style={{
                fontSize: "clamp(1.6rem, 4.5vw, 2.4rem)",
                color: "#f5f5fa",
              }}
            >
              Aspetta — il prezzo scontato
              <br />
              <span className="gradient-text">sta per scadere.</span>
            </h3>

            <p
              className="mx-auto mt-4 max-w-[42ch] text-[0.92rem] leading-[1.65]"
              style={{ color: "rgba(180,180,200,0.75)" }}
            >
              {fromPriceCents
                ? `Le Masterclass partono da € ${new Intl.NumberFormat("it-IT").format(Math.round(fromPriceCents / 100))} solo finché la promo è attiva. Poi si torna al prezzo pieno.`
                : "Blocca ora il tuo posto: i posti in presenza sono limitati e le promo hanno una scadenza."}
            </p>

            {promo?.ends_at && (
              <div className="mt-6 flex justify-center">
                <SalesCountdown endsAt={promo.ends_at} size="md" />
              </div>
            )}

            <button
              onClick={goToList}
              className="mt-7 inline-flex w-full items-center justify-center gap-3 px-7 py-4 text-[0.8rem] font-black uppercase tracking-[0.16em] transition-all duration-200 hover:opacity-90 sm:w-auto"
              style={{ background: ORANGE, color: "#111" }}
            >
              <span>Acquista una Masterclass</span>
              <span aria-hidden>→</span>
            </button>

            <button
              onClick={close}
              className="mt-4 block w-full text-[0.68rem] font-bold uppercase tracking-[0.2em] transition-opacity hover:opacity-70"
              style={{ color: "rgba(140,140,160,0.6)" }}
            >
              No grazie, pago il prezzo pieno
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
