"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// ── Split-char component ──────────────────────────────────────────────────────

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

// ── Magnetic button ───────────────────────────────────────────────────────────

function MagneticBtn({
  href,
  primary,
  children,
}: {
  href: string;
  primary?: boolean;
  children: React.ReactNode;
}) {
  const btnRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = btnRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      gsap.to(el, { x: dx * 0.28, y: dy * 0.28, duration: 0.4, ease: "power2.out" });
    };
    const onLeave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1,0.4)" });
    };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  if (primary) {
    return (
      <a
        ref={btnRef}
        href={href}
        className="relative inline-flex items-center gap-3 overflow-hidden px-10 py-4 text-sm font-black tracking-[0.18em] uppercase"
        style={{
          background: "linear-gradient(135deg, #F09226 0%, #e07d10 100%)",
          color: "#010015",
          boxShadow: "0 0 40px rgba(240,146,38,0.35), 0 8px 32px rgba(0,0,0,0.4)",
        }}
      >
        <span className="relative z-10">{children}</span>
        {/* Shimmer */}
        <span
          className="shimmer-overlay pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background:
              "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 2.8s infinite",
          }}
        />
      </a>
    );
  }

  return (
    <a
      ref={btnRef}
      href={href}
      className="inline-flex items-center gap-3 px-10 py-4 text-sm font-black tracking-[0.18em] uppercase transition-colors duration-200"
      style={{
        border: "1px solid rgba(240,146,38,0.35)",
        color: "rgba(240,146,38,0.85)",
        background: "rgba(240,146,38,0.04)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(240,146,38,0.7)";
        (e.currentTarget as HTMLElement).style.color = "#F09226";
        (e.currentTarget as HTMLElement).style.background = "rgba(240,146,38,0.08)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(240,146,38,0.35)";
        (e.currentTarget as HTMLElement).style.color = "rgba(240,146,38,0.85)";
        (e.currentTarget as HTMLElement).style.background = "rgba(240,146,38,0.04)";
      }}
    >
      {children}
    </a>
  );
}

// ── Animated counter ──────────────────────────────────────────────────────────

