"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function CertificationSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const certRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      // Certificate reveals with clip-path
      if (certRef.current) {
        gsap.from(certRef.current, {
          scrollTrigger: { trigger: certRef.current, start: "top 75%", once: true },
          clipPath: "inset(100% 0% 0% 0%)",
          opacity: 0,
          duration: 1.1,
          ease: "power4.out",
        });
        // Subtle float animation
        gsap.to(certRef.current, {
          y: -10,
          duration: 2.8,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      }

      // Text items stagger
      const items = textRef.current?.querySelectorAll("[data-cert-item]");
      if (items) {
        gsap.from(items, {
          scrollTrigger: { trigger: textRef.current, start: "top 78%", once: true },
          opacity: 0, x: 30, duration: 0.6, stagger: 0.15, ease: "power2.out",
        });
      }

      const certHead = textRef.current?.querySelector("[data-cert-head]");
      if (certHead) {
        gsap.from(certHead, {
          scrollTrigger: { trigger: textRef.current, start: "top 82%", once: true },
          opacity: 0, y: 25, duration: 0.7, ease: "power3.out",
        });
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="certificazione"
      className="relative overflow-hidden py-24 md:py-32"
    >
      {/* Background */}
      <div className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, #010018 0%, #020026 50%, #010018 100%)" }}
      />
      {/* Diagonal light strip */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute h-px w-[200%] -left-1/2"
          style={{
            top: "35%",
            background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.12), transparent)",
            transform: "rotate(-6deg)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto w-[90%] max-w-[1440px]">
        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-20">

          {/* Certificate mockup */}
          <div className="flex justify-center md:justify-start">
            <div
              ref={certRef}
              className="relative w-full max-w-sm"
              style={{ clipPath: "inset(0% 0% 0% 0%)" }}
            >
              {/* Certificate card */}
              <div
                className="relative overflow-hidden p-10"
                style={{
                  background: "linear-gradient(145deg, rgba(212,175,55,0.06) 0%, rgba(2,0,38,0.95) 100%)",
                  border: "1px solid rgba(212,175,55,0.3)",
                  boxShadow: "0 0 60px rgba(212,175,55,0.08), 0 40px 80px rgba(0,0,0,0.6)",
                }}
              >
                {/* Top gold line */}
                <div className="mb-8 h-px w-full" style={{ background: "linear-gradient(90deg, transparent, #D4AF37, transparent)" }} />

                {/* Logo mark */}
                <div className="mb-6 flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center border"
                    style={{ borderColor: "rgba(212,175,55,0.4)" }}
                  >
                    <span className="text-xs font-black text-academy-gold">LCT</span>
                  </div>
                  <div>
                    <p className="text-[0.75rem] font-bold tracking-[0.25em] text-academy-gold/60 uppercase">
                      Lacertosus Academy
                    </p>
                    <p className="text-[0.75rem] font-bold tracking-[0.22em] text-academy-gold/40 uppercase">
                      FIPE × LACERTOSUS
                    </p>
                  </div>
                </div>

                {/* Certificate text */}
                <p className="mb-1 text-[0.75rem] font-bold tracking-[0.3em] text-academy-gray-500 uppercase">
                  Certifica che
                </p>
                <div className="mb-4 border-b border-academy-gold/15 pb-3">
                  <p className="text-lg font-black italic text-academy-gold">Nome Cognome</p>
                </div>
                <p className="mb-4 text-[0.75rem] leading-relaxed text-academy-gray-400">
                  ha completato con successo il{" "}
                  <span className="font-semibold text-academy-gray-200">Percorso Formativo Lacertosus Academy</span>{" "}
                  e ottiene il titolo di
                </p>
                <p className="mb-2 text-base font-black uppercase tracking-wider text-academy-gray-100">
                  Personal Trainer FIPE × LACERTOSUS
                </p>
                <p className="text-[0.75rem] text-academy-gray-500">
                  Riconosciuto professionalmente nel settore fitness
                </p>

                {/* Bottom */}
                <div className="mt-8 flex items-end justify-between">
                  <div>
                    <div className="mb-1 h-px w-24 bg-academy-gold/20" />
                    <p className="text-[0.75rem] text-academy-gray-600">Firma del Direttore</p>
                  </div>
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full border"
                    style={{ borderColor: "rgba(212,175,55,0.25)" }}
                  >
                    <span className="text-[0.75rem] font-black text-academy-gold/50">FIPE</span>
                  </div>
                </div>

                {/* Bottom gold line */}
                <div className="mt-8 h-px w-full" style={{ background: "linear-gradient(90deg, transparent, #D4AF37, transparent)" }} />
              </div>

              {/* Shadow behind */}
              <div
                className="absolute -bottom-4 left-1/2 -z-10 h-20 w-[80%] -translate-x-1/2 rounded-full blur-2xl"
                style={{ background: "rgba(212,175,55,0.12)" }}
              />
            </div>
          </div>

          {/* Text */}
          <div ref={textRef}>
            <span className="label-tag mb-3 block">Certificazione Professionale</span>
            <h2
              data-cert-head
              className="mb-6 text-[clamp(1.7rem,3.5vw,3rem)] font-black leading-[1.05] tracking-tight"
            >
              Un titolo riconosciuto.{" "}
              <span className="gradient-text">Un professionista credibile.</span>
            </h2>

            <div className="space-y-5">
              {[
                {
                  n: "01",
                  title: "Valore ufficiale nel settore",
                  body: "La certificazione FIPE × LACERTOSUS è riconosciuta da datori di lavoro, palestre e strutture sportive in tutta Italia.",
                },
                {
                  n: "02",
                  title: "Approccio teorico-pratico",
                  body: "La valutazione delle competenze include prove pratiche sul campo, non solo esami scritti.",
                },
                {
                  n: "03",
                  title: "Immediatamente spendibile",
                  body: "Dal giorno del conseguimento puoi utilizzare il titolo per esercitare la professione e aprire il tuo Training Hub.",
                },
              ].map((item) => (
                <div
                  key={item.n}
                  data-cert-item
                  className="flex gap-5"
                >
                  <span className="mt-0.5 shrink-0 text-[0.75rem] font-black text-academy-gold/50">
                    {item.n}
                  </span>
                  <div>
                    <p className="mb-1 text-sm font-bold text-academy-gray-200">{item.title}</p>
                    <p className="text-xs leading-relaxed text-academy-gray-500">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Badge */}
            <div className="mt-8 inline-flex items-center gap-3 border border-academy-gold/20 bg-academy-gold/5 px-5 py-3">
              <span className="text-academy-gold">✦</span>
              <span className="text-xs font-bold tracking-wider text-academy-gold uppercase">
                FIPE × LACERTOSUS — Certificazione inclusa nel percorso completo
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
