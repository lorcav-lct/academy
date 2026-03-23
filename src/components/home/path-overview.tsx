"use client";

import { useEffect, useRef, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { COURSES } from "@/lib/constants/courses";

const META = {
  corpus: { roman: "I",   color: "#F09226", tagline: "Le Fondamenta", season: "Autunno 2025",     fipeSeason: "Novembre" },
  vis:    { roman: "II",  color: "#F09226", tagline: "La Forza",      season: "Inverno 2025/26",  fipeSeason: "Febbraio" },
  victor: { roman: "III", color: "#F09226", tagline: "La Vittoria",   season: "Primavera 2026",   fipeSeason: "Maggio"   },
} as const;

const CERT_ITEMS = [
  { n: "01", title: "Valore ufficiale nel settore",  body: "Riconosciuta da palestre e strutture sportive in tutta Italia." },
  { n: "02", title: "Approccio teorico-pratico",     body: "Prove pratiche sul campo, non solo esami scritti." },
  { n: "03", title: "Immediatamente spendibile",     body: "Dal giorno del conseguimento puoi esercitare la professione." },
];

const NUM_PANELS = 5;

// Default 3D positions for folder cards: left / center / right
const CARD_DEFAULTS = [
  { rotateZ: -12, rotateY: -14, x: -170, y: 50,  z: -70 },
  { rotateZ:   0, rotateY:   0, x:    0, y:  0,  z:   0 },
  { rotateZ:  12, rotateY:  14, x:  170, y: 50,  z: -70 },
] as const;

// ── Particles ─────────────────────────────────────────────────────────────────
function initParticles(canvas: HTMLCanvasElement) {
  const dpr = window.devicePixelRatio || 1;
  const ctx  = canvas.getContext("2d")!;

  const resize = () => {
    canvas.width  = window.innerWidth  * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width  = window.innerWidth  + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener("resize", resize);

  const W = () => window.innerWidth;
  const H = () => window.innerHeight;

  const pts = Array.from({ length: 90 }, () => ({
    x: Math.random() * W(), y: Math.random() * H(),
    vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
    r: Math.random() * 2.5 + 1.2, a: Math.random() * 0.55 + 0.25,
  }));

  let raf = 0;
  const draw = () => {
    ctx.clearRect(0, 0, W(), H());
    ctx.shadowColor = "rgba(240,146,38,0.9)";
    ctx.shadowBlur  = 8;
    for (const p of pts) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W(); else if (p.x > W()) p.x = 0;
      if (p.y < 0) p.y = H(); else if (p.y > H()) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(240,146,38,${p.a})`;
      ctx.fill();
    }
    raf = requestAnimationFrame(draw);
  };
  draw();
  return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
}

// ── Tilt helpers (shared with panels + certificate) ───────────────────────────
function onTiltMove(e: React.MouseEvent<HTMLDivElement>) {
  const rect = e.currentTarget.getBoundingClientRect();
  const dx = (e.clientX - (rect.left + rect.width  / 2)) / (rect.width  / 2);
  const dy = (e.clientY - (rect.top  + rect.height / 2)) / (rect.height / 2);
  gsap.to(e.currentTarget, { rotateX: -dy * 4, rotateY: dx * 4, duration: 0.5, ease: "power2.out", transformPerspective: 1000 });
}
function onTiltLeave(e: React.MouseEvent<HTMLDivElement>) {
  gsap.to(e.currentTarget, { rotateX: 0, rotateY: 0, duration: 0.9, ease: "elastic.out(1,0.4)" });
}

// ─────────────────────────────────────────────────────────────────────────────

export function PathOverview() {
  const sectionRef     = useRef<HTMLElement>(null);
  const trackRef       = useRef<HTMLDivElement>(null);
  const arrowRef       = useRef<HTMLSpanElement>(null);
  const progressRef    = useRef<HTMLDivElement>(null);
  const canvasRef      = useRef<HTMLCanvasElement>(null);
  const scrollTweenRef = useRef<gsap.core.Tween | null>(null);
  const folderCardsRef = useRef<(HTMLDivElement | null)[]>([null, null, null]);

  // Navigate to a specific panel by index (smooth GSAP-powered scroll)
  const goToPanel = useCallback((panelIndex: number) => {
    const st = scrollTweenRef.current?.scrollTrigger;
    if (!st) return;
    const targetProgress = panelIndex / (NUM_PANELS - 1);
    const targetScroll   = st.start + targetProgress * (st.end - st.start);
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
      rotateZ: def.rotateZ, rotateY: def.rotateY, rotateX: 0,
      x: def.x, y: def.y, z: def.z,
      scale: 1,
      duration: 0.75,
      ease: "elastic.out(1, 0.45)",
    });
  }, []);

  // Folder card click → fly up → fade → scroll to panel
  const onCardClick = useCallback((idx: number) => {
    const card = folderCardsRef.current[idx];
    if (!card) return;
    const def = CARD_DEFAULTS[idx];
    const panelIndex = idx + 1; // panels: 1=CORPUS, 2=VIS, 3=VICTOR

    const tl = gsap.timeline({
      onComplete: () => {
        goToPanel(panelIndex);
        // Restore card after nav completes
        setTimeout(() => {
          gsap.set(card, { opacity: 1, scale: 1, y: def.y, z: def.z, rotateZ: def.rotateZ, rotateY: def.rotateY, rotateX: 0, x: def.x });
        }, 1600);
      },
    });
    tl.to(card, { y: -80, z: 140, scale: 1.1, duration: 0.22, ease: "power2.out" });
    tl.to(card, { opacity: 0, scale: 0.92, duration: 0.28, ease: "power3.in" });
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
    const track   = trackRef.current;
    if (!section || !track) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // ── Desktop ────────────────────────────────────────────────────────────
      mm.add("(min-width: 1024px)", () => {
        section.style.overflow = "hidden";
        const panels = track.querySelectorAll<HTMLElement>("[data-panel]");
        const header = document.querySelector("header");

        if (arrowRef.current)
          gsap.to(arrowRef.current, { x: 10, yoyo: true, repeat: -1, duration: 0.72, ease: "sine.inOut" });

        // Initialize folder cards to off-screen 3D state
        folderCardsRef.current.forEach((card, idx) => {
          if (!card) return;
          const def = CARD_DEFAULTS[idx];
          gsap.set(card, {
            opacity: 0, rotateX: 80,
            rotateZ: def.rotateZ, rotateY: def.rotateY,
            x: def.x, y: def.y + 60, z: def.z - 40,
          });
        });

        const scrollTween = gsap.to(track, {
          x: () => -(track.scrollWidth - window.innerWidth),
          ease: "none",
          scrollTrigger: {
            trigger: section, pin: true, scrub: 1, anticipatePin: 1,
            end: () => `+=${track.scrollWidth - window.innerWidth}`,
            invalidateOnRefresh: true,
            snap: {
              snapTo: 1 / (NUM_PANELS - 1),
              duration: { min: 0.2, max: 0.45 },
              ease: "power2.inOut",
            },
            onEnter:     () => { if (header) gsap.to(header, { yPercent: -110, opacity: 0, duration: 0.45, ease: "power3.inOut" }); },
            onLeave:     () => { if (header) gsap.to(header, { yPercent: 0,    opacity: 1, duration: 0.5,  ease: "power3.out"   }); },
            onEnterBack: () => { if (header) gsap.to(header, { yPercent: -110, opacity: 0, duration: 0.45, ease: "power3.inOut" }); },
            onLeaveBack: () => { if (header) gsap.to(header, { yPercent: 0,    opacity: 1, duration: 0.5,  ease: "power3.out"   }); },
            onUpdate(self) {
              if (arrowRef.current) arrowRef.current.style.opacity = self.progress > 0.05 ? "0" : "1";
              if (progressRef.current) progressRef.current.style.transform = `scaleX(${self.progress})`;
            },
          },
        });

        scrollTweenRef.current = scrollTween;

        panels.forEach((panel, pIdx) => {
          const items = panel.querySelectorAll("[data-anim]");
          ScrollTrigger.create({
            trigger: panel, containerAnimation: scrollTween,
            start: "left 80%", once: true,
            onEnter: () => {
              if (items.length) {
                gsap.from(items, { opacity: 0, y: 28, stagger: 0.08, duration: 0.7, ease: "power3.out" });
              }
              // Intro panel: animate folder cards in with 3D flip
              if (pIdx === 0) {
                folderCardsRef.current.forEach((card, cIdx) => {
                  if (!card) return;
                  const def = CARD_DEFAULTS[cIdx];
                  gsap.to(card, {
                    opacity: 1, rotateX: 0,
                    rotateZ: def.rotateZ, rotateY: def.rotateY,
                    x: def.x, y: def.y, z: def.z,
                    duration: 0.85,
                    delay: 0.25 + cIdx * 0.12,
                    ease: "power3.out",
                  });
                });
              }
            },
          });
        });

        return () => {
          section.style.overflow = "";
          scrollTweenRef.current = null;
          if (header) gsap.set(header, { clearProps: "all" });
          folderCardsRef.current.forEach((c) => { if (c) gsap.set(c, { clearProps: "all" }); });
        };
      });

      // ── Mobile ─────────────────────────────────────────────────────────────
      mm.add("(max-width: 1023px)", () => {
        const header = document.querySelector("header");
        const navST  = ScrollTrigger.create({
          trigger: section, start: "top 20%", end: "bottom 10%",
          onEnter:     () => { if (header) gsap.to(header, { yPercent: -110, opacity: 0, duration: 0.4, ease: "power3.inOut" }); },
          onLeave:     () => { if (header) gsap.to(header, { yPercent: 0,    opacity: 1, duration: 0.4, ease: "power3.out"   }); },
          onEnterBack: () => { if (header) gsap.to(header, { yPercent: -110, opacity: 0, duration: 0.4, ease: "power3.inOut" }); },
          onLeaveBack: () => { if (header) gsap.to(header, { yPercent: 0,    opacity: 1, duration: 0.4, ease: "power3.out"   }); },
        });
        const mobHead = section.querySelector("[data-mobile-head]");
        if (mobHead) gsap.from(mobHead, { scrollTrigger: { trigger: mobHead, start: "top 85%", once: true }, opacity: 0, y: 30, duration: 0.65, ease: "power3.out" });
        const cards = section.querySelectorAll("[data-mobile-card]");
        if (cards.length) gsap.from(cards, { scrollTrigger: { trigger: section, start: "top 75%", once: true }, opacity: 0, y: 40, duration: 0.65, stagger: 0.1, ease: "power3.out" });

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
      style={{ background: "radial-gradient(ellipse at 18% 55%, rgba(240,146,38,0.09) 0%, transparent 58%), radial-gradient(ellipse at 82% 25%, rgba(240,146,38,0.05) 0%, transparent 45%), #020026" }}
    >
      {/* Canvas particles */}
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none hidden lg:block"
        style={{ position: "absolute", top: 0, left: 0, zIndex: 1 }}
      />

      {/* Progress bar */}
      <div className="pointer-events-none absolute top-0 left-0 hidden h-[2px] w-full lg:block"
        style={{ background: "rgba(255,255,255,0.1)", zIndex: 20 }}>
        <div ref={progressRef} className="h-full w-full origin-left"
          style={{ background: "linear-gradient(90deg,#F09226,#fff8)", transform: "scaleX(0)" }} />
      </div>

      {/* ── DESKTOP horizontal track ─────────────────────────────────────────── */}
      <div ref={trackRef} className="relative hidden lg:flex will-change-transform" style={{ zIndex: 5 }}>

        {/* ━━━ Panel 0 — Intro with Folder Cards ━━━ */}
        <div data-panel className="relative flex flex-col justify-center"
          style={{ width: "100vw", minHeight: "100vh", flexShrink: 0, padding: "6rem 5%" }}>
          <div className="mx-auto w-full max-w-[1400px]">
            <div className="grid items-center gap-12" style={{ gridTemplateColumns: "1fr 1fr" }}>

              {/* LEFT — text */}
              <div>
                <span data-anim className="label-tag mb-5 block">I 3 Blocchi Formativi — 2025/26</span>
                <h2 data-anim className="font-black leading-[0.95] tracking-tight text-white"
                  style={{ fontSize: "clamp(3.5rem,6.5vw,7rem)" }}>
                  Il<br /><span style={{ color: "#F09226" }}>Percorso.</span>
                </h2>
                <p data-anim className="mt-6 max-w-lg text-[1.0625rem] leading-relaxed"
                  style={{ color: "rgba(255,255,255,0.72)" }}>
                  9 mesi di formazione progressiva. Tre blocchi che si costruiscono l&apos;uno
                  sull&apos;altro fino alla certificazione FIPE.
                </p>
                <div data-anim className="mt-10 grid max-w-sm grid-cols-3 gap-3">
                  {[{ v: "9", u: "mesi" }, { v: "11", u: "weekend" }, { v: "30", u: "posti" }].map(({ v, u }) => (
                    <div key={u} className="p-4 text-center"
                      style={{ border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)" }}>
                      <p className="text-[2rem] font-black leading-none tabular-nums" style={{ color: "#F09226" }}>{v}</p>
                      <p className="mt-1 text-[0.75rem] font-bold tracking-[0.18em] uppercase" style={{ color: "rgba(255,255,255,0.5)" }}>{u}</p>
                    </div>
                  ))}
                </div>
                <div data-anim className="mt-10 flex items-center gap-3">
                  <span ref={arrowRef} className="inline-block text-xl" style={{ color: "#F09226" }}>→</span>
                  <span className="text-[0.7rem] font-bold tracking-[0.3em] uppercase" style={{ color: "rgba(255,255,255,0.38)" }}>
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
                {/* Subtle folder base / tray */}
                <div
                  className="absolute"
                  style={{
                    bottom: "12%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "460px",
                    height: "4px",
                    background: "linear-gradient(90deg, transparent, rgba(240,146,38,0.22), transparent)",
                    filter: "blur(1px)",
                  }}
                />
                <div
                  className="absolute"
                  style={{
                    bottom: "10%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "380px",
                    height: "12px",
                    background: "rgba(240,146,38,0.04)",
                    border: "1px solid rgba(240,146,38,0.12)",
                  }}
                />

                {/* Cards */}
                {COURSES.map((course, idx) => {
                  const meta = META[course.slug as keyof typeof META];
                  if (!meta) return null;
                  const { roman, color, tagline, season } = meta;

                  return (
                    <div
                      key={course.slug}
                      ref={(el) => { folderCardsRef.current[idx] = el; }}
                      onClick={() => onCardClick(idx)}
                      onMouseEnter={() => onCardEnter(idx)}
                      onMouseLeave={() => onCardLeave(idx)}
                      className="absolute"
                      style={{
                        top: "50%",
                        left: "50%",
                        width: "260px",
                        marginLeft: "-130px",
                        marginTop: "-175px",
                        cursor: "pointer",
                        transformStyle: "preserve-3d",
                      }}
                    >
                      {/* Card face */}
                      <div
                        style={{
                          background: "#f8f8fc",
                          border: "1px solid rgba(0,0,0,0.07)",
                          overflow: "hidden",
                          boxShadow: "0 24px 60px rgba(0,0,0,0.35), 0 4px 16px rgba(0,0,0,0.2)",
                          height: "350px",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          padding: "1.75rem 1.5rem 1.5rem",
                          position: "relative",
                        }}
                      >
                        {/* Top accent bar */}
                        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${color}, transparent)` }} />

                        {/* Top: roman + progress */}
                        <div>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                            <div className="font-black leading-none tabular-nums" style={{ fontSize: "4.5rem", color, lineHeight: 0.88 }}>
                              {roman}
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                              {COURSES.map((_, di) => (
                                <span key={di} style={{ width: di === idx ? 24 : 8, height: 2, background: di === idx ? color : "rgba(0,0,0,0.15)", display: "block" }} />
                              ))}
                            </div>
                          </div>
                          <span style={{ fontSize: "0.6rem", fontWeight: 900, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(240,146,38,0.7)" }}>
                            {course.area}
                          </span>
                          <h3 style={{ fontSize: "1.4rem", fontWeight: 900, color: "#111", lineHeight: 1, marginTop: "0.2rem" }}>
                            {course.title}
                          </h3>
                          <p style={{ fontSize: "0.875rem", fontWeight: 700, color, marginTop: "0.2rem" }}>{tagline}</p>
                        </div>

                        {/* Curriculum preview */}
                        <ul style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {course.curriculum.slice(0, 3).map((item) => (
                            <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: "0.8rem", color: "#555" }}>
                              <span style={{ marginTop: 5, width: 5, height: 5, borderRadius: "50%", background: color, flexShrink: 0 }} />
                              {item}
                            </li>
                          ))}
                        </ul>

                        {/* Footer */}
                        <div style={{ borderTop: "1px solid rgba(0,0,0,0.07)", paddingTop: "0.75rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "rgba(0,0,0,0.35)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                            {season}
                          </span>
                          <span style={{ fontSize: "0.75rem", fontWeight: 900, color, display: "flex", alignItems: "center", gap: 4 }}>
                            Scopri →
                          </span>
                        </div>
                      </div>

                      {/* Card "depth" edge (bottom) */}
                      <div
                        style={{
                          position: "absolute",
                          bottom: -6,
                          left: 6,
                          right: -6,
                          height: "100%",
                          background: "#e8e8ec",
                          zIndex: -1,
                          border: "1px solid rgba(0,0,0,0.05)",
                        }}
                      />
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        </div>

        {/* ━━━ Panels 1–3 — CORPUS / VIS / VICTOR ━━━ */}
        {COURSES.map((course, idx) => {
          const meta = META[course.slug as keyof typeof META];
          if (!meta) return null;
          const { roman, color, tagline, season, fipeSeason } = meta;

          return (
            <div key={course.slug} data-panel className="relative flex flex-col justify-center"
              style={{ width: "100vw", minHeight: "100vh", flexShrink: 0, padding: "4rem 5%" }}>
              <div className="mx-auto w-full max-w-[1400px]">
                <div className="grid grid-cols-2 gap-5" style={{ minHeight: "calc(100vh - 8rem)" }}>

                  {/* LEFT — light card with tilt */}
                  <div
                    data-anim
                    className="flex flex-col justify-between"
                    style={{ background: "#f8f8fc", border: "1px solid rgba(0,0,0,0.06)", padding: "3rem 3.5rem", willChange: "transform" }}
                    onMouseMove={onTiltMove}
                    onMouseLeave={onTiltLeave}
                  >
                    <div className="flex items-center gap-1.5">
                      {COURSES.map((_, di) => (
                        <span key={di} className="block" style={{ width: di === idx ? 28 : 8, height: 2, background: di === idx ? color : "rgba(0,0,0,0.15)" }} />
                      ))}
                      <span className="ml-3 text-[0.65rem] font-bold tracking-[0.28em] uppercase" style={{ color: "rgba(0,0,0,0.35)" }}>{roman} / III</span>
                    </div>

                    <div>
                      <div className="font-black leading-none tabular-nums" style={{ fontSize: "clamp(5rem,9vw,10rem)", color, lineHeight: 0.9 }}>
                        {roman}
                      </div>
                      <span className="mt-4 block text-[0.72rem] font-black tracking-[0.32em] uppercase" style={{ color: "rgba(240,146,38,0.75)" }}>
                        {course.area}
                      </span>
                      <h2 className="font-black leading-none tracking-tight" style={{ fontSize: "clamp(2.5rem,4.5vw,5rem)", color: "#111111", marginTop: "0.25rem" }}>
                        {course.title}
                      </h2>
                      <p className="text-[1.1rem] font-black" style={{ color, marginTop: "0.25rem" }}>{tagline}</p>
                      <p className="text-[1rem] leading-relaxed" style={{ color: "#444444", marginTop: "0.75rem" }}>{course.objective}</p>
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                      <span className="text-[0.68rem] font-bold tracking-[0.2em] uppercase" style={{ color: "rgba(0,0,0,0.3)" }}>Periodo</span>
                      <span className="px-3 py-1 text-[0.75rem] font-bold"
                        style={{ border: "1px solid rgba(240,146,38,0.3)", color: "#C06A0A", background: "rgba(240,146,38,0.06)" }}>
                        {season}
                      </span>
                    </div>
                  </div>

                  {/* RIGHT — dark card */}
                  <div data-anim className="flex flex-col justify-between"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", padding: "3rem" }}>
                    <div>
                      <p className="mb-5 text-[0.68rem] font-black tracking-[0.28em] uppercase" style={{ color: "rgba(255,255,255,0.5)" }}>
                        Programma
                      </p>
                      <ul className="space-y-3">
                        {course.curriculum.slice(0, 5).map((item) => (
                          <li key={item} className="flex items-start gap-3 text-[0.9375rem]" style={{ color: "rgba(255,255,255,0.82)" }}>
                            <span className="mt-[0.45em] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: color }} />
                            {item}
                          </li>
                        ))}
                        {course.curriculum.length > 5 && (
                          <li className="pl-[18px] text-[0.85rem]" style={{ color: "rgba(255,255,255,0.4)" }}>
                            + {course.curriculum.length - 5} argomenti
                          </li>
                        )}
                      </ul>
                    </div>
                    <div className="mt-6 space-y-3">
                      <a
                        href={`/corsi/${course.slug}`}
                        className="block w-full py-4 text-center text-[0.875rem] font-black tracking-[0.18em] uppercase transition-opacity duration-200"
                        style={{ background: "#F09226", color: "#010015" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = "0.85"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = "1"; }}
                      >
                        Scopri il programma →
                      </a>
                      <p className="text-[0.75rem]" style={{ color: "rgba(255,255,255,0.45)" }}>
                        <span style={{ color }}>✦</span>{" "}Sessione FIPE inclusa — {fipeSeason}
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          );
        })}

        {/* ━━━ Panel 4 — FIPE Certificate ━━━ */}
        <div data-panel className="flex flex-col justify-center"
          style={{ width: "100vw", minHeight: "100vh", flexShrink: 0, padding: "6rem 5%" }}>
          <div className="mx-auto w-full max-w-[1400px]">
            <div className="grid grid-cols-2 items-center gap-16">

              {/* Certificate document */}
              <div data-anim>
                <div
                  className="relative w-full max-w-[440px] overflow-hidden"
                  style={{ background: "#ffffff", boxShadow: "0 40px 100px rgba(0,0,0,0.35), 0 0 0 1px rgba(240,146,38,0.12)", willChange: "transform" }}
                  onMouseMove={onTiltMove}
                  onMouseLeave={onTiltLeave}
                >
                  <div style={{ background: "#020026", padding: "0.9rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                      <div style={{ width: 6, height: 6, background: "#F09226" }} />
                      <span style={{ fontSize: "0.58rem", fontWeight: 900, letterSpacing: "0.32em", color: "#F09226", textTransform: "uppercase" }}>Lacertosus Academy</span>
                    </div>
                    <span style={{ fontSize: "0.52rem", color: "rgba(240,146,38,0.5)", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }}>FIPE × LCT</span>
                  </div>
                  <div style={{ padding: "1.75rem 2rem 1.5rem" }}>
                    <div style={{ height: 3, background: "linear-gradient(90deg, #F09226, rgba(240,146,38,0.15))", marginBottom: "1.5rem" }} />
                    <p style={{ fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.3em", color: "#999", textTransform: "uppercase", marginBottom: "0.3rem" }}>Si certifica che</p>
                    <p style={{ fontSize: "1.25rem", fontWeight: 900, fontStyle: "italic", color: "#F09226", borderBottom: "1px solid rgba(240,146,38,0.18)", paddingBottom: "0.75rem", marginBottom: "1rem" }}>Nome Cognome</p>
                    <p style={{ fontSize: "0.78rem", lineHeight: 1.65, color: "#555", marginBottom: "0.75rem" }}>
                      ha completato con successo il{" "}
                      <strong style={{ color: "#111" }}>Percorso Formativo Lacertosus Academy</strong>
                      {" "}(CORPUS · VIS · VICTOR) e ottiene il titolo professionale di
                    </p>
                    <div style={{ background: "rgba(240,146,38,0.05)", border: "1px solid rgba(240,146,38,0.18)", padding: "0.75rem 1rem", marginBottom: "1.5rem" }}>
                      <p style={{ fontSize: "0.95rem", fontWeight: 900, letterSpacing: "0.06em", textTransform: "uppercase", color: "#111", lineHeight: 1.2 }}>
                        Personal Trainer<br /><span style={{ color: "#F09226" }}>FIPE × Lacertosus</span>
                      </p>
                      <p style={{ fontSize: "0.58rem", color: "#888", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", marginTop: "0.3rem" }}>Riconosciuto nel settore fitness italiano</p>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                      <div>
                        <div style={{ height: 1, width: 80, background: "rgba(0,0,0,0.18)", marginBottom: "0.3rem" }} />
                        <p style={{ fontSize: "0.56rem", color: "#aaa", letterSpacing: "0.12em" }}>Direttore Didattico</p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ height: 1, width: 80, background: "rgba(0,0,0,0.18)", marginBottom: "0.3rem" }} />
                        <p style={{ fontSize: "0.56rem", color: "#aaa", letterSpacing: "0.12em" }}>Responsabile FIPE</p>
                      </div>
                    </div>
                    <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(240,146,38,0.3), transparent)", margin: "1.25rem 0 0.75rem" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <p style={{ fontSize: "0.52rem", color: "#ccc", letterSpacing: "0.14em", textTransform: "uppercase" }}>Lacertosus Academy S.r.l.</p>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, borderRadius: "50%", border: "1.5px solid rgba(240,146,38,0.4)" }}>
                        <span style={{ fontSize: "0.48rem", fontWeight: 900, color: "#F09226", letterSpacing: "0.05em" }}>FIPE</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Text */}
              <div>
                <span data-anim className="label-tag mb-4 block">Certificazione Professionale</span>
                <h2 data-anim className="font-black leading-[1.05] tracking-tight text-white"
                  style={{ fontSize: "clamp(2rem,3.5vw,3.5rem)" }}>
                  Un titolo riconosciuto.{" "}
                  <span style={{ color: "#F09226" }}>Un professionista credibile.</span>
                </h2>
                <div data-anim className="mt-8 space-y-5">
                  {CERT_ITEMS.map((item) => (
                    <div key={item.n} className="flex gap-4">
                      <span className="mt-0.5 shrink-0 text-[0.72rem] font-black" style={{ color: "rgba(240,146,38,0.7)" }}>{item.n}</span>
                      <div>
                        <p className="text-[0.9375rem] font-bold text-white">{item.title}</p>
                        <p className="mt-0.5 text-[0.875rem] leading-relaxed" style={{ color: "rgba(255,255,255,0.62)" }}>{item.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div data-anim className="mt-8 inline-flex items-center gap-3 border px-5 py-3"
                  style={{ borderColor: "rgba(240,146,38,0.25)", background: "rgba(240,146,38,0.05)" }}>
                  <span style={{ color: "#F09226" }}>✦</span>
                  <span className="text-[0.78rem] font-bold tracking-wider uppercase" style={{ color: "#F09226" }}>
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
          <h2 className="font-black leading-tight tracking-tight text-white" style={{ fontSize: "clamp(2.2rem,8vw,3rem)" }}>
            Il Percorso.
          </h2>
          <p className="mt-2 text-[0.9375rem] leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
            9 mesi · 3 blocchi · 1 certificazione
          </p>
        </div>

        <div
          className="overflow-x-auto pb-6"
          style={{
            scrollSnapType: "x mandatory",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
            display: "flex", gap: "12px",
            paddingLeft: "5%", paddingRight: "5%",
            scrollPaddingInlineStart: "5%",
          }}
        >
          {COURSES.map((course) => {
            const meta = META[course.slug as keyof typeof META];
            if (!meta) return null;
            const { roman, color, tagline, season, fipeSeason } = meta;
            return (
              <div key={course.slug} data-mobile-card
                className="relative flex shrink-0 flex-col justify-between p-6"
                style={{ width: "82vw", scrollSnapAlign: "start", scrollSnapStop: "always", background: "#f8f8fc", border: "1px solid rgba(0,0,0,0.07)" }}>
                <div className="font-black leading-none tabular-nums mb-3" style={{ fontSize: "3.5rem", color }}>{roman}</div>
                <div>
                  <span className="mb-1 block text-[0.7rem] font-bold tracking-[0.28em] uppercase" style={{ color: "rgba(240,146,38,0.75)" }}>{course.area}</span>
                  <h3 className="text-[2rem] font-black leading-none" style={{ color: "#111" }}>{course.title}</h3>
                  <p className="mt-0.5 text-[0.9375rem] font-bold" style={{ color }}>{tagline}</p>
                  <p className="mt-3 text-[0.9375rem] leading-relaxed" style={{ color: "#444" }}>{course.objective}</p>
                  <ul className="mt-4 space-y-1.5">
                    {course.curriculum.slice(0, 4).map((item) => (
                      <li key={item} className="flex items-start gap-2 text-[0.875rem]" style={{ color: "#555" }}>
                        <span className="mt-[0.42em] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: color }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-5 space-y-3">
                  <span className="inline-block px-2.5 py-1 text-[0.75rem] font-bold"
                    style={{ border: "1px solid rgba(240,146,38,0.25)", color: "#C06A0A", background: "rgba(240,146,38,0.06)" }}>
                    {season}
                  </span>
                  <p className="text-[0.75rem]" style={{ color: "#888" }}>
                    <span style={{ color: "#F09226" }}>✦</span> FIPE — {fipeSeason}
                  </p>
                  <a href={`/corsi/${course.slug}`}
                    className="block w-full py-3 text-center text-[0.8rem] font-black tracking-[0.18em] uppercase"
                    style={{ background: "#F09226", color: "#010015" }}>
                    Scopri il programma →
                  </a>
                </div>
              </div>
            );
          })}

          {/* FIPE card mobile */}
          <div data-mobile-card className="shrink-0 flex flex-col overflow-hidden"
            style={{ width: "82vw", scrollSnapAlign: "start", scrollSnapStop: "always", background: "#ffffff", border: "1px solid rgba(240,146,38,0.2)" }}>
            <div style={{ background: "#020026", padding: "0.75rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <span style={{ fontSize: "0.52rem", fontWeight: 900, letterSpacing: "0.28em", color: "#F09226", textTransform: "uppercase" }}>Lacertosus Academy</span>
              <span style={{ fontSize: "0.5rem", color: "rgba(240,146,38,0.5)", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" }}>FIPE</span>
            </div>
            <div className="flex flex-col justify-between flex-1 p-5">
              <div>
                <div style={{ height: 2, background: "linear-gradient(90deg, #F09226, rgba(240,146,38,0.15))", marginBottom: "1rem" }} />
                <p className="mb-1 text-[0.62rem] font-bold tracking-[0.28em] uppercase" style={{ color: "#999" }}>Certificazione Finale</p>
                <h3 className="text-[1.75rem] font-black leading-tight" style={{ color: "#111" }}>FIPE × LACERTOSUS</h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed" style={{ color: "#444" }}>Titolo riconosciuto dal giorno del conseguimento.</p>
                <div className="mt-5 space-y-3">
                  {CERT_ITEMS.map((item) => (
                    <div key={item.n} className="flex gap-3">
                      <span className="shrink-0 text-[0.7rem] font-black" style={{ color: "#F09226" }}>{item.n}</span>
                      <p className="text-[0.875rem]" style={{ color: "#444" }}>
                        <span className="font-bold" style={{ color: "#111" }}>{item.title}</span> — {item.body}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-5 inline-flex items-center gap-2 border px-4 py-2.5"
                style={{ borderColor: "rgba(240,146,38,0.3)", background: "rgba(240,146,38,0.06)" }}>
                <span style={{ color: "#F09226" }}>✦</span>
                <span className="text-[0.72rem] font-bold tracking-wider uppercase" style={{ color: "#C06A0A" }}>Inclusa nel percorso</span>
              </div>
            </div>
          </div>

          {/* Trailing spacer */}
          <div style={{ width: "5%", flexShrink: 0 }} aria-hidden />
        </div>

        <div className="flex justify-center gap-1.5 pb-12">
          {Array.from({ length: 4 }, (_, i) => (
            <span key={i} className="block h-px w-5" style={{ background: i === 0 ? "#F09226" : "rgba(255,255,255,0.2)" }} />
          ))}
        </div>
      </div>
    </section>
  );
}
