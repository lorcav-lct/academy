"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { useTheme } from "@/components/providers/theme-provider";
import { VideoBlockMux } from "@/components/shared/video-block-mux";

const MUX_PLAYBACK_ID = "czjfcHxFBiCTiw8gH9nw8Cx7fU02XPsRIgG6P4j00012cE";
const MUX_POSTER =
  "https://image.mux.com/czjfcHxFBiCTiw8gH9nw8Cx7fU02XPsRIgG6P4j00012cE/thumbnail.png?fit_mode=preserve&time=31";

export function PercorsoHero() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".js-ph-text > *", {
        opacity: 0,
        y: 24,
        stagger: 0.1,
        duration: 0.75,
        ease: "power3.out",
        delay: 0.1,
        clearProps: "opacity,transform",
      });
      gsap.from(".js-ph-video", {
        opacity: 0,
        scale: 0.97,
        duration: 0.9,
        ease: "power3.out",
        delay: 0.35,
        clearProps: "opacity,transform",
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const th = isDark ? "#f5f5fa" : "#0a0a1a";
  const tb = isDark ? "rgba(180,180,200,0.65)" : "#555";
  const ts = isDark ? "rgba(120,120,140,0.5)" : "#888";
  const borderSubtle = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";

  return (
    <section
      ref={sectionRef}
      className="themed-section relative overflow-hidden"
    >
      <div className="absolute inset-0 section-bg" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: isDark
            ? "radial-gradient(ellipse at 68% 48%, rgba(240,146,38,0.055) 0%, transparent 52%), radial-gradient(ellipse at 18% 78%, rgba(42,95,168,0.04) 0%, transparent 48%)"
            : "radial-gradient(ellipse at 68% 42%, rgba(212,98,42,0.06) 0%, transparent 50%), radial-gradient(ellipse at 15% 72%, rgba(42,95,168,0.04) 0%, transparent 50%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.022]"
        style={{
          backgroundImage: `linear-gradient(to right, ${isDark ? "#fff" : "#000"} 1px, transparent 1px), linear-gradient(to bottom, ${isDark ? "#fff" : "#000"} 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
      />

      <div
        className="relative z-10 flex items-center"
        style={{ minHeight: "100svh" }}
      >
        <div className="w-full mx-auto max-w-[1440px] px-[5%] md:px-10 pt-24 md:pt-28 pb-14 md:pb-20">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-14">
            {/* Left — copy */}
            <div className="js-ph-text flex flex-col justify-center lg:w-[44%]">
              <span className="label-tag mb-5 block">Il Metodo Lacertosus</span>
              <h1
                className="font-black tracking-[-0.025em] leading-[0.93] text-[clamp(2.6rem,5.2vw,4.8rem)]"
                style={{ color: th }}
              >
                Un Sistema Formativo
                <br />
                Costruito su <span className="gradient-text">3 Pilastri</span>
              </h1>
              <p
                className="mt-6 max-w-[480px] text-[0.95rem] leading-relaxed"
                style={{ color: tb }}
              >
                <span
                  className="font-semibold"
                  style={{ color: isDark ? "rgba(220,220,235,0.9)" : "#222" }}
                >
                  FUNCTION, STRENGTH e SCIENCE
                </span>{" "}
                si integrano in un percorso immersivo 100% in presenza
                sviluppato all&apos;interno dell&apos;HQ Lacertosus.
              </p>

              {/* Stats pills */}
              <div className="mt-7 flex flex-wrap gap-3">
                {[
                  { val: "9", unit: "mesi" },
                  { val: "100%", unit: "in presenza" },
                  { val: "33+", unit: "docenti" },
                  { val: "3", unit: "certificazioni" },
                ].map((s) => (
                  <div
                    key={s.unit}
                    className="flex flex-col items-center px-4 py-2.5"
                    style={{
                      border: `1px solid ${borderSubtle}`,
                      background: isDark
                        ? "rgba(255,255,255,0.03)"
                        : "rgba(0,0,0,0.02)",
                      minWidth: "68px",
                    }}
                  >
                    <span
                      className="text-xl font-black leading-none"
                      style={{ color: "#F09226" }}
                    >
                      {s.val}
                    </span>
                    <span
                      className="mt-1 text-[0.62rem] font-bold tracking-[0.18em] uppercase"
                      style={{ color: ts }}
                    >
                      {s.unit}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  href="#blocchi"
                  className="group inline-flex items-center gap-3 px-6 py-3.5 transition-opacity duration-200 hover:opacity-85"
                  style={{ background: "#F09226", color: "#111111" }}
                >
                  <span className="text-[0.82rem] font-black tracking-[0.16em] uppercase">
                    Esplora i Blocchi
                  </span>
                  <span className="text-[0.85rem] font-black transition-transform duration-300 group-hover:translate-y-0.5">
                    ↓
                  </span>
                </Link>
                <Link
                  href="/pack"
                  className="group inline-flex items-center gap-3 px-6 py-3.5 transition-opacity duration-200 hover:opacity-80"
                  style={{
                    border: `1px solid ${borderSubtle}`,
                    color: th,
                    background: isDark
                      ? "rgba(255,255,255,0.03)"
                      : "rgba(0,0,0,0.02)",
                  }}
                >
                  <span className="text-[0.82rem] font-black tracking-[0.16em] uppercase">
                    Vedi i Pack
                  </span>
                  <span className="text-[0.85rem] font-black transition-transform duration-300 group-hover:translate-x-0.5">
                    →
                  </span>
                </Link>
              </div>
            </div>

            {/* Right — video */}
            <div className="js-ph-video lg:w-[56%]">
              <VideoBlockMux
                playbackId={MUX_PLAYBACK_ID}
                isDark={isDark}
                poster={MUX_POSTER}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
