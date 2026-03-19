"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import { COURSES } from "@/lib/constants/courses";

const BLOCK_META = {
  primal: {
    roman: "I",
    area: "Functional Training",
    color: "#F09226",
    desc: "Fondamenta anatomiche, biomeccaniche e metodologiche del movimento funzionale.",
    dates: ["11–12 Settembre", "9–10 Ottobre"],
  },
  vis: {
    roman: "II",
    area: "Strength & Conditioning",
    color: "#D4AF37",
    desc: "Sviluppo di forza, potenza e condizionamento atletico.",
    dates: ["11–12 Dicembre", "15–16 Gennaio"],
  },
  victor: {
    roman: "III",
    area: "Performance & Business",
    color: "#F09226",
    desc: "Integrazione completa: professionista, coach e imprenditore.",
    dates: ["12–13 Marzo", "9–10 Aprile"],
  },
};

export function PathOverview() {
  const sectionRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      // Header
      gsap.from(headRef.current, {
        scrollTrigger: { trigger: headRef.current, start: "top 85%", once: true },
        opacity: 0, y: 30, duration: 0.7, ease: "power3.out",
      });

      // Cards stagger in
      const cards = sectionRef.current?.querySelectorAll("[data-block-card]");
      if (cards) {
        gsap.from(cards, {
          scrollTrigger: { trigger: sectionRef.current, start: "top 70%", once: true },
          opacity: 0, y: 60, duration: 0.7, stagger: 0.18, ease: "power3.out",
        });
      }

      // Progress line fills as section scrolls
      if (progressRef.current) {
        gsap.fromTo(
          progressRef.current,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: "none",
            transformOrigin: "left center",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 60%",
              end: "bottom 60%",
              scrub: 0.6,
            },
          }
        );
      }

      // Active state per scroll
      const triggers = ["primal", "vis", "victor"].map((slug, i) => {
        const el = sectionRef.current?.querySelector(`[data-block="${slug}"]`);
        if (!el) return null;
        return ScrollTrigger.create({
          trigger: el,
          start: "top 55%",
          end: "bottom 55%",
          onToggle: (self) => {
            if (self.isActive) setActive(i);
          },
        });
      });

      return () => triggers.forEach((t) => t?.kill());
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="percorso"
      className="relative overflow-hidden py-24 md:py-32"
    >
      <div className="absolute inset-0 bg-academy-darker/50" />

      <div className="relative z-10 mx-auto max-w-[1440px] px-[5%] md:px-10">
        {/* Header */}
        <div ref={headRef} className="mb-14">
          <span className="label-tag mb-3 block">I 3 Blocchi Formativi</span>
          <h2 className="text-[clamp(1.9rem,4vw,3.5rem)] font-black leading-[1.05] tracking-tight">
            Una progressione{" "}
            <span className="gradient-text">cinematica</span>.
          </h2>
          <p className="mt-3 max-w-xl text-sm text-academy-gray-400">
            Tre blocchi che si costruiscono l&apos;uno sull&apos;altro. Ogni weekend di formazione ti porta più vicino alla versione definitiva di te stesso come professionista.
          </p>
        </div>

        {/* Progress track */}
        <div className="relative mb-10 hidden md:block">
          <div className="h-px w-full bg-academy-gray-700/30" />
          <div
            ref={progressRef}
            className="absolute top-0 left-0 h-px w-full"
            style={{ background: "linear-gradient(90deg, #F09226, #D4AF37, #F09226)" }}
          />
          <div className="mt-3 flex justify-between text-[0.75rem] font-bold tracking-[0.25em] text-academy-gray-600 uppercase">
            {["PRIMAL", "VIS", "VICTOR"].map((n, i) => (
              <span
                key={n}
                className="transition-colors duration-300"
                style={{ color: i <= active ? "#F09226" : undefined }}
              >
                {n}
              </span>
            ))}
          </div>
        </div>

        {/* Block cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {COURSES.map((course, i) => {
            const meta = BLOCK_META[course.slug as keyof typeof BLOCK_META];
            if (!meta) return null;
            const isActive = active === i;
            return (
              <div
                key={course.slug}
                data-block-card
                data-block={course.slug}
                className="group relative overflow-hidden p-8 transition-all duration-500"
                style={{
                  background: `linear-gradient(145deg, rgba(${isActive ? "240,146,38" : "10,10,58"},0.08), rgba(2,0,38,0.92))`,
                  border: `1px solid ${isActive ? "rgba(240,146,38,0.35)" : "rgba(255,255,255,0.06)"}`,
                  boxShadow: isActive ? "0 0 40px rgba(240,146,38,0.08)" : undefined,
                }}
              >
                {/* Roman number — large background decoration */}
                <div
                  className="pointer-events-none absolute -right-4 -bottom-4 select-none text-[8rem] font-black leading-none opacity-[0.04]"
                  style={{ color: meta.color }}
                >
                  {meta.roman}
                </div>

                {/* Block number indicator */}
                <div
                  className="mb-6 flex h-12 w-12 items-center justify-center text-lg font-black"
                  style={{
                    border: `2px solid ${meta.color}40`,
                    color: meta.color,
                  }}
                >
                  {meta.roman}
                </div>

                <span
                  className="mb-1 block text-[0.75rem] font-bold tracking-[0.28em] uppercase"
                  style={{ color: `${meta.color}90` }}
                >
                  {meta.area}
                </span>
                <h3 className="mb-3 text-2xl font-black tracking-tight text-academy-gray-100">
                  {course.title}
                </h3>
                <p className="mb-5 text-sm leading-relaxed text-academy-gray-400">{meta.desc}</p>

                {/* Mini curriculum */}
                <ul className="mb-6 space-y-1.5">
                  {course.curriculum.slice(0, 4).map((item) => (
                    <li key={item} className="flex items-center gap-2 text-xs text-academy-gray-500">
                      <span className="h-1 w-1 shrink-0" style={{ background: meta.color + "80" }} />
                      {item}
                    </li>
                  ))}
                  {course.curriculum.length > 4 && (
                    <li className="text-xs text-academy-gray-600">+ {course.curriculum.length - 4} argomenti</li>
                  )}
                </ul>

                {/* Dates */}
                <div className="mb-6 flex flex-wrap gap-2">
                  {meta.dates.map((d) => (
                    <span
                      key={d}
                      className="border px-2.5 py-0.5 text-[0.75rem] font-bold tracking-wider uppercase"
                      style={{ borderColor: `${meta.color}25`, color: `${meta.color}90` }}
                    >
                      {d}
                    </span>
                  ))}
                </div>

                <Button href={`/corsi/${course.slug}`} variant="ghost" size="sm">
                  Scopri il programma →
                </Button>
              </div>
            );
          })}
        </div>

        {/* FIPE note */}
        <div className="mt-4 border border-academy-gold/12 bg-academy-gold/4 p-5 text-center">
          <p className="text-xs text-academy-gray-400">
            Ogni blocco è seguito da una{" "}
            <span className="font-semibold text-academy-gold">Sessione Formativa FipexLacertosus</span>
            {" "}per consolidamento e valutazione delle competenze.
          </p>
        </div>
      </div>
    </section>
  );
}
