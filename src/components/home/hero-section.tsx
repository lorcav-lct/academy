"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { smoothScrollTo } from "@/lib/scroll";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { HeroSlide, DEFAULT_HERO_SLIDES } from "@/lib/constants/hero-slides";
import { VideoBlockMux } from "@/components/shared/video-block-mux";

const MUX_PLAYBACK_ID = "czjfcHxFBiCTiw8gH9nw8Cx7fU02XPsRIgG6P4j00012cE";

/* ──────────────────────────────────────────────────────────────
   SplitLine — char-by-char reveal (overflow:hidden per char)
─────────────────────────────────────────────────────────────── */
function SplitLine({
  text,
  className,
  style,
}: {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span className={`block leading-[0.92] ${className ?? ""}`} style={style}>
      {text.split("").map((ch, i) => (
        <span
          key={i}
          className="inline-block"
          style={{ overflow: "hidden", verticalAlign: "bottom" }}
        >
          <span data-char className="inline-block">
            {ch === " " ? "\u00A0" : ch}
          </span>
        </span>
      ))}
    </span>
  );
}

/* ──────────────────────────────────────────────────────────────
   StaticGrid — orange grid, static, no flicker
   Parent controls opacity/scale via GSAP on ref.
─────────────────────────────────────────────────────────────── */
function StaticGrid({
  gridRef,
}: {
  gridRef?: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={gridRef}
      className="pointer-events-none absolute inset-0"
      style={{ transformOrigin: "center center" }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(240,146,38,0.25) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(240,146,38,0.25) 1px, transparent 1px)",
          backgroundSize: "88px 88px",
          // Circular vignette: center cleared, grid visible toward corners/edges
          maskImage:
            "radial-gradient(ellipse 60% 58% at 50% 50%, transparent 0%, transparent 55%, rgba(0,0,0,0.4) 72%, black 88%, black 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 60% 58% at 50% 50%, transparent 0%, transparent 55%, rgba(0,0,0,0.4) 72%, black 88%, black 100%)",
        }}
      />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   CountUp — animates from 0 → to when `active` flips true
─────────────────────────────────────────────────────────────── */
function CountUp({
  to,
  duration = 1.4,
  className,
  style,
  active,
}: {
  to: number;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
  active: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!active || !ref.current) return;
    const obj = { v: 0 };
    const tween = gsap.to(obj, {
      v: to,
      duration,
      ease: "power3.out",
      onUpdate: () => {
        if (ref.current) ref.current.textContent = Math.round(obj.v).toString();
      },
    });
    return () => {
      tween.kill();
    };
  }, [active, to, duration]);

  return (
    <span ref={ref} className={className} style={style}>
      0
    </span>
  );
}

