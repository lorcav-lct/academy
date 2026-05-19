"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const WHATSAPP_NUMBER = "393487758065";
const PHONE_NUMBER = "+393487758065";
const PHONE_HREF = `tel:${PHONE_NUMBER}`;
const WHATSAPP_GREEN = "#25D366";
const WHATSAPP_GREEN_DARK = "#128C7E";
const WHATSAPP_TEAL = "#075E54";
const DEFAULT_MSG = "ACADEMY - ";

function WhatsAppGlyph({ size = 22 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
      className="shrink-0"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

/**
 * Floating WhatsApp CTA — premium chat composer.
 *
 * Collapsed: pill attached to the right edge with WhatsApp icon (+ "Scrivici"
 * label on desktop). Click expands to a chat-style composer where the user
 * writes the message; submit opens wa.me with the text prefilled.
 *
 * Hidden on /admin/* routes.
 */
export function WhatsAppFloat() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState(DEFAULT_MSG);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => taRef.current?.focus(), 220);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (pathname.startsWith("/admin")) return null;

  const finalMsg = msg.trim().length > 0 ? msg.trim() : DEFAULT_MSG;
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(finalMsg)}`;

  function send() {
    window.open(href, "_blank", "noopener,noreferrer");
    setOpen(false);
    setTimeout(() => setMsg(DEFAULT_MSG), 300);
  }

  return (
    <>
      {/* ── Mobile backdrop ─────────────────────────────────────── */}
      <div
        aria-hidden
        onClick={() => setOpen(false)}
        className="fixed inset-0 z-[39] md:hidden transition-opacity duration-300"
        style={{
          background: "rgba(10,10,15,0.45)",
          backdropFilter: "blur(3px)",
          WebkitBackdropFilter: "blur(3px)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
        }}
      />

      {/* ── Collapsed FAB cluster (phone + WhatsApp) ─────────────── */}
      <div
        aria-hidden={open}
        className="fixed right-0 z-40 md:z-[80] flex items-center gap-2.5 pl-3 md:pl-4
                   bottom-5 md:bottom-50"
        style={{
          opacity: open ? 0 : 1,
          transform: open
            ? "translateX(20px) scale(0.96)"
            : "translateX(0) scale(1)",
          pointerEvents: open ? "none" : "auto",
          transition:
            "opacity 220ms ease, transform 280ms cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* Phone — circular, dark premium */}
        <a
          href={PHONE_HREF}
          aria-label={`Chiamaci al ${PHONE_NUMBER}`}
          title={`Chiamaci al ${PHONE_NUMBER}`}
          tabIndex={open ? -1 : 0}
          className="group inline-flex items-center justify-center active:scale-95 h-12 w-12 md:h-14 md:w-14"
          style={{
            background: "#1a1a1a",
            color: "#F09226",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 9999,
            boxShadow:
              "0 12px 32px rgba(0,0,0,0.35), 0 4px 12px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.06)",
            transition: "background 200ms ease, color 200ms ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "#F09226";
            (e.currentTarget as HTMLElement).style.color = "#1a1a1a";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "#1a1a1a";
            (e.currentTarget as HTMLElement).style.color = "#F09226";
          }}
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57a1 1 0 0 0-1.02.24l-2.2 2.2a15.07 15.07 0 0 1-6.59-6.59l2.2-2.2a1 1 0 0 0 .24-1.02A11.36 11.36 0 0 1 8.5 4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1c0 9.39 7.61 17 17 17a1 1 0 0 0 1-1v-3.5a1 1 0 0 0-1-1z" />
          </svg>
        </a>

        {/* WhatsApp pill — attached to the right edge */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Scrivici su WhatsApp"
          title="Scrivici su WhatsApp"
          tabIndex={open ? -1 : 0}
          className="inline-flex items-center gap-2.5 active:scale-95 h-12 md:h-14 pl-4 pr-3.5 md:pl-5 md:pr-6"
          style={{
            background: WHATSAPP_GREEN,
            color: "#ffffff",
            borderTopLeftRadius: 9999,
            borderBottomLeftRadius: 9999,
            boxShadow:
              "0 14px 36px rgba(37,211,102,0.28), 0 4px 12px rgba(0,0,0,0.18)",
            transition: "background 200ms ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background =
              WHATSAPP_GREEN_DARK;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = WHATSAPP_GREEN;
          }}
        >
          <WhatsAppGlyph size={22} />
          <span className="hidden md:inline text-[12.5px] font-black tracking-[0.24em] uppercase leading-none">
            Contattaci
          </span>
        </button>
      </div>

      {/* ── Expanded chat composer ──────────────────────────────── */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="false"
        aria-label="Composer WhatsApp"
        aria-hidden={!open}
        className="fixed z-40 md:z-[80] flex flex-col overflow-hidden
                   right-3 md:right-6
                   bottom-5 md:bottom-50
                   w-[min(360px,calc(100vw-1.5rem))] md:w-[380px]
                   h-[min(70vh,520px)] md:h-[480px]"
        style={{
          background: "#ffffff",
          borderRadius: 18,
          boxShadow:
            "0 30px 80px rgba(0,0,0,0.32), 0 10px 28px rgba(0,0,0,0.16), 0 0 0 1px rgba(0,0,0,0.04)",
          opacity: open ? 1 : 0,
          transform: open
            ? "translateY(0) scale(1)"
            : "translateY(16px) scale(0.96)",
          transformOrigin: "bottom right",
          pointerEvents: open ? "auto" : "none",
          transition:
            "opacity 240ms ease, transform 320ms cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* ── Header ──────────────────────────────────────────── */}
        <div
          className="relative flex items-center gap-3 px-4 py-3.5 shrink-0"
          style={{
            background: `linear-gradient(180deg, ${WHATSAPP_TEAL} 0%, ${WHATSAPP_GREEN_DARK} 100%)`,
            color: "#ffffff",
          }}
        >
          {/* Subtle ornament */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 0%, #ffffff 0%, transparent 35%)",
            }}
          />
          <div
            className="relative flex h-10 w-10 items-center justify-center shrink-0"
            style={{
              background: "rgba(255,255,255,0.14)",
              border: "1.5px solid rgba(255,255,255,0.22)",
              borderRadius: 9999,
            }}
          >
            <WhatsAppGlyph size={20} />
          </div>
          <div className="relative min-w-0 flex-1">
            <div className="text-[13.5px] font-black tracking-[0.02em] leading-tight truncate">
              Lacertosus Academy
            </div>
            <div className="mt-0.5 flex items-center gap-1.5 text-[10.5px] font-medium tracking-[0.06em] opacity-95">
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{
                  background: "#4ade80",
                  boxShadow: "0 0 6px rgba(74,222,128,0.85)",
                }}
              />
              Online · risposta in poche ore
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Chiudi"
            className="relative shrink-0 inline-flex items-center justify-center h-8 w-8 transition-colors"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.14)",
              borderRadius: 9999,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                "rgba(255,255,255,0.18)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                "rgba(255,255,255,0.08)";
            }}
          >
            <svg
              viewBox="0 0 14 14"
              width="11"
              height="11"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="square"
            >
              <path d="M2 2l10 10M12 2L2 12" />
            </svg>
          </button>
        </div>

        {/* ── Body — chat bubble ────────────────────────────── */}
        <div
          className="flex-1 overflow-y-auto px-4 py-5"
          style={{
            background: "#ECE5DD",
            backgroundImage:
              "radial-gradient(rgba(0,0,0,0.05) 1px, transparent 1px)",
            backgroundSize: "14px 14px",
          }}
        >
          <div
            className="inline-block max-w-[88%] px-3.5 py-2.5"
            style={{
              background: "#ffffff",
              borderRadius: 14,
              borderTopLeftRadius: 4,
              boxShadow: "0 1px 1px rgba(0,0,0,0.08)",
            }}
          >
            <p
              className="text-[13px] leading-[1.55] m-0"
              style={{ color: "#111" }}
            >
              Ciao 👋 Siamo a tua disposizione: percorso, pack, masterclass o
              pagamenti — scrivici la tua domanda e ti risponderemo a breve.
            </p>
            <div
              className="mt-1.5 flex items-center justify-end gap-1 text-[10px]"
              style={{ color: "rgba(17,17,17,0.45)" }}
            >
              <span>Lacertosus Academy</span>
            </div>
          </div>
        </div>

        {/* ── Composer ───────────────────────────────────────── */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="flex items-end gap-2 px-3 py-2.5 shrink-0"
          style={{
            background: "#F0F2F5",
            borderTop: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <textarea
            ref={taRef}
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Scrivi un messaggio…"
            rows={1}
            className="flex-1 resize-none px-3.5 py-2.5 text-[13.5px] leading-[1.5] outline-none"
            style={{
              background: "#ffffff",
              borderRadius: 20,
              border: "1px solid rgba(0,0,0,0.06)",
              maxHeight: 120,
              color: "#111",
              fontFamily: "inherit",
            }}
          />
          <button
            type="submit"
            aria-label="Invia su WhatsApp"
            title="Invia su WhatsApp"
            className="shrink-0 inline-flex items-center justify-center h-10 w-10 active:scale-95 transition-all"
            style={{
              background: WHATSAPP_GREEN,
              borderRadius: 9999,
              color: "#ffffff",
              boxShadow: "0 6px 16px rgba(37,211,102,0.38)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                WHATSAPP_GREEN_DARK;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                WHATSAPP_GREEN;
            }}
          >
            <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </form>

        {/* ── Footer hint ───────────────────────────────────── */}
        <div
          className="px-4 py-2 text-[10px] tracking-[0.04em] shrink-0"
          style={{
            background: "#F0F2F5",
            color: "rgba(17,17,17,0.5)",
            borderTop: "1px solid rgba(0,0,0,0.04)",
          }}
        >
          Premi <kbd className="font-bold">Invio</kbd> per aprire WhatsApp con
          il tuo messaggio.
        </div>
      </div>
    </>
  );
}
