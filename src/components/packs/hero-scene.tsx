"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { smoothScrollTo } from "@/lib/scroll";

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
] as const;

const BRUSHED_OVERLAY =
  "repeating-linear-gradient(90deg, transparent 0px, transparent 1px, rgba(255,255,255,0.035) 1px, rgba(255,255,255,0.035) 2px)";

const PACK_DECK = [
  {
    label: "START",
    bg: "#ffffff",
    accent: "#F09226",
    labelColor: "#111111",
    metaColor: "rgba(17,17,17,0.5)",
  },
  {
    label: "PRO",
    bg: "#F09226",
    accent: "#111111",
    labelColor: "#111111",
    metaColor: "rgba(17,17,17,0.65)",
  },
  {
    label: "ELITE",
    bg: `${BRUSHED_OVERLAY}, linear-gradient(145deg, #434343 0%, #1a1a1a 55%, #0a0a0a 100%)`,
    accent: "#F09226",
    labelColor: "#ffffff",
    metaColor: "rgba(255,255,255,0.55)",
  },
] as const;

interface HeroSceneProps {
  isDark: boolean;
  onClickBlock?: (slug: string) => void;
}

function scrollToPacks() {
  smoothScrollTo("#section-packs");
}

// ── Mobile scene — only packs, simple entrance, no block phase ───────
function MobileScene({ isDark }: { isDark: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const cards = cardsRef.current.filter(Boolean);
    if (cards.length !== 3) return;
    const [start, pro, elite] = cards;

    const rest = {
      start: { x: -90, y: 14, rotation: -8, scale: 0.93 },
      pro: { x: 0, y: -10, rotation: 0, scale: 1.06 },
      elite: { x: 90, y: 14, rotation: 8, scale: 0.93 },
    };

    gsap.set([start, pro, elite], { opacity: 0, y: 60, scale: 0.85 });

    const entrance = gsap.timeline({ delay: 0.4 });
    entrance.to(pro, {
      opacity: 1,
      ...rest.pro,
      duration: 0.85,
      ease: "expo.out",
    });
    entrance.to(
      start,
      {
        opacity: 1,
        ...rest.start,
        duration: 0.75,
        ease: "expo.out",
      },
      "-=0.55",
    );
    entrance.to(
      elite,
      {
        opacity: 1,
        ...rest.elite,
        duration: 0.75,
        ease: "expo.out",
      },
      "-=0.7",
    );

    // Subtle idle float
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
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 1.8,
      }),
      gsap.to(elite, {
        y: rest.elite.y - 4,
        rotation: rest.elite.rotation + 0.8,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 2,
      }),
    ];

    return () => {
      entrance.kill();
      idleTweens.forEach((t) => t.kill());
      gsap.killTweensOf(cards);
    };
  }, [isDark]);

  return (
    <div
      ref={containerRef}
      className="relative w-full flex items-center justify-center"
      style={{ aspectRatio: "1 / 0.95" }}
    >
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: "62%",
          height: "62%",
          background:
            "radial-gradient(ellipse, rgba(240,146,38,0.14) 0%, transparent 70%)",
          filter: "blur(28px)",
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
            width: "clamp(160px, 46%, 220px)",
            height: "clamp(220px, 62%, 290px)",
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
                  ? `0 22px 60px rgba(240,146,38,0.32), 0 10px 28px rgba(0,0,0,${isDark ? 0.5 : 0.18})`
                  : `0 14px 44px rgba(0,0,0,${isDark ? 0.5 : 0.16})`,
            }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{
                background: `linear-gradient(90deg, ${pack.accent}, ${pack.accent}00)`,
              }}
            />
            <div className="text-center px-3">
              <span
                className="text-[0.5rem] font-black tracking-[0.42em] uppercase block mb-1.5"
                style={{ color: pack.metaColor }}
              >
                Pack
              </span>
              <span
                className="text-[clamp(1.7rem,5vw,2.3rem)] font-black leading-none tracking-tight block"
                style={{ color: pack.labelColor }}
              >
                {pack.label}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Desktop scene — blocks accordion → morph into packs → fan out ────
// Each card morphs from horizontal block row → vertical pack card.
// Geometry, bg, content all crossfade continuously. 1:1 mapping:
//   block 0 (top row, FUNCTION)   → pack 0 (START, leftmost, tilted left)
//   block 1 (middle row, STRENGTH) → pack 1 (PRO, center, lifted)
//   block 2 (bottom row, SCIENCE)  → pack 2 (ELITE, rightmost, tilted right)
const BLOCK_LAYOUT = [
  { top: "5%", left: "0%", width: "100%", height: "27%" },
  { top: "36.5%", left: "0%", width: "100%", height: "27%" },
  { top: "68%", left: "0%", width: "100%", height: "27%" },
];

