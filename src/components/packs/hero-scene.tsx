"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const BLOCKS = [
  {
    num: "01",
    label: "FUNCTION",
    area: "Functional Training",
    slug: "function",
  },
  {
    num: "02",
    label: "STRENGTH",
    area: "Strength & Conditioning",
    slug: "strength",
  },
  {
    num: "03",
    label: "SCIENCE",
    area: "Business & Performance",
    slug: "science",
  },
  { num: "✦", label: "FIPE", area: "Certificazione Ufficiale", slug: "fipe" },
] as const;

// 2×2 starting positions
const START_POS = [
  { left: 0, top: 0 },
  { left: 52, top: 0 },
  { left: 0, top: 53 },
  { left: 52, top: 53 },
];

const BRUSHED_OVERLAY =
  "repeating-linear-gradient(90deg, transparent 0px, transparent 1px, rgba(255,255,255,0.035) 1px, rgba(255,255,255,0.035) 2px)";

const PACK_DECK = [
  {
    label: "START",
    tagline: "Il percorso essenziale",
    bg: "#ffffff",
    accent: "#F09226",
    labelColor: "#111111",
    metaColor: "rgba(17,17,17,0.45)",
  },
  {
    label: "PRO",
    tagline: "Percorso + certificazione FIPE",
    bg: "#F09226",
    accent: "#111111",
    labelColor: "#111111",
    metaColor: "rgba(17,17,17,0.6)",
    badge: "Consigliato",
  },
  {
    label: "ELITE",
    tagline: "Tutto incluso, vitto e alloggio",
    bg: `${BRUSHED_OVERLAY}, linear-gradient(145deg, #434343 0%, #1a1a1a 55%, #0a0a0a 100%)`,
    accent: "#F09226",
    labelColor: "#ffffff",
    metaColor: "rgba(255,255,255,0.5)",
  },
] as const;

interface HeroSceneProps {
  isDark: boolean;
  onClickBlock?: (slug: string) => void;
}

function scrollToPacks() {
  document
    .getElementById("section-packs")
    ?.scrollIntoView({ behavior: "smooth" });
}