function Counter({
  to,
  suffix = "",
  prefix = "",
}: {
  to: number;
  suffix?: string;
  prefix?: string;
}) {
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = spanRef.current;
    if (!el) return;
    const obj = { val: 0 };
    ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          val: to,
          duration: 1.8,
          ease: "power2.out",
          onUpdate: () => {
            el.textContent = prefix + Math.round(obj.val) + suffix;
          },
        });
      },
    });
  }, [to, suffix, prefix]);

  return (
    <span ref={spanRef} aria-label={`${prefix}${to}${suffix}`}>
      {prefix}0{suffix}
    </span>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export function CTASection() {
  const sectionRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const watermarkRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLDivElement>(null);
  const line2Ref = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLDivElement>(null);
  const btnsRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const chars1 = line1Ref.current?.querySelectorAll("[data-cta-char]");
      const chars2 = line2Ref.current?.querySelectorAll("[data-cta-char]");

      const tl = gsap.timeline({
        scrollTrigger: { trigger: sectionRef.current, start: "top 60%", once: true },
      });

      // Glow entrance
      tl.from(glowRef.current, { opacity: 0, scale: 0.4, duration: 1.4, ease: "power2.out" });

      // Watermark parallax
      gsap.to(watermarkRef.current, {
        yPercent: -20,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.5,
        },
      });

      // Chars
      if (chars1?.length) {
        tl.from(chars1, { y: "115%", opacity: 0, duration: 0.7, stagger: 0.02, ease: "power3.out" }, "<0.25");
      }
      if (chars2?.length) {
        tl.from(chars2, { y: "115%", opacity: 0, duration: 0.7, stagger: 0.02, ease: "power3.out" }, "<0.05");
      }

      tl.from(dividerRef.current, { scaleX: 0, duration: 0.55, ease: "power3.out" }, "-=0.3");
      tl.from(subRef.current, { opacity: 0, y: 24, duration: 0.55, ease: "power2.out" }, "-=0.3");
      tl.from(btnsRef.current, { opacity: 0, y: 18, duration: 0.5, ease: "power2.out" }, "-=0.25");
      tl.from(statsRef.current, { opacity: 0, y: 16, duration: 0.45, ease: "power2.out" }, "-=0.2");

      // Glow ambient pulse
      gsap.to(glowRef.current, {
        scale: 1.18,
        opacity: 0.75,
        duration: 3.5,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <>
      {/* Shimmer keyframes */}
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>

      <section
        ref={sectionRef}
        id="cta"
        className="relative overflow-hidden py-32 md:py-48"
      >
        {/* Background */}
        <div className="absolute inset-0" style={{ background: "#020026" }} />

        {/* Grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(240,146,38,1) 1px, transparent 1px)," +
              "linear-gradient(90deg, rgba(240,146,38,1) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />

        {/* Central glow */}
        <div
          ref={glowRef}
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: "900px",
            height: "900px",
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse at center, rgba(240,146,38,0.14) 0%, rgba(240,146,38,0.04) 40%, transparent 68%)",
          }}
        />

        {/* Watermark */}
        <div
          ref={watermarkRef}
          className="pointer-events-none absolute inset-0 flex items-center justify-center select-none overflow-hidden"
          aria-hidden
        >
          <span
            className="whitespace-nowrap font-black uppercase tracking-[0.08em]"
            style={{
              fontSize: "clamp(8rem,20vw,22rem)",
              color: "transparent",
              WebkitTextStroke: "1px rgba(240,146,38,0.07)",
              lineHeight: 1,
            }}
          >
            LACERTOSUS
          </span>
        </div>

        <div className="relative z-10 mx-auto max-w-[1440px] px-[5%] md:px-10">
          <div className="flex flex-col items-center text-center">

            {/* Eyebrow */}
            <div className="mb-8">
              <span className="label-tag">Edizione 2026/27</span>
            </div>

            {/* Headline */}
            <div ref={line1Ref} className="leading-none">
              <SplitLine
                text="DA ATLETA"
                className="block text-[clamp(2.4rem,7vw,7rem)] font-black tracking-[-0.025em] text-[#e8e8f0]"
              />
            </div>
            <div ref={line2Ref} className="mb-6 leading-none">
              <SplitLine
                text="A PROFESSIONISTA."
                className="block text-[clamp(2.4rem,7vw,7rem)] font-black tracking-[-0.025em] gradient-text"
              />
            </div>

            {/* Divider */}
            <div
              ref={dividerRef}
              className="mb-8 h-px w-24 origin-left"
              style={{ background: "linear-gradient(90deg, #F09226, transparent)" }}
            />

            {/* Sub */}
            <p
              ref={subRef}
              className="mx-auto mb-10 max-w-lg text-base leading-relaxed"
              style={{ color: "rgba(200,200,220,0.6)" }}
            >
              La Lacertosus Academy è l'unico percorso in Italia che unisce{" "}
              <span style={{ color: "rgba(240,146,38,0.9)", fontWeight: 700 }}>scienza del movimento</span>,{" "}
              <span style={{ color: "rgba(240,146,38,0.9)", fontWeight: 700 }}>certificazione FIPE</span>{" "}
              e mentalità imprenditoriale in 9 mesi intensivi.
            </p>

            {/* CTAs */}
            <div
              ref={btnsRef}
              className="flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <MagneticBtn href="/pack" primary>
                Scegli il tuo Percorso →
              </MagneticBtn>
              <MagneticBtn href="/percorso">
                Esplora il Programma
              </MagneticBtn>
            </div>

            {/* Stats row */}
            <div
              ref={statsRef}
              className="mt-16 grid grid-cols-2 gap-px min-[540px]:grid-cols-4"
              style={{ border: "1px solid rgba(240,146,38,0.1)", background: "rgba(240,146,38,0.06)" }}
            >
              {[
                { to: 33, suffix: "+", label: "Docenti" },
                { to: 9,  suffix: "",  label: "Mesi" },
                { to: 30, suffix: "",  label: "Posti disponibili" },
                { to: 100, suffix: "%", label: "In presenza" },
              ].map((s, i) => (
                <div
                  key={s.label}
                  className="flex flex-col items-center gap-1 px-8 py-6"
                  style={{
                    borderRight: i < 3 ? "1px solid rgba(240,146,38,0.1)" : undefined,
                  }}
                >
                  <span
                    className="text-[clamp(1.8rem,3vw,2.6rem)] font-black leading-none"
                    style={{ color: "#F09226" }}
                  >
                    <Counter to={s.to} suffix={s.suffix} />
                  </span>
                  <span
                    className="text-[0.68rem] font-bold tracking-[0.22em] uppercase"
                    style={{ color: "rgba(200,200,220,0.45)" }}
                  >
                    {s.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Trust line */}
            <p
              className="mt-6 text-[0.72rem] font-semibold tracking-[0.18em] uppercase"
              style={{ color: "rgba(200,200,220,0.3)" }}
            >
              Posti limitati · Selezione in ingresso · Nessun pagamento immediato
            </p>

          </div>
        </div>
      </section>
    </>
  );
}
