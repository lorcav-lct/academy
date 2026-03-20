"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { COURSES } from "@/lib/constants/courses";
import { Button } from "@/components/ui/button";

// Block accent: CORPUS/VICTOR orange, VIS white
const META = {
  corpus: { roman: "I",   color: "#F09226", rgb: "240,146,38", tagline: "Le Fondamenta", fipeDate: "13–14 Nov" },
  vis:    { roman: "II",  color: "#ffffff", rgb: "255,255,255", tagline: "La Forza",      fipeDate: "12–13 Feb" },
  victor: { roman: "III", color: "#F09226", rgb: "240,146,38", tagline: "La Vittoria",   fipeDate: "14–15 Mag" },
} as const;

const CERT_ITEMS = [
  { n: "01", title: "Valore ufficiale nel settore",  body: "Riconosciuta da palestre e strutture sportive in tutta Italia." },
  { n: "02", title: "Approccio teorico-pratico",     body: "Prove pratiche sul campo, non solo esami scritti." },
  { n: "03", title: "Immediatamente spendibile",     body: "Dal giorno del conseguimento puoi esercitare la professione." },
];

const DIM   = "rgba(255,255,255,0.65)";
const DIM2  = "rgba(255,255,255,0.45)";
const FAINT = "rgba(255,255,255,0.1)";
const NUM_PANELS = 5; // intro + 3 blocks + fipe