/* ─────────────────────────────────────────────────────────────────────
   Mobile scene — only 3 pack cards. Minimal entrance, gentle idle.
   On scroll, cards spread + the highlighted PRO card lifts.
───────────────────────────────────────────────────────────────────── */
function MobilePackScene({ isDark }: { isDark: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const container = containerRef.current;
    if (!container) return;

    const cards = cardsRef.current.filter(Boolean);
    if (cards.length !== 3) return;

    const [start, pro, elite] = cards;

    // ── Initial off-screen state ─────────────────────────────────────
    gsap.set([start, pro, elite], { opacity: 0, y: 60, scale: 0.9 });

    // ── Resting transforms — gentle fan with PRO centered ──────────
    const rest = {
      start: { x: -60, y: 14, rotation: -7, scale: 0.93, z: 1 },
      pro: { x: 0, y: -8, rotation: 0, scale: 1.05, z: 3 },
      elite: { x: 60, y: 14, rotation: 7, scale: 0.93, z: 2 },
    };

    // ── Entrance: PRO first, then START + ELITE — staggered ────────
    const entrance = gsap.timeline({ delay: 0.4 });
    entrance.to(pro, {
      opacity: 1,
      y: rest.pro.y,
      x: rest.pro.x,
      rotation: rest.pro.rotation,
      scale: rest.pro.scale,
      duration: 0.85,
      ease: "expo.out",
    });
    entrance.to(
      start,
      {
        opacity: 1,
        y: rest.start.y,
        x: rest.start.x,
        rotation: rest.start.rotation,
        scale: rest.start.scale,
        duration: 0.75,
        ease: "expo.out",
      },
      "-=0.55",
    );
    entrance.to(
      elite,
      {
        opacity: 1,
        y: rest.elite.y,
        x: rest.elite.x,
        rotation: rest.elite.rotation,
        scale: rest.elite.scale,
        duration: 0.75,
        ease: "expo.out",
      },
      "-=0.7",
    );

    // ── Idle float — subtle, organic, infinite ─────────────────────
    const idleTweens = [
      gsap.to(pro, {
        y: rest.pro.y - 6,
        duration: 2.6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 1.4,
      }),
      gsap.to(start, {
        y: rest.start.y - 4,
        rotation: rest.start.rotation - 0.8,
        duration: 3.0,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 1.8,
      }),
      gsap.to(elite, {
        y: rest.elite.y - 4,
        rotation: rest.elite.rotation + 0.8,
        duration: 3.0,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 2.0,
      }),
    ];

    // ── Scroll-driven: spread cards apart, slight fade near the end ─
    const scrollParent = container.closest("[data-hero-scroll]");
    let scrollTrigger: ScrollTrigger | null = null;

    if (scrollParent) {
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: scrollParent,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.8,
        },
      });

      // 0 → 0.45: spread the fan further apart, PRO lifts more
      scrollTl.to(
        start,
        { x: -90, rotation: -10, duration: 0.45, ease: "power2.out" },
        0,
      );
      scrollTl.to(
        elite,
        { x: 90, rotation: 10, duration: 0.45, ease: "power2.out" },
        0,
      );
      scrollTl.to(
        pro,
        { y: rest.pro.y - 18, scale: 1.08, duration: 0.45, ease: "power2.out" },
        0,
      );

      // 0.55 → 1.0: gentle fade as the section transitions out
      scrollTl.to(
        [start, pro, elite],
        { opacity: 0.25, duration: 0.4, ease: "power2.in" },
        0.6,
      );

      scrollTrigger = scrollTl.scrollTrigger ?? null;
    }

    return () => {
      entrance.kill();
      idleTweens.forEach((t) => t.kill());
      if (scrollTrigger) scrollTrigger.kill();
      gsap.killTweensOf(cards);
    };
  }, [isDark]);

  return (
    <div
      ref={containerRef}
      className="relative w-full flex items-center justify-center"
      style={{ aspectRatio: "1 / 0.95" }}
    >
      {/* Soft glow behind PRO */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: "60%",
          height: "60%",
          background:
            "radial-gradient(ellipse, rgba(240,146,38,0.12) 0%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />

      {PACK_DECK.map((pack, i) => (
        <div
          key={pack.label}
          ref={(el) => {
            if (el) cardsRef.current[i] = el;
          }}
          className="absolute cursor-pointer"
          style={{
            width: "clamp(150px, 44%, 200px)",
            height: "clamp(210px, 60%, 270px)",
            zIndex: i === 1 ? 3 : i === 0 ? 1 : 2,
            transformOrigin: "center center",
            opacity: 0,
          }}
          onClick={scrollToPacks}
        >
          <div
            className="h-full w-full overflow-hidden flex flex-col items-center justify-center relative"
            style={{
              background: pack.bg,
              border: `1px solid ${pack.accent}30`,
              boxShadow:
                i === 1
                  ? `0 18px 50px rgba(240,146,38,0.28), 0 8px 24px rgba(0,0,0,${isDark ? 0.5 : 0.18})`
                  : `0 12px 36px rgba(0,0,0,${isDark ? 0.5 : 0.16})`,
            }}
          >
            {/* Top accent stripe */}
            <div
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{
                background: `linear-gradient(90deg, ${pack.accent}, ${pack.accent}00)`,
              }}
            />

            {/* "Consigliato" badge for PRO */}
            {"badge" in pack && pack.badge && (
              <div
                className="absolute top-2.5 right-2.5 px-1.5 py-0.5 text-[0.42rem] font-black tracking-[0.22em] uppercase"
                style={{
                  background: "rgba(17,17,17,0.92)",
                  color: "#F09226",
                  border: "1px solid rgba(240,146,38,0.4)",
                }}
              >
                {pack.badge}
              </div>
            )}

            <div className="text-center px-3">
              <span
                className="text-[0.46rem] font-black tracking-[0.4em] uppercase block mb-1.5"
                style={{ color: pack.metaColor }}
              >
                Pack
              </span>
              <span
                className="text-[clamp(1.6rem,5.5vw,2.2rem)] font-black leading-none tracking-tight block"
                style={{ color: pack.labelColor }}
              >
                {pack.label}
              </span>
              <span
                className="mt-2.5 block text-[0.55rem] font-semibold leading-snug"
                style={{ color: pack.metaColor }}
              >
                {pack.tagline}
              </span>
            </div>

            {/* Bottom CTA hint */}
            <div
              className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1 text-[0.5rem] font-black tracking-[0.22em] uppercase"
              style={{ color: pack.accent }}
            >
              Esplora <span>→</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Desktop scene — original 4 blocks → stack → 3 pack cards fan
───────────────────────────────────────────────────────────────────── */
function DesktopScene({ isDark, onClickBlock }: HeroSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const glowsRef = useRef<HTMLDivElement[]>([]);
  const labelsRef = useRef<HTMLDivElement[]>([]); // inner label+area container
  const topRowRef = useRef<HTMLDivElement[]>([]); // top row (blocco tag + num)
  const accentRef = useRef<HTMLDivElement[]>([]); // accent line
  const deckRef = useRef<HTMLDivElement>(null);
  const deckCardsRef = useRef<HTMLDivElement[]>([]);

  const bg = isDark ? "#0a0a16" : "#f8f8fc";
  const border = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)";
  const th = isDark ? "rgba(255,255,255,0.88)" : "#0a0a1a";
  const ts = isDark ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.22)";
  const accent = isDark ? "rgba(240,146,38,0.45)" : "rgba(200,90,0,0.5)";

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const container = containerRef.current;
    if (!container) return;

    const cards = cardsRef.current.filter(Boolean);
    const glows = glowsRef.current.filter(Boolean);
    const labels = labelsRef.current.filter(Boolean);
    const deck = deckRef.current;
    const deckCards = deckCardsRef.current.filter(Boolean);

    // ── Init ──────────────────────────────────────────────────────────
    gsap.set(cards, { opacity: 0, scale: 0.88 });
    gsap.set(deck, { opacity: 0, pointerEvents: "none" });
    gsap.set(deckCards, { opacity: 0 });

    // ── Entrance ──────────────────────────────────────────────────────
    const entrance = gsap.timeline({ delay: 0.8 });
    cards.forEach((card, i) => {
      entrance.to(
        card,
        { opacity: 1, scale: 1, duration: 0.6, ease: "power3.out" },
        i * 0.14,
      );
    });

    // ── Idle: float + glow ────────────────────────────────────────────
    cards.forEach((card, i) => {
      gsap.to(card, {
        y: `+=${4 + i * 1.5}`,
        rotation: i % 2 === 0 ? 0.5 : -0.5,
        duration: 2.8 + i * 0.3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 1.4 + i * 0.2,
      });
    });
    glows.forEach((glow, i) => {
      gsap.set(glow, { opacity: isDark ? 0.3 : 0.2 });
      gsap.to(glow, {
        opacity: isDark ? 0.7 : 0.5,
        duration: 2.0 + i * 0.25,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 1 + i * 0.3,
      });
    });

    // ── Scroll animation ──────────────────────────────────────────────
    const scrollParent = container.closest("[data-hero-scroll]");
    const scrollTl = gsap.timeline({
      scrollTrigger: {
        trigger: scrollParent,
        start: "top top",
        end: "bottom bottom",
        scrub: 1.0,
      },
    });

    glows.forEach((glow) => {
      scrollTl.to(glow, { opacity: 0, duration: 0.12 }, 0.05);
    });
    cards.forEach((card) => {
      scrollTl.to(card, { y: 0, rotation: 0, duration: 0.12 }, 0.05);
    });

    // Desktop: blocks stay same size, move to center, stack
    const stackOrder = [0, 1, 2, 3];
    const perCard = 0.07;
    const stackStart = 0.24;
    const centerLeft = 26.5;
    const centerTop = 26.5;

    stackOrder.forEach((cardIdx, seq) => {
      const t = stackStart + seq * perCard;
      const card = cards[cardIdx];
      if (!card) return;

      scrollTl.to(
        card,
        {
          left: `${centerLeft}%`,
          top: `${centerTop}%`,
          x: 0,
          y: seq * -4,
          zIndex: 10 + seq,
          scale: 1,
          duration: perCard,
          ease: "power2.inOut",
        },
        t,
      );
    });

    // Shrink + disappear
    cards.forEach((card) => {
      scrollTl.to(
        card,
        { scale: 0.4, opacity: 0, duration: 0.08, ease: "power2.in" },
        0.56,
      );
    });

    // Pack deck
    scrollTl.to(
      deck,
      { opacity: 1, pointerEvents: "auto", duration: 0.03 },
      0.66,
    );

    const fR = [-12, 0, 12];
    const fX = [-120, 0, 120];
    deckCards.forEach((dc, i) => {
      scrollTl.fromTo(
        dc,
        { opacity: 0, scale: 0.5, rotation: 0, x: 0, y: 20 },
        {
          opacity: 1,
          scale: 1,
          rotation: fR[i],
          x: fX[i],
          y: 0,
          duration: 0.34,
          ease: "power3.out",
        },
        0.68 + i * 0.03,
      );
    });

    const myTrigger = scrollTl.scrollTrigger;
    return () => {
      if (myTrigger) myTrigger.kill();
      scrollTl.kill();
      entrance.kill();
      gsap.killTweensOf(cards);
      gsap.killTweensOf(glows);
      gsap.killTweensOf(labels);
    };
  }, [isDark]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center"
    >
      <div
        ref={areaRef}
        className="relative w-full"
        style={{ aspectRatio: "1 / 0.88" }}
      >
        {BLOCKS.map((block, i) => {
          const pos = START_POS[i];
          return (
            <div
              key={block.label}
              ref={(el) => {
                if (el) cardsRef.current[i] = el;
              }}
              className="absolute cursor-pointer"
              style={{
                width: "47%",
                height: "47%",
                left: `${pos.left}%`,
                top: `${pos.top}%`,
              }}
              onClick={() => onClickBlock?.(block.slug)}
            >
              <div
                className="h-full w-full overflow-hidden relative"
                style={{ background: bg, border: `1px solid ${border}` }}
              >
                <div
                  ref={(el) => {
                    if (el) glowsRef.current[i] = el;
                  }}
                  className="pointer-events-none absolute inset-[-1px] z-0"
                  style={{
                    boxShadow: `0 0 20px rgba(240,146,38,${isDark ? 0.15 : 0.1}), 0 0 40px rgba(240,146,38,${isDark ? 0.08 : 0.05}), inset 0 0 20px rgba(240,146,38,${isDark ? 0.04 : 0.03})`,
                    opacity: 0,
                  }}
                />

                <div
                  ref={(el) => {
                    if (el) accentRef.current[i] = el;
                  }}
                  className="h-[2px] w-full relative z-[1]"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(240,146,38,0.5), transparent)",
                  }}
                />

                <div className="flex flex-col justify-between h-[calc(100%-2px)] p-3.5 sm:p-5 relative z-[1]">
                  <div
                    ref={(el) => {
                      if (el) topRowRef.current[i] = el;
                    }}
                    className="flex items-start justify-between"
                  >
                    <span
                      className="text-[0.5rem] sm:text-[0.56rem] font-black tracking-[0.38em] uppercase"
                      style={{ color: ts }}
                    >
                      {block.num === "✦"
                        ? "Certificazione"
                        : `Blocco ${block.num}`}
                    </span>
                    <span
                      className="text-[0.7rem] sm:text-[0.85rem] font-black"
                      style={{
                        color: isDark
                          ? "rgba(255,255,255,0.06)"
                          : "rgba(0,0,0,0.05)",
                      }}
                    >
                      {block.num}
                    </span>
                  </div>

                  <div
                    ref={(el) => {
                      if (el) labelsRef.current[i] = el;
                    }}
                  >
                    <div
                      className="h-[1.5px] w-6 mb-2.5 js-accent-line"
                      style={{
                        background:
                          "linear-gradient(90deg, rgba(240,146,38,0.5), transparent)",
                      }}
                    />
                    <div
                      className="js-block-name text-[clamp(1.15rem,2.5vw,1.75rem)] font-black leading-none tracking-tight"
                      style={{ color: th }}
                    >
                      {block.label}
                    </div>
                    <div
                      className="js-block-area mt-1.5 text-[0.52rem] sm:text-[0.6rem] font-bold tracking-[0.2em] uppercase"
                      style={{ color: accent }}
                    >
                      {block.area}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Deck — fan of 3 packs after scroll */}
        <div
          ref={deckRef}
          className="absolute inset-0 flex items-center justify-center"
          style={{ opacity: 0 }}
        >
          {PACK_DECK.map((pack, i) => (
            <div
              key={pack.label}
              ref={(el) => {
                if (el) deckCardsRef.current[i] = el;
              }}
              className="absolute cursor-pointer"
              style={{
                width: "clamp(140px, 36%, 200px)",
                height: "clamp(190px, 54%, 260px)",
                zIndex: 2,
                transformOrigin: "center bottom",
              }}
              onClick={scrollToPacks}
            >
              <div
                className="h-full w-full overflow-hidden flex flex-col items-center justify-center relative"
                style={{
                  background: pack.bg,
                  border: `1px solid ${pack.accent}30`,
                  boxShadow: `0 12px 40px rgba(0,0,0,${isDark ? 0.5 : 0.15})`,
                }}
              >
                <div
                  className="absolute top-0 left-0 right-0 h-[2px]"
                  style={{
                    background: `linear-gradient(90deg, ${pack.accent}, ${pack.accent}00)`,
                  }}
                />
                <div className="text-center">
                  <span
                    className="text-[0.5rem] sm:text-[0.56rem] font-black tracking-[0.42em] uppercase block mb-1.5"
                    style={{ color: pack.metaColor }}
                  >
                    Pack
                  </span>
                  <span
                    className="text-[clamp(1.6rem,3.5vw,2.4rem)] font-black leading-none tracking-tight block"
                    style={{ color: pack.labelColor }}
                  >
                    {pack.label}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   HeroScene — branches between mobile and desktop after mount
───────────────────────────────────────────────────────────────────── */
export function HeroScene({ isDark, onClickBlock }: HeroSceneProps) {
  const [mode, setMode] = useState<"mobile" | "desktop" | null>(null);

  useEffect(() => {
    const decide = () =>
      setMode(window.innerWidth < 1024 ? "mobile" : "desktop");
    decide();
    window.addEventListener("resize", decide);
    return () => window.removeEventListener("resize", decide);
  }, []);

  if (mode === null) {
    // Reserve space until we know the viewport — avoids layout shift.
    return (
      <div
        className="relative w-full"
        style={{ aspectRatio: "1 / 0.92", opacity: 0 }}
      />
    );
  }

  if (mode === "mobile") {
    return <MobilePackScene isDark={isDark} />;
  }

  return <DesktopScene isDark={isDark} onClickBlock={onClickBlock} />;
}
