"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTheme } from "@/components/providers/theme-provider";

export function SocialProofBar() {
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const cohortRef = useRef<HTMLDivElement>(null);
  const counter30Ref = useRef<HTMLSpanElement>(null);
  const dopoRef = useRef<HTMLDivElement>(null);

  const { theme } = useTheme();
  const d = theme === "dark";

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      // Header
      gsap.from(headRef.current, {
        scrollTrigger: {
          trigger: headRef.current,
          start: "top 88%",
          once: true,
        },
        opacity: 0,
        y: 32,
        duration: 0.8,
        ease: "power3.out",
      });

      // "COHORT 001" — letters reveal with stagger
      if (cohortRef.current) {
        const chars = cohortRef.current.querySelectorAll("[data-char]");
        gsap.from(chars, {
          scrollTrigger: {
            trigger: cohortRef.current,
            start: "top 80%",
            once: true,
          },
          opacity: 0,
          y: 30,
          duration: 0.5,
          stagger: 0.04,
          ease: "power3.out",
        });
      }

      // Counter: 30 posti
      if (counter30Ref.current) {
        const obj = { val: 0 };
        gsap.to(obj, {
          scrollTrigger: {
            trigger: counter30Ref.current,
            start: "top 82%",
            once: true,
          },
          val: 30,
          duration: 1.2,
          ease: "power2.out",
          onUpdate() {
            if (counter30Ref.current)
              counter30Ref.current.textContent = String(Math.round(obj.val));
          },
        });
      }

      // Card stagger entrance
      const cards = cardsRef.current?.querySelectorAll("[data-card]");
      if (cards?.length) {
        gsap.from(cards, {
          scrollTrigger: {
            trigger: cardsRef.current,
            start: "top 82%",
            once: true,
          },
          opacity: 0,
          y: 45,
          duration: 0.65,
          stagger: 0.09,
          ease: "power3.out",
        });
      }

      // "Dopo il Percorso" — rows slide up on scroll
      const dopoEl = dopoRef.current;
      if (dopoEl) {
        const items = dopoEl.querySelectorAll("[data-dopo-item]");
        gsap.from(items, {
          scrollTrigger: { trigger: dopoEl, start: "top 80%", once: true },
          opacity: 0,
          y: 18,
          duration: 0.55,
          stagger: 0.13,
          ease: "power3.out",
        });
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const th = d ? undefined : "#111111";
  const tm = d ? undefined : "#777777";

  const cardBg = d ? "rgba(10,8,28,0.7)" : "#ffffff";
  const cardBorder = d ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)";
  const accentBg = d
    ? "linear-gradient(145deg, rgba(240,146,38,0.1), rgba(2,0,38,0.94))"
    : "linear-gradient(145deg, rgba(240,146,38,0.07), rgba(255,255,255,0.99))";
  const accentBorder = d ? "rgba(240,146,38,0.2)" : "rgba(240,146,38,0.22)";
  const exclusiveBg = "#F09226";
  const exclusiveBorder = "rgba(240,146,38,0.0)";
  // Split "COHORT 001" into individual characters for GSAP stagger
  const cohortChars = "COHORT 001".split("").map((c, i) =>
    c === " " ? (
      <span key={i} className="inline-block w-[0.45em]" />
    ) : (
      <span key={i} data-char className="inline-block">
        {c}
      </span>
    ),
  );

  return (
    <section
      ref={sectionRef}
      className="themed-section relative overflow-hidden py-20 md:py-28"
    >
      <div className="absolute inset-0 section-bg-alt" />

      <div className="relative z-10 mx-auto max-w-[1440px] px-[5%] md:px-10">
        <div ref={headRef} className="mb-10">
          <span className="label-tag mb-3 block">Prima Edizione</span>
          <h2
            className="text-[clamp(1.8rem,3.5vw,2.8rem)] font-black leading-tight tracking-tight"
            style={{ color: th }}
          >
            Non è per tutti.{" "}
            <span className="gradient-text">Forse è per te.</span>
          </h2>
        </div>

        <div ref={cardsRef} className="grid gap-3 lg:grid-cols-12">
          {/* COHORT 001 — big founding member card */}
          <div
            data-card
            className="flex flex-col justify-between p-8 lg:col-span-7"
            style={{
              background: accentBg,
              border: `1px solid ${accentBorder}`,
            }}
          >
            <p className="text-[0.7rem] font-black tracking-[0.35em] text-academy-orange/65 uppercase">
              Founding Cohort — Prima Edizione
            </p>

            <div>
              {/* Animated COHORT 001 */}
              <div
                ref={cohortRef}
                className="text-[clamp(2.8rem,7vw,5.5rem)] font-black leading-none tracking-tight text-academy-orange tabular-nums"
                aria-label="COHORT 001"
              >
                {cohortChars}
              </div>

              <p
                className="mt-5 text-[clamp(0.95rem,1.4vw,1.1rem)] font-bold leading-snug"
                style={{ color: th }}
              >
                Non stai acquistando un corso.
                <br />
                Stai entrando in qualcosa di irripetibile.
              </p>
              <p
                className="mt-3 text-[0.85rem] leading-relaxed"
                style={{ color: tm }}
              >
                I fondatori della prima edizione non saranno semplici alumni —
                porteranno con sé qualcosa che nessun futuro partecipante potrà
                avere: il privilegio di aver aperto la strada e di aver
                contribuito a definire lo standard della formazione fitness
                italiana.
              </p>
            </div>
          </div>

          {/* POSTI LIMITATI — accesso esclusivo */}
          <div
            data-card
            className="flex flex-col justify-between p-8 lg:col-span-5"
            style={{
              background: exclusiveBg,
              border: `1px solid ${exclusiveBorder}`,
            }}
          >
            <p className="text-[0.75rem] font-bold tracking-[0.28em] text-[#020026]/60 uppercase">
              Accesso Esclusivo
            </p>
            <div>
              <div className="text-[clamp(4.5rem,9vw,7rem)] font-black leading-none text-[#020026] tabular-nums">
                <span ref={counter30Ref}>0</span>
              </div>
              <p className="mt-1 text-lg font-bold text-[#020026]">
                partecipanti per edizione
              </p>
              <p className="mt-2 text-[0.82rem] leading-relaxed text-[#020026]/70">
                Ogni posto è riservato a chi dimostra la determinazione giusta.
                Non si entra per caso. Non si entra per primo. Si entra perché
                si è pronti.
              </p>
            </div>
          </div>

          {/* I FONDATORI */}
          <div
            data-card
            className="flex flex-col p-7 lg:col-span-4"
            style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
          >
            <p className="text-[0.75rem] font-bold tracking-[0.28em] text-academy-orange/70 uppercase mb-6">
              I Fondatori
            </p>
            <div className="text-[2.6rem] font-black leading-none text-academy-orange/25 select-none">
              ◆
            </div>
            <p
              className="mt-3 text-[1.05rem] font-black leading-tight"
              style={{ color: th }}
            >
              La prima edizione è irripetibile
            </p>
            <p className="mt-1 text-[0.78rem] font-bold text-academy-orange/80 uppercase tracking-[0.2em]">
              Titolo di fondatore
            </p>
            <p
              className="mt-3 text-[0.78rem] leading-relaxed"
              style={{ color: tm }}
            >
              Chi partecipa ora costruisce qualcosa che non può essere comprato
              in futuro: il titolo di fondatore di un network destinato a
              durare.
            </p>
          </div>

          {/* L'ECOSISTEMA */}
          <div
            data-card
            className="flex flex-col p-7 lg:col-span-4"
            style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
          >
            <p className="text-[0.75rem] font-bold tracking-[0.28em] text-academy-orange/70 uppercase mb-6">
              L&apos;Ecosistema
            </p>
            <div className="text-[2.6rem] font-black leading-none text-academy-orange/25 select-none">
              ◈
            </div>
            <p
              className="mt-3 text-[1.05rem] font-black leading-tight"
              style={{ color: th }}
            >
              Chi ti circonda conta
            </p>
            <p className="mt-1 text-[0.78rem] font-bold text-academy-orange/80 uppercase tracking-[0.2em]">
              Network selezionato
            </p>
            <p
              className="mt-3 text-[0.78rem] leading-relaxed"
              style={{ color: tm }}
            >
              Sarai affiancato da persone selezionate con i tuoi stessi
              standard. Le connessioni che costruirai durante il percorso
              valgono quanto il percorso stesso.
            </p>
          </div>

          {/* TRAINING HUB */}
          <div
            data-card
            ref={dopoRef}
            className="flex flex-col p-7 lg:col-span-4"
            style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
          >
            <p className="text-[0.75rem] font-bold tracking-[0.28em] text-academy-orange/70 uppercase mb-6">
              Dopo il Percorso
            </p>
            <div
              data-dopo-item
              className="text-[2.6rem] font-black leading-none text-academy-orange/20 select-none"
            >
              ⬡
            </div>
            <p
              className="mt-3 text-[1.05rem] font-black leading-tight"
              style={{ color: th }}
            >
              Training Hub
            </p>
            <p className="mt-1 text-[0.78rem] font-bold text-academy-orange/80 uppercase tracking-[0.2em]">
              Apri nel tuo territorio
            </p>
            <p
              className="mt-3 text-[0.78rem] leading-relaxed"
              style={{ color: tm }}
            >
              Il percorso ti dà le competenze, il metodo e il network per aprire
              un Training Hub certificato Lacertosus Academy nella tua città.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
