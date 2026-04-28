"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// ── Split-char helper (solid-color only — gradient doesn't clip per-char) ─────

function SplitLine({ text, className }: { text: string; className?: string }) {
  return (
    <span
      className={`inline-flex flex-wrap overflow-hidden ${className ?? ""}`}
    >
      {text.split("").map((ch, i) => (
        <span key={i} data-cta-char className="inline-block">
          {ch === " " ? "\u00A0" : ch}
        </span>
      ))}
    </span>
  );
}

// ── Animated counter ──────────────────────────────────────────────────────────

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const spanRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = spanRef.current;
    if (!el) return;
    const obj = { val: 0 };
    ScrollTrigger.create({
      trigger: el,
      start: "top 88%",
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          val: to,
          duration: 1.8,
          ease: "power2.out",
          onUpdate: () => {
            el.textContent = Math.round(obj.val) + suffix;
          },
        });
      },
    });
  }, [to, suffix]);
  return <span ref={spanRef}>0{suffix}</span>;
}

// ── Bento tilt helpers ────────────────────────────────────────────────────────

function onTilt(e: React.MouseEvent<HTMLDivElement>) {
  const r = e.currentTarget.getBoundingClientRect();
  const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
  const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
  gsap.to(e.currentTarget, {
    rotateX: -dy * 3,
    rotateY: dx * 3,
    duration: 0.4,
    ease: "power2.out",
    transformPerspective: 900,
  });
}
function offTilt(e: React.MouseEvent<HTMLDivElement>) {
  gsap.to(e.currentTarget, {
    rotateX: 0,
    rotateY: 0,
    duration: 0.8,
    ease: "elastic.out(1,0.4)",
  });
}

// ── Stat cell ─────────────────────────────────────────────────────────────────

