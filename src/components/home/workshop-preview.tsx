"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WORKSHOPS } from "@/lib/constants/workshops";
import { useTheme } from "@/components/providers/theme-provider";

const BENTO_SPANS = [2, 1, 1, 2, 1, 2, 2, 1];

export function WorkshopPreview() {
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const { theme } = useTheme();
  const d = theme === "dark";

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.from(headRef.current, {
        scrollTrigger: { trigger: headRef.current, start: "top 85%", once: true },
        opacity: 0, y: 28, duration: 0.7, ease: "power3.out",
      });
      const cards = gridRef.current?.querySelectorAll("[data-ws-card]");
      if (cards) {
        gsap.from(cards, {
          scrollTrigger: { trigger: gridRef.current, start: "top 75%", once: true },
          opacity: 0, y: 35, scale: 0.96, duration: 0.6,
          stagger: { amount: 0.6, from: "start" }, ease: "power3.out",
        });
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const th = d ? undefined : "#111111";
  const tm = d ? "#c7c7cc" : "#777777";

  return (
    <section ref={sectionRef} id="workshop" className="themed-section relative overflow-hidden py-24 md:py-32 light-reflection">
      <div className="absolute inset-0 section-bg" />

      <div className="relative z-10 mx-auto max-w-[1440px] px-[5%] md:px-10">
        <div ref={headRef} className="mb-14 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="label-tag mb-3 block">Master Specialistici</span>
            <h2 className="text-[clamp(1.9rem,4vw,3.5rem)] font-black leading-[1.05] tracking-tight text-academy-gray-100" style={{ color: th }}>
              8 Masterclass.{" "}
              <span className="gradient-text">8 Specializzazioni.</span>
            </h2>
            <p className="mt-3 max-w-lg text-sm text-academy-gray-400" style={{ color: tm }}>
              Approfondimenti pratici con i migliori specialisti del settore. Acquistabili singolarmente o inclusi nel tuo percorso.
            </p>
          </div>
          <Button href="/masterclass" variant="outline" size="sm">Vedi tutti i Masterclass →</Button>
        </div>

        <div ref={gridRef} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {WORKSHOPS.map((ws, i) => {
            const span = BENTO_SPANS[i % BENTO_SPANS.length];
            const isWide = span === 2;
            return (
              <Link
                key={ws.slug}
                href={`/masterclass/${ws.slug}`}
                data-ws-card
                className={`group relative overflow-hidden ${isWide ? "sm:col-span-2 lg:col-span-2" : ""}`}
              >
                <div
                  className="bento-card bento-card--themed relative flex h-full min-h-[160px] flex-col justify-between p-6 transition-all duration-500 group-hover:border-academy-orange/30"
                >
                  <div className="mb-auto">
                    <span className="mb-3 inline-block bg-academy-orange/10 px-2.5 py-1 text-[0.75rem] font-black tracking-[0.2em] text-academy-orange uppercase">
                      {ws.date}
                    </span>
                    <h3
                      className="text-sm font-bold leading-snug text-academy-gray-200 transition-colors duration-300 group-hover:text-academy-orange"
                      style={{ color: d ? undefined : "#111111" }}
                    >
                      {ws.title}
                    </h3>
                    {isWide && (
                      <p className="mt-1.5 text-xs leading-relaxed text-academy-gray-500" style={{ color: tm }}>
                        {ws.focus}
                      </p>
                    )}
                  </div>
                  <div className="mt-4 flex items-end justify-between">
                    <span className="text-[0.75rem] font-medium tracking-wider text-academy-gray-600 uppercase" style={{ color: tm }}>
                      {ws.duration}
                    </span>
                    <span className="translate-x-2 text-sm text-academy-orange opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                      →
                    </span>
                  </div>
                  <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-academy-orange/5 blur-xl opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:translate-x-4 group-hover:-translate-y-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
