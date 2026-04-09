"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const BLOCKS = [
  { num: "01", label: "CORPUS", area: "Functional Training", slug: "corpus" },
  { num: "02", label: "VIS", area: "Strength & Conditioning", slug: "vis" },
  {
    num: "03",
    label: "VICTOR",
    area: "Business & Performance",
    slug: "victor",
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

const PACK_DECK = [
  { label: "BRONZO", color: "#CD7F32", darkBg: "#0f0b08", lightBg: "#fdf9f4" },
  { label: "ARGENTO", color: "#C0C0C0", darkBg: "#0c0c10", lightBg: "#f9f9fc" },
  { label: "ORO", color: "#D4AF37", darkBg: "#100e08", lightBg: "#fdfbf3" },
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

export function HeroScene({ isDark, onClickBlock }: HeroSceneProps) {
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
    const topRows = topRowRef.current.filter(Boolean);
    const accents = accentRef.current.filter(Boolean);
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

    // ── Step 1 (0.05→0.20): Kill idle + glow ─────────────────────────
    glows.forEach((glow) => {
      scrollTl.to(glow, { opacity: 0, duration: 0.12 }, 0.05);
    });
    cards.forEach((card) => {
      scrollTl.to(card, { y: 0, rotation: 0, duration: 0.12 }, 0.05);
    });

    // ── Step 2: Blocks stack one by one ─────────────────────────────
    const stackOrder = [0, 1, 2, 3];
    const perCard = 0.07;
    const stackStart = 0.24;
    const isMobile = window.innerWidth < 1024;

    // Center of the 2×2 grid: card is 47% wide, center = 26.5%
    const centerLeft = 26.5;
    const centerTop = 26.5;

    if (isMobile) {
      // ── MOBILE: expand to full + center text + slide from sides ────
      const entryX = [0, 400, -400, 400];

      stackOrder.forEach((cardIdx, seq) => {
        const t = stackStart + seq * perCard;
        const card = cards[cardIdx];
        const label = labels[cardIdx];
        const topRow = topRows[cardIdx];
        const accentLine = accents[cardIdx];
        if (!card) return;

        if (seq > 0) {
          scrollTl.set(card, { x: entryX[seq], zIndex: 10 + seq }, t - 0.001);
        }

        scrollTl.to(
          card,
          {
            left: "0%",
            top: "0%",
            width: "100%",
            height: "100%",
            x: 0,
            y: 0,
            zIndex: 10 + seq,
            scale: 1,
            duration: perCard,
            ease: "power2.inOut",
          },
          t,
        );

        if (topRow)
          scrollTl.to(
            topRow,
            { opacity: 0, y: -10, duration: perCard * 0.4 },
            t,
          );
        if (accentLine)
          scrollTl.to(accentLine, { opacity: 0, duration: perCard * 0.4 }, t);

        if (label) {
          const nameEl = label.querySelector(".js-block-name") as HTMLElement;
          const areaEl = label.querySelector(".js-block-area") as HTMLElement;

          scrollTl.to(
            label,
            {
              position: "absolute",
              left: 0,
              right: 0,
              top: "50%",
              yPercent: -50,
              textAlign: "center",
              duration: perCard,
              ease: "power2.inOut",
            },
            t,
          );

          if (nameEl)
            scrollTl.to(
              nameEl,
              {
                scale: 1.6,
                transformOrigin: "center center",
                duration: perCard,
                ease: "power2.inOut",
              },
              t,
            );
          if (areaEl)
            scrollTl.to(
              areaEl,
              {
                scale: 1.3,
                transformOrigin: "center center",
                duration: perCard,
                ease: "power2.inOut",
              },
              t,
            );
        }
      });
    } else {
      // ── DESKTOP: blocks stay same size, move to center, stack ──────
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
    }

    // ── Step 3 (0.52→0.56): Hold ────────────────────────────────────

    // ── Step 4 (0.56→0.64): Shrink + disappear ─────────────────────
    cards.forEach((card) => {
      scrollTl.to(
        card,
        { scale: 0.4, opacity: 0, duration: 0.08, ease: "power2.in" },
        0.56,
      );
    });

    // ── Step 5 (0.66→1.0): Pack cards ───────────────────────────────
    scrollTl.to(
      deck,
      { opacity: 1, pointerEvents: "auto", duration: 0.03 },
      0.66,
    );

    if (window.innerWidth < 1024) {
      const mX = [-40, 40, -40];
      const mY = [-120, 0, 120];
      const mR = [-8, 0, 8];
      deckCards.forEach((dc, i) => {
        scrollTl.fromTo(
          dc,
          { opacity: 0, scale: 0.5, rotation: 0, x: 0, y: 0 },
          {
            opacity: 1,
            scale: 1,
            rotation: mR[i],
            x: mX[i],
            y: mY[i],
            duration: 0.34,
            ease: "power3.out",
          },
          0.68 + i * 0.03,
        );
      });
    } else {
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
    }

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
                {/* Glow */}
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

                {/* Accent bar */}
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
                  {/* Top row — fades during stack */}
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

                  {/* Label + area — animated to center + bigger during stack */}
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

        {/* Deck */}
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
                  background: isDark ? pack.darkBg : pack.lightBg,
                  border: `1px solid ${pack.color}44`,
                  boxShadow: `0 12px 40px rgba(0,0,0,${isDark ? 0.5 : 0.15}), 0 0 0 1px ${pack.color}15`,
                }}
              >
                <div
                  className="absolute top-0 left-0 right-0 h-[2px]"
                  style={{
                    background: `linear-gradient(90deg, ${pack.color}, ${pack.color}00)`,
                  }}
                />
                <div className="text-center">
                  <span
                    className="text-[0.5rem] sm:text-[0.56rem] font-black tracking-[0.42em] uppercase block mb-1.5"
                    style={{ color: `${pack.color}55` }}
                  >
                    Pack
                  </span>
                  <span
                    className="text-[clamp(1.6rem,3.5vw,2.4rem)] font-black leading-none tracking-tight block"
                    style={{ color: pack.color }}
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
