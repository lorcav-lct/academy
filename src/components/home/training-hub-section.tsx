"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/providers/theme-provider";

export function TrainingHubSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const { theme } = useTheme();
  const d = theme === "dark";

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const items = contentRef.current?.querySelectorAll("[data-hub-item]");
      if (items) {
        gsap.from(items, {
          scrollTrigger: { trigger: contentRef.current, start: "top 78%", once: true },
          opacity: 0, y: 30, duration: 0.65, stagger: 0.12, ease: "power3.out",
        });
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const th = d ? undefined : "#111111";
  const tb = d ? "#e5e5ea" : "#444444";
  const tm = d ? "#c7c7cc" : "#777777";

  return (
    <section
      ref={sectionRef}
      id="training-hub"
      className="themed-section relative overflow-hidden py-24 md:py-32"
    >
      <div className="absolute inset-0 section-bg" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(240,146,38,0.04) 0%, transparent 50%, rgba(212,175,55,0.03) 100%)",
        }}
      />
      {/* Diagonal accent */}
      <div
        className="pointer-events-none absolute -right-40 top-0 h-full w-px"
        style={{
          background: "linear-gradient(180deg, transparent, rgba(212,175,55,0.15), transparent)",
          transform: "rotate(15deg)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-[1440px] px-[5%] md:px-10">
        <div ref={contentRef} className="grid items-center gap-12 md:grid-cols-2">
          {/* Text */}
          <div>
            <span data-hub-item className="label-tag mb-3 block">
              Opportunità Imprenditoriale
            </span>
            <h2
              data-hub-item
              className="text-[clamp(2rem,4.5vw,4rem)] font-black leading-[1.0] tracking-tight text-academy-gray-100"
              style={{ color: th }}
            >
              Apri il tuo{" "}
              <span className="gradient-text">Training Hub</span>
              <br />
              Lacertosus.
            </h2>
            <p data-hub-item className="mt-5 max-w-md text-sm leading-relaxed text-academy-gray-400" style={{ color: tb }}>
              L&apos;investimento nel percorso formativo può diventare un asset imprenditoriale concreto.
              Diventa un nodo della rete Lacertosus Academy sul territorio.
            </p>

            <div data-hub-item className="mt-8 space-y-4">
              {[
                { title: "Brand riconoscibile",   desc: "Utilizza il brand Lacertosus e la rete di professionisti certificati." },
                { title: "Supporto operativo",    desc: "Metodologie, materiali e supporto diretto per avviare la struttura." },
                { title: "ROI dell'investimento", desc: "Il percorso formativo si converte in capitale professionale e imprenditoriale." },
              ].map((p) => (
                <div key={p.title} className="flex gap-4">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 bg-academy-orange" />
                  <div>
                    <p className="text-sm font-bold text-academy-gray-200" style={{ color: th }}>{p.title}</p>
                    <p className="text-xs text-academy-gray-500" style={{ color: tm }}>{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div data-hub-item className="mt-10">
              <Button href="/pack" size="lg">
                Inizia il percorso →
              </Button>
            </div>
          </div>

          {/* Visual block */}
          <div data-hub-item className="relative">
            <div
              className="relative overflow-hidden p-10"
              style={{
                background: d
                  ? "linear-gradient(145deg, rgba(240,146,38,0.06), rgba(2,0,38,0.95))"
                  : "linear-gradient(145deg, rgba(240,146,38,0.06), rgba(255,255,255,0.98))",
                border: "1px solid rgba(240,146,38,0.18)",
              }}
            >
              {/* Top accent */}
              <div className="mb-8 h-px w-full" style={{ background: "linear-gradient(90deg, #F09226, transparent)" }} />

              <div className="mb-6">
                <span className="label-tag opacity-60">Il tuo Hub</span>
              </div>

              <div className="space-y-5">
                {[
                  { n: "01", label: "Struttura certificata" },
                  { n: "02", label: "Metodo Lacertosus" },
                  { n: "03", label: "Rete nazionale" },
                  { n: "04", label: "Supporto continuo" },
                ].map((item) => (
                  <div key={item.n} className="flex items-center gap-4">
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center text-[0.75rem] font-black"
                      style={{ border: "1px solid rgba(240,146,38,0.3)", color: "#F09226" }}
                    >
                      {item.n}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-academy-gray-300" style={{ color: th }}>{item.label}</p>
                      <div
                        className="mt-1.5 h-px w-full"
                        style={{ background: d ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)" }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 h-px w-full" style={{ background: "linear-gradient(90deg, transparent, #F09226)" }} />
            </div>

            {/* Decorative glow */}
            <div
              className="pointer-events-none absolute -bottom-6 -right-6 h-40 w-40 rounded-full blur-3xl"
              style={{ background: "rgba(240,146,38,0.06)" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