const PACK_LAYOUT = [
  { top: "26%", left: "1%", width: "32%", height: "50%", rotation: -7 },
  { top: "20%", left: "34%", width: "32%", height: "50%", rotation: 0 },
  { top: "26%", left: "67%", width: "32%", height: "50%", rotation: 7 },
];

function DesktopScene({ isDark, onClickBlock }: HeroSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const blockSkinRef = useRef<HTMLDivElement[]>([]);
  const blockBodyRef = useRef<HTMLDivElement[]>([]);
  const packSkinRef = useRef<HTMLDivElement[]>([]);
  const packBodyRef = useRef<HTMLDivElement[]>([]);
  // Tracks morph progress so click handler routes correctly:
  // < 0.4 (block phase) → open block modal; >= 0.4 (pack phase) → scroll to packs.
  const triggerRef = useRef<ScrollTrigger | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const container = containerRef.current;
    if (!container) return;

    const cards = cardsRef.current.filter(Boolean);
    const blockSkins = blockSkinRef.current.filter(Boolean);
    const blockBodies = blockBodyRef.current.filter(Boolean);
    const packSkins = packSkinRef.current.filter(Boolean);
    const packBodies = packBodyRef.current.filter(Boolean);
    if (cards.length !== 3) return;

    // Initial state — block geometry, block skin visible, pack hidden
    cards.forEach((card, i) => {
      gsap.set(card, {
        ...BLOCK_LAYOUT[i],
        rotation: 0,
        opacity: 0,
        x: -36,
      });
    });
    gsap.set(blockSkins, { opacity: 1 });
    gsap.set(blockBodies, { opacity: 1 });
    gsap.set(packSkins, { opacity: 0 });
    gsap.set(packBodies, { opacity: 0 });

    // Entrance — slide-in from left, stagger
    const entrance = gsap.timeline({ delay: 0.45 });
    cards.forEach((c, i) => {
      entrance.to(
        c,
        { opacity: 1, x: 0, duration: 0.7, ease: "expo.out" },
        i * 0.13,
      );
    });

    // Subtle idle drift — small horizontal sway (does not conflict with morph)
    const idleTweens = cards.map((c, i) =>
      gsap.to(c, {
        x: i % 2 === 0 ? 3 : -3,
        duration: 2.8 + i * 0.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 1.6 + i * 0.18,
      }),
    );

    const scrollParent = container.closest("[data-hero-scroll]");
    if (!scrollParent) {
      return () => {
        entrance.kill();
        idleTweens.forEach((t) => t.kill());
      };
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: scrollParent,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.9,
      },
    });

    // ── Phase A (0 → 0.25): blocks at rest while description fades ──

    // ── Phase B (0.25 → 0.55): unified morph — geometry + content + skin ─
    // Geometry: continuous transform from block row to pack card
    cards.forEach((card, i) => {
      tl.to(
        card,
        {
          top: PACK_LAYOUT[i].top,
          left: PACK_LAYOUT[i].left,
          width: PACK_LAYOUT[i].width,
          height: PACK_LAYOUT[i].height,
          rotation: PACK_LAYOUT[i].rotation,
          duration: 0.3,
          ease: "expo.inOut",
        },
        0.25 + i * 0.025,
      );
    });

    // Block content fades early so layout collapse isn't visible
    tl.to(blockBodies, { opacity: 0, duration: 0.06, ease: "power2.in" }, 0.27);

    // Skin crossfade — happens mid-morph, where geometry is ambiguous
    tl.to(
      blockSkins,
      { opacity: 0, duration: 0.1, ease: "power2.inOut" },
      0.36,
    );
    tl.to(packSkins, { opacity: 1, duration: 0.1, ease: "power2.inOut" }, 0.36);

    // Pack content fades in as geometry approaches final shape
    tl.to(packBodies, { opacity: 1, duration: 0.08, ease: "power2.out" }, 0.46);

    const trig = tl.scrollTrigger ?? null;
    triggerRef.current = trig;
    return () => {
      entrance.kill();
      idleTweens.forEach((t) => t.kill());
      if (trig) trig.kill();
      triggerRef.current = null;
      tl.kill();
      gsap.killTweensOf(cards);
    };
  }, [isDark]);

  const bg = isDark ? "#0a0a16" : "#f8f8fc";
  const border = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const th = isDark ? "rgba(255,255,255,0.92)" : "#0a0a1a";
  const ts = isDark ? "rgba(255,255,255,0.32)" : "rgba(0,0,0,0.32)";
  const accent = isDark ? "rgba(240,146,38,0.85)" : "rgba(212,98,42,0.9)";
  const numFaint = isDark ? "rgba(240,146,38,0.22)" : "rgba(240,146,38,0.34)";

  return (
    <div
      ref={containerRef}
      className="relative w-full flex items-center justify-center"
      style={{ aspectRatio: "1 / 0.95" }}
    >
      {/* Soft ambient glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: "62%",
          height: "62%",
          background:
            "radial-gradient(ellipse, rgba(240,146,38,0.12) 0%, transparent 70%)",
          filter: "blur(28px)",
        }}
      />

      {/* 3 unified morphing cards — same DOM nodes that transform from
          horizontal block rows into vertical pack cards */}
      {PACK_DECK.map((pack, i) => {
        const block = BLOCKS[i];
        return (
          <div
            key={pack.label}
            ref={(el) => {
              if (el) cardsRef.current[i] = el;
            }}
            className="absolute overflow-hidden cursor-pointer"
            style={{
              transformOrigin: "center center",
              zIndex: i === 1 ? 3 : i === 0 ? 1 : 2,
              willChange: "transform, top, left, width, height",
            }}
            onClick={() => {
              const p = triggerRef.current?.progress ?? 0;
              if (p >= 0.4) scrollToPacks();
              else onClickBlock?.(block.slug);
            }}
          >
            {/* Pack skin (underneath, fades IN during morph) */}
            <div
              ref={(el) => {
                if (el) packSkinRef.current[i] = el;
              }}
              className="absolute inset-0"
              style={{
                background: pack.bg,
                border: `1px solid ${pack.accent}30`,
                boxShadow:
                  i === 1
                    ? `0 24px 64px rgba(240,146,38,0.35), 0 10px 28px rgba(0,0,0,${isDark ? 0.55 : 0.2})`
                    : `0 14px 44px rgba(0,0,0,${isDark ? 0.55 : 0.18})`,
              }}
            />

            {/* Block skin (on top, fades OUT during morph) */}
            <div
              ref={(el) => {
                if (el) blockSkinRef.current[i] = el;
              }}
              className="absolute inset-0"
              style={{ background: bg, border: `1px solid ${border}` }}
            />

            {/* Block content (horizontal layout — fades out early) */}
            <div
              ref={(el) => {
                if (el) blockBodyRef.current[i] = el;
              }}
              className="absolute inset-0 flex items-center"
            >
              <div
                className="absolute left-0 top-0 bottom-0 w-[3px]"
                style={{
                  background: `linear-gradient(180deg, ${accent}, ${accent}55)`,
                }}
              />
              <div
                className="pl-5 sm:pl-6 pr-3 flex items-center"
                style={{ minWidth: "28%" }}
              >
                <span
                  className="font-black leading-none tracking-tight"
                  style={{
                    fontSize: "clamp(2.2rem, 5.8vw, 3.6rem)",
                    color: numFaint,
                  }}
                >
                  {block.num}
                </span>
              </div>
              <div className="flex-1 pr-3">
                <div
                  className="text-[clamp(1rem,2.2vw,1.55rem)] font-black leading-none tracking-tight"
                  style={{ color: th }}
                >
                  {block.label}
                </div>
                <div
                  className="mt-2 text-[0.55rem] sm:text-[0.62rem] font-bold tracking-[0.22em] uppercase"
                  style={{ color: accent }}
                >
                  {block.area}
                </div>
              </div>
              <div
                className="pr-4 sm:pr-5 text-[0.85rem] font-black"
                style={{ color: ts }}
              >
                →
              </div>
            </div>

            {/* Pack content (vertical layout — fades in late) */}
            <div
              ref={(el) => {
                if (el) packBodyRef.current[i] = el;
              }}
              className="absolute inset-0 flex flex-col items-center justify-center"
            >
              <div
                className="absolute top-0 left-0 right-0 h-[2px]"
                style={{
                  background: `linear-gradient(90deg, ${pack.accent}, ${pack.accent}00)`,
                }}
              />
              <div className="text-center px-3">
                <span
                  className="text-[0.5rem] sm:text-[0.56rem] font-black tracking-[0.42em] uppercase block mb-1.5"
                  style={{ color: pack.metaColor }}
                >
                  Pack
                </span>
                <span
                  className="text-[clamp(1.7rem,3.8vw,2.6rem)] font-black leading-none tracking-tight block"
                  style={{ color: pack.labelColor }}
                >
                  {pack.label}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

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
    return (
      <div
        className="relative w-full"
        style={{ aspectRatio: "1 / 0.95", opacity: 0 }}
      />
    );
  }

  if (mode === "mobile") {
    return <MobileScene isDark={isDark} />;
  }

  return <DesktopScene isDark={isDark} onClickBlock={onClickBlock} />;
}
