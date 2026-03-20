"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { COURSES } from "@/lib/constants/courses";
import { Button } from "@/components/ui/button";

const META = {
  corpus: { roman: "I",   color: "#F09226", tagline: "Le Fondamenta", fipeDate: "13–14 Nov" },
  vis:    { roman: "II",  color: "#F09226", tagline: "La Forza",      fipeDate: "12–13 Feb" },
  victor: { roman: "III", color: "#F09226", tagline: "La Vittoria",   fipeDate: "14–15 Mag" },
} as const;

const CERT_ITEMS = [
  { n: "01", title: "Valore ufficiale nel settore",  body: "Riconosciuta da palestre e strutture sportive in tutta Italia." },
  { n: "02", title: "Approccio teorico-pratico",     body: "Prove pratiche sul campo, non solo esami scritti." },
  { n: "03", title: "Immediatamente spendibile",     body: "Dal giorno del conseguimento puoi esercitare la professione." },
];

const NUM_PANELS = 5;

// ── Improved particles ──────────────────────────────────────────────────────
function initParticles(canvas: HTMLCanvasElement) {
  const dpr = window.devicePixelRatio || 1;

  const resize = () => {
    canvas.width  = window.innerWidth  * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width  = window.innerWidth  + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.scale(dpr, dpr);
  };

  const ctx = canvas.getContext("2d")!;
  resize();
  window.addEventListener("resize", resize);

  const W = () => window.innerWidth;
  const H = () => window.innerHeight;

  const pts = Array.from({ length: 90 }, () => ({
    x: Math.random() * W(),
    y: Math.random() * H(),
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
    r: Math.random() * 2.5 + 1.2,
    a: Math.random() * 0.55 + 0.25,
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

// ─────────────────────────────────────────────────────────────────────────────

export function PathOverview() {
  const sectionRef  = useRef<HTMLElement>(null);
  const trackRef    = useRef<HTMLDivElement>(null);
  const arrowRef    = useRef<HTMLSpanElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.innerWidth < 1024) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    return initParticles(canvas);
  }, []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const section = sectionRef.current;
    const track   = trackRef.current;
    if (!section || !track) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px)", () => {
        section.style.overflow = "hidden";
        const panels = track.querySelectorAll<HTMLElement>("[data-panel]");

        if (arrowRef.current)
          gsap.to(arrowRef.current, { x: 10, yoyo: true, repeat: -1, duration: 0.72, ease: "sine.inOut" });

        const scrollTween = gsap.to(track, {
          x: () => -(track.scrollWidth - window.innerWidth),
          ease: "none",
          scrollTrigger: {
            trigger: section, pin: true, scrub: 1.4,
            end: () => `+=${track.scrollWidth - window.innerWidth}`,
            invalidateOnRefresh: true,
            snap: { snapTo: 1 / (NUM_PANELS - 1), duration: { min: 0.2, max: 0.5 }, ease: "power2.inOut" },
            onUpdate(self) {
              if (arrowRef.current) arrowRef.current.style.opacity = self.progress > 0.05 ? "0" : "1";
              if (progressRef.current) progressRef.current.style.transform = `scaleX(${self.progress})`;
            },
          },
        });

        panels.forEach((panel) => {
          const items = panel.querySelectorAll("[data-anim]");
          if (!items.length) return;
          ScrollTrigger.create({
            trigger: panel, containerAnimation: scrollTween,
            start: "left 80%", once: true,
            onEnter: () => gsap.from(items, { opacity: 0, y: 28, stagger: 0.08, duration: 0.7, ease: "power3.out" }),
          });
        });

        return () => { section.style.overflow = ""; };
      });

      mm.add("(max-width: 1023px)", () => {
        const header = section.querySelector("[data-mobile-head]");
        if (header) gsap.from(header, { scrollTrigger: { trigger: header, start: "top 85%", once: true }, opacity: 0, y: 30, duration: 0.65, ease: "power3.out" });
        const cards = section.querySelectorAll("[data-mobile-card]");
        if (cards.length) gsap.from(cards, { scrollTrigger: { trigger: section, start: "top 75%", once: true }, opacity: 0, y: 40, duration: 0.65, stagger: 0.1, ease: "power3.out" });
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
        style={{ background: "rgba(255,255,255,0.12)", zIndex: 20 }}>
        <div ref={progressRef} className="h-full w-full origin-left"
          style={{ background: "linear-gradient(90deg,#F09226,#fff8)", transform: "scaleX(0)" }} />
      </div>

      {/* ── DESKTOP horizontal track ── */}
      <div ref={trackRef} className="relative hidden lg:flex will-change-transform" style={{ zIndex: 5 }}>

        {/* Panel 0 — Intro */}
        <div data-panel className="relative flex flex-col justify-center"
          style={{ width: "100vw", minHeight: "100vh", flexShrink: 0, padding: "6rem 5%" }}>
          <div className="mx-auto w-full max-w-[1400px]">
            <span data-anim className="label-tag mb-5 block">I 3 Blocchi Formativi — 2025/26</span>
            <h2 data-anim className="font-black leading-[0.95] tracking-tight text-white"
              style={{ fontSize: "clamp(3.5rem,6.5vw,7rem)" }}>
              Il<br /><span style={{ color: "#F09226" }}>Percorso.</span>
            </h2>
            <p data-anim className="mt-6 max-w-lg text-[1.0625rem] leading-relaxed text-white/70">
              9 mesi di formazione progressiva. Tre blocchi che si costruiscono l&apos;uno
              sull&apos;altro fino alla certificazione FIPE.
            </p>
            <div data-anim className="mt-10 grid max-w-lg grid-cols-3 gap-3">
              {[{ v: "9", u: "mesi" }, { v: "11", u: "weekend" }, { v: "30", u: "posti" }].map(({ v, u }) => (
                <div key={u} className="p-5 text-center"
                  style={{ border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)" }}>
                  <p className="text-[2.2rem] font-black leading-none tabular-nums" style={{ color: "#F09226" }}>{v}</p>
                  <p className="mt-1 text-[0.8rem] font-bold tracking-[0.18em] uppercase text-white/60">{u}</p>
                </div>
              ))}
            </div>
            <div data-anim className="mt-12 flex items-center gap-3">
              <span ref={arrowRef} className="inline-block text-xl" style={{ color: "#F09226" }}>→</span>
              <span className="text-[0.72rem] font-bold tracking-[0.3em] uppercase text-white/50">
                CORPUS · VIS · VICTOR · FIPE
              </span>
            </div>
          </div>
        </div>

        {/* Panels 1–3 — CORPUS / VIS / VICTOR */}
        {COURSES.map((course, idx) => {
          const meta = META[course.slug as keyof typeof META];
          if (!meta) return null;
          const { roman, color, tagline, fipeDate } = meta;

          return (
            <div key={course.slug} data-panel className="relative flex flex-col justify-center"
              style={{ width: "100vw", minHeight: "100vh", flexShrink: 0, padding: "4rem 5%" }}>
              <div className="mx-auto w-full max-w-[1400px]">
                <div className="grid grid-cols-2 gap-5" style={{ minHeight: "calc(100vh - 8rem)" }}>

                  {/* LEFT — light card */}
                  <div data-anim className="flex flex-col justify-between"
                    style={{ background: "#f8f8fc", border: "1px solid rgba(0,0,0,0.06)", padding: "3rem 3.5rem" }}>
                    {/* Top: progress dots */}
                    <div className="flex items-center gap-1.5 mb-2">
                      {COURSES.map((_, di) => (
                        <span key={di} className="block"
                          style={{ width: di === idx ? 28 : 8, height: 2, background: di === idx ? color : "rgba(0,0,0,0.15)" }} />
                      ))}
                      <span className="ml-3 text-[0.65rem] font-bold tracking-[0.28em] uppercase" style={{ color: "rgba(0,0,0,0.35)" }}>
                        {roman} / III
                      </span>
                    </div>

                    <div>
                      {/* Roman numeral — full opacity, big */}
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

                    {/* Dates */}
                    <div className="flex flex-wrap gap-2 mt-5">
                      {course.dates.map((d) => (
                        <span key={d} className="px-3 py-1 text-[0.78rem] font-bold"
                          style={{ border: "1px solid rgba(240,146,38,0.3)", color: "#D47B10", background: "rgba(240,146,38,0.06)" }}>
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* RIGHT — dark card, curriculum */}
                  <div data-anim className="flex flex-col justify-between"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", padding: "3rem" }}>
                    <div>
                      <p className="mb-5 text-[0.68rem] font-black tracking-[0.28em] uppercase text-white/55">
                        Programma
                      </p>
                      <ul className="space-y-3">
                        {course.curriculum.slice(0, 5).map((item) => (
                          <li key={item} className="flex items-start gap-3 text-[0.9375rem] text-white/82">
                            <span className="mt-[0.45em] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: color }} />
                            {item}
                          </li>
                        ))}
                        {course.curriculum.length > 5 && (
                          <li className="pl-[18px] text-[0.85rem] text-white/45">
                            + {course.curriculum.length - 5} argomenti
                          </li>
                        )}
                      </ul>
                    </div>
                    <div className="mt-6">
                      <Button href={`/corsi/${course.slug}`} variant="ghost" size="sm">
                        Scopri il programma →
                      </Button>
                      <p className="mt-3 text-[0.78rem] text-white/55">
                        <span style={{ color }}>✦</span>{" "}
                        Sessione FIPE inclusa — {fipeDate}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Panel 4 — FIPE */}
        <div data-panel className="flex flex-col justify-center"
          style={{ width: "100vw", minHeight: "100vh", flexShrink: 0, padding: "6rem 5%" }}>
          <div className="mx-auto w-full max-w-[1400px]">
            <div className="grid grid-cols-2 items-center gap-16">

              {/* Certificate — light */}
              <div data-anim style={{ filter: "drop-shadow(0 32px 64px rgba(240,146,38,0.2))" }}>
                <div className="w-full max-w-[420px] overflow-hidden p-9"
                  style={{ background: "#ffffff", border: "1px solid rgba(240,146,38,0.3)" }}>
                  <div className="mb-7 h-px w-full" style={{ background: "linear-gradient(90deg,transparent,#F09226,transparent)" }} />
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center border" style={{ borderColor: "rgba(240,146,38,0.5)" }}>
                      <span className="text-[0.7rem] font-black" style={{ color: "#F09226" }}>LCT</span>
                    </div>
                    <div>
                      <p className="text-[0.7rem] font-bold tracking-[0.2em] uppercase" style={{ color: "#D47B10" }}>Lacertosus Academy</p>
                      <p className="text-[0.7rem] font-bold tracking-[0.16em] uppercase" style={{ color: "rgba(212,123,16,0.6)" }}>FIPE × LACERTOSUS</p>
                    </div>
                  </div>
                  <p className="mb-1 text-[0.68rem] font-bold tracking-[0.25em] uppercase" style={{ color: "#888" }}>Certifica che</p>
                  <div className="mb-4 border-b pb-3" style={{ borderColor: "rgba(240,146,38,0.18)" }}>
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
                  <p className="text-[0.7rem]" style={{ color: "#888" }}>Riconosciuto nel settore fitness</p>
                  <div className="mt-7 flex items-end justify-between">
                    <div>
                      <div className="mb-1 h-px w-20" style={{ background: "rgba(240,146,38,0.28)" }} />
                      <p className="text-[0.68rem]" style={{ color: "#bbb" }}>Firma del Direttore</p>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-full border" style={{ borderColor: "rgba(240,146,38,0.4)" }}>
                      <span className="text-[0.7rem] font-black" style={{ color: "#F09226" }}>FIPE</span>
                    </div>
                  </div>
                  <div className="mt-6 h-px w-full" style={{ background: "linear-gradient(90deg,transparent,#F09226,transparent)" }} />
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
                        <p className="mt-0.5 text-[0.875rem] leading-relaxed text-white/65">{item.body}</p>
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

      {/* ── MOBILE ── */}
      <div className="relative lg:hidden" style={{ zIndex: 2 }}>
        <div data-mobile-head className="px-[5%] pt-16 pb-6">
          <span className="label-tag mb-3 block">I 3 Blocchi Formativi</span>
          <h2 className="font-black leading-tight tracking-tight text-white" style={{ fontSize: "clamp(2.2rem,8vw,3rem)" }}>
            Il Percorso.
          </h2>
          <p className="mt-2 text-[0.9375rem] leading-relaxed text-white/65">
            9 mesi · 3 blocchi · 1 certificazione
          </p>
        </div>

        <div className="overflow-x-auto pb-6"
          style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch", scrollbarWidth: "none", paddingLeft: "5%", paddingRight: "5%", display: "flex", gap: "12px" }}>

          {COURSES.map((course) => {
            const meta = META[course.slug as keyof typeof META];
            if (!meta) return null;
            const { roman, color, tagline, fipeDate } = meta;
            return (
              <div key={course.slug} data-mobile-card className="relative flex shrink-0 flex-col justify-between p-6"
                style={{ width: "82vw", scrollSnapAlign: "start", background: "#f8f8fc", border: "1px solid rgba(0,0,0,0.07)" }}>
                {/* Roman numeral — visible */}
                <div className="font-black leading-none tabular-nums mb-3" style={{ fontSize: "3.5rem", color }}>
                  {roman}
                </div>
                <div>
                  <span className="mb-1 block text-[0.7rem] font-bold tracking-[0.28em] uppercase" style={{ color: "rgba(240,146,38,0.75)" }}>
                    {course.area}
                  </span>
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
                <div className="mt-5">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {course.dates.map((d) => (
                      <span key={d} className="px-2.5 py-1 text-[0.78rem] font-bold"
                        style={{ border: "1px solid rgba(240,146,38,0.25)", color: "#D47B10", background: "rgba(240,146,38,0.06)" }}>{d}</span>
                    ))}
                  </div>
                  <p className="text-[0.75rem]" style={{ color: "#888" }}>
                    <span style={{ color: "#F09226" }}>✦</span> Sessione FIPE — {fipeDate}
                  </p>
                </div>
              </div>
            );
          })}

          {/* FIPE card mobile — light */}
          <div data-mobile-card className="shrink-0 flex flex-col justify-between p-6"
            style={{ width: "82vw", scrollSnapAlign: "start", background: "#ffffff", border: "1px solid rgba(240,146,38,0.25)" }}>
            <div>
              <p className="mb-2 text-[0.7rem] font-black tracking-[0.3em] uppercase" style={{ color: "#D47B10" }}>
                Certificazione Finale
              </p>
              <h3 className="text-[1.75rem] font-black leading-tight" style={{ color: "#111" }}>FIPE × LACERTOSUS</h3>
              <p className="mt-2 text-[0.9375rem] leading-relaxed" style={{ color: "#444" }}>
                Titolo riconosciuto dal giorno del conseguimento.
              </p>
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
            <div className="mt-6 inline-flex items-center gap-2 border px-4 py-2.5"
              style={{ borderColor: "rgba(240,146,38,0.3)", background: "rgba(240,146,38,0.06)" }}>
              <span style={{ color: "#F09226" }}>✦</span>
              <span className="text-[0.72rem] font-bold tracking-wider uppercase" style={{ color: "#D47B10" }}>
                Inclusa nel percorso
              </span>
            </div>
          </div>
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
