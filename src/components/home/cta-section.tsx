"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";

function SplitLine({ text, className }: { text: string; className?: string }) {
  return (
    <span className={`inline-flex overflow-hidden ${className ?? ""}`}>
      {text.split("").map((ch, i) => (
        <span key={i} data-cta-char className="inline-block">
          {ch === " " ? "\u00A0" : ch}
        </span>
      ))}
    </span>
  );
}

export function CTASection() {
  const sectionRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLDivElement>(null);
  const line2Ref = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLDivElement>(null);
  const btnsRef = useRef<HTMLDivElement>(null);
  const pillsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const chars1 = line1Ref.current?.querySelectorAll("[data-cta-char]");
      const chars2 = line2Ref.current?.querySelectorAll("[data-cta-char]");

      const tl = gsap.timeline({
        scrollTrigger: { trigger: sectionRef.current, start: "top 65%", once: true },
      });

      tl.from(glowRef.current, { opacity: 0, scale: 0.5, duration: 1.2, ease: "power2.out" });

      if (chars1?.length) {
        tl.from(chars1, { y: "110%", opacity: 0, duration: 0.65, stagger: 0.022, ease: "power3.out" }, "<0.2");
      }
      if (chars2?.length) {
        tl.from(chars2, { y: "110%", opacity: 0, duration: 0.65, stagger: 0.022, ease: "power3.out" }, "<0.05");
      }

      tl.from(subRef.current,  { opacity: 0, y: 20, duration: 0.5, ease: "power2.out" }, "-=0.2");
      tl.from(btnsRef.current, { opacity: 0, y: 15, duration: 0.45, ease: "power2.out" }, "-=0.25");
      tl.from(pillsRef.current, { opacity: 0, y: 10, duration: 0.4, ease: "power2.out" }, "-=0.2");

      // Glow pulse
      gsap.to(glowRef.current, {
        scale: 1.15,
        opacity: 0.6,
        duration: 3,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="cta"
      className="relative overflow-hidden py-28 md:py-40"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-academy-darker" />

      {/* Massive central glow */}
      <div
        ref={glowRef}
        className="pointer-events-none absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(240,146,38,0.1) 0%, rgba(212,175,55,0.04) 40%, transparent 70%)",
        }}
      />

      {/* Grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(240,146,38,1) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(240,146,38,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 mx-auto w-[90%] max-w-[1440px] text-center">
        {/* Eyebrow */}
        <div className="mb-6">
          <span className="label-tag">Il Tuo Percorso Inizia Ora</span>
        </div>

        {/* Main headline — split text */}
        <div ref={line1Ref} className="leading-none">
          <SplitLine
            text="IL PERCORSO INIZIA"
            className="block text-[clamp(2rem,6vw,6rem)] font-black tracking-[-0.02em] text-academy-gray-100"
          />
        </div>
        <div ref={line2Ref} className="mb-8 leading-none">
          <SplitLine
            text="L'11 SETTEMBRE."
            className="block text-[clamp(2rem,6vw,6rem)] font-black tracking-[-0.02em] gradient-text"
          />
        </div>

        <p
          ref={subRef}
          className="mx-auto mb-10 max-w-md text-sm leading-relaxed text-academy-gray-400"
        >
          La Lacertosus Academy non forma semplici istruttori.
          <br />
          <span className="font-semibold text-academy-gray-200">
            Forma professionisti. Forma imprenditori.
          </span>
        </p>

        {/* CTAs */}
        <div
          ref={btnsRef}
          className="flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Button href="/pack" size="lg">
            Scegli il tuo Percorso
          </Button>
          <Button href="/percorso" variant="outline" size="lg">
            Esplora il Programma
          </Button>
        </div>

        {/* Quick summary pills */}
        <div
          ref={pillsRef}
          className="mt-12 flex flex-wrap items-center justify-center gap-3"
        >
          {[
            "9 mesi",
            "3 blocchi formativi",
            "Certificazione FIPE",
            "8 Workshop specialistici",
            "100% in presenza",
          ].map((pill) => (
            <span
              key={pill}
              className="border border-academy-orange/12 bg-academy-orange/4 px-3 py-1 text-[0.62rem] font-semibold tracking-wider text-academy-gray-500 uppercase"
            >
              {pill}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
