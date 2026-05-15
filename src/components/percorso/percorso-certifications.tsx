"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CERTIFICATIONS } from "@/lib/constants/certifications";

const ORANGE = "#F09226";

export function PercorsoCertifications() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const items = sectionRef.current?.querySelectorAll("[data-cert-item]");
      if (items) {
        gsap.from(items, {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 78%",
            once: true,
          },
          opacity: 0,
          y: 30,
          duration: 0.7,
          stagger: 0.12,
          ease: "power3.out",
        });
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="certificazioni"
      className="relative overflow-hidden py-24 md:py-32"
      style={{ background: "#0a0a0a" }}
    >
      {/* Vimeo blurred background — same pattern used by "La Risposta" on home */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        <iframe
          src="https://player.vimeo.com/video/1188022841?background=1&autoplay=1&loop=1&muted=1&quality=360p&dnt=1"
          title="Certificazioni background"
          loading="lazy"
          allow="autoplay; fullscreen"
          suppressHydrationWarning
          className="absolute left-1/2 top-1/2 min-h-full min-w-full"
          style={{
            aspectRatio: "16 / 9",
            border: 0,
            filter: "grayscale(.45) blur(8px) brightness(.8)",
            transform: "translate(-50%, -50%) scale(1.08)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(10,10,14,0.7) 0%, rgba(10,10,14,0.88) 100%)",
          }}
        />
      </div>

      {/* Diagonal light strip */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute h-px w-[200%] -left-1/2"
          style={{
            top: "42%",
            background:
              "linear-gradient(90deg, transparent, rgba(240,146,38,0.12), transparent)",
            transform: "rotate(-6deg)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-[1440px] px-[5%] md:px-10">
        {/* Header */}
        <div className="mb-14 max-w-3xl">
          <span className="label-tag mb-3 block">Le 3 Certificazioni</span>
          <h2 className="mb-6 text-[clamp(1.9rem,4vw,3.4rem)] font-black leading-[1.02] tracking-tight text-academy-gray-100">
            Tre titoli.
            <br />
            <span className="gradient-text">Una professione riconosciuta.</span>
          </h2>
          <p className="text-[0.98rem] leading-relaxed text-academy-gray-400">
            Al termine del percorso esci con tre riconoscimenti distinti — uno
            interno firmato CSEN, uno internazionale dato dai crediti NSCA, uno
            elite firmato FIPE per chi sceglie Pro o Elite.
          </p>
        </div>

        {/* Logo row — 3 real issuer logos */}
        <div
          className="mb-14 flex items-center justify-start gap-6 md:gap-8 flex-wrap"
          aria-label="Enti certificatori"
        >
          {[
            {
              src: "/certificazioni/fsmt.webp",
              label: "Functional Strength Master Trainer",
            },
            { src: "/certificazioni/csen.webp", label: "CSEN" },
            { src: "/certificazioni/nsca.webp", label: "NSCA" },
            { src: "/certificazioni/fipe.webp", label: "FIPE" },
          ].map((logo) => (
            <Image
              key={logo.label}
              src={logo.src}
              alt={logo.label}
              title={logo.label}
              width={128}
              height={128}
              className="h-24 w-24 md:h-32 md:w-32 object-contain"
            />
          ))}
        </div>

        {/* 3 certification cards in horizontal grid */}
        <div className="grid gap-4 md:gap-5 lg:grid-cols-3">
          {CERTIFICATIONS.map((cert, i) => {
            const isFipe = cert.id === "fipe-elite";
            return (
              <article
                key={cert.id}
                data-cert-item
                className="relative flex flex-col p-6 md:p-7"
                style={
                  isFipe
                    ? {
                        background:
                          "linear-gradient(135deg, rgba(240,146,38,0.18) 0%, rgba(240,146,38,0.04) 100%)",
                        border: "2px solid rgba(240,146,38,0.65)",
                        boxShadow: "0 0 28px rgba(240,146,38,0.15)",
                      }
                    : {
                        background: "rgba(255,255,255,0.03)",
                        border: "1.5px solid rgba(240,146,38,0.3)",
                        borderLeft: "4px solid #F09226",
                      }
                }
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-5">
                  <Image
                    src={cert.logo}
                    alt={`${cert.issuer} — ${cert.issuerFull}`}
                    width={56}
                    height={56}
                    className="h-14 w-14 object-contain"
                  />
                  <span
                    className="shrink-0 px-2 py-1 text-[0.55rem] font-black tracking-[0.22em] uppercase"
                    style={
                      isFipe
                        ? { color: "#111", background: ORANGE }
                        : {
                            color: ORANGE,
                            background: "rgba(240,146,38,0.12)",
                            border: "1px solid rgba(240,146,38,0.35)",
                          }
                    }
                  >
                    {cert.packsLabel}
                  </span>
                </div>

                {/* Index */}
                <span
                  className="text-[0.58rem] font-black tracking-[0.3em] uppercase mb-2"
                  style={{ color: "rgba(240,146,38,0.85)" }}
                >
                  {String(i + 1).padStart(2, "0")} · {cert.recognition}
                </span>

                {/* Title */}
                <h3
                  className="font-black tracking-[-0.02em] leading-[1.05] text-academy-gray-100"
                  style={{ fontSize: "clamp(1.3rem, 2vw, 1.7rem)" }}
                >
                  {cert.title}
                  <br />
                  <span style={{ color: ORANGE }}>{cert.titleAccent}</span>
                </h3>

                {/* Issuer */}
                <p
                  className="mt-2 text-[0.66rem] font-black tracking-[0.22em] uppercase"
                  style={{ color: isFipe ? ORANGE : "rgba(240,146,38,0.7)" }}
                >
                  Rilasciata da {cert.issuer}
                </p>

                {/* Description */}
                <p className="mt-4 text-[0.86rem] leading-[1.6] text-academy-gray-400">
                  {cert.shortDescription}
                </p>
              </article>
            );
          })}
        </div>

        {/* CTA strip → /certificazioni */}
        <div
          className="mt-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 md:p-7"
          style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div>
            <p className="text-[0.6rem] font-black tracking-[0.28em] uppercase text-academy-orange/85 mb-1">
              Approfondisci
            </p>
            <p className="text-[1.05rem] font-black text-academy-gray-100">
              Vedi cosa attesta ciascuna certificazione, dove vale e chi la
              rilascia.
            </p>
          </div>
          <Link
            href="/certificazioni"
            className="inline-flex items-center gap-2 px-6 py-3 text-[0.78rem] font-black tracking-[0.18em] uppercase transition-colors shrink-0"
            style={{
              color: "#111",
              background: ORANGE,
            }}
          >
            Pagina Certificazioni
            <svg
              viewBox="0 0 16 16"
              fill="none"
              className="h-3.5 w-3.5"
              aria-hidden
            >
              <path
                d="M4 8h8m0 0L8 4m4 4l-4 4"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="square"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
