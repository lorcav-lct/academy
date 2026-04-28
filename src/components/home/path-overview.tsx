"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { COURSES } from "@/lib/constants/courses";
import { BlockModal, type BlockSlug } from "@/components/shared/block-modal";

const META = {
  function: {
    roman: "I",
    color: "#F09226",
    tagline: "Le Fondamenta",
    season: "Autunno 2026",
    fipeSeason: "Novembre",
  },
  strength: {
    roman: "II",
    color: "#F09226",
    tagline: "La Forza",
    season: "Inverno 2026/27",
    fipeSeason: "Febbraio",
  },
  science: {
    roman: "III",
    color: "#F09226",
    tagline: "La Vittoria",
    season: "Primavera 2027",
    fipeSeason: "Maggio",
  },
} as const;

const CERT_ITEMS = [
  {
    n: "01",
    title: "Valore ufficiale nel settore",
    body: "Riconosciuta da palestre e strutture sportive in tutta Italia.",
  },
  {
    n: "02",
    title: "Approccio teorico-pratico",
    body: "Prove pratiche sul campo, non solo esami scritti.",
  },
  {
    n: "03",
    title: "Immediatamente spendibile",
    body: "Dal giorno del conseguimento puoi esercitare la professione.",
  },
];

const NUM_PANELS = 3;

// Default 3D positions for folder cards: left / center / right
const CARD_DEFAULTS = [
  { rotateZ: -12, rotateY: -14, x: -170, y: 50, z: -70 },
  { rotateZ: 0, rotateY: 0, x: 0, y: 0, z: 0 },
  { rotateZ: 12, rotateY: 14, x: 170, y: 50, z: -70 },
] as const;

// ── Silk Filaments (flow-field) ──────────────────────────────────────────────
const TAU = Math.PI * 2;
const FILAMENT_COUNT = 50;
const TRAIL_LEN = 24;

type Filament = {
  x: number;
  y: number;
  trail: Float32Array;
  head: number;
  life: number;
  maxLife: number;
  hueShift: number;
  alpha: number;
  speed: number;
  width: number;
  _color: string;
};

/* Pseudo-simplex via 2-ottave sommate: grande fold + piccolo ripple ruotato.
   Il tempo entra anche nella formula → il campo stesso "respira" (silk). */
function flowAngle(x: number, y: number, t: number): number {
  const n1 =
    Math.sin(x * 0.0042 + t * 0.00018) * Math.cos(y * 0.0051 - t * 0.00022);
  const cs = 0.7986;
  const sn = 0.6018; // cos/sin 37°
  const xr = x * cs - y * sn;
  const yr = x * sn + y * cs;
  const n2 =
    Math.sin(xr * 0.011 + t * 0.00031) *
    Math.cos(yr * 0.013 + t * 0.00027) *
    0.45;
  return (n1 + n2) * TAU;
}

function colorFor(hueShift: number, alpha: number): string {
  return `hsla(${32 + hueShift}, 85%, 54%, ${alpha.toFixed(3)})`;
}

function initParticles(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d", { alpha: true })!;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const prefersReducedMotion =
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

  const W = () => window.innerWidth;
  const H = () => window.innerHeight;

  const sizeCanvas = () => {
    canvas.width = W() * dpr;
    canvas.height = H() * dpr;
    canvas.style.width = W() + "px";
    canvas.style.height = H() + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  sizeCanvas();

  let resizeTimer: number | undefined;
  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(sizeCanvas, 150);
  };
  window.addEventListener("resize", onResize);

  function respawn(p: Filament, w: number, h: number) {
    p.x = Math.random() * w;
    p.y = Math.random() * h;
    p.life = 0;
    p.maxLife = 260 + Math.random() * 260;
    p.alpha = 0.15 + Math.random() * 0.23;
    p.speed = 0.55 + Math.random() * 0.55;
    p.width = 0.6 + Math.random() * 0.6;
    p.hueShift = (Math.random() - 0.5) * 24;
    p._color = colorFor(p.hueShift, 1);
    // Pre-fill ring con spawn position → la scia cresce dal punto
    for (let k = 0; k < TRAIL_LEN * 2; k += 2) {
      p.trail[k] = p.x;
      p.trail[k + 1] = p.y;
    }
    p.head = 0;
  }

  function step(p: Filament, t: number, w: number, h: number) {
    const a = flowAngle(p.x, p.y, t);
    const vx = Math.cos(a) * p.speed;
    const vy = Math.sin(a) * p.speed;
    const i = p.head * 2;
    p.trail[i] = p.x;
    p.trail[i + 1] = p.y;
    p.head = (p.head + 1) % TRAIL_LEN;
    p.x += vx;
    p.y += vy;
    p.life++;
    const margin = 40;
    if (
      p.x < -margin ||
      p.x > w + margin ||
      p.y < -margin ||
      p.y > h + margin ||
      p.life > p.maxLife
    ) {
      respawn(p, w, h);
    }
  }

  const pts: Filament[] = Array.from({ length: FILAMENT_COUNT }, () => {
    const f: Filament = {
      x: 0,
      y: 0,
      trail: new Float32Array(TRAIL_LEN * 2),
      head: 0,
      life: 0,
      maxLife: 0,
      hueShift: 0,
      alpha: 0,
      speed: 0,
      width: 0.8,
      _color: "",
    };
    respawn(f, W(), H());
    return f;
  });

  function render() {
    const w = W();
    const h = H();
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter"; // additive glow su bg scuro
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    for (const p of pts) {
      ctx.strokeStyle = p._color;
      ctx.lineWidth = p.width;

      let prevX = p.trail[p.head * 2];
      let prevY = p.trail[p.head * 2 + 1];

      for (let s = 1; s < TRAIL_LEN; s++) {
        const idx = ((p.head + s) % TRAIL_LEN) * 2;
        const nx = p.trail[idx];
        const ny = p.trail[idx + 1];
        // Fade power 1.4 → comet taper (più opacità verso la testa)
        ctx.globalAlpha = p.alpha * Math.pow(s / TRAIL_LEN, 1.4);
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(nx, ny);
        ctx.stroke();
        prevX = nx;
        prevY = ny;
      }
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.moveTo(prevX, prevY);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }

  if (prefersReducedMotion) {
    // Snapshot statico: pre-calcola 80 frame per far crescere le scie, poi render unico
    for (let f = 0; f < 80; f++) {
      const t = f * 16.67;
      for (const p of pts) step(p, t, W(), H());
    }
    render();
    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(resizeTimer);
    };
  }

  let raf = 0;
  let paused = false;
  let lastT = performance.now();
  const loop = (now: number) => {
    // dt clamped → no burst al tab-resume
    const dt = Math.min(now - lastT, 33);
    void dt;
    lastT = now;
    for (const p of pts) step(p, now, W(), H());
    render();
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);

  const onVis = () => {
    const hidden = document.visibilityState === "hidden";
    if (hidden && !paused) {
      paused = true;
      cancelAnimationFrame(raf);
    } else if (!hidden && paused) {
      paused = false;
      lastT = performance.now();
      raf = requestAnimationFrame(loop);
    }
  };
  document.addEventListener("visibilitychange", onVis);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", onResize);
    document.removeEventListener("visibilitychange", onVis);
    clearTimeout(resizeTimer);
  };
}