function StatCell({
  to,
  suffix = "",
  label,
}: {
  to: number;
  suffix?: string;
  label: string;
}) {
  return (
    <div
      data-bento-stat
      className="flex flex-col items-center justify-center gap-2 p-6"
      style={{
        background: "rgba(240,146,38,0.05)",
        border: "1px solid rgba(240,146,38,0.14)",
      }}
      onMouseMove={onTilt}
      onMouseLeave={offTilt}
    >
      <span
        className="text-[clamp(2rem,3.5vw,2.8rem)] font-black leading-none"
        style={{ color: "#F09226" }}
      >
        <Counter to={to} suffix={suffix} />
      </span>
      <span
        className="text-[0.65rem] font-bold tracking-[0.25em] uppercase text-center"
        style={{ color: "#8888a8" }}
      >
        {label}
      </span>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export function CTASection() {
  const sectionRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLDivElement>(null);
  const line2Ref = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const ctaRowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const chars1 = line1Ref.current?.querySelectorAll("[data-cta-char]");
      const stats = statsRef.current?.querySelectorAll("[data-bento-stat]");

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 62%",
          once: true,
        },
      });

      // Glow in
      tl.from(glowRef.current, {
        opacity: 0,
        scale: 0.5,
        duration: 1.4,
        ease: "power2.out",
      });

      // Hero cell
      tl.from(
        heroRef.current,
        { opacity: 0, y: 28, duration: 0.6, ease: "power3.out" },
        "<0.2",
      );

      // Per-char on "DA ATLETA"
      if (chars1?.length) {
        tl.from(
          chars1,
          {
            y: "115%",
            opacity: 0,
            duration: 0.65,
            stagger: 0.022,
            ease: "power3.out",
          },
          "<0.15",
        );
      }

      // "A PROFESSIONISTA." as a block
      tl.from(
        line2Ref.current,
        { y: 30, opacity: 0, duration: 0.55, ease: "power3.out" },
        "-=0.2",
      );
      tl.from(
        subRef.current,
        { opacity: 0, y: 16, duration: 0.45, ease: "power2.out" },
        "-=0.2",
      );

      // Stats stagger
      if (stats?.length) {
        tl.from(
          stats,
          {
            opacity: 0,
            y: 22,
            duration: 0.55,
            stagger: 0.1,
            ease: "power3.out",
          },
          "-=0.35",
        );
      }

      // CTA row
      tl.from(
        ctaRowRef.current,
        { opacity: 0, y: 18, duration: 0.45, ease: "power2.out" },
        "-=0.2",
      );

      // Ambient glow pulse
      gsap.to(glowRef.current, {
        scale: 1.15,
        opacity: 0.7,
        duration: 3.5,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>

      <section
        ref={sectionRef}
        id="cta"
        className="relative overflow-hidden py-20 md:py-28"
      >
        {/* BG */}
        <div className="absolute inset-0" style={{ background: "#1a1a1a" }} />

        {/* Subtle grid */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(240,146,38,1) 1px, transparent 1px)," +
              "linear-gradient(90deg, rgba(240,146,38,1) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            opacity: 0.022,
          }}
        />

        {/* Central glow */}
        <div
          ref={glowRef}
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: "960px",
            height: "960px",
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse at center, rgba(240,146,38,0.12) 0%, rgba(240,146,38,0.03) 45%, transparent 70%)",
          }}
        />

        <div className="relative z-10 mx-auto max-w-[1440px] px-[5%] md:px-10">
          {/* ── Bento grid ─────────────────────────────────────────────────── */}
          <div className="grid gap-3 min-[981px]:grid-cols-12">
            {/* A: Hero cell — col 1-7, row 1-2 */}
            <div
              ref={heroRef}
              className="flex flex-col justify-between gap-8 p-8 md:p-10
                min-[981px]:col-start-1 min-[981px]:col-span-7
                min-[981px]:row-start-1 min-[981px]:row-span-2"
              style={{
                background: "rgba(255,255,255,0.028)",
                border: "1px solid rgba(240,146,38,0.14)",
              }}
            >
              <div>
                <span className="label-tag mb-5 block">Edizione 2026/27</span>

                {/* "DA ATLETA" — white, per-char animated */}
                <div ref={line1Ref} className="leading-none overflow-hidden">
                  <SplitLine
                    text="DA ATLETA"
                    className="block text-[clamp(2.6rem,5.5vw,5.5rem)] font-black tracking-[-0.025em] text-white"
                  />
                </div>

                {/* "A PROFESSIONISTA." — gradient, block animated */}
                <div
                  ref={line2Ref}
                  className="mb-6 leading-none overflow-hidden"
                >
                  <span className="block text-[clamp(2.6rem,5.5vw,5.5rem)] font-black tracking-[-0.025em] gradient-text">
                    A PROFESSIONISTA.
                  </span>
                </div>

                <p
                  ref={subRef}
                  className="max-w-md text-[0.95rem] leading-relaxed"
                  style={{ color: "#a8a8c0" }}
                >
                  L&apos;unico percorso in Italia che unisce{" "}
                  <span style={{ color: "#d4d4e8", fontWeight: 700 }}>
                    scienza del movimento
                  </span>
                  ,{" "}
                  <span style={{ color: "#d4d4e8", fontWeight: 700 }}>
                    certificazione FIPE
                  </span>{" "}
                  e mentalità imprenditoriale — in 9 mesi intensivi, 100% in
                  presenza.
                </p>
              </div>

              {/* Trust pills inside hero cell */}
              <div className="flex flex-wrap gap-2">
                {[
                  "Certificazione FIPE",
                  "9 mesi formativi",
                  "100% in presenza",
                  "30 posti",
                ].map((t) => (
                  <span
                    key={t}
                    className="px-3 py-1 text-[0.65rem] font-bold tracking-[0.2em] uppercase"
                    style={{
                      border: "1px solid rgba(240,146,38,0.18)",
                      color: "#7878a0",
                      background: "rgba(240,146,38,0.04)",
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* B: Stats 2×2 — col 8-12, row 1-2 */}
            <div
              ref={statsRef}
              className="grid grid-cols-2 gap-3
                min-[981px]:col-start-8 min-[981px]:col-span-5
                min-[981px]:row-start-1 min-[981px]:row-span-2"
              style={{ alignContent: "stretch" }}
            >
              <StatCell to={33} suffix="+" label="Docenti" />
              <StatCell to={9} label="Mesi" />
              <StatCell to={100} suffix="%" label="In presenza" />
              <StatCell to={30} label="Posti disponibili" />
            </div>

            {/* C + D: CTA row — col 1-12, row 3 */}
            <div
              ref={ctaRowRef}
              className="grid gap-3 grid-cols-1 min-[540px]:grid-cols-2
                min-[981px]:col-start-1 min-[981px]:col-span-12 min-[981px]:row-start-3"
            >
              {/* Primary CTA */}
              <a
                href="/pack"
                className="group relative flex items-center justify-between overflow-hidden p-8 md:p-10"
                style={{
                  background:
                    "linear-gradient(135deg, #F09226 0%, #e07d10 100%)",
                  boxShadow:
                    "0 0 60px rgba(240,146,38,0.2), 0 12px 40px rgba(0,0,0,0.35)",
                }}
              >
                <div>
                  <p
                    className="text-[0.62rem] font-black tracking-[0.3em] uppercase mb-1"
                    style={{ color: "rgba(17,17,17,0.55)" }}
                  >
                    Inizia ora
                  </p>
                  <p
                    className="text-lg font-black tracking-tight"
                    style={{ color: "#111111" }}
                  >
                    Scegli il tuo Percorso
                  </p>
                </div>
                <span
                  className="flex h-12 w-12 items-center justify-center text-xl font-black transition-transform duration-300 group-hover:translate-x-1"
                  style={{
                    border: "1.5px solid rgba(17,17,17,0.25)",
                    color: "#111111",
                  }}
                >
                  →
                </span>
                {/* Shimmer */}
                <span
                  className="pointer-events-none absolute inset-0"
                  aria-hidden
                  style={{
                    background:
                      "linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.15) 50%,transparent 60%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 3s infinite",
                  }}
                />
              </a>

              {/* Secondary CTA */}
              <a
                href="/percorso"
                className="group flex items-center justify-between p-8 md:p-10 transition-colors duration-200"
                style={{
                  background: "rgba(240,146,38,0.04)",
                  border: "1px solid rgba(240,146,38,0.18)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background =
                    "rgba(240,146,38,0.08)";
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "rgba(240,146,38,0.35)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background =
                    "rgba(240,146,38,0.04)";
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "rgba(240,146,38,0.18)";
                }}
              >
                <div>
                  <p
                    className="text-[0.62rem] font-black tracking-[0.3em] uppercase mb-1"
                    style={{ color: "rgba(240,146,38,0.45)" }}
                  >
                    Approfondisci
                  </p>
                  <p
                    className="text-lg font-black tracking-tight"
                    style={{ color: "#e8e8f4" }}
                  >
                    Esplora il Programma
                  </p>
                  <p
                    className="mt-1 text-[0.78rem]"
                    style={{ color: "#6868a0" }}
                  >
                    Curriculum · Docenti · Certificazione
                  </p>
                </div>
                <span
                  className="flex h-12 w-12 shrink-0 items-center justify-center text-xl font-black transition-transform duration-300 group-hover:translate-x-1"
                  style={{
                    border: "1px solid rgba(240,146,38,0.25)",
                    color: "#F09226",
                  }}
                >
                  →
                </span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