// ── Particle canvas ──────────────────────────────────────────────────────────
function initParticles(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};

  const resize = () => {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener("resize", resize);

  const particles = Array.from({ length: 55 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.25,
    vy: (Math.random() - 0.5) * 0.25,
    r: Math.random() * 1.2 + 0.4,
    a: Math.random() * 0.35 + 0.05,
  }));

  let raf = 0;
  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = canvas.width;
      else if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      else if (p.y > canvas.height) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(240,146,38,${p.a})`;
      ctx.fill();
    }
    raf = requestAnimationFrame(draw);
  };
  draw();

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", resize);
  };
}

// ─────────────────────────────────────────────────────────────────────────────

export function PathOverview() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef   = useRef<HTMLDivElement>(null);
  const arrowRef   = useRef<HTMLSpanElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const canvasRef  = useRef<HTMLCanvasElement>(null);

  // Particles (desktop only)
  useEffect(() => {
    if (window.innerWidth < 1024 || !canvasRef.current) return;
    return initParticles(canvasRef.current);
  }, []);

  // GSAP
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const section  = sectionRef.current;
    const track    = trackRef.current;
    if (!section || !track) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px)", () => {
        section.style.overflow = "hidden";

        const panels = track.querySelectorAll<HTMLElement>("[data-panel]");

        // Arrow bounce
        if (arrowRef.current) {
          gsap.to(arrowRef.current, { x: 10, yoyo: true, repeat: -1, duration: 0.72, ease: "sine.inOut" });
        }

        // Main horizontal scroll
        const scrollTween = gsap.to(track, {
          x: () => -(track.scrollWidth - window.innerWidth),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            pin: true,
            scrub: 1.4,
            end: () => `+=${track.scrollWidth - window.innerWidth}`,
            invalidateOnRefresh: true,
            snap: { snapTo: 1 / (NUM_PANELS - 1), duration: { min: 0.2, max: 0.5 }, ease: "power2.inOut" },
            onUpdate(self) {
              // Fade arrow out after first move
              if (arrowRef.current) arrowRef.current.style.opacity = self.progress > 0.05 ? "0" : "1";
              // Animate progress bar
              if (progressRef.current) progressRef.current.style.transform = `scaleX(${self.progress})`;
            },
          },
        });

        // Per-panel content animations
        panels.forEach((panel) => {
          const items = panel.querySelectorAll("[data-anim]");
          if (!items.length) return;
          ScrollTrigger.create({
            trigger: panel,
            containerAnimation: scrollTween,
            start: "left 80%",
            once: true,
            onEnter: () => {
              gsap.from(items, { opacity: 0, y: 28, stagger: 0.08, duration: 0.7, ease: "power3.out" });
            },
          });
        });

        return () => { section.style.overflow = ""; };
      });

      mm.add("(max-width: 1023px)", () => {
        const header = section.querySelector("[data-mobile-head]");
        if (header) {
          gsap.from(header, {
            scrollTrigger: { trigger: header, start: "top 85%", once: true },
            opacity: 0, y: 30, duration: 0.65, ease: "power3.out",
          });
        }
        const cards = section.querySelectorAll("[data-mobile-card]");
        if (cards.length) {
          gsap.from(cards, {
            scrollTrigger: { trigger: section, start: "top 75%", once: true },
            opacity: 0, y: 40, duration: 0.65, stagger: 0.1, ease: "power3.out",
          });
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="percorso" className="relative bg-academy-dark">

      {/* Particle canvas — desktop only, above all content */}
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none hidden lg:block"
        style={{ position: "absolute", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 10 }}
      />

      {/* Progress bar — desktop horizontal scroll */}
      <div className="pointer-events-none absolute top-0 left-0 z-10 hidden h-[2px] w-full lg:block"
        style={{ background: "rgba(255,255,255,0.06)" }}>
        <div ref={progressRef} className="h-full w-full origin-left"
          style={{ background: "linear-gradient(90deg,#F09226,#ffffff)", transform: "scaleX(0)", transition: "transform 0.05s linear" }} />
      </div>

      {/* ── DESKTOP horizontal track ── */}
      <div ref={trackRef} className="relative hidden lg:flex will-change-transform" style={{ zIndex: 2 }}>

        {/* Panel 0 — Intro */}
        <div data-panel className="relative flex flex-col justify-center py-24"
          style={{ width: "100vw", minHeight: "100vh", flexShrink: 0, padding: "6rem 5%" }}>

          <div className="mx-auto w-full max-w-[1440px]">
            {/* Bg decoration */}
            <div className="pointer-events-none absolute right-[4%] top-1/2 -translate-y-1/2 select-none font-black leading-none text-white"
              style={{ fontSize: "clamp(10rem,16vw,18rem)", opacity: 0.025 }}>LCT</div>

            <span data-anim className="label-tag mb-5 block">I 3 Blocchi Formativi — 2025/26</span>
            <h2 data-anim className="font-black leading-[0.95] tracking-tight text-white"
              style={{ fontSize: "clamp(3.5rem,6.5vw,7rem)" }}>
              Il<br /><span style={{ color: "#F09226" }}>Percorso.</span>
            </h2>
            <p data-anim className="mt-6 max-w-lg text-[1.0625rem] leading-relaxed" style={{ color: DIM }}>
              9 mesi di formazione progressiva. Tre blocchi che si costruiscono l&apos;uno
              sull&apos;altro fino alla certificazione FIPE.
            </p>

            {/* Stats */}
            <div data-anim className="mt-10 grid max-w-lg grid-cols-3 gap-3">
              {[{ v: "9", u: "mesi" }, { v: "11", u: "weekend" }, { v: "30", u: "posti" }].map(({ v, u }) => (
                <div key={u} className="p-5 text-center"
                  style={{ border: `1px solid ${FAINT}`, background: "rgba(255,255,255,0.025)" }}>
                  <p className="text-[2.2rem] font-black leading-none tabular-nums" style={{ color: "#F09226" }}>{v}</p>
                  <p className="mt-1 text-[0.78rem] font-bold tracking-[0.18em] uppercase" style={{ color: DIM }}>{u}</p>
                </div>
              ))}
            </div>

            {/* Scroll hint */}
            <div data-anim className="mt-12 flex items-center gap-3">
              <span ref={arrowRef} className="inline-block text-xl" style={{ color: "#F09226" }}>→</span>
              <span className="text-[0.72rem] font-bold tracking-[0.3em] uppercase" style={{ color: "rgba(255,255,255,0.5)" }}>
                CORPUS · VIS · VICTOR · FIPE
              </span>
            </div>
          </div>
        </div>

        {/* Panels 1–3 — CORPUS / VIS / VICTOR */}
        {COURSES.map((course, idx) => {
          const meta = META[course.slug as keyof typeof META];
          if (!meta) return null;
          const { color, rgb, roman, tagline, fipeDate } = meta;
          const ra = (a: number) => `rgba(${rgb},${a})`;

          return (
            <div key={course.slug} data-panel className="relative flex flex-col justify-center"
              style={{ width: "100vw", minHeight: "100vh", flexShrink: 0, padding: "6rem 5%" }}>
              <div className="mx-auto w-full max-w-[1440px]">

                {/* Decorative bg roman */}
                <div className="pointer-events-none absolute right-[4%] top-1/2 -translate-y-1/2 select-none font-black leading-none"
                  style={{ fontSize: "clamp(14rem,20vw,22rem)", color, opacity: 0.04 }}>{roman}</div>

                {/* Progress dots */}
                <div data-anim className="mb-10 flex items-center gap-2">
                  {COURSES.map((_, di) => (
                    <span key={di} className="block"
                      style={{ width: di === idx ? 32 : 8, height: 2, background: di === idx ? color : "rgba(255,255,255,0.3)", transition: "width 0.3s" }} />
                  ))}
                  <span className="ml-4 text-[0.68rem] font-bold tracking-[0.25em] uppercase" style={{ color: "rgba(255,255,255,0.5)" }}>
                    Blocco {roman} / III
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-20">
                  {/* Left */}
                  <div>
                    <span data-anim className="mb-2 block text-[0.72rem] font-black tracking-[0.32em] uppercase" style={{ color: ra(0.55) }}>
                      {course.area}
                    </span>
                    <h2 data-anim className="font-black leading-none tracking-tight text-white"
                      style={{ fontSize: "clamp(3rem,5vw,5.5rem)" }}>
                      {course.title}
                    </h2>
                    <p data-anim className="mt-1 text-[1.125rem] font-black" style={{ color }}>{tagline}</p>
                    <p data-anim className="mt-4 text-[1.0625rem] leading-relaxed" style={{ color: DIM }}>{course.objective}</p>
                    <div data-anim className="mt-5 flex flex-wrap gap-2">
                      {course.dates.map((d) => (
                        <span key={d} className="px-3 py-1 text-[0.8rem] font-bold"
                          style={{ border: `1px solid ${ra(0.22)}`, color: ra(0.72), background: ra(0.06) }}>
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Right */}
                  <div className="flex flex-col justify-between">
                    <div>
                      <p data-anim className="mb-3 text-[0.68rem] font-black tracking-[0.28em] uppercase" style={{ color: "rgba(255,255,255,0.5)" }}>
                        Programma
                      </p>
                      <ul data-anim className="space-y-2.5">
                        {course.curriculum.slice(0, 5).map((item) => (
                          <li key={item} className="flex items-start gap-3 text-[0.9375rem]" style={{ color: "rgba(255,255,255,0.72)" }}>
                            <span className="mt-[0.45em] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: color }} />
                            {item}
                          </li>
                        ))}
                        {course.curriculum.length > 5 && (
                          <li className="pl-[18px] text-[0.85rem]" style={{ color: "rgba(255,255,255,0.45)" }}>
                            + {course.curriculum.length - 5} argomenti
                          </li>
                        )}
                      </ul>
                    </div>
                    <div data-anim className="mt-8">
                      <Button href={`/corsi/${course.slug}`} variant="ghost" size="sm">
                        Scopri il programma →
                      </Button>
                      <p className="mt-3 text-[0.78rem]" style={{ color: "rgba(255,255,255,0.45)" }}>
                        <span style={{ color: "#F09226" }}>✦</span>{" "}
                        Sessione FIPE inclusa — {fipeDate}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Panel 4 — FIPE Certification */}
        <div data-panel className="flex flex-col justify-center"
          style={{ width: "100vw", minHeight: "100vh", flexShrink: 0, padding: "6rem 5%" }}>
          <div className="mx-auto w-full max-w-[1440px]">
            <div className="grid grid-cols-2 items-center gap-20">

              {/* Certificate mockup — light theme */}
              <div data-anim style={{ filter: "drop-shadow(0 32px 64px rgba(240,146,38,0.15))" }}>
                <div className="w-full max-w-[420px] overflow-hidden p-10"
                  style={{ background: "#ffffff", border: "1px solid rgba(240,146,38,0.3)" }}>
                  <div className="mb-8 h-px w-full" style={{ background: "linear-gradient(90deg,transparent,#F09226,transparent)" }} />
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center border" style={{ borderColor: "rgba(240,146,38,0.4)" }}>
                      <span className="text-[0.7rem] font-black" style={{ color: "#F09226" }}>LCT</span>
                    </div>
                    <div>
                      <p className="text-[0.7rem] font-bold tracking-[0.2em] uppercase" style={{ color: "#D47B10" }}>Lacertosus Academy</p>
                      <p className="text-[0.7rem] font-bold tracking-[0.16em] uppercase" style={{ color: "rgba(212,123,16,0.5)" }}>FIPE × LACERTOSUS</p>
                    </div>
                  </div>
                  <p className="mb-1 text-[0.68rem] font-bold tracking-[0.25em] uppercase" style={{ color: "#999" }}>Certifica che</p>
                  <div className="mb-4 border-b pb-3" style={{ borderColor: "rgba(240,146,38,0.15)" }}>
                    <p className="text-[1.1rem] font-black italic" style={{ color: "#F09226" }}>Nome Cognome</p>
                  </div>
                  <p className="mb-3 text-[0.8rem] leading-relaxed" style={{ color: "#555" }}>
                    ha completato il{" "}
                    <span className="font-semibold" style={{ color: "#111" }}>Percorso Formativo Lacertosus Academy</span>{" "}
                    e ottiene il titolo di
                  </p>
                  <p className="mb-1 text-[0.92rem] font-black uppercase tracking-wide" style={{ color: "#111" }}>
                    Personal Trainer<br />FIPE × LACERTOSUS
                  </p>
                  <p className="text-[0.7rem]" style={{ color: "#999" }}>Riconosciuto nel settore fitness</p>
                  <div className="mt-8 flex items-end justify-between">
                    <div>
                      <div className="mb-1 h-px w-20" style={{ background: "rgba(240,146,38,0.25)" }} />
                      <p className="text-[0.68rem]" style={{ color: "#bbb" }}>Firma del Direttore</p>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-full border" style={{ borderColor: "rgba(240,146,38,0.35)" }}>
                      <span className="text-[0.7rem] font-black" style={{ color: "rgba(240,146,38,0.55)" }}>FIPE</span>
                    </div>
                  </div>
                  <div className="mt-7 h-px w-full" style={{ background: "linear-gradient(90deg,transparent,#F09226,transparent)" }} />
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
                        <p className="mt-0.5 text-[0.875rem] leading-relaxed" style={{ color: DIM }}>{item.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div data-anim className="mt-8 inline-flex items-center gap-3 border px-5 py-3"
                  style={{ borderColor: "rgba(240,146,38,0.2)", background: "rgba(240,146,38,0.04)" }}>
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

      {/* ── MOBILE: native swipe carousel ── */}
      <div className="relative lg:hidden" style={{ zIndex: 2 }}>
        <div data-mobile-head className="px-[5%] pt-16 pb-6">
          <span className="label-tag mb-3 block">I 3 Blocchi Formativi</span>
          <h2 className="font-black leading-tight tracking-tight text-white"
            style={{ fontSize: "clamp(2.2rem,8vw,3rem)" }}>
            Il Percorso.
          </h2>
          <p className="mt-2 text-[0.9375rem] leading-relaxed" style={{ color: DIM }}>
            9 mesi · 3 blocchi · 1 certificazione
          </p>
        </div>

        {/* Horizontal swipe */}
        <div className="overflow-x-auto pb-6"
          style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch", scrollbarWidth: "none", paddingLeft: "5%", paddingRight: "5%", display: "flex", gap: "12px" }}>

          {COURSES.map((course) => {
            const meta = META[course.slug as keyof typeof META];
            if (!meta) return null;
            const { color, rgb, roman, tagline, fipeDate } = meta;
            const ra = (a: number) => `rgba(${rgb},${a})`;
            return (
              <div key={course.slug} data-mobile-card className="relative flex shrink-0 flex-col justify-between p-6"
                style={{ width: "82vw", scrollSnapAlign: "start", background: "rgba(255,255,255,0.03)", border: `1px solid ${FAINT}` }}>
                <span className="pointer-events-none absolute right-4 bottom-3 select-none font-black leading-none"
                  style={{ fontSize: "5.5rem", color, opacity: 0.06 }}>{roman}</span>
                <div>
                  <span className="mb-1 block text-[0.7rem] font-bold tracking-[0.28em] uppercase" style={{ color: ra(0.5) }}>
                    {roman} · {course.area}
                  </span>
                  <h3 className="text-[2rem] font-black leading-none text-white">{course.title}</h3>
                  <p className="mt-0.5 text-[0.9375rem] font-bold" style={{ color }}>{tagline}</p>
                  <p className="mt-3 text-[0.9375rem] leading-relaxed" style={{ color: DIM }}>{course.objective}</p>
                  <ul className="mt-4 space-y-1.5">
                    {course.curriculum.slice(0, 4).map((item) => (
                      <li key={item} className="flex items-start gap-2 text-[0.875rem]" style={{ color: "rgba(255,255,255,0.5)" }}>
                        <span className="mt-[0.42em] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: color }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-5">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {course.dates.map((d) => (
                      <span key={d} className="px-2.5 py-1 text-[0.78rem] font-bold"
                        style={{ border: `1px solid ${ra(0.2)}`, color: ra(0.7), background: ra(0.06) }}>{d}</span>
                    ))}
                  </div>
                  <p className="text-[0.75rem]" style={{ color: "rgba(255,255,255,0.45)" }}>
                    <span style={{ color: "#F09226" }}>✦</span> Sessione FIPE — {fipeDate}
                  </p>
                </div>
              </div>
            );
          })}

          {/* FIPE card */}
          <div data-mobile-card className="shrink-0 flex flex-col justify-between p-6"
            style={{ width: "82vw", scrollSnapAlign: "start", background: "rgba(240,146,38,0.05)", border: "1px solid rgba(240,146,38,0.13)" }}>
            <div>
              <p className="mb-2 text-[0.7rem] font-black tracking-[0.3em] uppercase" style={{ color: "rgba(240,146,38,0.6)" }}>
                Certificazione Finale
              </p>
              <h3 className="text-[1.75rem] font-black leading-tight text-white">FIPE × LACERTOSUS</h3>
              <p className="mt-2 text-[0.9375rem] leading-relaxed" style={{ color: DIM }}>
                Titolo riconosciuto dal giorno del conseguimento.
              </p>
              <div className="mt-5 space-y-3">
                {CERT_ITEMS.map((item) => (
                  <div key={item.n} className="flex gap-3">
                    <span className="shrink-0 text-[0.7rem] font-black" style={{ color: "rgba(240,146,38,0.7)" }}>{item.n}</span>
                    <p className="text-[0.875rem]" style={{ color: "rgba(255,255,255,0.7)" }}>
                      <span className="font-bold text-white">{item.title}</span> — {item.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6 inline-flex items-center gap-2 border px-4 py-2.5"
              style={{ borderColor: "rgba(240,146,38,0.2)", background: "rgba(240,146,38,0.05)" }}>
              <span style={{ color: "#F09226" }}>✦</span>
              <span className="text-[0.72rem] font-bold tracking-wider uppercase" style={{ color: "#F09226" }}>
                Inclusa nel percorso
              </span>
            </div>
          </div>
        </div>

        {/* Swipe hint */}
        <div className="flex justify-center gap-1.5 pb-12">
          {Array.from({ length: 4 }, (_, i) => (
            <span key={i} className="block h-px w-5" style={{ background: i === 0 ? "#F09226" : "rgba(255,255,255,0.14)" }} />
          ))}
        </div>
      </div>
    </section>
  );
}