/* ──────────────────────────────────────────────────────────────
   HeroSection — full-bleed cinematic, 4 pinned states, sticky CTA
─────────────────────────────────────────────────────────────── */
export function HeroSection({
  slides = DEFAULT_HERO_SLIDES,
}: {
  slides?: HeroSlide[];
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  // Background layers
  const videoLayerRef = useRef<HTMLDivElement>(null);
  const videoOverlayRef = useRef<HTMLDivElement>(null);
  const slideBgRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // State layers (absolute-positioned, stacked)
  const s0Ref = useRef<HTMLDivElement>(null);
  const s1Ref = useRef<HTMLDivElement>(null);
  const s2Ref = useRef<HTMLDivElement>(null);
  const s3Ref = useRef<HTMLDivElement>(null);

  // S0 inner refs (for char animation + slide transitions)
  const line1Ref = useRef<HTMLDivElement>(null);
  const line2Ref = useRef<HTMLDivElement>(null);
  const slideContentRef = useRef<HTMLDivElement>(null);

  // CTA band sticky
  const ctaBandRef = useRef<HTMLDivElement>(null);
  const ctaPrimaryRef = useRef<HTMLAnchorElement>(null);

  // Slider
  const [activeIdx, setActiveIdx] = useState(0);
  const activeIdxRef = useRef(0);
  const isTransitioning = useRef(false);
  const sliderActive = useRef(true);

  const [countActive, setCountActive] = useState(false);
  const countFiredRef = useRef(false);
  // Mobile-only: triggered when the numbers section enters viewport
  const [mobileCountActive, setMobileCountActive] = useState(false);
  const mobileP3Ref = useRef<HTMLDivElement>(null);
  // Current panel index (0..3) for the desktop progress/skip control
  const [stageIdx, setStageIdx] = useState(0);
  const stageIdxRef = useRef(0);

  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  /* ── Lock body scroll + close on Escape when video modal open ── */
  useEffect(() => {
    if (!videoModalOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setVideoModalOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [videoModalOpen]);

  /* ── Viewport + reduced motion detection ─────────────────── */
  useEffect(() => {
    const mqD = window.matchMedia("(min-width: 1024px)");
    const mqR = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsDesktop(mqD.matches);
    setIsReducedMotion(mqR.matches);
    const onD = () => setIsDesktop(mqD.matches);
    const onR = () => setIsReducedMotion(mqR.matches);
    mqD.addEventListener("change", onD);
    mqR.addEventListener("change", onR);
    return () => {
      mqD.removeEventListener("change", onD);
      mqR.removeEventListener("change", onR);
    };
  }, []);

  /* ── Slide transition ───────────────────────────────────── */
  const goToSlide = useCallback((idx: number) => {
    if (isTransitioning.current || idx === activeIdxRef.current) return;
    if (!slideContentRef.current) return;
    isTransitioning.current = true;
    gsap.to(slideContentRef.current, {
      opacity: 0,
      y: -12,
      duration: 0.32,
      ease: "power2.in",
      onComplete: () => {
        activeIdxRef.current = idx;
        setActiveIdx(idx);
        requestAnimationFrame(() => {
          gsap.fromTo(
            slideContentRef.current,
            { opacity: 0, y: 16 },
            {
              opacity: 1,
              y: 0,
              duration: 0.52,
              ease: "power2.out",
              onComplete: () => {
                isTransitioning.current = false;
              },
            },
          );
        });
      },
    });
  }, []);

  /* ── Prev / next helpers ─────────────────────────────── */
  const nextSlide = useCallback(() => {
    goToSlide((activeIdxRef.current + 1) % slides.length);
  }, [goToSlide, slides.length]);

  const prevSlide = useCallback(() => {
    goToSlide((activeIdxRef.current - 1 + slides.length) % slides.length);
  }, [goToSlide, slides.length]);

  /* ── Swipe handlers for slider panel (pointer events: mouse + touch) ── */
  const dragStartXRef = useRef<number | null>(null);
  const dragActiveRef = useRef(false);

  const onSliderPointerDown = useCallback((e: React.PointerEvent) => {
    // Ignore interactive children (buttons, links)
    const target = e.target as HTMLElement;
    if (target.closest("button, a, [data-no-swipe]")) return;
    dragStartXRef.current = e.clientX;
    dragActiveRef.current = true;
  }, []);

  const onSliderPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!dragActiveRef.current) return;
      const startX = dragStartXRef.current;
      dragActiveRef.current = false;
      dragStartXRef.current = null;
      if (startX == null) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) < 48) return;
      if (dx < 0) nextSlide();
      else prevSlide();
    },
    [nextSlide, prevSlide],
  );

  const onSliderPointerCancel = useCallback(() => {
    dragActiveRef.current = false;
    dragStartXRef.current = null;
  }, []);

  /* ── Slider autoplay (only during state 0) ──────────────── */
  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(() => {
      if (sliderActive.current && !isTransitioning.current) {
        goToSlide((activeIdxRef.current + 1) % slides.length);
      }
    }, 6600);
    return () => clearInterval(id);
  }, [slides.length, goToSlide]);

  /* ── GSAP orchestration: intro + per-panel reveals + count-up ── */
  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    gsap.config({ nullTargetWarn: false });
    const STg = ScrollTrigger as typeof ScrollTrigger & {
      __refreshPatched?: boolean;
    };
    if (!STg.__refreshPatched) {
      const orig = STg.refresh.bind(STg);
      STg.refresh = ((...args: Parameters<typeof STg.refresh>) => {
        try {
          return orig(...args);
        } catch (e) {
          if (process.env.NODE_ENV !== "production") {
            console.warn("[ScrollTrigger] refresh skipped (DOM race)", e);
          }
          return undefined as unknown as ReturnType<typeof STg.refresh>;
        }
      }) as typeof STg.refresh;
      STg.__refreshPatched = true;
    }

    countFiredRef.current = false;

    const ctx = gsap.context(() => {
      /* ── Entrance timeline (always) ─────────────────────── */
      const chars1 = line1Ref.current?.querySelectorAll("[data-char]");
      const chars2 = line2Ref.current?.querySelectorAll("[data-char]");

      const intro = gsap.timeline({ delay: 0.1 });

      if (chars1?.length) {
        intro.from(chars1, {
          y: "108%",
          duration: 0.8,
          stagger: 0.022,
          ease: "power3.out",
        });
      }
      if (chars2?.length) {
        intro.from(
          chars2,
          { y: "108%", duration: 0.8, stagger: 0.022, ease: "power3.out" },
          "-=0.55",
        );
      }
      intro.from(
        s0Ref.current?.querySelectorAll("[data-s0-sub]") ?? [],
        {
          opacity: 0,
          y: 18,
          duration: 0.55,
          stagger: 0.11,
          ease: "power2.out",
        },
        "-=0.35",
      );
      intro.from(
        ctaBandRef.current,
        { opacity: 0, y: 26, duration: 0.7, ease: "power3.out" },
        "-=0.45",
      );

      if (!isDesktop || isReducedMotion) return;

      /* ── Per-panel scroll-triggered reveals ────────────────
         Each panel reveals its [data-reveal] children when it
         enters the viewport. Reverse animation on scroll-up. */
      const setupReveal = (panelEl: HTMLDivElement | null) => {
        if (!panelEl) return;
        const targets = panelEl.querySelectorAll("[data-reveal]");
        if (!targets.length) return;
        gsap.set(targets, { opacity: 0, y: 30 });
        ScrollTrigger.create({
          trigger: panelEl,
          start: "top 75%",
          end: "bottom top",
          onEnter: () => {
            gsap.to(targets, {
              opacity: 1,
              y: 0,
              duration: 0.7,
              stagger: 0.08,
              ease: "power3.out",
              overwrite: "auto",
            });
          },
          onLeaveBack: () => {
            gsap.to(targets, {
              opacity: 0,
              y: 30,
              duration: 0.4,
              ease: "power2.in",
              overwrite: "auto",
            });
          },
        });
      };

      setupReveal(s1Ref.current);
      setupReveal(s2Ref.current);
      setupReveal(s3Ref.current);

      /* ── Count-up trigger when numbers panel (s2) enters ── */
      if (s2Ref.current) {
        ScrollTrigger.create({
          trigger: s2Ref.current,
          start: "top 70%",
          once: true,
          onEnter: () => {
            countFiredRef.current = true;
            setCountActive(true);
          },
        });
      }

      /* ── Track active panel for progress + slider autoplay + video bg ──
         Stage A's video bg fades in only during Panels 2 (metodo) and 3
         (numeri); fades out during Panels 1 (slider) and 4 (cert). */
      const panelRefs = [s0Ref, s1Ref, s2Ref, s3Ref];
      panelRefs.forEach((ref, idx) => {
        if (!ref.current) return;
        ScrollTrigger.create({
          trigger: ref.current,
          start: "top center",
          end: "bottom center",
          onToggle: (self) => {
            if (self.isActive) {
              stageIdxRef.current = idx;
              setStageIdx(idx);
              sliderActive.current = idx === 0;
              const targetOpacity = idx === 1 || idx === 2 ? 1 : 0;
              if (videoLayerRef.current) {
                gsap.to(videoLayerRef.current, {
                  opacity: targetOpacity,
                  duration: 0.5,
                  ease: "power2.inOut",
                  overwrite: "auto",
                });
              }
            }
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [isReducedMotion, isDesktop]);

  /* ── Mobile numbers — scroll-triggered count-up + stagger ─── */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isDesktop) return;

    if (isReducedMotion) {
      setMobileCountActive(true);
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    const root = mobileP3Ref.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const rows = root.querySelectorAll<HTMLElement>("[data-mobile-kpi]");
      if (rows.length === 0) return;

      gsap.set(rows, { opacity: 0, y: 30 });

      ScrollTrigger.create({
        trigger: root,
        start: "top 80%",
        once: true,
        invalidateOnRefresh: true,
        onEnter: () => {
          setMobileCountActive(true);
          gsap.to(rows, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.14,
            ease: "power3.out",
          });
        },
      });
    }, root);

    return () => ctx.revert();
  }, [isDesktop, isReducedMotion]);

  /* ── Global ScrollTrigger refresh after viewport/layout settles ──
     Fixes stale positions that cause downstream sections (e.g. #perche)
     to never trigger their own onEnter callbacks.
     Deferred via rAF + mount guard to avoid running during React
     reconciliation (prevents "insertBefore ... no longer a child"). */
  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);
    let mounted = true;
    let rafId = 0;
    const refresh = () => {
      if (!mounted) return;
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (!mounted) return;
        ScrollTrigger.refresh();
      });
    };
    const t1 = setTimeout(refresh, 300);
    const t2 = setTimeout(refresh, 1200);
    window.addEventListener("load", refresh);
    return () => {
      mounted = false;
      cancelAnimationFrame(rafId);
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("load", refresh);
    };
  }, [isDesktop, isReducedMotion]);

  const slide = slides[activeIdx] ?? slides[0];

  /* ──────────────────────────────────────────────────────────
     DESKTOP — sticky bg + naturally-scrolling panels + sticky CTA
  ────────────────────────────────────────────────────────── */
  const desktopStage = (
    <>
      {/* ══ STAGE A — sticky bg (dark base + video layer + brackets + top gradient) ══
          Stays pinned to viewport while user scrolls through panels.
          Video is fixed bg for Panels 2+3, opacity 0 elsewhere. */}
      <div
        ref={stageRef}
        className="sticky top-0 h-screen w-full overflow-hidden pointer-events-none"
        style={{ background: "#111111", zIndex: 0 }}
      >
        {/* Video layer (fixed bg, opacity controlled by scroll).
            Short MP4 loop, blurred + grain to soften compression artifacts. */}
        <div
          ref={videoLayerRef}
          className="absolute inset-0 overflow-hidden"
          style={{ opacity: 0 }}
        >
          <video
            src="/videos/hero-bg-loop.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            style={{
              transform: "scale(1.06)",
              filter: "blur(5px) saturate(1.08) brightness(1.02)",
            }}
          />
          {/* Film grain — masks low-res artifacts, adds cinematic texture */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.85'/></svg>\")",
              backgroundSize: "240px 240px",
              opacity: 0.18,
              mixBlendMode: "overlay",
            }}
          />
          <div
            ref={videoOverlayRef}
            className="absolute inset-0"
            style={{ background: "rgba(17,17,17,0.7)" }}
          />
        </div>

        {/* Top navbar-safe gradient */}
        <div
          className="absolute inset-x-0 top-0 h-32"
          style={{
            background:
              "linear-gradient(to bottom, rgba(17,17,17,0.85) 0%, rgba(17,17,17,0.5) 60%, transparent 100%)",
          }}
        />

        {/* Corner brackets (chrome) */}
        {[
          "top-8 left-8 border-t border-l",
          "top-8 right-8 border-t border-r",
          "bottom-32 left-8 border-b border-l",
          "bottom-32 right-8 border-b border-r",
        ].map((cls) => (
          <div
            key={cls}
            className={`absolute w-8 h-8 ${cls}`}
            style={{ borderColor: "rgba(240,146,38,0.35)" }}
          />
        ))}
      </div>

      {/* ══ STAGE A2 — sticky grid overlay (always above panels, below CTA) ══
          Single source of truth for the orange grid backdrop. Pointer-events
          disabled so panel interactions still work. */}
      <div
        className="sticky top-0 h-screen w-full overflow-hidden pointer-events-none"
        style={{ marginTop: "-100vh", zIndex: 20 }}
      >
        <StaticGrid gridRef={gridRef} />
      </div>

      {/* ══ PANELS — natural vertical scroll, pulled up to overlap Stage A ══ */}
      <div
        className="relative w-full"
        style={{ marginTop: "-100vh", zIndex: 10 }}
      >
        {/* ──── PANEL 1 — SLIDER ──── */}
        <div
          ref={s0Ref}
          className="relative w-full min-h-screen overflow-hidden select-none"
          style={{ touchAction: "pan-y" }}
          onPointerDown={onSliderPointerDown}
          onPointerUp={onSliderPointerUp}
          onPointerCancel={onSliderPointerCancel}
        >
          {/* Slide bg image (per-slide, full-bleed) */}
          <div
            ref={slideBgRef}
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: slide.bg_image_url
                ? `url(${slide.bg_image_url})`
                : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: slide.bg_image_url ? 1 : 0,
            }}
          >
            {slide.bg_image_url && (
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(17,17,17,0.7) 0%, rgba(17,17,17,0.55) 45%, rgba(17,17,17,0.9) 100%)",
                }}
              />
            )}
          </div>

          {/* Inner 1440 stage — holds arrows + title content */}
          <div
            className="relative z-10 w-full max-w-[1440px] mx-auto px-10 flex flex-col items-center justify-center"
            style={{
              minHeight: "100vh",
              paddingTop: "120px",
              paddingBottom: "200px",
            }}
          >
            {/* Prev / Next arrows (desktop) */}
            {slides.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevSlide}
                  data-no-swipe
                  aria-label="Slide precedente"
                  className="group absolute left-4 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center transition-colors"
                  style={{
                    width: "52px",
                    height: "52px",
                    border: "1.5px solid rgba(255,255,255,0.25)",
                    background: "rgba(17,17,17,0.35)",
                    backdropFilter: "blur(6px)",
                    color: "rgba(255,255,255,0.9)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor =
                      "#F09226";
                    (e.currentTarget as HTMLElement).style.color = "#F09226";
                    (e.currentTarget as HTMLElement).style.background =
                      "rgba(240,146,38,0.12)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor =
                      "rgba(255,255,255,0.25)";
                    (e.currentTarget as HTMLElement).style.color =
                      "rgba(255,255,255,0.9)";
                    (e.currentTarget as HTMLElement).style.background =
                      "rgba(17,17,17,0.35)";
                  }}
                >
                  <svg
                    viewBox="0 0 16 16"
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                  >
                    <path d="M11 3L5 8l6 5" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  data-no-swipe
                  aria-label="Slide successiva"
                  className="group absolute right-4 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center transition-colors"
                  style={{
                    width: "52px",
                    height: "52px",
                    border: "1.5px solid rgba(255,255,255,0.25)",
                    background: "rgba(17,17,17,0.35)",
                    backdropFilter: "blur(6px)",
                    color: "rgba(255,255,255,0.9)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor =
                      "#F09226";
                    (e.currentTarget as HTMLElement).style.color = "#F09226";
                    (e.currentTarget as HTMLElement).style.background =
                      "rgba(240,146,38,0.12)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor =
                      "rgba(255,255,255,0.25)";
                    (e.currentTarget as HTMLElement).style.color =
                      "rgba(255,255,255,0.9)";
                    (e.currentTarget as HTMLElement).style.background =
                      "rgba(17,17,17,0.35)";
                  }}
                >
                  <svg
                    viewBox="0 0 16 16"
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                  >
                    <path d="M5 3l6 5-6 5" />
                  </svg>
                </button>
              </>
            )}

            {/* Title (split reveal) + description */}
            <div ref={slideContentRef} className="text-center">
              <div ref={line1Ref}>
                <SplitLine
                  text={slide.title_white}
                  className="text-[clamp(3.2rem,7.2vw,8rem)] font-black tracking-[-0.035em]"
                  style={{ color: "#ffffff" }}
                />
              </div>
              <div ref={line2Ref} className="mt-1">
                <SplitLine
                  text={slide.title_orange}
                  className="text-[clamp(3.2rem,7.2vw,8rem)] font-black tracking-[-0.035em]"
                  style={{ color: "#F09226" }}
                />
              </div>
              <p
                data-s0-sub
                className="mx-auto mt-8 max-w-2xl text-[clamp(0.95rem,1.15vw,1.1rem)] leading-[1.7]"
                style={{ color: "rgba(220,215,230,0.82)" }}
              >
                {slide.description}
              </p>
            </div>
          </div>
          {/* /inner 1440 stage */}

          {/* Bottom bar: slide dots (above CTA band) */}
          <div
            data-s0-sub
            className="absolute z-10 left-0 right-0 px-10 max-w-[1440px] mx-auto flex items-center justify-end"
            style={{ bottom: "220px" }}
          >
            {slides.length > 1 && (
              <div className="flex items-center gap-2">
                <span
                  className="text-[0.65rem] font-bold tracking-[0.25em] uppercase mr-2"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  {String(activeIdx + 1).padStart(2, "0")} /{" "}
                  {String(slides.length).padStart(2, "0")}
                </span>
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goToSlide(i)}
                    aria-label={`Slide ${i + 1}`}
                    aria-current={i === activeIdx}
                    className="transition-all duration-300 focus-visible:outline-none"
                    style={{
                      height: "3px",
                      width: i === activeIdx ? "28px" : "10px",
                      background:
                        i === activeIdx ? "#F09226" : "rgba(255,255,255,0.22)",
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ──── PANEL 2 — METODO (transparent: Stage A video + Stage A2 grid) ──── */}
        <div
          ref={s1Ref}
          className="relative w-full min-h-screen overflow-hidden"
        >
          {/* Inner 1440 stage */}
          <div
            className="relative z-10 w-full max-w-[1440px] mx-auto px-10 flex flex-col items-center justify-center"
            style={{
              minHeight: "100vh",
              paddingTop: "120px",
              paddingBottom: "200px",
            }}
          >
            <span
              data-reveal
              className="text-[0.72rem] font-black tracking-[0.34em] uppercase mb-8"
              style={{ color: "#F09226" }}
            >
              — Il Metodo
            </span>
            <div className="text-center max-w-5xl">
              <div
                data-reveal
                className="text-[clamp(2.6rem,6.2vw,6.8rem)] font-black tracking-[-0.035em] leading-[0.96]"
                style={{ color: "#ffffff" }}
              >
                FORMIAMO CHI
              </div>
              <div
                data-reveal
                className="text-[clamp(2.6rem,6.2vw,6.8rem)] font-black tracking-[-0.035em] leading-[0.96] mt-1"
                style={{ color: "#F09226" }}
              >
                CAMBIA IL FITNESS.
              </div>
              <p
                data-reveal
                className="mx-auto mt-10 max-w-2xl text-[clamp(0.95rem,1.15vw,1.08rem)] leading-[1.7]"
                style={{ color: "rgba(255,255,255,0.95)" }}
              >
                9 mesi in presenza. 33+ docenti. 8 masterclass specialistiche.
                <br />
                Un percorso progettato come una squadra professionistica.
              </p>
            </div>
          </div>
        </div>

        {/* ──── PANEL 3 — NUMERI (transparent: Stage A video + Stage A2 grid) ──── */}
        <div
          ref={s2Ref}
          className="relative w-full min-h-screen overflow-hidden"
        >
          {/* Inner 1600 stage */}
          <div
            className="relative z-10 w-full max-w-[1600px] mx-auto px-10 flex flex-col items-center justify-center"
            style={{
              minHeight: "100vh",
              paddingTop: "120px",
              paddingBottom: "200px",
            }}
          >
            <span
              data-reveal
              className="text-[0.72rem] font-black tracking-[0.34em] uppercase mb-10"
              style={{ color: "#F09226" }}
            >
              — I Numeri che Ti Aspettano
            </span>

            <div className="grid grid-cols-3 gap-10 w-full items-center">
              {/* 9 MESI */}
              <div
                data-reveal
                className="flex flex-col items-center text-center"
              >
                <div className="relative">
                  <CountUp
                    to={9}
                    duration={1.4}
                    active={countActive}
                    className="font-black leading-[0.85] tabular-nums"
                    style={{
                      color: "#F09226",
                      fontSize: "clamp(8rem, 18vw, 18rem)",
                      textShadow: "0 0 60px rgba(240,146,38,0.25)",
                    }}
                  />
                  <span
                    className="absolute -top-4 -right-6 text-[0.75rem] font-black tracking-[0.3em]"
                    style={{ color: "rgba(240,146,38,0.5)" }}
                  >
                    01
                  </span>
                </div>
                <span
                  className="mt-4 text-[0.82rem] font-black tracking-[0.32em] uppercase"
                  style={{ color: "#ffffff" }}
                >
                  Mesi Formativi
                </span>
                <span
                  className="mt-1 text-[0.68rem] tracking-[0.22em] uppercase"
                  style={{ color: "#ffffff" }}
                >
                  In Presenza
                </span>
              </div>

              {/* 100% */}
              <div
                data-reveal
                className="flex flex-col items-center text-center"
              >
                <div className="relative flex items-baseline">
                  <CountUp
                    to={100}
                    duration={1.8}
                    active={countActive}
                    className="font-black leading-[0.85] tabular-nums"
                    style={{
                      color: "#ffffff",
                      fontSize: "clamp(8rem, 18vw, 18rem)",
                      textShadow: "0 0 60px rgba(255,255,255,0.15)",
                    }}
                  />
                  <span
                    className="font-black leading-[0.85]"
                    style={{
                      color: "#F09226",
                      fontSize: "clamp(4rem, 9vw, 9rem)",
                    }}
                  >
                    %
                  </span>
                  <span
                    className="absolute -top-4 -right-6 text-[0.75rem] font-black tracking-[0.3em]"
                    style={{ color: "rgba(240,146,38,0.5)" }}
                  >
                    02
                  </span>
                </div>
                <span
                  className="mt-4 text-[0.82rem] font-black tracking-[0.32em] uppercase"
                  style={{ color: "#ffffff" }}
                >
                  In Presenza
                </span>
                <span
                  className="mt-1 text-[0.68rem] tracking-[0.22em] uppercase"
                  style={{ color: "#ffffff" }}
                >
                  Zero DAD, Zero Scuse
                </span>
              </div>

              {/* 8 MASTERCLASS */}
              <div
                data-reveal
                className="flex flex-col items-center text-center"
              >
                <div className="relative">
                  <CountUp
                    to={8}
                    duration={1.2}
                    active={countActive}
                    className="font-black leading-[0.85] tabular-nums"
                    style={{
                      color: "#ffffff",
                      fontSize: "clamp(8rem, 18vw, 18rem)",
                      textShadow: "0 0 60px rgba(255,255,255,0.15)",
                    }}
                  />
                  <span
                    className="absolute -top-4 -right-6 text-[0.75rem] font-black tracking-[0.3em]"
                    style={{ color: "rgba(240,146,38,0.5)" }}
                  >
                    03
                  </span>
                </div>
                <span
                  className="mt-4 text-[0.82rem] font-black tracking-[0.32em] uppercase"
                  style={{ color: "#ffffff" }}
                >
                  Masterclass
                </span>
                <span
                  className="mt-1 text-[0.68rem] tracking-[0.22em] uppercase"
                  style={{ color: "#ffffff" }}
                >
                  Specialistiche
                </span>
              </div>
            </div>
          </div>
          {/* /inner 1600 stage */}
        </div>

        {/* ──── PANEL 4 — DUE CERTIFICAZIONI (own video bg + spotlight; grid via Stage A2) ──── */}
        <div
          ref={s3Ref}
          className="relative w-full min-h-screen overflow-hidden"
        >
          {/* Cert-specific Vimeo bg + dark tint + spotlight (NO grid: handled by Stage A2) */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
          >
            <iframe
              src="https://player.vimeo.com/video/1188018710?background=1&autoplay=1&loop=1&muted=1&quality=360p&dnt=1"
              title="Due Certificazioni background"
              loading="lazy"
              allow="autoplay; fullscreen"
              suppressHydrationWarning
              className="absolute left-1/2 top-1/2 min-h-full min-w-full"
              style={{
                aspectRatio: "16 / 9",
                border: 0,
                filter: "blur(14px) brightness(0.6) saturate(1.05)",
                transform: "translate(-50%, -50%) scale(1.08)",
              }}
            />
            {/* Dark tint */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(135deg, rgba(10,10,14,0.6) 0%, rgba(10,10,14,0.82) 100%)",
              }}
            />
            {/* Spotlight radiale al centro per dare risalto alle card */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 55% 55% at 50% 50%, rgba(240,146,38,0.08) 0%, transparent 60%)",
              }}
            />
          </div>

          {/* Inner 1440 stage */}
          <div
            className="relative z-10 flex w-full max-w-[1440px] flex-col items-center px-10 mx-auto justify-center"
            style={{
              minHeight: "100vh",
              paddingTop: "120px",
              paddingBottom: "200px",
            }}
          >
            <span
              data-reveal
              className="text-[0.72rem] font-black tracking-[0.34em] uppercase mb-6"
              style={{ color: "rgba(240,146,38,0.85)" }}
            >
              — Le Certificazioni
            </span>

            {/* Title */}
            <div className="text-center">
              <div
                data-reveal
                className="text-[clamp(2.4rem,5.4vw,5.6rem)] font-black tracking-[-0.03em] leading-[0.95]"
                style={{ color: "#ffffff" }}
              >
                Esci dal percorso{" "}
                <span style={{ color: "#F09226" }}>certificato.</span>
              </div>
              <p
                data-reveal
                className="mx-auto mt-6 max-w-3xl text-[clamp(0.95rem,1.1vw,1.05rem)] leading-[1.7]"
                style={{ color: "rgba(255,255,255,0.85)" }}
              >
                Tre riconoscimenti che fanno la differenza:{" "}
                <strong>Functional Strength Master Trainer</strong> rilasciato
                da CSEN e <strong>2.0 CEU NSCA</strong> di valore internazionale
                — inclusi in tutti i pack. Con PRO ed ELITE ottieni anche il{" "}
                <strong>Personal Trainer FIPE</strong>, il titolo che apre le
                porte del mercato professionale del fitness in Italia e
                all&apos;estero.
              </p>
            </div>

            {/* Logo row — 3 real issuer logos */}
            <div
              data-reveal
              className="mt-10 flex items-center justify-center gap-6 md:gap-10"
              aria-label="Enti riconoscitori"
            >
              {[
                {
                  src: "/certificazioni/fsmt.webp",
                  label: "Functional Strength Master Trainer",
                },
                { src: "/certificazioni/csen.webp", label: "CSEN" },
                { src: "/certificazioni/fipe.webp", label: "FIPE" },
                { src: "/certificazioni/nsca.webp", label: "NSCA" },
              ].map((logo) => (
                <Image
                  key={logo.label}
                  src={logo.src}
                  alt={logo.label}
                  title={logo.label}
                  width={160}
                  height={160}
                  className="h-20 w-20 md:h-28 md:w-28 lg:h-32 lg:w-32 object-contain"
                />
              ))}
            </div>

            {/* Two-cert grid */}
            <div
              data-reveal
              className="relative z-10 mt-10 grid grid-cols-2 gap-5 w-full max-w-5xl"
            >
              {/* Cert 1 — Master Trainer (CSEN) */}
              <div
                className="flex flex-col gap-4 p-7"
                style={{
                  background: "rgba(255,255,255,0.025)",
                  border: "1.5px solid rgba(240,146,38,0.35)",
                }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-[0.6rem] font-black tracking-[0.28em] uppercase"
                    style={{ color: "rgba(240,146,38,0.85)" }}
                  >
                    01 · Nazionale
                  </span>
                  <span
                    className="text-[0.55rem] font-black tracking-[0.22em] uppercase px-2 py-1"
                    style={{
                      color: "#F09226",
                      background: "rgba(240,146,38,0.12)",
                      border: "1px solid rgba(240,146,38,0.35)",
                    }}
                  >
                    Tutti i pack
                  </span>
                </div>
                <div
                  className="text-[clamp(1.1rem,1.55vw,1.6rem)] font-black tracking-[-0.02em] leading-[1.05]"
                  style={{ color: "#ffffff" }}
                >
                  Functional Strength
                  <br />
                  <span style={{ color: "#F09226" }}>Master Trainer</span>
                </div>
                <p
                  className="text-[0.7rem] font-black tracking-[0.22em] uppercase"
                  style={{ color: "rgba(240,146,38,0.85)" }}
                >
                  Rilasciata da CSEN
                </p>
                <p
                  className="text-[0.85rem] leading-[1.6]"
                  style={{ color: "rgba(255,255,255,0.78)" }}
                >
                  Diploma da Istruttore CSEN con Tesserino tecnico e iscrizione
                  nell&apos;albo nazionale degli istruttori sportivi. Spendibile
                  immediatamente in palestre, studi e centri fitness.
                </p>
              </div>

              {/* Cert 2 — Personal Trainer FIPE */}
              <div
                className="flex flex-col gap-4 p-7"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(240,146,38,0.16) 0%, rgba(240,146,38,0.04) 100%)",
                  border: "2px solid rgba(240,146,38,0.7)",
                  boxShadow: "0 0 32px rgba(240,146,38,0.18)",
                }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-[0.6rem] font-black tracking-[0.28em] uppercase"
                    style={{ color: "#F09226" }}
                  >
                    02 · Internazionale
                  </span>
                  <span
                    className="text-[0.55rem] font-black tracking-[0.22em] uppercase px-2 py-1"
                    style={{
                      color: "#111111",
                      background: "#F09226",
                    }}
                  >
                    PRO &amp; ELITE
                  </span>
                </div>
                <div
                  className="text-[clamp(1.1rem,1.55vw,1.6rem)] font-black tracking-[-0.02em] leading-[1.05]"
                  style={{ color: "#ffffff" }}
                >
                  Personal Trainer
                  <br />
                  <span style={{ color: "#F09226" }}>FIPE</span>
                </div>
                <p
                  className="text-[0.7rem] font-black tracking-[0.22em] uppercase"
                  style={{ color: "#F09226" }}
                >
                  Rilasciata da FIPE
                </p>
                <p
                  className="text-[0.85rem] leading-[1.6]"
                  style={{ color: "rgba(255,255,255,0.85)" }}
                >
                  Certificazione ufficiale della Federazione Italiana Pesistica.
                  Specializzazione avanzata su Strength &amp; Conditioning,
                  programmazione avanzata della forza e applicazioni multi-sport
                  — con supporto diretto dei docenti FIPE.
                </p>
                <ul className="mt-1 flex flex-col gap-1.5">
                  {[
                    "Iscrizione registro nazionale FIPE",
                    "Valida in Italia e all'estero",
                    "Standard internazionali di programmazione forza",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-[0.78rem] leading-[1.5]"
                      style={{ color: "rgba(255,255,255,0.78)" }}
                    >
                      <span
                        className="shrink-0 mt-1.5 h-1 w-1"
                        style={{ background: "#F09226" }}
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* NSCA full-width endorsement strip — muted dark, orange only on +2.0 CEU */}
            <div
              data-reveal
              className="relative z-10 mt-5 w-full max-w-5xl overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <div
                className="absolute left-0 top-0 h-full w-1"
                style={{ background: "rgba(255,255,255,0.2)" }}
                aria-hidden
              />
              <div className="relative flex items-center gap-7 px-8 py-6">
                <Image
                  src="/certificazioni/nsca.webp"
                  alt="NSCA — National Strength and Conditioning Association"
                  width={120}
                  height={120}
                  className="shrink-0 h-24 w-24 object-contain"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-1.5">
                    <span
                      className="text-[0.62rem] font-black tracking-[0.3em] uppercase"
                      style={{ color: "rgba(255,255,255,0.6)" }}
                    >
                      Riconoscimento Internazionale
                    </span>
                    <span
                      className="text-[0.55rem] font-black tracking-[0.22em] uppercase px-2 py-1"
                      style={{
                        color: "rgba(255,255,255,0.75)",
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.14)",
                      }}
                    >
                      Tutti i pack
                    </span>
                  </div>
                  <h4
                    className="font-black tracking-[-0.02em] leading-[1.05] text-white"
                    style={{ fontSize: "clamp(1.2rem, 2vw, 1.7rem)" }}
                  >
                    NSCA CEU Provider ·{" "}
                    <span style={{ color: "#F09226" }}>+2.0 CEU</span>
                  </h4>
                  <p
                    className="mt-2 text-[0.88rem] leading-[1.55]"
                    style={{ color: "rgba(255,255,255,0.72)" }}
                  >
                    Lacertosus Academy è ufficialmente riconosciuta come{" "}
                    <strong>NSCA CEU Provider</strong>. Il percorso vale{" "}
                    <strong>2.0 CEU</strong> validi per il mantenimento delle
                    certificazioni NSCA e per la spendibilità internazionale.
                  </p>
                </div>
                <div
                  className="hidden md:flex flex-col items-center justify-center shrink-0 pl-6"
                  style={{
                    borderLeft: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <span
                    className="text-[2.6rem] font-black leading-none tabular-nums"
                    style={{ color: "#F09226" }}
                  >
                    2.0
                  </span>
                  <span
                    className="mt-1 text-[0.55rem] font-black tracking-[0.26em] uppercase"
                    style={{ color: "rgba(255,255,255,0.72)" }}
                  >
                    CEU NSCA
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ STAGE B — sticky CTA band at viewport bottom ══ */}
      <div
        ref={ctaBandRef}
        className="sticky left-0 right-0 w-full"
        style={{
          bottom: 0,
          zIndex: 30,
          background:
            "linear-gradient(to top, rgba(17,17,17,0.97) 0%, rgba(17,17,17,0.85) 55%, rgba(17,17,17,0.3) 90%, transparent 100%)",
          paddingTop: "48px",
          paddingBottom: "32px",
        }}
      >
        <div className="w-full px-6 md:px-10">
          {/* Top meta row */}
          <div className="flex items-center justify-center mb-5">
            <div className="flex items-center gap-3">
              <span
                className="h-2 w-2 rounded-full animate-pulse"
                style={{
                  background: "#F09226",
                  boxShadow: "0 0 10px rgba(240,146,38,0.9)",
                }}
              />
              <span
                className="text-[0.72rem] font-black tracking-[0.32em] uppercase"
                style={{ color: "rgba(240,146,38,0.85)" }}
              >
                Iscrizioni Aperte · Inizio Settembre 2026
              </span>
            </div>
          </div>

          {/* CTA row — full-width, equal-flex */}
          <div className="flex items-stretch gap-4 w-full">
            {/* Primary — Scopri i Pack */}
            <Link
              ref={ctaPrimaryRef}
              href="#pack"
              className="group relative inline-flex items-center justify-between gap-5 font-black tracking-[0.2em] uppercase transition-opacity duration-200 hover:opacity-90"
              style={{
                background: "#F09226",
                color: "#111111",
                fontSize: "clamp(0.95rem, 1.05vw, 1.05rem)",
                padding: "22px 32px",
                flex: "1 1 0",
                boxShadow:
                  "0 0 0 1px rgba(240,146,38,0.5), 0 0 48px rgba(240,146,38,0.4)",
              }}
            >
              <span>Scopri i Pack</span>
              <span
                className="flex items-center justify-center transition-transform duration-300 ease-out group-hover:scale-110"
                style={{
                  width: "36px",
                  height: "36px",
                  border: "1.5px solid rgba(17,17,17,0.3)",
                }}
                aria-hidden="true"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="miter"
                >
                  <rect x="0.75" y="0.75" width="6" height="6" />
                  <rect x="9.25" y="0.75" width="6" height="6" />
                  <rect x="0.75" y="9.25" width="6" height="6" />
                  <rect x="9.25" y="9.25" width="6" height="6" />
                </svg>
              </span>
            </Link>

            {/* Secondary — Il Percorso */}
            <Link
              href="/percorso"
              className="group relative inline-flex items-center justify-between gap-5 font-black tracking-[0.2em] uppercase transition-colors duration-200"
              style={{
                color: "#ffffff",
                border: "1.5px solid rgba(255,255,255,0.25)",
                background: "rgba(255,255,255,0.03)",
                backdropFilter: "blur(6px)",
                fontSize: "clamp(0.95rem, 1.05vw, 1.05rem)",
                padding: "22px 32px",
                flex: "1 1 0",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  "rgba(255,255,255,0.55)";
                (e.currentTarget as HTMLElement).style.background =
                  "rgba(255,255,255,0.07)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  "rgba(255,255,255,0.25)";
                (e.currentTarget as HTMLElement).style.background =
                  "rgba(255,255,255,0.03)";
              }}
            >
              <span>Il Percorso Completo</span>
              <span
                className="inline-flex items-center transition-transform duration-200 group-hover:translate-x-1.5"
                aria-hidden="true"
              >
                <svg
                  width="28"
                  height="10"
                  viewBox="0 0 28 10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="miter"
                >
                  <rect
                    x="0.5"
                    y="2"
                    width="6"
                    height="6"
                    fill="currentColor"
                  />
                  <line x1="7" y1="5" x2="11" y2="5" />
                  <rect x="11" y="2" width="6" height="6" />
                  <line x1="17" y1="5" x2="21" y2="5" />
                  <rect x="21" y="2" width="6" height="6" />
                </svg>
              </span>
            </Link>

            {/* Video watch */}
            <button
              type="button"
              onClick={() => setVideoModalOpen(true)}
              className="group inline-flex items-center justify-center gap-3.5 font-black tracking-[0.2em] uppercase transition-colors duration-200"
              style={{
                color: "#ffffff",
                border: "1.5px solid rgba(240,146,38,0.4)",
                background: "rgba(240,146,38,0.08)",
                fontSize: "clamp(0.88rem, 0.95vw, 1rem)",
                padding: "22px 26px",
                flex: "1 1 0",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  "rgba(240,146,38,0.75)";
                (e.currentTarget as HTMLElement).style.background =
                  "rgba(240,146,38,0.14)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  "rgba(240,146,38,0.4)";
                (e.currentTarget as HTMLElement).style.background =
                  "rgba(240,146,38,0.08)";
              }}
              aria-label="Guarda il video di presentazione"
            >
              <span
                className="flex items-center justify-center shrink-0"
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  background: "#F09226",
                }}
              >
                <svg viewBox="0 0 12 12" width="10" height="10" fill="#111111">
                  <path d="M3 1.5L10 6L3 10.5V1.5Z" />
                </svg>
              </span>
              <span>Guarda la presentazione</span>
            </button>

            {/* Prosegui — scrolls to next panel, or to #perche if on last panel */}
            <button
              type="button"
              onClick={() => {
                const idx = stageIdxRef.current;
                const nextRefs = [s1Ref, s2Ref, s3Ref];
                if (idx < 3) {
                  const nextPanel = nextRefs[idx]?.current;
                  if (nextPanel) {
                    smoothScrollTo(nextPanel);
                    return;
                  }
                }
                const target = document.getElementById("perche");
                if (target) {
                  smoothScrollTo(target);
                }
              }}
              className="group relative inline-flex items-center justify-between gap-5 font-black tracking-[0.2em] uppercase transition-colors duration-200"
              style={{
                color: "#ffffff",
                border: "1.5px solid rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.03)",
                backdropFilter: "blur(6px)",
                fontSize: "clamp(0.95rem, 1.05vw, 1.05rem)",
                padding: "22px 32px",
                flex: "1 1 0",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  "rgba(255,255,255,0.55)";
                (e.currentTarget as HTMLElement).style.background =
                  "rgba(255,255,255,0.07)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  "rgba(255,255,255,0.2)";
                (e.currentTarget as HTMLElement).style.background =
                  "rgba(255,255,255,0.03)";
              }}
              aria-label={`Prosegui — progresso ${stageIdx + 1} di 4`}
            >
              {/* Progress fill — sits flush against the top border of the button */}
              <span
                className="pointer-events-none absolute left-0 top-0 h-[3px] transition-[width] duration-500 ease-out"
                style={{
                  width: `${((stageIdx + 1) / 4) * 100}%`,
                  background: "#F09226",
                  boxShadow: "0 0 10px rgba(240,146,38,0.55)",
                }}
                aria-hidden="true"
              />
              {/* Subtle tick markers behind the fill */}
              <span
                className="pointer-events-none absolute left-0 top-0 w-full h-[3px]"
                aria-hidden="true"
              >
                {[1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className="absolute top-0 bottom-0 w-px"
                    style={{
                      left: `${(i / 4) * 100}%`,
                      background: "rgba(255,255,255,0.35)",
                    }}
                  />
                ))}
              </span>

              <span>Prosegui</span>
              <span
                className="flex items-center justify-center transition-transform duration-200 group-hover:translate-y-1"
                style={{
                  width: "36px",
                  height: "36px",
                  border: "1.5px solid rgba(255,255,255,0.25)",
                  color: "#F09226",
                }}
              >
                <svg
                  viewBox="0 0 14 14"
                  width="14"
                  height="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                >
                  <path d="M3 5l4 4 4-4" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );

  /* ──────────────────────────────────────────────────────────
     MOBILE stack (no pin, simpler)
  ────────────────────────────────────────────────────────── */
  const mobileStage = (
    <div
      className="relative w-full overflow-hidden"
      style={{ background: "#111111" }}
    >
      {/* Navbar-safe top gradient */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-24 z-[5]"
        style={{
          background:
            "linear-gradient(to bottom, rgba(17,17,17,0.95) 0%, rgba(17,17,17,0.5) 60%, transparent 100%)",
        }}
      />

      <div className="relative z-10 flex flex-col">
        {/* ══ P1 — SLIDER (dark #111 + slide bg image) ══ */}
        <div
          className="relative overflow-hidden"
          style={{ minHeight: "50vh", touchAction: "pan-y" }}
          onPointerDown={onSliderPointerDown}
          onPointerUp={onSliderPointerUp}
          onPointerCancel={onSliderPointerCancel}
        >
          {slide.bg_image_url && (
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${slide.bg_image_url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(17,17,17,0.7) 0%, rgba(17,17,17,0.6) 50%, rgba(17,17,17,0.95) 100%)",
                }}
              />
            </div>
          )}
          <div className="absolute inset-0">
            <StaticGrid />
          </div>

          {/* Bottom fade-to-black, blends the slider into the CTA band below */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24 z-[5]"
            style={{
              background:
                "linear-gradient(to bottom, transparent 0%, rgba(17,17,17,0.6) 45%, #111111 100%)",
            }}
          />

          <div className="relative z-10 flex flex-col justify-between min-h-[50vh] px-6 pt-28 pb-12">
            <div className="flex flex-col gap-6">
              {/* Slider title */}
              <div ref={slideContentRef}>
                <div ref={line1Ref}>
                  <SplitLine
                    text={slide.title_white}
                    className="text-[clamp(2.6rem,11vw,4.2rem)] font-black tracking-[-0.028em]"
                    style={{ color: "#ffffff" }}
                  />
                </div>
                <div ref={line2Ref} className="mt-1">
                  <SplitLine
                    text={slide.title_orange}
                    className="text-[clamp(2.6rem,11vw,4.2rem)] font-black tracking-[-0.028em]"
                    style={{ color: "#F09226" }}
                  />
                </div>
                <p
                  className="mt-6 text-[1rem] leading-[1.65]"
                  style={{ color: "rgba(220,215,230,0.82)" }}
                >
                  {slide.description}
                </p>
              </div>
            </div>

            {/* Dots pinned bottom */}
            <div className="flex flex-col gap-5 mt-10">
              {slides.length > 1 && (
                <div className="flex items-center gap-2">
                  <span
                    className="text-[0.58rem] font-bold tracking-[0.22em] uppercase mr-1"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                  >
                    {String(activeIdx + 1).padStart(2, "0")}/
                    {String(slides.length).padStart(2, "0")}
                  </span>
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goToSlide(i)}
                      aria-label={`Slide ${i + 1}`}
                      className="transition-all duration-300"
                      style={{
                        height: "3px",
                        width: i === activeIdx ? "24px" : "8px",
                        background:
                          i === activeIdx
                            ? "#F09226"
                            : "rgba(255,255,255,0.22)",
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ══ CTA BAND (mobile — right under slider) ══ */}
        <div
          className="relative px-6 py-10 flex flex-col gap-3"
          style={{ background: "#111111" }}
        >
          <div className="flex items-center gap-2.5 mb-2">
            <span
              className="h-2 w-2 rounded-full animate-pulse"
              style={{
                background: "#F09226",
                boxShadow: "0 0 8px rgba(240,146,38,0.9)",
              }}
            />
            <span
              className="text-[0.6rem] font-black tracking-[0.3em] uppercase"
              style={{ color: "rgba(240,146,38,0.85)" }}
            >
              Iscrizioni Aperte · Settembre 2026
            </span>
          </div>

          <Link
            href="#pack"
            className="group w-full flex items-center justify-between gap-4 font-black text-[0.9rem] tracking-[0.2em] uppercase transition-opacity duration-200 hover:opacity-90"
            style={{
              background: "#F09226",
              color: "#111111",
              padding: "20px 22px",
              boxShadow:
                "0 0 0 1px rgba(240,146,38,0.5), 0 0 40px rgba(240,146,38,0.3)",
            }}
          >
            <span>Scopri i Pack</span>
            <span
              className="flex items-center justify-center"
              style={{
                width: "30px",
                height: "30px",
                border: "1.5px solid rgba(17,17,17,0.3)",
              }}
              aria-hidden="true"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="miter"
              >
                <rect x="0.75" y="0.75" width="6" height="6" />
                <rect x="9.25" y="0.75" width="6" height="6" />
                <rect x="0.75" y="9.25" width="6" height="6" />
                <rect x="9.25" y="9.25" width="6" height="6" />
              </svg>
            </span>
          </Link>

          <Link
            href="/percorso"
            className="w-full flex items-center justify-between gap-4 font-black text-[0.88rem] tracking-[0.2em] uppercase"
            style={{
              color: "#ffffff",
              border: "1.5px solid rgba(255,255,255,0.25)",
              background: "rgba(255,255,255,0.03)",
              padding: "20px 22px",
            }}
          >
            <span>Il Percorso Completo</span>
            <span aria-hidden="true" className="inline-flex items-center">
              <svg
                width="24"
                height="8"
                viewBox="0 0 28 10"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="miter"
              >
                <rect x="0.5" y="2" width="6" height="6" fill="currentColor" />
                <line x1="7" y1="5" x2="11" y2="5" />
                <rect x="11" y="2" width="6" height="6" />
                <line x1="17" y1="5" x2="21" y2="5" />
                <rect x="21" y="2" width="6" height="6" />
              </svg>
            </span>
          </Link>
        </div>

        {/* ══ P2 — IL METODO (video bg + dark overlay) ══ */}
        <div className="relative overflow-hidden" style={{ minHeight: "70vh" }}>
          <div className="absolute inset-0">
            <video
              src="/videos/hero-bg-loop.mp4"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(17,17,17,0.72) 0%, rgba(17,17,17,0.55) 50%, rgba(17,17,17,0.9) 100%)",
              }}
            />
          </div>
          <div className="relative z-10 flex flex-col justify-center min-h-[70vh] px-6 py-14">
            <span
              className="text-[0.6rem] font-black tracking-[0.32em] uppercase mb-5"
              style={{ color: "#F09226" }}
            >
              — Il Metodo
            </span>
            <div
              className="text-[clamp(2.2rem,9vw,3.6rem)] font-black tracking-[-0.028em] leading-[0.98]"
              style={{ color: "#ffffff" }}
            >
              FORMIAMO CHI
            </div>
            <div
              className="text-[clamp(2.2rem,9vw,3.6rem)] font-black tracking-[-0.028em] leading-[0.98] mt-1"
              style={{ color: "#F09226" }}
            >
              CAMBIA IL FITNESS.
            </div>
            <p
              className="mt-6 text-[0.95rem] leading-[1.65]"
              style={{ color: "rgba(255,255,255,0.95)" }}
            >
              9 mesi in presenza. 33+ docenti. 8 masterclass specialistiche. Un
              percorso progettato come una squadra professionistica.
            </p>

            {/* Inline watch-with-audio trigger */}
            <button
              type="button"
              onClick={() => setVideoModalOpen(true)}
              className="mt-7 inline-flex items-center gap-3 self-start font-black text-[0.72rem] tracking-[0.24em] uppercase py-3 px-4"
              style={{
                color: "#ffffff",
                border: "1px solid rgba(240,146,38,0.5)",
                background: "rgba(240,146,38,0.1)",
              }}
            >
              <span
                className="flex items-center justify-center shrink-0"
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  background: "#F09226",
                }}
              >
                <svg viewBox="0 0 12 12" width="8" height="8" fill="#111111">
                  <path d="M3 1.5L10 6L3 10.5V1.5Z" />
                </svg>
              </span>
              Guarda con audio
            </button>
          </div>
        </div>

        {/* ══ P3 — NUMERI (dark #111, generous spacing, scroll-triggered) ══ */}
        <div
          ref={mobileP3Ref}
          className="relative overflow-hidden px-6 py-14"
          style={{ background: "#111111" }}
        >
          <div className="absolute inset-0 opacity-70">
            <StaticGrid />
          </div>
          {/* Bottom grid-to-solid fade: blends the grid into P4 (cert) seamlessly */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-40 z-[1]"
            style={{
              background:
                "linear-gradient(to bottom, transparent 0%, rgba(17,17,17,0.7) 55%, #111111 100%)",
            }}
          />
          <div className="relative z-10">
            <span
              className="text-[0.6rem] font-black tracking-[0.32em] uppercase mb-8 block"
              style={{ color: "#F09226" }}
            >
              — I Numeri
            </span>

            <div className="flex flex-col gap-4">
              {[
                {
                  idx: "01",
                  n: 9,
                  label: "Mesi Formativi",
                  sub: "In Presenza",
                  primary: true,
                },
                {
                  idx: "02",
                  n: 100,
                  suffix: "%",
                  label: "Presenza",
                  sub: "Zero DAD, Zero Scuse",
                  primary: false,
                },
                {
                  idx: "03",
                  n: 8,
                  label: "Masterclass",
                  sub: "Specialistiche",
                  primary: false,
                },
              ].map((k) => (
                <div
                  key={k.label}
                  data-mobile-kpi
                  className="relative flex items-center gap-6 py-6 px-5"
                  style={{
                    background: "rgba(255,255,255,0.025)",
                    borderLeft: `3px solid ${k.primary ? "#F09226" : "rgba(255,255,255,0.15)"}`,
                  }}
                >
                  <span
                    className="absolute top-3 right-4 text-[0.58rem] font-black tracking-[0.25em]"
                    style={{ color: "rgba(240,146,38,0.45)" }}
                  >
                    {k.idx}
                  </span>
                  <div className="flex items-baseline gap-0.5 shrink-0 min-w-[100px]">
                    <CountUp
                      to={k.n}
                      duration={1.4}
                      active={mobileCountActive}
                      className="font-black leading-[0.85] tabular-nums"
                      style={{
                        color: k.primary ? "#F09226" : "#ffffff",
                        fontSize: "clamp(3.6rem, 18vw, 5rem)",
                      }}
                    />
                    {k.suffix && (
                      <span
                        className="font-black"
                        style={{
                          color: "#F09226",
                          fontSize: "clamp(1.6rem, 8vw, 2.2rem)",
                        }}
                      >
                        {k.suffix}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span
                      className="text-[0.78rem] font-black tracking-[0.2em] uppercase"
                      style={{ color: "#ffffff" }}
                    >
                      {k.label}
                    </span>
                    <span
                      className="mt-1 text-[0.62rem] tracking-[0.2em] uppercase"
                      style={{ color: "#ffffff" }}
                    >
                      {k.sub}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ P4 — DUE CERTIFICAZIONI (dark #111 → bg-transition at the bottom) ══ */}
        <div
          className="relative overflow-hidden px-6 py-14"
          style={{ background: "#111111" }}
        >
          {/* Vimeo background — stesso pattern */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
          >
            <iframe
              src="https://player.vimeo.com/video/1188018710?background=1&autoplay=1&loop=1&muted=1&quality=360p&dnt=1"
              title="Due Certificazioni background"
              loading="lazy"
              allow="autoplay; fullscreen"
              suppressHydrationWarning
              className="absolute left-1/2 top-1/2 min-h-full min-w-full"
              style={{
                aspectRatio: "16 / 9",
                border: 0,
                filter: "blur(14px) brightness(0.6) saturate(1.05)",
                transform: "translate(-50%, -50%) scale(1.08)",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(135deg, rgba(10,10,14,0.6) 0%, rgba(10,10,14,0.82) 100%)",
              }}
            />
            {/* Orange chrome grid + radial vignette */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(240,146,38,0.22) 1px, transparent 1px)," +
                  "linear-gradient(90deg, rgba(240,146,38,0.22) 1px, transparent 1px)",
                backgroundSize: "56px 56px",
                maskImage:
                  "radial-gradient(ellipse 70% 65% at 50% 50%, transparent 0%, transparent 50%, rgba(0,0,0,0.4) 75%, black 92%, black 100%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse 70% 65% at 50% 50%, transparent 0%, transparent 50%, rgba(0,0,0,0.4) 75%, black 92%, black 100%)",
              }}
            />
            {/* Spotlight centrale */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 60% 55% at 50% 50%, rgba(240,146,38,0.08) 0%, transparent 65%)",
              }}
            />
          </div>

          <span
            className="relative z-10 text-[0.6rem] font-black tracking-[0.32em] uppercase mb-6 block"
            style={{ color: "rgba(240,146,38,0.85)" }}
          >
            — Le Certificazioni
          </span>

          <div
            className="relative z-10 text-[clamp(1.7rem,7.5vw,2.6rem)] font-black tracking-[-0.025em] leading-[1]"
            style={{ color: "#ffffff" }}
          >
            Esci dal percorso
            <br />
            <span style={{ color: "#F09226" }}>certificato.</span>
          </div>
          <p
            className="relative z-10 mt-5 text-[0.9rem] leading-[1.65]"
            style={{ color: "rgba(255,255,255,0.85)" }}
          >
            Tre riconoscimenti che fanno la differenza:{" "}
            <strong>Master Trainer</strong> rilasciato da CSEN e{" "}
            <strong>2.0 CEU NSCA</strong> in tutti i pack. Con PRO ed ELITE
            anche il <strong>Personal Trainer FIPE</strong>, riconosciuto in
            Italia e all&apos;estero.
          </p>

          {/* Logo row — 3 real issuer logos */}
          <div
            className="relative z-10 mt-8 flex items-center justify-center gap-5"
            aria-label="Enti riconoscitori"
          >
            {[
              {
                src: "/certificazioni/fsmt.webp",
                label: "Functional Strength Master Trainer",
              },
              { src: "/certificazioni/csen.webp", label: "CSEN" },
              { src: "/certificazioni/fipe.webp", label: "FIPE" },
              { src: "/certificazioni/nsca.webp", label: "NSCA" },
            ].map((logo) => (
              <Image
                key={logo.label}
                src={logo.src}
                alt={logo.label}
                title={logo.label}
                width={96}
                height={96}
                className="h-16 w-16 object-contain"
              />
            ))}
          </div>

          {/* Two certs stacked */}
          <div className="relative z-10 mt-8 mb-4 flex flex-col gap-4">
            {/* Cert 1 — Master Trainer (CSEN) */}
            <div
              className="flex flex-col gap-3 p-5"
              style={{
                background: "rgba(255,255,255,0.025)",
                border: "1.5px solid rgba(240,146,38,0.35)",
              }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-[0.55rem] font-black tracking-[0.26em] uppercase"
                  style={{ color: "rgba(240,146,38,0.85)" }}
                >
                  01 · Nazionale
                </span>
                <span
                  className="text-[0.5rem] font-black tracking-[0.2em] uppercase px-2 py-0.5"
                  style={{
                    color: "#F09226",
                    background: "rgba(240,146,38,0.12)",
                    border: "1px solid rgba(240,146,38,0.35)",
                  }}
                >
                  Tutti i pack
                </span>
              </div>
              <div
                className="text-[1.05rem] font-black tracking-[-0.015em] leading-[1.1]"
                style={{ color: "#ffffff" }}
              >
                Functional Strength{" "}
                <span style={{ color: "#F09226" }}>Master Trainer</span>
              </div>
              <p
                className="text-[0.62rem] font-black tracking-[0.22em] uppercase"
                style={{ color: "rgba(240,146,38,0.85)" }}
              >
                Rilasciata da CSEN
              </p>
              <p
                className="text-[0.8rem] leading-[1.55]"
                style={{ color: "rgba(255,255,255,0.75)" }}
              >
                Diploma da Istruttore CSEN con Tesserino tecnico e iscrizione
                all&apos;albo nazionale. Spendibile in palestre, studi e centri
                fitness.
              </p>
            </div>

            {/* Cert 2 — Personal Trainer FIPE */}
            <div
              className="flex flex-col gap-3 p-5"
              style={{
                background:
                  "linear-gradient(135deg, rgba(240,146,38,0.16) 0%, rgba(240,146,38,0.04) 100%)",
                border: "2px solid rgba(240,146,38,0.7)",
                boxShadow: "0 0 22px rgba(240,146,38,0.18)",
              }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-[0.55rem] font-black tracking-[0.26em] uppercase"
                  style={{ color: "#F09226" }}
                >
                  02 · Internazionale
                </span>
                <span
                  className="text-[0.5rem] font-black tracking-[0.2em] uppercase px-2 py-0.5"
                  style={{
                    color: "#111111",
                    background: "#F09226",
                  }}
                >
                  PRO &amp; ELITE
                </span>
              </div>
              <div
                className="text-[1.05rem] font-black tracking-[-0.015em] leading-[1.1]"
                style={{ color: "#ffffff" }}
              >
                Personal Trainer <span style={{ color: "#F09226" }}>FIPE</span>
              </div>
              <p
                className="text-[0.62rem] font-black tracking-[0.22em] uppercase"
                style={{ color: "#F09226" }}
              >
                Rilasciata da FIPE
              </p>
              <p
                className="text-[0.8rem] leading-[1.55]"
                style={{ color: "rgba(255,255,255,0.85)" }}
              >
                Certificazione ufficiale della Federazione Italiana Pesistica.
                Specializzazione avanzata su Strength &amp; Conditioning,
                programmazione avanzata della forza e applicazioni multi-sport.
              </p>
              <ul className="mt-1 flex flex-col gap-1">
                {[
                  "Iscrizione registro nazionale FIPE",
                  "Valida in Italia e all'estero",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-[0.72rem] leading-[1.45]"
                    style={{ color: "rgba(255,255,255,0.78)" }}
                  >
                    <span
                      className="shrink-0 mt-1.5 h-1 w-1"
                      style={{ background: "#F09226" }}
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* NSCA strip — muted dark, orange only on +2.0 CEU */}
            <div
              className="relative w-full overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <div
                className="absolute left-0 top-0 h-full w-1"
                style={{ background: "rgba(255,255,255,0.2)" }}
                aria-hidden
              />
              <div className="relative flex items-start gap-4 px-5 py-5">
                <Image
                  src="/certificazioni/nsca.webp"
                  alt="NSCA — National Strength and Conditioning Association"
                  width={72}
                  height={72}
                  className="shrink-0 h-16 w-16 object-contain"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span
                      className="text-[0.5rem] font-black tracking-[0.26em] uppercase"
                      style={{ color: "rgba(255,255,255,0.6)" }}
                    >
                      Internazionale
                    </span>
                    <span
                      className="px-1.5 py-0.5 text-[0.46rem] font-black tracking-[0.2em] uppercase"
                      style={{
                        color: "rgba(255,255,255,0.75)",
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.14)",
                      }}
                    >
                      Tutti i pack
                    </span>
                  </div>
                  <p className="text-[1rem] font-black leading-[1.1] text-white">
                    NSCA CEU Provider ·{" "}
                    <span style={{ color: "#F09226" }}>+2.0 CEU</span>
                  </p>
                  <p
                    className="mt-1.5 text-[0.74rem] leading-[1.5]"
                    style={{ color: "rgba(255,255,255,0.72)" }}
                  >
                    2.0 CEU NSCA validi a livello internazionale — incluso in
                    tutti i pack.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  /* ──────────────────────────────────────────────────────────
     Video modal — watchable + audible on demand
  ────────────────────────────────────────────────────────── */
  const videoModal =
    videoModalOpen && typeof document !== "undefined"
      ? createPortal(
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto p-4 sm:p-10"
            style={{
              background: "rgba(17,17,17,0.94)",
              backdropFilter: "blur(14px)",
            }}
            onClick={() => setVideoModalOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Video di presentazione"
          >
            <div
              className="relative my-auto flex w-full max-w-5xl flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setVideoModalOpen(false)}
                className="mb-3 flex items-center gap-2.5 self-end text-[0.72rem] font-black tracking-[0.28em] uppercase text-white/60 hover:text-white transition-colors"
                aria-label="Chiudi video"
              >
                <span>Chiudi</span>
                <span
                  className="flex items-center justify-center w-7 h-7"
                  style={{ border: "1px solid rgba(255,255,255,0.25)" }}
                >
                  ×
                </span>
              </button>
              {/* Vertical (9/16) video: cap width by available viewport height so
                  the player + controls + caption always fit without overflow. */}
              <div
                className="mx-auto w-full"
                style={{
                  maxWidth: "min(480px, calc((100dvh - 10rem) * 9 / 16))",
                  boxShadow:
                    "0 0 0 1px rgba(240,146,38,0.22), 0 0 80px rgba(240,146,38,0.15), 0 0 180px rgba(240,146,38,0.05)",
                }}
              >
                <VideoBlockMux
                  playbackId={MUX_PLAYBACK_ID}
                  isDark
                  poster="https://image.mux.com/czjfcHxFBiCTiw8gH9nw8Cx7fU02XPsRIgG6P4j00012cE/thumbnail.png?fit_mode=preserve&time=31"
                />
              </div>
              <div className="mt-4 flex w-full items-center justify-between text-[0.62rem] font-black tracking-[0.28em] uppercase text-white/40">
                <span>Lacertosus Academy · 2 min</span>
                <span>Premi 🔊 per attivare l&apos;audio</span>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <section ref={sectionRef} className="relative">
      {isDesktop ? desktopStage : mobileStage}
      {videoModal}
    </section>
  );
}
