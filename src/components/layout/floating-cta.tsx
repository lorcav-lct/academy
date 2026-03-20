"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { createClient } from "@/lib/supabase/client";

// ─── Config ───────────────────────────────────────────────────────────────────

const DEFAULTS = {
  phone:    "+390521607870",
  label:    "Chiamaci ora",
  sublabel: "Siamo qui per aiutarti",
};

const DISMISS_KEY = "lct_cta_dismissed";

/** Returns true if current local time is in 10:00–12:00 or 15:00–17:00 */
function isAvailableNow(): boolean {
  const h = new Date().getHours();
  return (h >= 10 && h < 12) || (h >= 15 && h < 17);
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FloatingCTA() {
  const [config, setConfig]       = useState(DEFAULTS);
  const [visible, setVisible]     = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [available]               = useState(isAvailableNow);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Not in availability window — render nothing
  if (!available) return null;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    (async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("site_settings")
          .select("key, value")
          .in("key", ["cta_phone", "cta_label", "cta_sublabel"]);
        if (data?.length) {
          const map = Object.fromEntries(data.map((r) => [r.key, r.value]));
          setConfig({
            phone:    map["cta_phone"]    ?? DEFAULTS.phone,
            label:    map["cta_label"]    ?? DEFAULTS.label,
            sublabel: map["cta_sublabel"] ?? DEFAULTS.sublabel,
          });
        }
      } catch { /* table not yet migrated */ }
    })();
  }, []);

  // Trigger visibility: mobile → IntersectionObserver on #perche; desktop → timer
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(DISMISS_KEY)) return;

    const isMobile = window.innerWidth < 1024;

    if (isMobile) {
      const el = document.getElementById("perche");
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
        { threshold: 0.25 }
      );
      obs.observe(el);
      return () => obs.disconnect();
    } else {
      const id = setTimeout(() => setVisible(true), 1800);
      return () => clearTimeout(id);
    }
  }, []);

  // Entrance animation
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (!visible || !wrapRef.current) return;
    gsap.fromTo(
      wrapRef.current,
      { y: 36, opacity: 0, scale: 0.9 },
      { y: 0, opacity: 1, scale: 1, duration: 0.65, ease: "back.out(1.6)" }
    );
  }, [visible]);

  // Push ScrollProgress upward so it doesn't overlap the CTA card
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const root = document.documentElement;
    if (!visible) {
      root.style.removeProperty("--sp-bottom");
    } else if (minimized) {
      root.style.setProperty("--sp-bottom", "80px");
    } else {
      root.style.setProperty("--sp-bottom", "178px");
    }
    return () => { root.style.removeProperty("--sp-bottom"); };
  }, [visible, minimized]);

  function dismiss(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    sessionStorage.setItem(DISMISS_KEY, "1");
    gsap.to(wrapRef.current, {
      y: 20, opacity: 0, scale: 0.9, duration: 0.28, ease: "power2.in",
      onComplete: () => setVisible(false),
    });
  }

  function toggleMinimize(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setMinimized((v) => !v);
  }

  if (!visible) return null;

  const tel = `tel:${config.phone.replace(/\s/g, "")}`;

  return (
    <div
      ref={wrapRef}
      className="fixed bottom-6 right-5 z-[40] flex flex-col items-end gap-2"
      style={{ opacity: 0 }}
    >
      {minimized ? (
        /* ── Collapsed pill ── */
        <button
          onClick={toggleMinimize}
          className="flex items-center gap-2.5 px-4 py-2.5 shadow-xl transition-all duration-300 hover:scale-105"
          style={{
            borderRadius: "2px",
            background: "#ffffff",
            border: "1px solid rgba(0,0,0,0.1)",
            boxShadow: "0 8px 28px rgba(0,0,0,0.18)",
          }}
          aria-label="Apri CTA telefono"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <PhoneIcon />
          <span className="text-[0.72rem] font-bold tracking-[0.1em] text-gray-800">
            {config.label}
          </span>
        </button>
      ) : (
        /* ── Full card ── */
        <div className="relative">
          {/* Control buttons */}
          <div className="absolute -top-3.5 right-0 z-10 flex items-center gap-1.5">
            <button
              onClick={toggleMinimize}
              className="flex h-7 w-7 items-center justify-center rounded-sm text-xs font-bold text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-800 active:scale-95"
              style={{
                background: "#ffffff",
                border: "1px solid rgba(0,0,0,0.14)",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              }}
              aria-label="Minimizza"
            >
              −
            </button>
            <button
              onClick={dismiss}
              className="flex h-7 w-7 items-center justify-center rounded-sm text-sm font-bold text-gray-500 transition-all hover:bg-red-50 hover:text-red-500 active:scale-95"
              style={{
                background: "#ffffff",
                border: "1px solid rgba(0,0,0,0.14)",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              }}
              aria-label="Chiudi"
            >
              ×
            </button>
          </div>

          <a
            href={tel}
            className="group flex w-[220px] flex-col overflow-hidden rounded-sm transition-all duration-300 hover:scale-[1.025]"
            style={{
              background: "#ffffff",
              border: "1px solid rgba(0,0,0,0.09)",
              boxShadow: "0 12px 40px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.08)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 18px 52px rgba(0,0,0,0.2), 0 4px 16px rgba(240,146,38,0.1)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 12px 40px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.08)";
            }}
          >
            {/* Orange top accent */}
            <div className="h-0.5 w-full" style={{ background: "linear-gradient(90deg, #F09226, #D4AF3780)" }} />

            <div className="flex items-center gap-4 p-4 pb-3">
              {/* Avatar */}
              <div
                className="relative flex h-11 w-11 shrink-0 items-end justify-center overflow-hidden rounded-full"
                style={{
                  background: "radial-gradient(circle at 50% 35%, rgba(240,146,38,0.2) 0%, rgba(240,146,38,0.07) 70%)",
                  border: "1.5px solid rgba(240,146,38,0.3)",
                }}
              >
                <PersonSVG />
              </div>

              {/* Text */}
              <div className="min-w-0">
                {/* Availability indicator */}
                <div className="mb-1 flex items-center gap-1.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </span>
                  <span className="text-[0.6rem] font-bold tracking-[0.15em] uppercase text-emerald-600">
                    Disponibile
                  </span>
                </div>
                <p className="text-[0.82rem] font-black leading-tight tracking-tight text-gray-900">
                  {config.label}
                </p>
                <p className="mt-0.5 text-[0.63rem] font-medium text-gray-400">
                  {config.sublabel}
                </p>
              </div>
            </div>

            {/* CTA strip */}
            <div
              className="flex items-center justify-between px-4 py-2.5 transition-colors duration-200 group-hover:bg-[#F09226]"
              style={{ background: "rgba(240,146,38,0.1)", borderTop: "1px solid rgba(240,146,38,0.12)" }}
            >
              <span className="text-[0.72rem] font-black tracking-[0.12em] text-[#D4830A] transition-colors duration-200 group-hover:text-white">
                {config.phone}
              </span>
              <svg viewBox="0 0 16 16" width="13" height="13" fill="none"
                className="shrink-0 text-[#D4830A] transition-colors duration-200 group-hover:text-white">
                <path d="M3 13L13 3M13 3H5M13 3v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </a>
        </div>
      )}
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function PersonSVG() {
  return (
    <svg viewBox="0 0 40 44" width="34" height="38" fill="none" style={{ marginBottom: "-2px" }}>
      <circle cx="20" cy="13" r="7" fill="rgba(240,146,38,0.6)" />
      <path d="M4 40c0-8.837 7.163-16 16-16s16 7.163 16 16" fill="rgba(240,146,38,0.45)" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 20 20" width="14" height="14" fill="none">
      <path
        d="M2 6.5A1.5 1.5 0 013.5 5h3a1.5 1.5 0 011.4.97l.87 2.17a1.5 1.5 0 01-.34 1.64l-.93.93a10.02 10.02 0 004.96 4.96l.93-.93a1.5 1.5 0 011.64-.34l2.17.87A1.5 1.5 0 0119 16.5v3A1.5 1.5 0 0117.5 21C9.49 21 3 14.51 3 6.5z"
        fill="#F09226"
      />
    </svg>
  );
}
