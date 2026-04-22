"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { HeroSlide, DEFAULT_HERO_SLIDES } from "@/lib/constants/hero-slides";
import { VideoBlock } from "@/components/shared/video-block";

const VIMEO_ID = "1161847546";

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
    }, 5600);
    return () => clearInterval(id);
  }, [slides.length, goToSlide]);

  /* ── Main GSAP orchestration ───────────────────────────── */
  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    /* Hydration/navigation robustness:
       1. Silenzia gli avvisi "GSAP target not found" durante mount (refs
          temporaneamente null nelle bundle minified con fast refresh/bfcache).
       2. Monkey-patch one-shot di ScrollTrigger.refresh per intercettare
          race "insertBefore on Node" quando React ha già mosso il pin
          wrapper. Il prossimo scroll/resize farà un refresh pulito. */
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

    const shouldPin = isDesktop && !isReducedMotion;
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

      if (!shouldPin) return;

      /* ── Initial states ──────────────────────────────────── */
      gsap.set(s1Ref.current, { opacity: 0, y: 40 });
      gsap.set(s2Ref.current, { opacity: 0, y: 40 });
      gsap.set(s3Ref.current, { opacity: 0, y: 40 });
      gsap.set(videoLayerRef.current, { opacity: 0 });
      gsap.set(slideBgRef.current, { opacity: 1 });

      /* Hide panel children by default → reveal on panel arrival */
      const allReveals = [
        ...(s1Ref.current?.querySelectorAll("[data-reveal]") ?? []),
        ...(s2Ref.current?.querySelectorAll("[data-reveal]") ?? []),
        ...(s3Ref.current?.querySelectorAll("[data-reveal]") ?? []),
      ];
      if (allReveals.length) {
        gsap.set(allReveals, { opacity: 0, y: 24 });
      }

      const revealPanel = (el: HTMLDivElement | null) => {
        if (!el) return;
        const targets = el.querySelectorAll("[data-reveal]");
        if (!targets.length) return;
        gsap.fromTo(
          targets,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.06,
            duration: 0.55,
            ease: "power3.out",
            overwrite: "auto",
          },
        );
      };

      /* ── Master scroll timeline ─────────────────────────── */
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=580%",
          pin: stageRef.current,
          scrub: 0.9,
          /* Snap ai centri degli hold (P1/P2/P3/P4) + inizio/fine.
             Se l'utente si ferma a metà di una transizione, viene portato
             al pannello più vicino — meno artefatti "incastrati". */
          snap: {
            snapTo: [0, 0.11, 0.41, 0.69, 0.89, 1],
            duration: { min: 0.25, max: 0.7 },
            delay: 0.12,
            ease: "power2.inOut",
            inertia: false,
          },
          onUpdate: (self) => {
            const p = self.progress;
            sliderActive.current = p < 0.22;
            // Trigger count-up when entering P3 (numbers)
            if (p > 0.58 && !countFiredRef.current) {
              countFiredRef.current = true;
              setCountActive(true);
            }
            // Map progress → current panel idx (0..3)
            const idx = p < 0.22 ? 0 : p < 0.52 ? 1 : p < 0.78 ? 2 : 3;
            if (idx !== stageIdxRef.current) {
              stageIdxRef.current = idx;
              setStageIdx(idx);
              /* Rifai entrance animation degli elementi interni ogni volta
                 che si entra in un nuovo pannello (anche in navigazione
                 avanti/indietro). */
              const panelMap = [
                null,
                s1Ref.current,
                s2Ref.current,
                s3Ref.current,
              ];
              const entering = panelMap[idx];
              if (entering) revealPanel(entering);
            }
          },
        },
      });

      /* ──────────────────────────────────────────────────────
         Panel durations (normalized 0 → 1 over 580vh scroll)
         P1: 0.00 → 0.22   — slider hold
         P1→P2: 0.22 → 0.30 — transition: slide bg fades, video fades in
         P2: 0.30 → 0.52   — method, video as bg
         P2→P3: 0.52 → 0.60 — transition: video fades out, #111 returns
         P3: 0.60 → 0.78   — numbers
         P3→P4: 0.78 → 0.84 — transition
         P4: 0.84 → 0.94   — certification hold (tempo di lettura)
         Exit: 0.94 → 1.00 — fade out hero internals
      ────────────────────────────────────────────────────── */

      /* P1 → P2 transition
         (slide bg out, video in, grid hidden for P2) */
      scrollTl
        .to(
          s0Ref.current,
          { opacity: 0, y: -50, duration: 0.08, ease: "power2.in" },
          0.22,
        )
        .to(
          slideBgRef.current,
          { opacity: 0, duration: 0.08, ease: "power2.in" },
          0.22,
        )
        .to(
          videoLayerRef.current,
          { opacity: 1, duration: 0.08, ease: "power2.out" },
          0.22,
        )
        .fromTo(
          s1Ref.current,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.08, ease: "power3.out" },
          0.24,
        );

      /* P2 hold */
      scrollTl.to({}, { duration: 0.22 }, 0.3);

      /* P2 → P3 transition (video STAYS, grid unchanged) */
      scrollTl
        .to(
          s1Ref.current,
          { opacity: 0, y: -50, duration: 0.08, ease: "power2.in" },
          0.52,
        )
        .fromTo(
          s2Ref.current,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.08, ease: "power3.out" },
          0.54,
        );

      /* P3 hold */
      scrollTl.to({}, { duration: 0.18 }, 0.6);

      /* P3 → P4 transition (video fades out, #111 returns for cert; grid stays) */
      scrollTl
        .to(
          s2Ref.current,
          { opacity: 0, y: -50, duration: 0.06, ease: "power2.in" },
          0.78,
        )
        .to(
          videoLayerRef.current,
          { opacity: 0, duration: 0.06, ease: "power2.inOut" },
          0.78,
        )
        .fromTo(
          s3Ref.current,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.06, ease: "power3.out" },
          0.8,
        );

      /* P4 hold — tempo di lettura del certificato (~58vh di scroll) */
      scrollTl.to({}, { duration: 0.1 }, 0.84);

      /* Exit: fade out hero internals */
      scrollTl
        .to(
          gridRef.current,
          { opacity: 0, duration: 0.06, ease: "power3.inOut" },
          0.94,
        )
        .to(
          s3Ref.current,
          { opacity: 0, y: -20, duration: 0.06, ease: "power3.inOut" },
          0.94,
        );
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
     DESKTOP pinned stage
  ────────────────────────────────────────────────────────── */
  const desktopStage = (
    <div
      ref={stageRef}
      className="relative h-screen w-full overflow-hidden"
      style={{ background: "#111111" }}
    >
      {/* ── VIDEO LAYER (preloaded during P1, visible only in P2) ── */}
      <div
        ref={videoLayerRef}
        className="absolute inset-0 z-0"
        style={{ opacity: 0 }}
      >
        <iframe
          src={`https://player.vimeo.com/video/${VIMEO_ID}?background=1&autoplay=1&loop=1&muted=1&dnt=1`}
          className="absolute border-0"
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "177.77vh",
            minWidth: "100%",
            height: "56.25vw",
            minHeight: "100%",
            pointerEvents: "none",
          }}
          allow="autoplay; picture-in-picture"
          title="Lacertosus Academy"
        />
        {/* Dark overlay on video for text legibility — uniform 75% */}
        <div
          ref={videoOverlayRef}
          className="absolute inset-0"
          style={{ background: "rgba(17,17,17,0.75)" }}
        />
      </div>

      {/* ── SLIDE BG IMAGE (P1 only) ── */}
      <div
        ref={slideBgRef}
        className="absolute inset-0 z-[1]"
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

      {/* Top navbar-safe gradient (ensures contrast) */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-32 z-[5]"
        style={{
          background:
            "linear-gradient(to bottom, rgba(17,17,17,0.85) 0%, rgba(17,17,17,0.5) 60%, transparent 100%)",
        }}
      />

      {/* ── DYNAMIC GRID ── */}
      <div className="absolute inset-0 z-[2]">
        <StaticGrid gridRef={gridRef} />
      </div>

      {/* Corner brackets (chrome) */}
      {[
        "top-8 left-8 border-t border-l",
        "top-8 right-8 border-t border-r",
        "bottom-28 left-8 border-b border-l",
        "bottom-28 right-8 border-b border-r",
      ].map((cls) => (
        <div
          key={cls}
          className={`pointer-events-none absolute w-8 h-8 z-[3] ${cls}`}
          style={{ borderColor: "rgba(240,146,38,0.35)" }}
        />
      ))}

      {/* ──────────────────────────────────────────────────────
          STATE LAYERS (absolute, stacked, centered)
      ────────────────────────────────────────────────────── */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        {/* ══ S0 — SLIDER ══ */}
        <div
          ref={s0Ref}
          className="absolute inset-0 flex flex-col items-center justify-center px-10 max-w-[1440px] mx-auto select-none"
          style={{ touchAction: "pan-y" }}
          onPointerDown={onSliderPointerDown}
          onPointerUp={onSliderPointerUp}
          onPointerCancel={onSliderPointerCancel}
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
          <div ref={slideContentRef} className="text-center max-w-5xl">
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

          {/* Bottom bar: slide dots (centered) */}
          <div
            data-s0-sub
            className="absolute left-0 right-0 bottom-[108px] px-10 max-w-[1440px] mx-auto flex items-center justify-end"
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

        {/* ══ S1 — EDITORIAL QUOTE ══ */}
        <div
          ref={s1Ref}
          className="absolute inset-0 flex flex-col items-center justify-center px-10 max-w-[1440px] mx-auto pointer-events-none"
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

        {/* ══ S2 — MASSIVE KPI ══ */}
        <div
          ref={s2Ref}
          className="absolute inset-0 flex flex-col items-center justify-center px-10 max-w-[1600px] mx-auto pointer-events-none"
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
            <div data-reveal className="flex flex-col items-center text-center">
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
            <div data-reveal className="flex flex-col items-center text-center">
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
            <div data-reveal className="flex flex-col items-center text-center">
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

        {/* ══ S3 — FIPE CERT (hero-level) ══ */}
        <div
          ref={s3Ref}
          className="absolute inset-0 flex flex-col items-center justify-center px-10 max-w-[1440px] mx-auto pointer-events-none"
        >
          <span
            data-reveal
            className="text-[0.72rem] font-black tracking-[0.34em] uppercase mb-8"
            style={{ color: "rgba(212,175,55,0.85)" }}
          >
            — Certificazione Ufficiale
          </span>

          {/* Title */}
          <div className="text-center">
            <div
              data-reveal
              className="text-[clamp(3rem,7vw,7.5rem)] font-black tracking-[-0.03em] leading-[0.92]"
              style={{ color: "#D4AF37" }}
            >
              FIPE <span style={{ color: "rgba(212,175,55,0.45)" }}>×</span>{" "}
              <span style={{ color: "#ffffff" }}>LACERTOSUS</span>
            </div>
            <p
              data-reveal
              className="mx-auto mt-8 max-w-2xl text-[clamp(0.95rem,1.15vw,1.08rem)] leading-[1.7]"
              style={{ color: "#ffffff" }}
            >
              L&apos;unica certificazione che combina riconoscimento federale e
              metodologia Lacertosus. Costruita in tre momenti progressivi.
            </p>
          </div>

          {/* Progression track */}
          <div data-reveal className="mt-12 flex items-center gap-0">
            {[
              { n: "I", after: "CORPUS" },
              { n: "II", after: "VIS" },
              { n: "III", after: "VICTOR" },
            ].map((node, i) => (
              <div key={node.n} className="flex items-center">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className="w-12 h-12 flex items-center justify-center"
                    style={{
                      background: "rgba(212,175,55,0.08)",
                      border: "1.5px solid rgba(212,175,55,0.45)",
                    }}
                  >
                    <span
                      className="text-[0.85rem] font-black tracking-[0.1em]"
                      style={{ color: "#D4AF37" }}
                    >
                      {node.n}
                    </span>
                  </div>
                  <span
                    className="text-[0.62rem] font-black tracking-[0.25em] uppercase"
                    style={{ color: "#ffffff" }}
                  >
                    {node.after}
                  </span>
                </div>
                {i < 2 && (
                  <div
                    className="h-px w-16 mx-3 mb-5"
                    style={{
                      background:
                        "linear-gradient(90deg, rgba(212,175,55,0.45), rgba(212,175,55,0.45))",
                    }}
                  />
                )}
                {i === 2 && (
                  <>
                    <div
                      className="h-px w-16 mx-3 mb-5"
                      style={{
                        background:
                          "linear-gradient(90deg, rgba(212,175,55,0.45), rgba(212,175,55,0.75))",
                      }}
                    />
                    <div className="flex flex-col items-center gap-2 mb-0">
                      <div
                        className="px-4 h-12 flex items-center justify-center"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(212,175,55,0.22) 0%, rgba(212,175,55,0.08) 100%)",
                          border: "2px solid rgba(212,175,55,0.7)",
                          boxShadow: "0 0 24px rgba(212,175,55,0.2)",
                        }}
                      >
                        <span
                          className="text-[0.8rem] font-black tracking-[0.25em]"
                          style={{ color: "#D4AF37" }}
                        >
                          CERT.
                        </span>
                      </div>
                      <span
                        className="text-[0.62rem] font-black tracking-[0.25em] uppercase"
                        style={{ color: "rgba(212,175,55,0.7)" }}
                      >
                        Ufficiale
                      </span>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ STICKY CTA BAND — bigger, more prominent ══ */}
      <div
        ref={ctaBandRef}
        className="absolute bottom-0 left-0 right-0 z-20"
        style={{
          background:
            "linear-gradient(to top, rgba(1,0,21,0.97) 0%, rgba(1,0,21,0.85) 55%, rgba(1,0,21,0.3) 90%, transparent 100%)",
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
                color: "#010015",
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
                  border: "1.5px solid rgba(1,0,21,0.3)",
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
                <svg viewBox="0 0 12 12" width="10" height="10" fill="#010015">
                  <path d="M3 1.5L10 6L3 10.5V1.5Z" />
                </svg>
              </span>
              <span>Guarda la presentazione</span>
            </button>

            {/* Prosegui — progress is the button's own top fill bar
                (compact, no extra horizontal space needed) */}
            <button
              type="button"
              onClick={() => {
                const target = document.getElementById("perche");
                if (target) {
                  target.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
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
    </div>
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
              color: "#010015",
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
                border: "1.5px solid rgba(1,0,21,0.3)",
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
            <iframe
              src={`https://player.vimeo.com/video/${VIMEO_ID}?background=1&autoplay=1&loop=1&muted=1&dnt=1`}
              className="absolute border-0"
              style={{
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "177.77vh",
                minWidth: "100%",
                height: "56.25vw",
                minHeight: "100%",
                pointerEvents: "none",
              }}
              allow="autoplay; picture-in-picture"
              title="Lacertosus Academy"
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
                <svg viewBox="0 0 12 12" width="8" height="8" fill="#010015">
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

        {/* ══ P4 — CERTIFICAZIONE (dark #111 → bg-transition at the bottom) ══ */}
        <div className="relative px-6 py-14" style={{ background: "#111111" }}>
          <span
            className="text-[0.6rem] font-black tracking-[0.32em] uppercase mb-6 block"
            style={{ color: "rgba(212,175,55,0.85)" }}
          >
            — Certificazione Ufficiale
          </span>

          <div
            className="text-[clamp(2rem,9vw,3.4rem)] font-black tracking-[-0.028em] leading-[0.95]"
            style={{ color: "#D4AF37" }}
          >
            FIPE
          </div>
          <div
            className="text-[clamp(1.4rem,6vw,2.2rem)] font-black tracking-[-0.02em] leading-[1] mt-1"
            style={{ color: "rgba(212,175,55,0.5)" }}
          >
            × LACERTOSUS
          </div>
          <p
            className="mt-5 text-[0.92rem] leading-[1.65]"
            style={{ color: "#ffffff" }}
          >
            L&apos;unica certificazione che combina riconoscimento federale e
            metodologia Lacertosus. Costruita in tre momenti progressivi.
          </p>

          {/* Progression track */}
          <div className="mt-7 mb-10 flex items-center gap-0 flex-wrap">
            {[
              { n: "I", after: "CORPUS" },
              { n: "II", after: "VIS" },
              { n: "III", after: "VICTOR" },
            ].map((node, i) => (
              <div key={node.n} className="flex items-center">
                <div className="flex flex-col items-center gap-3">
                  <div
                    className="w-9 h-9 flex items-center justify-center"
                    style={{
                      background: "rgba(212,175,55,0.08)",
                      border: "1.5px solid rgba(212,175,55,0.45)",
                    }}
                  >
                    <span
                      className="text-[0.7rem] font-black"
                      style={{ color: "#D4AF37" }}
                    >
                      {node.n}
                    </span>
                  </div>
                  <span
                    className="text-[0.5rem] font-black tracking-[0.22em] uppercase"
                    style={{ color: "#ffffff" }}
                  >
                    {node.after}
                  </span>
                </div>
                {i < 2 && (
                  <div
                    className="h-px w-5 mx-2 mb-7"
                    style={{ background: "rgba(212,175,55,0.45)" }}
                  />
                )}
              </div>
            ))}
            <div
              className="h-px w-5 mx-2 mb-7"
              style={{ background: "rgba(212,175,55,0.75)" }}
            />
            <div
              className="px-3 h-9 flex items-center justify-center mb-4"
              style={{
                background: "rgba(212,175,55,0.18)",
                border: "2px solid rgba(212,175,55,0.7)",
                boxShadow: "0 0 18px rgba(212,175,55,0.22)",
              }}
            >
              <span
                className="text-[0.68rem] font-black tracking-[0.22em]"
                style={{ color: "#D4AF37" }}
              >
                CERT.
              </span>
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
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-10"
            style={{
              background: "rgba(1,0,21,0.94)",
              backdropFilter: "blur(14px)",
            }}
            onClick={() => setVideoModalOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Video di presentazione"
          >
            <div
              className="relative w-full max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setVideoModalOpen(false)}
                className="absolute -top-12 right-0 flex items-center gap-2.5 text-[0.72rem] font-black tracking-[0.28em] uppercase text-white/60 hover:text-white transition-colors"
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
              <div
                style={{
                  boxShadow:
                    "0 0 0 1px rgba(240,146,38,0.22), 0 0 80px rgba(240,146,38,0.15), 0 0 180px rgba(240,146,38,0.05)",
                }}
              >
                <VideoBlock vimeoId={VIMEO_ID} isDark />
              </div>
              <div className="mt-4 flex items-center justify-between text-[0.62rem] font-black tracking-[0.28em] uppercase text-white/40">
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
