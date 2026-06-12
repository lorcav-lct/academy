"use client";

import { motion } from "framer-motion";

const ORANGE = "#F09226";

/**
 * Official "registrations closed" notice for the pack section, shown once the
 * pack purchase deadline has passed. Rubber-stamp entrance + slow pulsing seal
 * to read as a final, official state — matching the brand (squared, bold, dark
 * with orange accent).
 */
export function RegistrationsClosed({ isDark }: { isDark: boolean }) {
  const th = isDark ? "#f5f5fa" : "#111111";
  const tb = isDark ? "rgba(255,255,255,0.62)" : "#555555";

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative mb-12 overflow-hidden"
      style={{
        border: `1px solid ${ORANGE}`,
        background: isDark
          ? "linear-gradient(135deg, rgba(26,26,26,0.92) 0%, rgba(10,10,10,0.96) 100%)"
          : "linear-gradient(135deg, #ffffff 0%, #fafafa 100%)",
        boxShadow: isDark
          ? "0 30px 90px rgba(0,0,0,0.55), inset 0 0 60px rgba(240,146,38,0.05)"
          : "0 24px 70px rgba(0,0,0,0.1), inset 0 0 60px rgba(240,146,38,0.04)",
      }}
    >
      {/* Top accent strip */}
      <div
        className="h-[3px] w-full"
        style={{
          background: `linear-gradient(90deg, ${ORANGE}, rgba(240,146,38,0.1))`,
        }}
      />

      {/* Diagonal hazard texture, very subtle */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `repeating-linear-gradient(-45deg, ${ORANGE} 0, ${ORANGE} 2px, transparent 2px, transparent 18px)`,
        }}
      />

      <div className="relative flex flex-col items-center gap-7 px-6 py-12 text-center md:flex-row md:items-center md:gap-10 md:px-12 md:py-14 md:text-left">
        {/* ── Official stamp seal ─────────────────────────────────── */}
        <motion.div
          initial={{ scale: 1.7, rotate: 14, opacity: 0 }}
          whileInView={{ scale: 1, rotate: -7, opacity: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{
            type: "spring",
            stiffness: 320,
            damping: 14,
            delay: 0.15,
          }}
          className="relative shrink-0"
        >
          {/* Pulsing ring */}
          <motion.span
            aria-hidden
            className="absolute inset-0"
            style={{ border: `2px solid ${ORANGE}` }}
            animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          />
          <div
            className="flex h-[112px] w-[112px] flex-col items-center justify-center md:h-[128px] md:w-[128px]"
            style={{
              border: `3px solid ${ORANGE}`,
              background: "rgba(240,146,38,0.08)",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              width="30"
              height="30"
              fill="none"
              stroke={ORANGE}
              strokeWidth={2.6}
              strokeLinecap="square"
            >
              <path d="M4 12.5 9.5 18 20 6.5" />
            </svg>
            <span
              className="mt-1.5 text-[0.58rem] font-black uppercase leading-tight tracking-[0.22em]"
              style={{ color: ORANGE }}
            >
              Al
              <br />
              completo
            </span>
          </div>
        </motion.div>

        {/* ── Copy ────────────────────────────────────────────────── */}
        <div className="min-w-0">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mb-3 inline-flex items-center gap-2 text-[0.66rem] font-black uppercase tracking-[0.32em]"
            style={{ color: ORANGE }}
          >
            <span className="relative flex h-2 w-2">
              <span
                className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-70"
                style={{ background: ORANGE }}
              />
              <span
                className="relative inline-flex h-2 w-2 rounded-full"
                style={{ background: ORANGE }}
              />
            </span>
            Edizione 2026/27
          </motion.span>

          <h3
            className="text-[clamp(1.7rem,3.8vw,2.8rem)] font-black uppercase leading-[0.98] tracking-[-0.02em]"
            style={{ color: th }}
          >
            Iscrizioni <span className="gradient-text">completate.</span>
          </h3>

          <p
            className="mx-auto mt-4 max-w-xl text-[0.95rem] leading-relaxed md:mx-0"
            style={{ color: tb }}
          >
            I posti per questa edizione sono esauriti e le iscrizioni sono
            ufficialmente chiuse. Scrivici per essere tra i primi a essere
            avvisato all&apos;apertura della prossima edizione.
          </p>

          <a
            href="mailto:academy@lacertosus.com?subject=Lista%20attesa%20prossima%20edizione"
            className="mt-6 inline-flex items-center gap-2.5 px-6 py-3.5 text-[0.74rem] font-black uppercase tracking-[0.16em] transition-opacity hover:opacity-90"
            style={{ background: ORANGE, color: "#111111" }}
          >
            <span>Entra in lista d&apos;attesa</span>
            <span aria-hidden>→</span>
          </a>
        </div>
      </div>
    </motion.div>
  );
}
