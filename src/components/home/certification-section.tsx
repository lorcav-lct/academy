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
          scrollTrigger: {
            trigger: certRef.current,
            start: "top 75%",
            once: true,
          },
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
          scrollTrigger: {
            trigger: textRef.current,
            start: "top 78%",
            once: true,
          },
          opacity: 0,
          x: 30,
          duration: 0.6,
          stagger: 0.15,
          ease: "power2.out",
        });
      }

      const certHead = textRef.current?.querySelector("[data-cert-head]");
      if (certHead) {
        gsap.from(certHead, {
          scrollTrigger: {
            trigger: textRef.current,
            start: "top 82%",
            once: true,
          },
          opacity: 0,
          y: 25,
          duration: 0.7,
          ease: "power3.out",
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
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)",
        }}
      />
      {/* Diagonal light strip */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute h-px w-[200%] -left-1/2"
          style={{
            top: "35%",
            background:
              "linear-gradient(90deg, transparent, rgba(240,146,38,0.12), transparent)",
            transform: "rotate(-6deg)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-[1440px] px-[5%] md:px-10">
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
                  background:
                    "linear-gradient(145deg, rgba(240,146,38,0.06) 0%, rgba(26,26,26,0.95) 100%)",
                  border: "1px solid rgba(240,146,38,0.3)",
                  boxShadow:
                    "0 0 60px rgba(240,146,38,0.08), 0 40px 80px rgba(0,0,0,0.6)",
                }}
              >
                {/* Top gold line */}
                <div
                  className="mb-8 h-px w-full"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, #F09226, transparent)",
                  }}
                />

                {/* Logo mark */}
                <div className="mb-6 flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center border"
                    style={{ borderColor: "rgba(240,146,38,0.4)" }}
                  >
                    <span className="text-xs font-black text-academy-orange">
                      LCT
                    </span>
                  </div>
                  <div>
                    <p className="text-[0.75rem] font-bold tracking-[0.25em] text-academy-orange/60 uppercase">
                      Lacertosus Academy
                    </p>
                    <p className="text-[0.75rem] font-bold tracking-[0.22em] text-academy-orange/40 uppercase">
                      FIPE × LACERTOSUS
                    </p>
                  </div>
                </div>

                {/* Certificate text */}
                <p className="mb-1 text-[0.75rem] font-bold tracking-[0.3em] text-academy-gray-500 uppercase">
                  Certifica che
                </p>
                <div className="mb-4 border-b border-academy-orange/15 pb-3">
                  <p className="text-lg font-black italic text-academy-orange">
                    Nome Cognome
                  </p>
                </div>
                <p className="mb-4 text-[0.75rem] leading-relaxed text-academy-gray-400">
                  ha completato con successo il{" "}
                  <span className="font-semibold text-academy-gray-200">
                    Percorso Formativo Lacertosus Academy
                  </span>{" "}
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
                    <div className="mb-1 h-px w-24 bg-academy-orange/20" />
                    <p className="text-[0.75rem] text-academy-gray-600">
                      Firma del Direttore
                    </p>
                  </div>
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full border"
                    style={{ borderColor: "rgba(240,146,38,0.25)" }}
                  >
                    <span className="text-[0.75rem] font-black text-academy-orange/50">
                      FIPE
                    </span>
                  </div>
                </div>

                {/* Bottom gold line */}
                <div
                  className="mt-8 h-px w-full"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, #F09226, transparent)",
                  }}
                />
              </div>

              {/* Shadow behind */}
              <div
                className="absolute -bottom-4 left-1/2 -z-10 h-20 w-[80%] -translate-x-1/2 rounded-full blur-2xl"
                style={{ background: "rgba(240,146,38,0.12)" }}
              />
            </div>
          </div>

          {/* Text */}
          <div ref={textRef}>
            <span className="label-tag mb-3 block">Le Due Certificazioni</span>
            <h2
              data-cert-head
              className="mb-6 text-[clamp(1.7rem,3.5vw,3rem)] font-black leading-[1.05] tracking-tight"
            >
              Due titoli <span className="gradient-text">riconosciuti</span>.
              <br />
              Una carriera reale.
            </h2>
            <p className="mb-8 max-w-lg text-sm leading-relaxed text-academy-gray-400">
              Al termine del percorso ricevi due certificazioni distinte. Una è
              inclusa in qualunque pack, l&apos;altra è riservata ai pack PRO ed
              ELITE per chi vuole il riconoscimento FIPE ufficiale.
            </p>

            <div className="flex flex-col gap-4">
              {/* Master Coach — included in all */}
              <div
                data-cert-item
                className="relative p-5"
                style={{
                  background: "rgba(240,146,38,0.05)",
                  border: "1.5px solid rgba(240,146,38,0.32)",
                  borderLeft: "4px solid #F09226",
                }}
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <span
                    className="text-[0.58rem] font-black tracking-[0.3em] uppercase"
                    style={{ color: "#F09226" }}
                  >
                    ✦ Inclusa in tutti i pack
                  </span>
                  <span
                    className="shrink-0 px-2 py-0.5 text-[0.52rem] font-black tracking-[0.22em] uppercase"
                    style={{
                      color: "#F09226",
                      background: "rgba(240,146,38,0.1)",
                      border: "1px solid rgba(240,146,38,0.4)",
                    }}
                  >
                    Start · Pro · Elite
                  </span>
                </div>
                <p className="text-[1.1rem] font-black leading-tight tracking-tight text-academy-gray-100">
                  Functional Strength Master Coach
                </p>
                <p
                  className="mt-1 text-[0.6rem] font-black tracking-[0.22em] uppercase"
                  style={{ color: "rgba(240,146,38,0.85)" }}
                >
                  Riconoscimento Nazionale
                </p>
                <p className="mt-3 text-xs leading-relaxed text-academy-gray-400">
                  Certificazione Lacertosus rilasciata al termine dei 9 mesi di
                  percorso. Abilita all&apos;esercizio della professione e
                  attesta competenza sul Functional Strength.
                </p>
              </div>

              {/* FIPE × Lacertosus — Pro/Elite only */}
              <div
                data-cert-item
                className="relative p-5"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(240,146,38,0.16) 0%, rgba(240,146,38,0.04) 100%)",
                  border: "2px solid rgba(240,146,38,0.65)",
                  boxShadow: "0 0 24px rgba(240,146,38,0.15)",
                }}
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <span
                    className="text-[0.58rem] font-black tracking-[0.3em] uppercase"
                    style={{ color: "#F09226" }}
                  >
                    ★ Solo Pack Pro &amp; Elite
                  </span>
                  <span
                    className="shrink-0 px-2 py-0.5 text-[0.52rem] font-black tracking-[0.22em] uppercase"
                    style={{
                      color: "#111111",
                      background: "#F09226",
                    }}
                  >
                    Pro · Elite
                  </span>
                </div>
                <p className="text-[1.1rem] font-black leading-tight tracking-tight text-academy-gray-100">
                  Personal Trainer FIPE × Lacertosus
                </p>
                <p
                  className="mt-1 text-[0.6rem] font-black tracking-[0.22em] uppercase"
                  style={{ color: "#F09226" }}
                >
                  Riconoscimento Nazionale e Internazionale
                </p>
                <p className="mt-3 text-xs leading-relaxed text-academy-gray-400">
                  Certificazione ufficiale FIPE × Lacertosus, spendibile in
                  palestre, centri sportivi e strutture di performance in Italia
                  e all&apos;estero. Il titolo che fa la differenza nel mercato
                  professionale.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
