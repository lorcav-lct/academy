"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTheme } from "@/components/providers/theme-provider";

export function SocialProofBar() {
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const counter200Ref = useRef<HTMLSpanElement>(null);
  const counter9Ref = useRef<HTMLSpanElement>(null);
  const counter8Ref = useRef<HTMLSpanElement>(null);

  const { theme } = useTheme();
  const d = theme === "dark";

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {

      gsap.from(headRef.current, {
        scrollTrigger: { trigger: headRef.current, start: "top 88%", once: true },
        opacity: 0, y: 32, duration: 0.75, ease: "power3.out",
      });

      const cards = cardsRef.current?.querySelectorAll("[data-card]");
      if (cards?.length) {
        gsap.from(cards, {
          scrollTrigger: { trigger: cardsRef.current, start: "top 82%", once: true },
          opacity: 0, y: 45, duration: 0.65, stagger: 0.09, ease: "power3.out",
        });
      }

      const makeCounter = (el: HTMLSpanElement | null, target: number, dur: number) => {
        if (!el) return;
        const obj = { val: 0 };
        gsap.to(obj, {
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
          val: target, duration: dur, ease: "power2.out",
          onUpdate() { el.textContent = String(Math.round(obj.val)); },
        });
      };

      makeCounter(counter200Ref.current, 200, 1.8);
      makeCounter(counter9Ref.current, 9, 1.2);
      makeCounter(counter8Ref.current, 8, 1.0);

    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const th = d ? undefined : "#111111";
  const tm = d ? undefined : "#777777";

  const cardBg = d ? "rgba(10,8,28,0.7)" : "#ffffff";
  const cardBorder = d ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)";
  const accentBg = d
    ? "linear-gradient(145deg, rgba(240,146,38,0.1), rgba(2,0,38,0.92))"
    : "linear-gradient(145deg, rgba(240,146,38,0.08), rgba(255,255,255,0.99))";
  const accentBorder = d ? "rgba(240,146,38,0.2)" : "rgba(240,146,38,0.22)";
  const certBg = d
    ? "linear-gradient(145deg, rgba(212,175,55,0.09), rgba(2,0,38,0.94))"
    : "linear-gradient(145deg, rgba(212,175,55,0.06), rgba(255,255,255,0.99))";
  const certBorder = d ? "rgba(212,175,55,0.18)" : "rgba(212,175,55,0.2)";
  const quoteBg = d ? "rgba(8,6,20,0.65)" : "#F5F2EC";
  const quoteBorder = d ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)";

  return (
    <section ref={sectionRef} className="themed-section relative overflow-hidden py-20 md:py-28">
      <div className="absolute inset-0 section-bg-alt" />

      <div className="relative z-10 mx-auto max-w-[1440px] px-[5%] md:px-10">

        <div ref={headRef} className="mb-10">
          <span className="label-tag mb-3 block">I Numeri</span>
          <h2
            className="text-[clamp(1.8rem,3.5vw,2.8rem)] font-black leading-tight tracking-tight"
            style={{ color: th }}
          >
            Risultati concreti.{" "}
            <span className="gradient-text">Alumni che crescono.</span>
          </h2>
        </div>

        <div ref={cardsRef} className="grid gap-3 lg:grid-cols-12">

          {/* BIG STAT: +200 alumni — col-span-5 */}
          <div
            data-card
            className="flex flex-col justify-between p-8 lg:col-span-5"
            style={{ background: accentBg, border: `1px solid ${accentBorder}` }}
          >
            <p className="text-[0.75rem] font-bold tracking-[0.28em] text-academy-orange/80 uppercase">Alumni certificati</p>
            <div>
              <div className="text-[clamp(5rem,11vw,8rem)] font-black leading-none text-academy-orange tabular-nums">
                +<span ref={counter200Ref}>0</span>
              </div>
              <p className="mt-2 text-base font-bold" style={{ color: th }}>Professionisti Formati</p>
              <p className="mt-1 text-[0.8rem]" style={{ color: tm }}>Trainer, coach e imprenditori del fitness in tutta Italia</p>
            </div>
          </div>

          {/* STAR RATING — col-span-3 */}
          <div
            data-card
            className="flex flex-col justify-between p-7 lg:col-span-3"
            style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
          >
            <p className="text-[0.75rem] font-bold tracking-[0.28em] text-academy-orange/70 uppercase">Valutazione</p>
            <div>
              <div className="text-[2.8rem] font-black leading-none" style={{ color: "#D4AF37" }}>★★★★★</div>
              <p className="mt-2 text-[0.88rem] font-bold" style={{ color: th }}>Media Alumni</p>
              <p className="mt-1 text-[0.75rem]" style={{ color: tm }}>Su oltre 200 recensioni verificate</p>
            </div>
          </div>

          {/* FIPE CERTIFICATION — col-span-4 */}
          <div
            data-card
            className="flex flex-col justify-between p-7 lg:col-span-4"
            style={{ background: certBg, border: `1px solid ${certBorder}` }}
          >
            <p className="text-[0.75rem] font-bold tracking-[0.28em] text-academy-gold/80 uppercase">Certificazione Ufficiale</p>
            <div className="flex items-center gap-4">
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-academy-gold/25"
                style={{ background: "radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)" }}
              >
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none">
                  <path d="M12 2L3 7v6c0 5.25 3.75 10.18 9 11.25C17.25 23.18 21 18.25 21 13V7L12 2z"
                    stroke="#D4AF37" strokeWidth="1.2" fill="rgba(212,175,55,0.1)" />
                  <path d="M9 12l2 2 4-4" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <div className="text-[1.15rem] font-black leading-none" style={{ color: "#D4AF37" }}>FIPE × LACERTOSUS</div>
                <p className="mt-1 text-[0.75rem]" style={{ color: d ? "rgba(212,175,55,0.55)" : "rgba(130,100,15,0.7)" }}>
                  Riconosciuta a livello nazionale
                </p>
              </div>
            </div>
          </div>

          {/* QUOTE — full width */}
          <div
            data-card
            className="flex items-center justify-center px-8 py-10 lg:col-span-12"
            style={{ background: quoteBg, border: `1px solid ${quoteBorder}` }}
          >
            <blockquote className="text-center">
              {/* decorative open-quote */}
              <span className="mb-2 block text-[2.5rem] leading-none text-academy-orange/20 select-none">&ldquo;</span>
              <p
                className="text-[clamp(1.1rem,2.8vw,1.65rem)] font-black italic leading-snug"
                style={{ color: th }}
              >
                Il percorso più completo del fitness italiano
              </p>
              <cite className="mt-4 block text-[0.72rem] font-bold not-italic tracking-[0.28em] text-academy-orange/60 uppercase">
                Alumni Lacertosus Academy
              </cite>
            </blockquote>
          </div>

          {/* BOTTOM ROW — 3 equal stat cards */}

          {/* 9 Mesi */}
          <div
            data-card
            className="flex flex-col justify-between p-7 lg:col-span-4"
            style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
          >
            <p className="text-[0.75rem] font-bold tracking-[0.28em] text-academy-orange/70 uppercase">Durata</p>
            <div>
              <div className="text-[clamp(3rem,6vw,4.5rem)] font-black leading-none text-academy-orange tabular-nums">
                <span ref={counter9Ref}>0</span>
              </div>
              <p className="mt-1 text-[0.88rem] font-bold" style={{ color: th }}>Mesi di Formazione</p>
              <p className="mt-1 text-[0.75rem]" style={{ color: tm }}>PRIMAL → VIS → VICTOR</p>
            </div>
          </div>

          {/* 8 Masterclass */}
          <div
            data-card
            className="flex flex-col justify-between p-7 lg:col-span-4"
            style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
          >
            <p className="text-[0.75rem] font-bold tracking-[0.28em] text-academy-orange/70 uppercase">Specializzazioni</p>
            <div>
              <div className="text-[clamp(3rem,6vw,4.5rem)] font-black leading-none text-academy-orange tabular-nums">
                <span ref={counter8Ref}>0</span>
              </div>
              <p className="mt-1 text-[0.88rem] font-bold" style={{ color: th }}>Masterclass Specialistici</p>
              <p className="mt-1 text-[0.75rem]" style={{ color: tm }}>Approfondimenti verticali esclusivi</p>
            </div>
          </div>

          {/* 100% Presenza */}
          <div
            data-card
            className="flex flex-col justify-between p-7 lg:col-span-4"
            style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
          >
            <p className="text-[0.75rem] font-bold tracking-[0.28em] text-academy-orange/70 uppercase">Modalità</p>
            <div>
              <div className="text-[clamp(3rem,6vw,4.5rem)] font-black leading-none gradient-text tabular-nums">100%</div>
              <p className="mt-1 text-[0.88rem] font-bold" style={{ color: th }}>In Presenza</p>
              <p className="mt-1 text-[0.75rem]" style={{ color: tm }}>Zero lezioni online, solo pratica diretta</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
