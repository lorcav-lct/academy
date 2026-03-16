"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import { PRODUCTS } from "@/lib/constants/packs";

function formatPrice(cents: number) {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", minimumFractionDigits: 0 }).format(cents / 100);
}

const COURSE_COLORS: Record<string, { border: string; glow: string; label: string }> = {
  primal:  { border: "rgba(240,146,38,0.25)", glow: "rgba(240,146,38,0.08)", label: "Blocco I" },
  vis:     { border: "rgba(212,175,55,0.45)", glow: "rgba(212,175,55,0.12)", label: "Blocco II — In evidenza" },
  victor:  { border: "rgba(240,146,38,0.25)", glow: "rgba(240,146,38,0.06)", label: "Blocco III" },
};

const courses = PRODUCTS.filter((p) => p.type === "course").sort((a, b) => a.sortOrder - b.sortOrder);

export function PackPreview() {
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.from(headRef.current, {
        scrollTrigger: { trigger: headRef.current, start: "top 85%", once: true },
        opacity: 0, y: 30, duration: 0.7, ease: "power3.out",
      });
      const cards = cardsRef.current?.querySelectorAll("[data-pack-card]");
      if (cards) {
        gsap.from(cards, {
          scrollTrigger: { trigger: cardsRef.current, start: "top 78%", once: true },
          opacity: 0, y: 50, duration: 0.7, stagger: 0.15, ease: "power3.out",
        });
      }
      gsap.from(bottomRef.current, {
        scrollTrigger: { trigger: bottomRef.current, start: "top 88%", once: true },
        opacity: 0, y: 20, duration: 0.5, ease: "power2.out",
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="pack"
      className="relative overflow-hidden py-24 md:py-32 light-reflection"
    >
      <div className="absolute inset-0 bg-academy-dark" />
      {/* Central glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: "radial-gradient(ellipse, rgba(240,146,38,0.04) 0%, transparent 70%)" }} />

      <div className="relative z-10 mx-auto w-[90%] max-w-[1440px]">
        {/* Header */}
        <div ref={headRef} className="mb-14 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="label-tag mb-3 block">Costruisci il Tuo Percorso</span>
            <h2 className="text-[clamp(1.9rem,4vw,3.5rem)] font-black leading-[1.05] tracking-tight">
              Scegli il Blocco.{" "}
              <span className="gradient-text">Scala il Livello.</span>
            </h2>
            <p className="mt-3 max-w-lg text-sm text-academy-gray-400">
              Ogni blocco è acquistabile singolarmente. Puoi iniziare da PRIMAL e completare il percorso al tuo ritmo.
            </p>
          </div>
          <Button href="/pack" variant="outline" size="sm">
            Tutti i prodotti →
          </Button>
        </div>

        {/* Cards */}
        <div ref={cardsRef} className="grid gap-4 md:grid-cols-3">
          {courses.map((course, i) => {
            const c = COURSE_COLORS[course.slug] || COURSE_COLORS.primal;
            const isHighlighted = course.highlighted;
            return (
              <div
                key={course.slug}
                data-pack-card
                className="relative flex flex-col overflow-hidden p-8 transition-all duration-500"
                style={{
                  background: `linear-gradient(145deg, ${c.glow}, rgba(2,0,38,0.95))`,
                  border: `1px solid ${c.border}`,
                  boxShadow: isHighlighted ? `0 0 40px ${c.glow}, 0 20px 60px rgba(0,0,0,0.4)` : undefined,
                  transform: isHighlighted ? "scale(1.02)" : undefined,
                }}
              >
                {isHighlighted && (
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-academy-gold to-transparent" />
                )}
                {isHighlighted && (
                  <span className="absolute right-4 top-4 bg-academy-gold/15 px-2 py-0.5 text-[0.58rem] font-black tracking-[0.2em] text-academy-gold uppercase">
                    Più acquistato
                  </span>
                )}

                <div className="mb-6">
                  <span className="label-tag mb-2 block opacity-60">{c.label}</span>
                  <h3 className="text-3xl font-black tracking-tight text-academy-gray-100">
                    {course.name}
                  </h3>
                  <p className="mt-1 text-sm text-academy-gray-500">{course.subtitle}</p>
                </div>

                <ul className="mb-8 flex-1 space-y-2">
                  {course.includes.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs text-academy-gray-400">
                      <span className="mt-1 h-1 w-1 shrink-0 bg-academy-orange" />
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[0.62rem] font-medium text-academy-gray-500 uppercase">
                      {course.priceCents > 0 ? "A partire da" : ""}
                    </p>
                    <p className="text-2xl font-black text-academy-orange">
                      {course.priceCents > 0 ? formatPrice(course.priceCents) : "Prossimamente"}
                    </p>
                  </div>
                  <Button
                    href={`/checkout?pack=${course.slug}`}
                    size="sm"
                    variant={isHighlighted ? "primary" : "outline"}
                    disabled={course.priceCents === 0}
                  >
                    Scegli
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Certification note */}
        <div
          ref={bottomRef}
          className="mt-4 flex flex-col items-start gap-4 border border-academy-gold/15 bg-academy-gold/4 p-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rotate-45 bg-academy-gold" />
            <p className="text-sm text-academy-gray-300">
              <span className="font-bold text-academy-gold">Certificazione FipexLacertosus</span>
              {" — "}inclusa nel percorso completo. Riconosciuta professionalmente nel settore fitness.
            </p>
          </div>
          <Button href="/pack" variant="secondary" size="sm">
            Confronta tutti i prodotti
          </Button>
        </div>
      </div>
    </section>
  );
}