// ── Tilt helpers (shared with panels + certificate) ───────────────────────────
function onTiltMove(e: React.MouseEvent<HTMLDivElement>) {
  const rect = e.currentTarget.getBoundingClientRect();
  const dx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
  const dy = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
  gsap.to(e.currentTarget, {
    rotateX: -dy * 4,
    rotateY: dx * 4,
    duration: 0.5,
    ease: "power2.out",
    transformPerspective: 1000,
  });
}
function onTiltLeave(e: React.MouseEvent<HTMLDivElement>) {
  gsap.to(e.currentTarget, {
    rotateX: 0,
    rotateY: 0,
    duration: 0.9,
    ease: "elastic.out(1,0.4)",
  });
}

// ─────────────────────────────────────────────────────────────────────────────

export function PathOverview() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLSpanElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollTweenRef = useRef<gsap.core.Tween | null>(null);
  const folderCardsRef = useRef<(HTMLDivElement | null)[]>([null, null, null]);
  const bigCardsRef = useRef<(HTMLDivElement | null)[]>([null, null, null]);
  const overviewPanelRef = useRef<HTMLDivElement>(null);
  const certPanelRef = useRef<HTMLDivElement>(null);
  const [openBlock, setOpenBlock] = useState<BlockSlug | null>(null);

  // Navigate to a specific panel by index (smooth GSAP-powered scroll)
  const goToPanel = useCallback((panelIndex: number) => {
    const st = scrollTweenRef.current?.scrollTrigger;
    if (!st) return;
    const targetProgress = panelIndex / (NUM_PANELS - 1);
    const targetScroll = st.start + targetProgress * (st.end - st.start);
    const proxy = { y: window.scrollY };
    gsap.to(proxy, {
      y: targetScroll,
      duration: 1.5,
      ease: "expo.inOut",
      onUpdate: () => window.scrollTo(0, proxy.y),
    });
  }, []);

  // Folder card hover
  const onCardEnter = useCallback((idx: number) => {
    const card = folderCardsRef.current[idx];
    if (!card) return;
    const def = CARD_DEFAULTS[idx];
    gsap.to(card, {
      rotateZ: def.rotateZ * 0.2,
      rotateY: 0,
      rotateX: -5,
      x: def.x * 0.55,
      y: -40,
      z: 90,
      scale: 1.06,
      duration: 0.45,
      ease: "power3.out",
    });
  }, []);

  const onCardLeave = useCallback((idx: number) => {
    const card = folderCardsRef.current[idx];
    if (!card) return;
    const def = CARD_DEFAULTS[idx];
    gsap.to(card, {
      rotateZ: def.rotateZ,
      rotateY: def.rotateY,
      rotateX: 0,
      x: def.x,
      y: def.y,
      z: def.z,
      scale: 1,
      duration: 0.75,
      ease: "elastic.out(1, 0.45)",
    });
  }, []);

  // Folder card click → scroll al Panel 1 (3-column overview).
  // La transizione verticale dei blocchi è gestita dal ScrollTrigger scrub,
  // niente più fly-up/fade qui: la stessa card diventa la big card di Panel 1.
  const onCardClick = useCallback(() => {
    goToPanel(1);
  }, [goToPanel]);

  // ── Particles (desktop only)
  useEffect(() => {
    if (typeof window === "undefined" || window.innerWidth < 1024) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    return initParticles(canvas);
  }, []);

  // ── GSAP scroll + navbar hide
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // ── Desktop ────────────────────────────────────────────────────────────
      mm.add("(min-width: 1024px)", () => {
        section.style.overflow = "hidden";
        const panels = track.querySelectorAll<HTMLElement>("[data-panel]");
        const header = document.querySelector("header");

        if (arrowRef.current)
          gsap.to(arrowRef.current, {
            x: 10,
            yoyo: true,
            repeat: -1,
            duration: 0.72,
            ease: "sine.inOut",
          });

        // Initialize folder cards to off-screen 3D state
        folderCardsRef.current.forEach((card, idx) => {
          if (!card) return;
          const def = CARD_DEFAULTS[idx];
          gsap.set(card, {
            opacity: 0,
            rotateX: 80,
            rotateZ: def.rotateZ,
            rotateY: def.rotateY,
            x: def.x,
            y: def.y + 60,
            z: def.z - 40,
          });
        });

        const scrollTween = gsap.to(track, {
          x: () => -(track.scrollWidth - window.innerWidth),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            pin: true,
            scrub: 1.2,
            anticipatePin: 1,
            end: () => `+=${track.scrollWidth - window.innerWidth}`,
            invalidateOnRefresh: true,
            snap: {
              // Wide sticky zone for panel 0 (needs >18% scroll to leave intro)
              // and for last panel (>82% to stay on FIPE)
              snapTo: (v: number) => {
                const n = NUM_PANELS - 1;
                if (v < 0.18) return 0;
                if (v > 1 - 0.18) return 1;
                return Math.round(v * n) / n;
              },
              delay: 0.12,
              duration: { min: 0.3, max: 0.55 },
              ease: "power2.inOut",
            },
            onEnter: () => {
              document.documentElement.dataset.pathActive = "1";
              if (header)
                gsap.to(header, {
                  yPercent: -110,
                  opacity: 0,
                  duration: 0.45,
                  ease: "power3.inOut",
                });
            },
            onLeave: () => {
              delete document.documentElement.dataset.pathActive;
              if (header)
                gsap.to(header, {
                  yPercent: 0,
                  opacity: 1,
                  duration: 0.5,
                  ease: "power3.out",
                });
            },
            onEnterBack: () => {
              document.documentElement.dataset.pathActive = "1";
              if (header)
                gsap.to(header, {
                  yPercent: -110,
                  opacity: 0,
                  duration: 0.45,
                  ease: "power3.inOut",
                });
            },
            onLeaveBack: () => {
              delete document.documentElement.dataset.pathActive;
              if (header)
                gsap.to(header, {
                  yPercent: 0,
                  opacity: 1,
                  duration: 0.5,
                  ease: "power3.out",
                });
            },
            onUpdate(self) {
              if (arrowRef.current)
                arrowRef.current.style.opacity =
                  self.progress > 0.05 ? "0" : "1";
              if (progressRef.current)
                progressRef.current.style.transform = `scaleX(${self.progress})`;
            },
          },
        });

        scrollTweenRef.current = scrollTween;

        panels.forEach((panel, pIdx) => {
          const items = panel.querySelectorAll("[data-anim]");
          ScrollTrigger.create({
            trigger: panel,
            containerAnimation: scrollTween,
            start: "left 80%",
            once: true,
            onEnter: () => {
              if (items.length) {
                gsap.from(items, {
                  opacity: 0,
                  y: 28,
                  stagger: 0.08,
                  duration: 0.7,
                  ease: "power3.out",
                });
              }
              // Intro panel: animate folder cards in + start idle float
              if (pIdx === 0) {
                folderCardsRef.current.forEach((card, cIdx) => {
                  if (!card) return;
                  const def = CARD_DEFAULTS[cIdx];
                  gsap.to(card, {
                    opacity: 1,
                    rotateX: 0,
                    rotateZ: def.rotateZ,
                    rotateY: def.rotateY,
                    x: def.x,
                    y: def.y,
                    z: def.z,
                    duration: 0.85,
                    delay: 0.25 + cIdx * 0.12,
                    ease: "power3.out",
                  });
                  // Idle float on the inner card face (doesn't clash
                  // with outer transform used by hover/click). Yoyo loop.
                  const inner = card.querySelector("[data-idle-float]");
                  if (inner) {
                    gsap.to(inner, {
                      y: -12,
                      duration: 2.4 + cIdx * 0.3,
                      ease: "sine.inOut",
                      yoyo: true,
                      repeat: -1,
                      delay: 1.4 + cIdx * 0.2,
                    });
                  }
                });
              }
            },
          });
        });

        // Seed hidden state for big cards of Panel 1 (3-col overview)
        // Partono spinti verso il basso, invisibili
        bigCardsRef.current.forEach((card) => {
          if (card) gsap.set(card, { opacity: 0, y: 260 });
        });

        const VERTICAL_DRIFT = 260; // px — distanza di uscita/entrata

        /* Entry: Panel 0 → Panel 1 (scrubbed) — in 2 fasi sequenziali:
           Fase A (p 0 → 0.5): folder cards scendono e spariscono COMPLETAMENTE
           Fase B (p 0.5 → 1): big cards ricompaiono dal basso e salgono */
        if (overviewPanelRef.current) {
          ScrollTrigger.create({
            trigger: overviewPanelRef.current,
            containerAnimation: scrollTween,
            start: "left right",
            end: "left left",
            scrub: true,
            onUpdate: (self) => {
              const p = self.progress;

              // Fase A — folder cards exit verso il basso (0 → 0.5)
              const fp = Math.max(0, Math.min(1, p / 0.5));
              folderCardsRef.current.forEach((card, cIdx) => {
                if (!card) return;
                const def = CARD_DEFAULTS[cIdx];
                const d = cIdx * 0.08;
                const lp = Math.max(
                  0,
                  Math.min(1, (fp - d) / Math.max(0.01, 1 - d)),
                );
                gsap.set(card, {
                  opacity: 1 - lp,
                  y: def.y + lp * VERTICAL_DRIFT,
                });
              });

              // Fase B — big cards enter dal basso (0.5 → 1)
              const bp = Math.max(0, Math.min(1, (p - 0.5) / 0.5));
              bigCardsRef.current.forEach((card, cIdx) => {
                if (!card) return;
                const d = cIdx * 0.08;
                const lp = Math.max(
                  0,
                  Math.min(1, (bp - d) / Math.max(0.01, 1 - d)),
                );
                gsap.set(card, {
                  opacity: lp,
                  y: VERTICAL_DRIFT - lp * VERTICAL_DRIFT,
                });
              });
            },
          });
        }

        /* Exit: Panel 1 → Panel 2 (scrubbed) — in 1 fase:
           big cards salgono e spariscono COMPLETAMENTE (0 → ~0.55).
           Il resto dello scroll lascia il viewport vuoto per
           l'ingresso di Panel 2 dal lato. */
        if (certPanelRef.current) {
          ScrollTrigger.create({
            trigger: certPanelRef.current,
            containerAnimation: scrollTween,
            start: "left right",
            end: "left left",
            scrub: true,
            onUpdate: (self) => {
              const p = self.progress;
              // Big cards exit verso l'alto, accelerate so they vanish early
              const ep = Math.max(0, Math.min(1, p / 0.55));
              bigCardsRef.current.forEach((card, cIdx) => {
                if (!card) return;
                const d = cIdx * 0.08;
                const lp = Math.max(
                  0,
                  Math.min(1, (ep - d) / Math.max(0.01, 1 - d)),
                );
                gsap.set(card, {
                  opacity: 1 - lp,
                  y: -lp * VERTICAL_DRIFT,
                });
              });
            },
          });
        }

        return () => {
          section.style.overflow = "";
          scrollTweenRef.current = null;
          if (header) gsap.set(header, { clearProps: "all" });
          folderCardsRef.current.forEach((c) => {
            if (!c) return;
            const inner = c.querySelector("[data-idle-float]");
            if (inner) gsap.killTweensOf(inner);
            gsap.set(c, { clearProps: "all" });
          });
          bigCardsRef.current.forEach((c) => {
            if (c) gsap.set(c, { clearProps: "all" });
          });
        };
      });

      // ── Mobile ─────────────────────────────────────────────────────────────
      mm.add("(max-width: 1023px)", () => {
        const header = document.querySelector("header");
        const navST = ScrollTrigger.create({
          trigger: section,
          start: "top 20%",
          end: "bottom 10%",
          onEnter: () => {
            if (header)
              gsap.to(header, {
                yPercent: -110,
                opacity: 0,
                duration: 0.4,
                ease: "power3.inOut",
              });
          },
          onLeave: () => {
            if (header)
              gsap.to(header, {
                yPercent: 0,
                opacity: 1,
                duration: 0.4,
                ease: "power3.out",
              });
          },
          onEnterBack: () => {
            if (header)
              gsap.to(header, {
                yPercent: -110,
                opacity: 0,
                duration: 0.4,
                ease: "power3.inOut",
              });
          },
          onLeaveBack: () => {
            if (header)
              gsap.to(header, {
                yPercent: 0,
                opacity: 1,
                duration: 0.4,
                ease: "power3.out",
              });
          },
        });
        const mobHead = section.querySelector("[data-mobile-head]");
        if (mobHead)
          gsap.from(mobHead, {
            scrollTrigger: { trigger: mobHead, start: "top 85%", once: true },
            opacity: 0,
            y: 30,
            duration: 0.65,
            ease: "power3.out",
          });
        const cards = section.querySelectorAll("[data-mobile-card]");
        if (cards.length)
          gsap.from(cards, {
            scrollTrigger: { trigger: section, start: "top 75%", once: true },
            opacity: 0,
            y: 40,
            duration: 0.65,
            stagger: 0.1,
            ease: "power3.out",
          });

        return () => {
          navST.kill();
          if (header) gsap.set(header, { clearProps: "all" });
        };
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="percorso"
      className="relative"
      style={{
        background:
          "radial-gradient(ellipse at 18% 55%, rgba(240,146,38,0.09) 0%, transparent 58%), radial-gradient(ellipse at 82% 25%, rgba(240,146,38,0.05) 0%, transparent 45%), linear-gradient(145deg, #434343 0%, #1a1a1a 55%, #0a0a0a 100%)",
      }}
    >
      {/* Canvas particles */}
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none hidden lg:block"
        style={{ position: "absolute", top: 0, left: 0, zIndex: 1 }}
      />

      {/* Progress bar */}
      <div
        className="pointer-events-none absolute top-0 left-0 hidden h-[2px] w-full lg:block"
        style={{ background: "rgba(255,255,255,0.1)", zIndex: 20 }}
      >
        <div
          ref={progressRef}
          className="h-full w-full origin-left"
          style={{
            background: "linear-gradient(90deg,#F09226,#fff8)",
            transform: "scaleX(0)",
          }}
        />
      </div>

      {/* ── DESKTOP horizontal track ─────────────────────────────────────────── */}
      <div
        ref={trackRef}
        className="relative hidden lg:flex will-change-transform"
        style={{ zIndex: 5 }}
      >
        {/* ━━━ Panel 0 — Intro with Folder Cards ━━━ */}
        <div
          data-panel
          className="relative flex flex-col justify-center"
          style={{
            width: "100vw",
            minHeight: "100vh",
            flexShrink: 0,
            padding: "6rem 5%",
          }}
        >
          <div className="mx-auto w-full max-w-[1400px]">
            <div
              className="grid items-center gap-12"
              style={{ gridTemplateColumns: "1fr 1fr" }}
            >
              {/* LEFT — text */}
              <div>
                <span data-anim className="label-tag mb-5 block">
                  I 3 Blocchi Formativi — 2026/27
                </span>
                <h2
                  data-anim
                  className="font-black leading-[0.95] tracking-tight text-white"
                  style={{ fontSize: "clamp(3.5rem,6.5vw,7rem)" }}
                >
                  Il
                  <br />
                  <span style={{ color: "#F09226" }}>Percorso.</span>
                </h2>
                <p
                  data-anim
                  className="mt-6 max-w-lg text-[1.0625rem] leading-relaxed"
                  style={{ color: "rgba(255,255,255,0.72)" }}
                >
                  9 mesi di formazione progressiva. Tre blocchi che si
                  costruiscono l&apos;uno sull&apos;altro fino alla
                  certificazione FIPE.
                </p>
                <div
                  data-anim
                  className="mt-10 grid max-w-sm grid-cols-3 gap-3"
                >
                  {[
                    { v: "9", u: "mesi" },
                    { v: "11", u: "weekend" },
                    { v: "30", u: "posti" },
                  ].map(({ v, u }) => (
                    <div
                      key={u}
                      className="p-4 text-center"
                      style={{
                        border: "1px solid rgba(255,255,255,0.12)",
                        background: "rgba(255,255,255,0.04)",
                      }}
                    >
                      <p
                        className="text-[2rem] font-black leading-none tabular-nums"
                        style={{ color: "#F09226" }}
                      >
                        {v}
                      </p>
                      <p
                        className="mt-1 text-[0.75rem] font-bold tracking-[0.18em] uppercase"
                        style={{ color: "rgba(255,255,255,0.5)" }}
                      >
                        {u}
                      </p>
                    </div>
                  ))}
                </div>
                <div data-anim className="mt-10 flex items-center gap-3">
                  <span
                    ref={arrowRef}
                    className="inline-block text-xl"
                    style={{ color: "#F09226" }}
                  >
                    →
                  </span>
                  <span
                    className="text-[0.7rem] font-bold tracking-[0.3em] uppercase"
                    style={{ color: "rgba(255, 255, 255, 0.84)38)" }}
                  >
                    Esplora le card per navigare
                  </span>
                </div>
              </div>

              {/* RIGHT — 3D Folder Cards */}
              <div
                className="relative"
                style={{
                  height: "72vh",
                  perspective: "1300px",
                  perspectiveOrigin: "50% 48%",
                }}
              >
                {/* Cards */}
                {COURSES.map((course, idx) => {
                  const meta = META[course.slug as keyof typeof META];
                  if (!meta) return null;
                  const { roman, color, tagline } = meta;

                  return (
                    <div
                      key={course.slug}
                      ref={(el) => {
                        folderCardsRef.current[idx] = el;
                      }}
                      onClick={onCardClick}
                      onMouseEnter={() => onCardEnter(idx)}
                      onMouseLeave={() => onCardLeave(idx)}
                      className="absolute"
                      style={{
                        top: "50%",
                        left: "50%",
                        width: "300px",
                        marginLeft: "-150px",
                        marginTop: "-140px",
                        cursor: "pointer",
                        transformStyle: "preserve-3d",
                      }}
                    >
                      {/* Card face */}
                      <div
                        data-idle-float
                        style={{
                          background: "#f8f8fc",
                          border: "1px solid rgba(0,0,0,0.07)",
                          overflow: "hidden",
                          boxShadow:
                            "0 28px 70px rgba(0,0,0,0.4), 0 4px 18px rgba(0,0,0,0.18)",
                          height: "280px",
                          display: "flex",
                          flexDirection: "column",
                          padding: "1.75rem 1.6rem 1.6rem",
                          position: "relative",
                        }}
                      >
                        {/* Top accent bar */}
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 3,
                            background: `linear-gradient(90deg, ${color}, transparent)`,
                          }}
                        />

                        {/* Header: roman + step indicator */}
                        <div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              justifyContent: "space-between",
                            }}
                          >
                            <div
                              className="font-black leading-none tabular-nums"
                              style={{
                                fontSize: "6.2rem",
                                color,
                                lineHeight: 0.85,
                              }}
                            >
                              {roman}
                            </div>
                            {/* Step dots */}
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "flex-end",
                                gap: 5,
                                paddingTop: "0.4rem",
                              }}
                            >
                              {COURSES.map((_, di) => (
                                <span
                                  key={di}
                                  style={{
                                    width: di === idx ? 22 : 7,
                                    height: 2,
                                    background:
                                      di === idx ? color : "rgba(0,0,0,0.14)",
                                    display: "block",
                                    transition: "all 0.3s",
                                  }}
                                />
                              ))}
                              <span
                                style={{
                                  fontSize: "0.55rem",
                                  fontWeight: 800,
                                  letterSpacing: "0.2em",
                                  color: "rgba(0,0,0,0.3)",
                                  marginTop: 2,
                                }}
                              >
                                {roman}/III
                              </span>
                            </div>
                          </div>
                          <span
                            style={{
                              fontSize: "0.65rem",
                              fontWeight: 900,
                              letterSpacing: "0.3em",
                              textTransform: "uppercase",
                              color: "rgba(240,146,38,0.7)",
                              display: "block",
                              marginTop: "0.85rem",
                            }}
                          >
                            {course.area}
                          </span>
                          <h3
                            style={{
                              fontSize: "1.8rem",
                              fontWeight: 900,
                              color: "#111",
                              lineHeight: 0.95,
                              marginTop: "0.35rem",
                            }}
                          >
                            {course.title}
                          </h3>
                          <p
                            style={{
                              fontSize: "1rem",
                              fontWeight: 700,
                              color,
                              marginTop: "0.4rem",
                            }}
                          >
                            {tagline}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ━━━ Panel 1 — 3-Column Overview (tutti i blocchi in un colpo) ━━━ */}
        <div
          ref={overviewPanelRef}
          data-panel
          className="relative flex flex-col justify-center"
          style={{
            width: "100vw",
            minHeight: "100vh",
            flexShrink: 0,
            padding: "6rem 5%",
          }}
        >
          <div className="mx-auto w-full max-w-[1500px]">
            <div
              data-anim
              className="mb-10 flex items-end justify-between gap-6"
            >
              <div>
                <span className="label-tag mb-3 block">
                  I 3 Blocchi · In Dettaglio
                </span>
                <h2
                  className="font-black leading-[0.95] tracking-tight text-white"
                  style={{ fontSize: "clamp(2.5rem, 4.5vw, 4.5rem)" }}
                >
                  Nove mesi.{" "}
                  <span style={{ color: "#F09226" }}>Tre tappe.</span>
                </h2>
              </div>
              <p
                className="max-w-md text-right text-[0.95rem] leading-relaxed"
                style={{ color: "rgba(255,255,255,0.55)" }}
              >
                Ogni blocco si costruisce sul precedente.
                <br />
                Clicca per scoprire il programma completo.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-5">
              {COURSES.map((course, idx) => {
                const meta = META[course.slug as keyof typeof META];
                if (!meta) return null;
                const { roman, color, tagline, season, fipeSeason } = meta;
                return (
                  <div
                    key={course.slug}
                    ref={(el) => {
                      bigCardsRef.current[idx] = el;
                    }}
                    data-big-card
                    className="flex flex-col justify-between"
                    style={{
                      background: "#f8f8fc",
                      border: "1px solid rgba(0,0,0,0.07)",
                      boxShadow:
                        "0 28px 70px rgba(0,0,0,0.32), 0 4px 18px rgba(0,0,0,0.14)",
                      padding: "2.25rem 2rem",
                      minHeight: "72vh",
                    }}
                  >
                    {/* Header: step indicator */}
                    <div>
                      <div className="mb-6 flex items-center gap-1.5">
                        {COURSES.map((_, di) => (
                          <span
                            key={di}
                            className="block"
                            style={{
                              width: di === idx ? 28 : 8,
                              height: 2,
                              background:
                                di === idx ? color : "rgba(0,0,0,0.15)",
                            }}
                          />
                        ))}
                        <span
                          className="ml-2 text-[0.62rem] font-bold tracking-[0.28em] uppercase"
                          style={{ color: "rgba(0,0,0,0.4)" }}
                        >
                          {roman} / III
                        </span>
                      </div>

                      {/* Roman numeral massive */}
                      <div
                        className="font-black leading-none tabular-nums"
                        style={{
                          fontSize: "clamp(4.5rem, 7vw, 7.5rem)",
                          color,
                          lineHeight: 0.88,
                        }}
                      >
                        {roman}
                      </div>
                      <span
                        className="mt-3 block text-[0.68rem] font-black tracking-[0.32em] uppercase"
                        style={{ color: "rgba(240,146,38,0.75)" }}
                      >
                        {course.area}
                      </span>
                      <h3
                        className="mt-1 font-black leading-tight tracking-tight"
                        style={{
                          fontSize: "clamp(1.6rem, 2vw, 2.1rem)",
                          color: "#111111",
                        }}
                      >
                        {course.title}
                      </h3>
                      <p
                        className="mt-1 text-[0.95rem] font-bold"
                        style={{ color }}
                      >
                        {tagline}
                      </p>

                      <p
                        className="mt-5 text-[0.88rem] leading-relaxed"
                        style={{ color: "#555555" }}
                      >
                        {course.objective}
                      </p>

                      {/* Curriculum preview */}
                      <ul className="mt-6 space-y-2">
                        {course.curriculum.slice(0, 4).map((item) => (
                          <li
                            key={item}
                            className="flex items-start gap-2.5 text-[0.82rem]"
                            style={{ color: "rgba(17,17,17,0.78)" }}
                          >
                            <span
                              className="mt-[0.5em] h-1 w-1 shrink-0"
                              style={{ background: color }}
                            />
                            {item}
                          </li>
                        ))}
                        {course.curriculum.length > 4 && (
                          <li
                            className="pl-[14px] text-[0.75rem]"
                            style={{ color: "rgba(0,0,0,0.38)" }}
                          >
                            + {course.curriculum.length - 4} altri argomenti
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Footer: season + CTA */}
                    <div className="mt-6">
                      <div className="mb-4 flex items-center gap-2">
                        <span
                          className="text-[0.62rem] font-bold tracking-[0.2em] uppercase"
                          style={{ color: "rgba(0,0,0,0.4)" }}
                        >
                          Periodo
                        </span>
                        <span
                          className="px-2.5 py-0.5 text-[0.7rem] font-bold"
                          style={{
                            border: "1px solid rgba(240,146,38,0.35)",
                            color: "#C06A0A",
                            background: "rgba(240,146,38,0.08)",
                          }}
                        >
                          {season}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setOpenBlock(course.slug as BlockSlug)}
                        className="block w-full py-3.5 text-center text-[0.8rem] font-black tracking-[0.18em] uppercase transition-opacity duration-200 cursor-pointer"
                        style={{ background: "#F09226", color: "#111111" }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.opacity =
                            "0.85";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.opacity =
                            "1";
                        }}
                      >
                        Scopri il programma →
                      </button>
                      <p
                        className="mt-3 text-[0.7rem]"
                        style={{ color: "rgba(0,0,0,0.42)" }}
                      >
                        <span style={{ color }}>✦</span> Sessione FIPE —{" "}
                        {fipeSeason}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ━━━ Panel 2 — FIPE Certificate ━━━ */}
        <div
          ref={certPanelRef}
          data-panel
          className="flex flex-col justify-center"
          style={{
            width: "100vw",
            minHeight: "100vh",
            flexShrink: 0,
            padding: "6rem 5%",
          }}
        >
          <div className="mx-auto w-full max-w-[1400px]">
            <div className="grid grid-cols-2 items-center gap-16">
              {/* Certificate document */}
              <div data-anim>
                <div
                  className="relative w-full max-w-[440px] overflow-hidden"
                  style={{
                    background: "#ffffff",
                    boxShadow:
                      "0 40px 100px rgba(0,0,0,0.35), 0 0 0 1px rgba(240,146,38,0.12)",
                    willChange: "transform",
                  }}
                  onMouseMove={onTiltMove}
                  onMouseLeave={onTiltLeave}
                >
                  <div
                    style={{
                      background: "#1a1a1a",
                      padding: "0.9rem 1.5rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.6rem",
                      }}
                    >
                      <div
                        style={{ width: 6, height: 6, background: "#F09226" }}
                      />
                      <span
                        style={{
                          fontSize: "0.58rem",
                          fontWeight: 900,
                          letterSpacing: "0.32em",
                          color: "#F09226",
                          textTransform: "uppercase",
                        }}
                      >
                        Lacertosus Academy
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: "0.52rem",
                        color: "rgba(240,146,38,0.5)",
                        fontWeight: 700,
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                      }}
                    >
                      FIPE × LCT
                    </span>
                  </div>
                  <div style={{ padding: "1.75rem 2rem 1.5rem" }}>
                    <div
                      style={{
                        height: 3,
                        background:
                          "linear-gradient(90deg, #F09226, rgba(240,146,38,0.15))",
                        marginBottom: "1.5rem",
                      }}
                    />
                    <p
                      style={{
                        fontSize: "0.58rem",
                        fontWeight: 700,
                        letterSpacing: "0.3em",
                        color: "#999",
                        textTransform: "uppercase",
                        marginBottom: "0.3rem",
                      }}
                    >
                      Si certifica che
                    </p>
                    <p
                      style={{
                        fontSize: "1.25rem",
                        fontWeight: 900,
                        fontStyle: "italic",
                        color: "#F09226",
                        borderBottom: "1px solid rgba(240,146,38,0.18)",
                        paddingBottom: "0.75rem",
                        marginBottom: "1rem",
                      }}
                    >
                      Nome Cognome
                    </p>
                    <p
                      style={{
                        fontSize: "0.78rem",
                        lineHeight: 1.65,
                        color: "#555",
                        marginBottom: "0.75rem",
                      }}
                    >
                      ha completato con successo il{" "}
                      <strong style={{ color: "#111" }}>
                        Percorso Formativo Lacertosus Academy
                      </strong>{" "}
                      (FUNCTION · STRENGTH · SCIENCE) e ottiene il titolo
                      professionale di
                    </p>
                    <div
                      style={{
                        background: "rgba(240,146,38,0.05)",
                        border: "1px solid rgba(240,146,38,0.18)",
                        padding: "0.75rem 1rem",
                        marginBottom: "1.5rem",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "0.95rem",
                          fontWeight: 900,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          color: "#111",
                          lineHeight: 1.2,
                        }}
                      >
                        Personal Trainer
                        <br />
                        <span style={{ color: "#F09226" }}>
                          FIPE × Lacertosus
                        </span>
                      </p>
                      <p
                        style={{
                          fontSize: "0.58rem",
                          color: "#888",
                          fontWeight: 600,
                          letterSpacing: "0.2em",
                          textTransform: "uppercase",
                          marginTop: "0.3rem",
                        }}
                      >
                        Riconosciuto nel settore fitness italiano
                      </p>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-end",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            height: 1,
                            width: 80,
                            background: "rgba(0,0,0,0.18)",
                            marginBottom: "0.3rem",
                          }}
                        />
                        <p
                          style={{
                            fontSize: "0.56rem",
                            color: "#aaa",
                            letterSpacing: "0.12em",
                          }}
                        >
                          Direttore Didattico
                        </p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div
                          style={{
                            height: 1,
                            width: 80,
                            background: "rgba(0,0,0,0.18)",
                            marginBottom: "0.3rem",
                          }}
                        />
                        <p
                          style={{
                            fontSize: "0.56rem",
                            color: "#aaa",
                            letterSpacing: "0.12em",
                          }}
                        >
                          Responsabile FIPE
                        </p>
                      </div>
                    </div>
                    <div
                      style={{
                        height: 1,
                        background:
                          "linear-gradient(90deg, transparent, rgba(240,146,38,0.3), transparent)",
                        margin: "1.25rem 0 0.75rem",
                      }}
                    />
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "0.52rem",
                          color: "#ccc",
                          letterSpacing: "0.14em",
                          textTransform: "uppercase",
                        }}
                      >
                        Lacertosus Academy S.r.l.
                      </p>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 30,
                          height: 30,
                          borderRadius: "50%",
                          border: "1.5px solid rgba(240,146,38,0.4)",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.48rem",
                            fontWeight: 900,
                            color: "#F09226",
                            letterSpacing: "0.05em",
                          }}
                        >
                          FIPE
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Text */}
              <div>
                <span data-anim className="label-tag mb-4 block">
                  Certificazione Professionale
                </span>
                <h2
                  data-anim
                  className="font-black leading-[1.05] tracking-tight text-white"
                  style={{ fontSize: "clamp(2rem,3.5vw,3.5rem)" }}
                >
                  Un titolo riconosciuto.{" "}
                  <span style={{ color: "#F09226" }}>
                    Un professionista credibile.
                  </span>
                </h2>
                <div data-anim className="mt-8 space-y-5">
                  {CERT_ITEMS.map((item) => (
                    <div key={item.n} className="flex gap-4">
                      <span
                        className="mt-0.5 shrink-0 text-[0.72rem] font-black"
                        style={{ color: "rgba(240,146,38,0.7)" }}
                      >
                        {item.n}
                      </span>
                      <div>
                        <p className="text-[0.9375rem] font-bold text-white">
                          {item.title}
                        </p>
                        <p
                          className="mt-0.5 text-[0.875rem] leading-relaxed"
                          style={{ color: "rgba(255,255,255,0.62)" }}
                        >
                          {item.body}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div
                  data-anim
                  className="mt-8 inline-flex items-center gap-3 border px-5 py-3"
                  style={{
                    borderColor: "rgba(240,146,38,0.25)",
                    background: "rgba(240,146,38,0.05)",
                  }}
                >
                  <span style={{ color: "#F09226" }}>✦</span>
                  <span
                    className="text-[0.78rem] font-bold tracking-wider uppercase"
                    style={{ color: "#F09226" }}
                  >
                    FIPE × LACERTOSUS — Inclusa nel percorso
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE ──────────────────────────────────────────────────────────── */}
      <div className="relative lg:hidden" style={{ zIndex: 2 }}>
        <div data-mobile-head className="px-[5%] pt-16 pb-6">
          <span className="label-tag mb-3 block">I 3 Blocchi Formativi</span>
          <h2
            className="font-black leading-tight tracking-tight text-white"
            style={{ fontSize: "clamp(2.2rem,8vw,3rem)" }}
          >
            Il Percorso.
          </h2>
          <p
            className="mt-2 text-[0.9375rem] leading-relaxed"
            style={{ color: "rgba(255,255,255,0.65)" }}
          >
            9 mesi · 3 blocchi · 1 certificazione
          </p>
        </div>

        <div
          className="overflow-x-auto pb-6"
          style={{
            scrollSnapType: "x mandatory",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
            display: "flex",
            gap: "12px",
            paddingLeft: "5%",
            paddingRight: "5%",
            scrollPaddingInlineStart: "5%",
          }}
        >
          {COURSES.map((course) => {
            const meta = META[course.slug as keyof typeof META];
            if (!meta) return null;
            const { roman, color, tagline, season, fipeSeason } = meta;
            return (
              <div
                key={course.slug}
                data-mobile-card
                className="relative flex shrink-0 flex-col justify-between p-6"
                style={{
                  width: "82vw",
                  scrollSnapAlign: "start",
                  scrollSnapStop: "always",
                  background: "#f8f8fc",
                  border: "1px solid rgba(0,0,0,0.07)",
                }}
              >
                <div
                  className="font-black leading-none tabular-nums mb-3"
                  style={{ fontSize: "3.5rem", color }}
                >
                  {roman}
                </div>
                <div>
                  <span
                    className="mb-1 block text-[0.7rem] font-bold tracking-[0.28em] uppercase"
                    style={{ color: "rgba(240,146,38,0.75)" }}
                  >
                    {course.area}
                  </span>
                  <h3
                    className="text-[2rem] font-black leading-none"
                    style={{ color: "#111" }}
                  >
                    {course.title}
                  </h3>
                  <p
                    className="mt-0.5 text-[0.9375rem] font-bold"
                    style={{ color }}
                  >
                    {tagline}
                  </p>
                  <p
                    className="mt-3 text-[0.9375rem] leading-relaxed"
                    style={{ color: "#444" }}
                  >
                    {course.objective}
                  </p>
                  <ul className="mt-4 space-y-1.5">
                    {course.curriculum.slice(0, 4).map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-[0.875rem]"
                        style={{ color: "#555" }}
                      >
                        <span
                          className="mt-[0.42em] h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ background: color }}
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-5 space-y-3">
                  <span
                    className="inline-block px-2.5 py-1 text-[0.75rem] font-bold"
                    style={{
                      border: "1px solid rgba(240,146,38,0.25)",
                      color: "#C06A0A",
                      background: "rgba(240,146,38,0.06)",
                    }}
                  >
                    {season}
                  </span>
                  <p className="text-[0.75rem]" style={{ color: "#888" }}>
                    <span style={{ color: "#F09226" }}>✦</span> FIPE —{" "}
                    {fipeSeason}
                  </p>
                  <button
                    type="button"
                    onClick={() => setOpenBlock(course.slug as BlockSlug)}
                    className="block w-full py-3 text-center text-[0.8rem] font-black tracking-[0.18em] uppercase cursor-pointer"
                    style={{ background: "#F09226", color: "#111111" }}
                  >
                    Scopri il programma →
                  </button>
                </div>
              </div>
            );
          })}

          {/* FIPE card mobile */}
          <div
            data-mobile-card
            className="shrink-0 flex flex-col overflow-hidden"
            style={{
              width: "82vw",
              scrollSnapAlign: "start",
              scrollSnapStop: "always",
              background: "#ffffff",
              border: "1px solid rgba(240,146,38,0.2)",
            }}
          >
            <div
              style={{
                background: "#1a1a1a",
                padding: "0.75rem 1.25rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontSize: "0.52rem",
                  fontWeight: 900,
                  letterSpacing: "0.28em",
                  color: "#F09226",
                  textTransform: "uppercase",
                }}
              >
                Lacertosus Academy
              </span>
              <span
                style={{
                  fontSize: "0.5rem",
                  color: "rgba(240,146,38,0.5)",
                  fontWeight: 700,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                }}
              >
                FIPE
              </span>
            </div>
            <div className="flex flex-col justify-between flex-1 p-5">
              <div>
                <div
                  style={{
                    height: 2,
                    background:
                      "linear-gradient(90deg, #F09226, rgba(240,146,38,0.15))",
                    marginBottom: "1rem",
                  }}
                />
                <p
                  className="mb-1 text-[0.62rem] font-bold tracking-[0.28em] uppercase"
                  style={{ color: "#999" }}
                >
                  Certificazione Finale
                </p>
                <h3
                  className="text-[1.75rem] font-black leading-tight"
                  style={{ color: "#111" }}
                >
                  FIPE × LACERTOSUS
                </h3>
                <p
                  className="mt-2 text-[0.9375rem] leading-relaxed"
                  style={{ color: "#444" }}
                >
                  Titolo riconosciuto dal giorno del conseguimento.
                </p>
                <div className="mt-5 space-y-3">
                  {CERT_ITEMS.map((item) => (
                    <div key={item.n} className="flex gap-3">
                      <span
                        className="shrink-0 text-[0.7rem] font-black"
                        style={{ color: "#F09226" }}
                      >
                        {item.n}
                      </span>
                      <p className="text-[0.875rem]" style={{ color: "#444" }}>
                        <span className="font-bold" style={{ color: "#111" }}>
                          {item.title}
                        </span>{" "}
                        — {item.body}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div
                className="mt-5 inline-flex items-center gap-2 border px-4 py-2.5"
                style={{
                  borderColor: "rgba(240,146,38,0.3)",
                  background: "rgba(240,146,38,0.06)",
                }}
              >
                <span style={{ color: "#F09226" }}>✦</span>
                <span
                  className="text-[0.72rem] font-bold tracking-wider uppercase"
                  style={{ color: "#C06A0A" }}
                >
                  Inclusa nel percorso
                </span>
              </div>
            </div>
          </div>

          {/* Trailing spacer */}
          <div style={{ width: "5%", flexShrink: 0 }} aria-hidden />
        </div>

        <div className="flex justify-center gap-1.5 pb-12">
          {Array.from({ length: 4 }, (_, i) => (
            <span
              key={i}
              className="block h-px w-5"
              style={{
                background: i === 0 ? "#F09226" : "rgba(255,255,255,0.2)",
              }}
            />
          ))}
        </div>
      </div>
      {openBlock && (
        <BlockModal slug={openBlock} onClose={() => setOpenBlock(null)} />
      )}
    </section>
  );
}
