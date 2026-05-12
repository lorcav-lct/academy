"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  TEACHERS,
  type Teacher,
  getOrderedTeachers,
} from "@/lib/constants/teachers";
import { TeacherPortrait } from "@/components/shared/teacher-portrait";

const PROBLEMS = [
  "Corsi online senza pratica reale",
  "Certificazioni non riconosciute dal settore",
  "Formazione tecnica — zero visione business",
  "Docenti senza esperienza concreta di campo",
  "Nessuna rete professionale dopo il corso",
];

const RESPONSE_TAGS: string[] = [];

const FOUNDER_PERKS = [
  {
    icon: "◆",
    label: "I Fondatori",
    title: "La prima edizione è irripetibile",
    sub: "Titolo di Fondatore",
    body: "Chi partecipa ora costruisce qualcosa che non può essere comprato in futuro: il titolo di fondatore di un network destinato a durare.",
  },
  {
    icon: "◈",
    label: "L'Ecosistema",
    title: "Chi ti circonda conta",
    sub: "Network selezionato",
    body: "Sarai affiancato da persone selezionate con i tuoi stessi standard. Le connessioni che costruirai durante il percorso valgono quanto il percorso stesso.",
  },
  {
    icon: "⬡",
    label: "Dopo il Percorso",
    title: "3 Certificazioni Riconosciute",
    sub: "Spendibili in Italia e all'estero",
    body: "Esci con il Diploma Functional Strength Master Trainer rilasciato da CSEN, 2.0 CEU NSCA di valore internazionale e — per i pack PRO ed ELITE — il Personal Elite Trainer FIPE. Tre titoli che aprono porte concrete: palestre, centri sportivi, training hub, strutture federali in Italia e all'estero.",
  },
];

const SLOT_COUNT = 30;

function getCourseLabel(courses: string[]): string {
  const first = courses[0] ?? "";
  if (first === "function") return "FUNCTION";
  if (first === "strength") return "STRENGTH";
  if (first === "science") return "SCIENCE";
  if (first.startsWith("master-")) return "MASTERCLASS";
  return "ACADEMY";
}

/* Palette light minimal-luxury + dark anchor cards */
const BG_SECTION = "#ededed"; // warm off-white più saturato per carattere
const CARD_BG = "#FFFFFF";
const CARD_BORDER = "rgba(0,0,0,0.08)";
const CARD_SHADOW = "0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)";
const TEXT_PRIMARY = "#111111";
const TEXT_SECONDARY = "rgba(17,17,17,0.62)";
const TEXT_TERTIARY = "rgba(17,17,17,0.42)";
const DIVIDER = "rgba(0,0,0,0.08)";
const STRIKE_ORANGE = "rgba(240,146,38,0.7)";

/* Dark anchor tokens — usati per "La Risposta" (§01) e "COHORT 001" (§02).
   Gradient diagonale grigio scuro → scurissimo per dare profondità
   senza il "flat feeling" del colore pieno. */
const DARK_CARD_BG = "linear-gradient(145deg,#434343 0%, #0a0a0a 100%)";
const DARK_CARD_BG_BRAND = "linear-gradient(145deg, #434343 0%, #0a0a0a 100%)";
const DARK_TEXT_PRIMARY = "#FFFFFF";
const DARK_TEXT_SECONDARY = "rgba(255,255,255,0.72)";
const DARK_TAG_BG = "rgba(255,255,255,0.05)";
const DARK_TAG_BORDER = "rgba(255,255,255,0.15)";

function SplitLine({
  text,
  className,
  style,
}: {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span className={`block leading-[0.92] ${className ?? ""}`} style={style}>
      {text.split("").map((ch, i) => (
        <span
          key={i}
          className="inline-block"
          style={{ overflow: "hidden", verticalAlign: "bottom" }}
        >
          <span data-cohort-char className="inline-block">
            {ch === " " ? "\u00A0" : ch}
          </span>
        </span>
      ))}
    </span>
  );
}

function TeacherCard({
  teacher,
  index,
  total,
}: {
  teacher: Teacher;
  index: number;
  total: number;
}) {
  const courseLabel = getCourseLabel(teacher.courses);
  return (
    <article
      data-teacher-card
      className="relative flex shrink-0 flex-col overflow-hidden"
      style={{
        background: CARD_BG,
        border: `1px solid ${CARD_BORDER}`,
        width: "clamp(280px, 78vw, 340px)",
        scrollSnapAlign: "start",
      }}
    >
      {/* Portrait 4:5 with overlay name */}
      <TeacherPortrait
        teacher={teacher}
        sizes="(max-width: 640px) 78vw, 340px"
        fallbackTheme="dark"
      />

      {/* Bottom meta row */}
      <div
        className="flex items-center justify-between px-5 py-3 border-t"
        style={{ borderColor: CARD_BORDER }}
      >
        <span className="font-mono text-[0.62rem] font-bold tracking-[0.24em] uppercase text-academy-orange">
          {String(index + 1).padStart(2, "0")} /{" "}
          {String(total).padStart(2, "0")}
        </span>
        <span
          className="font-mono text-[0.6rem] font-bold tracking-[0.25em] uppercase"
          style={{ color: TEXT_TERTIARY }}
        >
          {courseLabel}
        </span>
      </div>

      {/* Name + role */}
      <div className="px-5 pt-3 pb-5">
        <h3
          className="text-[1.05rem] md:text-[1.15rem] font-black leading-tight tracking-tight"
          style={{ color: TEXT_PRIMARY }}
        >
          {teacher.name}
        </h3>
        <p
          className="mt-2 text-[0.66rem] font-bold tracking-[0.18em] uppercase line-clamp-2"
          style={{ color: "#F09226" }}
        >
          {teacher.role}
        </p>
      </div>
    </article>
  );
}

function CarouselArrow({
  direction,
  onClick,
  disabled,
}: {
  direction: "prev" | "next";
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={
        direction === "prev" ? "Docente precedente" : "Docente successivo"
      }
      className="flex h-12 w-12 items-center justify-center transition-opacity disabled:opacity-30"
      style={{
        background: "#FFFFFF",
        border: "1px solid rgba(240,146,38,0.35)",
      }}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        stroke="#F09226"
        strokeWidth="1.8"
        strokeLinecap="square"
        strokeLinejoin="miter"
        style={{
          transform: direction === "prev" ? "rotate(180deg)" : undefined,
        }}
        aria-hidden
      >
        <path d="M4 2 L9 7 L4 12" />
      </svg>
    </button>
  );
}

function MovementHeader({
  num,
  title,
  headerRef,
}: {
  num: string;
  title: string;
  headerRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div ref={headerRef} className="mb-10 flex items-baseline gap-4">
      <span className="font-mono text-[0.7rem] font-bold tracking-[0.3em] uppercase text-academy-orange">
        § {num}
      </span>
      <span className="h-px flex-1" style={{ background: DIVIDER }} />
      <span
        className="font-mono text-[0.7rem] font-bold tracking-[0.3em] uppercase"
        style={{ color: TEXT_TERTIARY }}
      >
        {title}
      </span>
    </div>
  );
}

export function WhyLacertosus() {
  const sectionRef = useRef<HTMLElement>(null);

  const m1HeaderRef = useRef<HTMLDivElement>(null);
  const m2HeaderRef = useRef<HTMLDivElement>(null);
  const m3HeaderRef = useRef<HTMLDivElement>(null);

  const titleRef = useRef<HTMLHeadingElement>(null);
  const teachersTitleRef = useRef<HTMLHeadingElement>(null);
  const problemsRef = useRef<HTMLDivElement>(null);
  const responseCardRef = useRef<HTMLDivElement>(null);
  const fipeCardRef = useRef<HTMLDivElement>(null);

  const cohortCardRef = useRef<HTMLDivElement>(null);
  const stat30Ref = useRef<HTMLDivElement>(null);
  const counter30Ref = useRef<HTMLSpanElement>(null);
  const perksRef = useRef<HTMLDivElement>(null);

  const carouselRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [carouselProgress, setCarouselProgress] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const scrollByCard = useCallback((dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-teacher-card]");
    const gap = 16;
    const step = (card?.offsetWidth ?? 320) + gap;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  }, []);

  /* Desktop mouse drag-to-scroll con momentum.
     Listener su window (non pointer capture) → eventi garantiti anche
     se il cursore esce dal carosello durante il trascinamento. */
  const velocityRef = useRef(0);
  const momentumRafRef = useRef<number | null>(null);

  const stopMomentum = useCallback(() => {
    if (momentumRafRef.current != null) {
      cancelAnimationFrame(momentumRafRef.current);
      momentumRafRef.current = null;
    }
  }, []);

  const startMomentum = useCallback(() => {
    const DECAY = 0.93;
    const MIN_V = 0.02;
    const tick = () => {
      const el = scrollerRef.current;
      if (!el) {
        momentumRafRef.current = null;
        return;
      }
      const v = velocityRef.current;
      if (Math.abs(v) < MIN_V) {
        momentumRafRef.current = null;
        return;
      }
      el.scrollLeft += v * 16;
      velocityRef.current *= DECAY;
      momentumRafRef.current = requestAnimationFrame(tick);
    };
    momentumRafRef.current = requestAnimationFrame(tick);
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const el = scrollerRef.current;
      if (!el) return;
      const target = e.target as HTMLElement;
      if (target.closest("button, a, [data-no-drag]")) return;

      /* preventDefault evita la text selection durante il drag e garantisce
         che onMouseMove globali arrivino fluidamente. */
      e.preventDefault();
      stopMomentum();

      const startX = e.clientX;
      const startScroll = el.scrollLeft;
      let lastX = startX;
      let lastTime = performance.now();
      velocityRef.current = 0;

      el.style.cursor = "grabbing";
      document.body.style.userSelect = "none";

      const onMove = (ev: MouseEvent) => {
        const node = scrollerRef.current;
        if (!node) return;
        const dx = ev.clientX - startX;
        node.scrollLeft = startScroll - dx;
        const now = performance.now();
        const dt = now - lastTime;
        if (dt > 0) {
          velocityRef.current = (lastX - ev.clientX) / dt;
        }
        lastX = ev.clientX;
        lastTime = now;
      };

      const onUp = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
        const node = scrollerRef.current;
        if (node) node.style.cursor = "grab";
        document.body.style.userSelect = "";

        const fresh = performance.now() - lastTime < 80;
        if (fresh && Math.abs(velocityRef.current) > 0.05) {
          startMomentum();
        } else {
          velocityRef.current = 0;
        }
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [stopMomentum, startMomentum],
  );

  /* Cleanup momentum on unmount */
  useEffect(() => {
    return () => stopMomentum();
  }, [stopMomentum]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => {
      const max = el.scrollWidth - el.clientWidth;
      const p = max > 0 ? Math.max(0, Math.min(1, el.scrollLeft / max)) : 0;
      setCarouselProgress(p);
      setCanPrev(el.scrollLeft > 4);
      setCanNext(el.scrollLeft < max - 4);
    };
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      const fadeUp = (target: Element | null, opts?: gsap.TweenVars) => {
        if (!target) return;
        gsap.from(target, {
          scrollTrigger: { trigger: target, start: "top 86%", once: true },
          opacity: 0,
          y: 32,
          duration: 0.8,
          ease: "power3.out",
          ...opts,
        });
      };

      fadeUp(m1HeaderRef.current);
      fadeUp(titleRef.current, { y: 40, duration: 0.9 });
      fadeUp(m2HeaderRef.current);
      fadeUp(m3HeaderRef.current);
      fadeUp(teachersTitleRef.current, { y: 40, duration: 0.9 });
      fadeUp(carouselRef.current, { y: 40 });

      /* §01 Problemi + strike */
      const problemItems =
        problemsRef.current?.querySelectorAll("[data-problem]");
      if (problemItems?.length) {
        gsap.from(problemItems, {
          scrollTrigger: {
            trigger: problemsRef.current,
            start: "top 82%",
            once: true,
          },
          opacity: 0,
          x: -24,
          duration: 0.55,
          stagger: 0.1,
          ease: "power2.out",
        });
        const strikes = problemsRef.current?.querySelectorAll("[data-strike]");
        if (strikes?.length) {
          gsap.set(strikes, { scaleX: 0, transformOrigin: "left center" });
          gsap.to(strikes, {
            scrollTrigger: {
              trigger: problemsRef.current,
              start: "top 72%",
              once: true,
            },
            scaleX: 1,
            duration: 0.55,
            stagger: 0.13,
            ease: "power2.inOut",
            delay: 0.3,
          });
        }
      }

      fadeUp(responseCardRef.current, { y: 40 });
      fadeUp(fipeCardRef.current, { y: 40, duration: 0.7 });

      /* §02 Cohort: SplitLine */
      const cohortChars =
        cohortCardRef.current?.querySelectorAll("[data-cohort-char]");
      if (cohortChars?.length) {
        gsap.from(cohortChars, {
          scrollTrigger: {
            trigger: cohortCardRef.current,
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
      fadeUp(cohortCardRef.current, { y: 40 });

      /* §02 Counter 30 */
      if (counter30Ref.current && stat30Ref.current) {
        const obj = { v: 0 };
        gsap.to(obj, {
          scrollTrigger: {
            trigger: stat30Ref.current,
            start: "top 80%",
            once: true,
          },
          v: 30,
          duration: 1.2,
          ease: "power2.out",
          onUpdate() {
            if (counter30Ref.current)
              counter30Ref.current.textContent = String(Math.round(obj.v));
          },
        });
      }
      fadeUp(stat30Ref.current, { y: 40 });

      /* §02 Perks 3 card */
      const perkCards = perksRef.current?.querySelectorAll("[data-perk]");
      if (perkCards?.length) {
        gsap.from(perkCards, {
          scrollTrigger: {
            trigger: perksRef.current,
            start: "top 84%",
            once: true,
          },
          opacity: 0,
          y: 40,
          duration: 0.65,
          stagger: 0.12,
          ease: "power3.out",
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  /* --section-bg allinea il transition layer di chiusura della hero
     al bg light di questa sezione (transizione seamless). */
  const sectionStyle = {
    background: BG_SECTION,
    "--section-bg": BG_SECTION,
  } as React.CSSProperties;

  return (
    <section
      ref={sectionRef}
      id="perche"
      className="relative overflow-hidden"
      style={sectionStyle}
    >
      <div className="relative z-10 mx-auto max-w-[1440px] px-[5%] py-24 md:px-10 md:py-32">
        {/* ───────────── §01 · IL SETTORE ───────────── */}
        <MovementHeader num="01" title="Il Settore" headerRef={m1HeaderRef} />

        <h2
          ref={titleRef}
          className="mb-10 max-w-3xl text-[clamp(2rem,4.5vw,3.8rem)] font-black leading-[1.05] tracking-tight"
          style={{ color: TEXT_PRIMARY }}
        >
          Pieno di corsi.{" "}
          <span className="text-academy-orange">Non di professionisti.</span>
        </h2>

        <div className="mb-24 grid gap-4 md:gap-5 lg:grid-cols-12">
          {/* PROBLEMA */}
          <div
            ref={problemsRef}
            className="relative flex flex-col overflow-hidden p-7 md:p-8 lg:col-span-7 lg:row-span-2"
            style={{
              background: CARD_BG,
              border: `1px solid ${CARD_BORDER}`,
              boxShadow: CARD_SHADOW,
            }}
          >
            <p className="mb-7 text-[0.7rem] font-black tracking-[0.32em] uppercase text-academy-orange">
              Problemi comuni reali
            </p>
            <ul className="space-y-5">
              {PROBLEMS.map((p, i) => (
                <li key={i} data-problem className="flex items-start gap-3.5">
                  <span className="mt-[3px] shrink-0 font-mono text-[0.68rem] font-black text-academy-orange">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className="relative text-[0.9rem] leading-snug"
                    style={{ color: "rgba(17,17,17,0.8)" }}
                  >
                    {p}
                    <span
                      data-strike
                      className="absolute left-0 right-0"
                      style={{
                        top: "50%",
                        height: "1px",
                        background: STRIKE_ORANGE,
                        transformOrigin: "left center",
                      }}
                    />
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* RISPOSTA — Vimeo bg con blur + dark overlay */}
          <div
            ref={responseCardRef}
            className="relative flex flex-col justify-between overflow-hidden p-7 md:p-8 lg:col-span-5"
            style={{
              background: DARK_CARD_BG,
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {/* Vimeo background — stesso pattern della cohort card */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
            >
              <iframe
                src="https://player.vimeo.com/video/1188022841?background=1&autoplay=1&loop=1&muted=1&quality=360p&dnt=1"
                title="La Risposta background"
                loading="lazy"
                allow="autoplay; fullscreen"
                suppressHydrationWarning
                className="absolute left-1/2 top-1/2 min-h-full min-w-full"
                style={{
                  aspectRatio: "16 / 9",
                  border: 0,
                  filter: "grayscale(.45) blur(8px) brightness(.8)",
                  /* translate centra, scale nasconde i bordi sfocati */
                  transform: "translate(-50%, -50%) scale(1.08)",
                }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(10,10,14,0.45) 0%, rgba(10,10,14,0.68) 100%)",
                }}
              />
            </div>

            <p className="relative z-10 text-[0.7rem] font-black tracking-[0.32em] uppercase text-academy-orange">
              ✓&ensp;La Risposta
            </p>
            <div className="relative z-10 mt-6">
              <p
                className="text-[clamp(1.3rem,2.2vw,1.9rem)] font-black leading-[1.15]"
                style={{ color: DARK_TEXT_PRIMARY }}
              >
                Un percorso unico e pluricertificato che unisce{" "}
                <span className="text-academy-orange">
                  tecnica, pratica, business e network
                </span>
                .
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {RESPONSE_TAGS.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 text-[0.7rem] font-bold tracking-[0.2em] uppercase"
                    style={{
                      background: DARK_TAG_BG,
                      border: `1px solid ${DARK_TAG_BORDER}`,
                      color: DARK_TEXT_PRIMARY,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* CERTIFICAZIONI STRIP */}
          <div
            ref={fipeCardRef}
            className="flex flex-col gap-5 p-7 md:p-8 lg:col-span-5"
            style={{
              background: CARD_BG,
              border: `1px solid ${CARD_BORDER}`,
              boxShadow: CARD_SHADOW,
            }}
          >
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-mono text-[0.65rem] font-bold tracking-[0.28em] uppercase text-academy-orange">
                Le 3 certificazioni
              </p>
              <span
                className="px-2 py-0.5 text-[0.55rem] font-black tracking-[0.22em] uppercase"
                style={{
                  color: "#F09226",
                  background: "rgba(240,146,38,0.1)",
                  border: "1px solid rgba(240,146,38,0.35)",
                }}
              >
                Nazionali · Internazionali
              </span>
            </div>

            {/* 3 mini-rows */}
            <ul className="flex flex-col gap-3">
              {[
                {
                  pill: "Tutti i pack",
                  title: "Functional Strength Master Trainer",
                  sub: "Diploma rilasciato da CSEN · Riconoscimento nazionale.",
                },
                {
                  pill: "Tutti i pack",
                  title: "NSCA CEU Provider · +2.0 CEU",
                  sub: "Crediti formativi internazionali validi per certificazioni NSCA.",
                },
                {
                  pill: "Pro · Elite",
                  title: "Personal Elite Trainer FIPE",
                  sub: "Certificazione FIPE · Riconoscimento nazionale e internazionale.",
                },
              ].map((cert) => (
                <li key={cert.title} className="flex items-start gap-3">
                  <span
                    className="shrink-0 mt-1 h-2 w-2"
                    style={{ background: "#F09226" }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span
                        className="text-[0.86rem] font-black leading-tight"
                        style={{ color: TEXT_PRIMARY }}
                      >
                        {cert.title}
                      </span>
                      <span
                        className="px-1.5 py-0.5 text-[0.48rem] font-black tracking-[0.18em] uppercase"
                        style={{
                          color: "#F09226",
                          background: "rgba(240,146,38,0.08)",
                          border: "1px solid rgba(240,146,38,0.3)",
                        }}
                      >
                        {cert.pill}
                      </span>
                    </div>
                    <p
                      className="text-[0.74rem] leading-[1.5]"
                      style={{ color: TEXT_SECONDARY }}
                    >
                      {cert.sub}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            {/* Logo row — 6 placeholders */}
            <div
              className="flex items-center justify-between gap-1 pt-5"
              style={{ borderTop: `1px solid ${DIVIDER}` }}
              aria-label="Enti certificatori"
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <Image
                  key={i}
                  src="/certificazioni/csen.webp"
                  alt="Ente certificatore"
                  width={88}
                  height={88}
                  className="h-16 w-16 md:h-20 md:w-20 object-contain"
                />
              ))}
            </div>
          </div>
        </div>

        {/* ───────────── §02 · LA COHORT ───────────── */}
        <MovementHeader num="02" title="La Cohort" headerRef={m2HeaderRef} />

        <div className="mb-5 grid gap-4 md:gap-5 lg:grid-cols-12">
          {/* COHORT 001 HERO — Vimeo bg con blur + dark overlay */}
          <div
            ref={cohortCardRef}
            className="relative flex flex-col justify-between overflow-hidden p-7 md:p-10 lg:col-span-8 lg:row-span-2"
            style={{
              background: DARK_CARD_BG_BRAND,
              border: "1px solid rgba(255,255,255,0.06)",
              minHeight: "380px",
            }}
          >
            {/* Vimeo background — quality bassa + lazy load per leggerezza.
                Trick "cover": iframe min 100%×100% con aspect-ratio 16:9
                forzato così il video copre la card senza letterbox. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
            >
              <iframe
                src="https://player.vimeo.com/video/1188010863?background=1&autoplay=1&loop=1&muted=1&quality=360p&dnt=1"
                title="Cohort 001 background"
                loading="lazy"
                allow="autoplay; fullscreen"
                suppressHydrationWarning
                className="absolute left-1/2 top-1/2 min-h-full min-w-full"
                style={{
                  aspectRatio: "16 / 9",
                  border: 0,
                  filter: "blur(14px) brightness(0.7) saturate(1.05)",
                  /* translate centra, scale nasconde i bordi sfocati */
                  transform: "translate(-50%, -50%) scale(1.08)",
                }}
              />
              {/* Tint scuro per leggibilità del testo + coerenza brand */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(10,10,14,0.55) 0%, rgba(10,10,14,0.78) 100%)",
                }}
              />
            </div>

            <p className="relative z-10 font-mono text-[0.7rem] font-black tracking-[0.32em] uppercase text-academy-orange">
              Founding Edition · 2026 / 2027
            </p>

            <div className="relative z-10">
              <div
                className="text-[clamp(3.2rem,9vw,7rem)] font-black leading-[0.95] tracking-tight tabular-nums text-academy-orange"
                aria-label="COHORT 001"
              >
                <SplitLine text="COHORT 001" />
              </div>
              <p
                className="mt-6 max-w-xl text-[clamp(1rem,1.5vw,1.2rem)] font-bold leading-snug"
                style={{ color: DARK_TEXT_PRIMARY }}
              >
                Non stai acquistando un corso. Stai entrando in qualcosa di
                irripetibile.
              </p>
              <p
                className="mt-3 max-w-xl text-[0.85rem] leading-relaxed"
                style={{ color: DARK_TEXT_SECONDARY }}
              >
                I fondatori della prima edizione non saranno semplici alumni —
                porteranno con sé il privilegio di aver aperto la strada e
                contribuito a definire lo standard della formazione fitness
                italiana.
              </p>
            </div>

            {/* Corner brackets arancio */}
            <span
              aria-hidden
              className="absolute top-4 left-4 z-10 h-4 w-4 border-t border-l border-academy-orange"
              style={{ opacity: 0.55 }}
            />
            <span
              aria-hidden
              className="absolute top-4 right-4 z-10 h-4 w-4 border-t border-r border-academy-orange"
              style={{ opacity: 0.55 }}
            />
            <span
              aria-hidden
              className="absolute bottom-4 left-4 z-10 h-4 w-4 border-b border-l border-academy-orange"
              style={{ opacity: 0.55 }}
            />
            <span
              aria-hidden
              className="absolute bottom-4 right-4 z-10 h-4 w-4 border-b border-r border-academy-orange"
              style={{ opacity: 0.55 }}
            />
          </div>

          {/* ACCESSO ESCLUSIVO — minimal, counter focale + status live */}
          <div
            ref={stat30Ref}
            className="relative flex flex-col justify-between gap-7 p-7 md:p-8 lg:col-span-4 lg:row-span-2"
            style={{
              background: CARD_BG,
              border: `1px solid ${CARD_BORDER}`,
              boxShadow: CARD_SHADOW,
            }}
          >
            <p className="text-[0.7rem] font-black tracking-[0.3em] uppercase text-academy-orange">
              Accesso Esclusivo
            </p>

            <div>
              <div
                className="text-[clamp(6rem,14vw,10rem)] font-black leading-[0.85] tabular-nums text-academy-orange"
                aria-label={`${SLOT_COUNT} posti per edizione`}
              >
                <span ref={counter30Ref}>0</span>
              </div>
              <p
                className="mt-3 font-mono text-[0.68rem] font-bold tracking-[0.32em] uppercase"
                style={{ color: TEXT_TERTIARY }}
              >
                Posti · per edizione
              </p>
            </div>

            <div className="h-px" style={{ background: DIVIDER }} />

            <p
              className="text-[0.85rem] leading-relaxed"
              style={{ color: TEXT_SECONDARY }}
            >
              Ogni posto è riservato a chi dimostra la determinazione giusta.
              Non si entra per caso.
            </p>

            <div className="flex items-center gap-2.5">
              <span
                className="relative inline-flex h-2 w-2 shrink-0"
                aria-hidden
              >
                <span
                  className="absolute inset-0 animate-ping"
                  style={{
                    background: "#F09226",
                    opacity: 0.55,
                  }}
                />
                <span
                  className="relative inline-flex h-2 w-2"
                  style={{ background: "#F09226" }}
                />
              </span>
              <span
                className="font-mono text-[0.64rem] font-bold tracking-[0.24em] uppercase"
                style={{ color: TEXT_PRIMARY }}
              >
                Iscrizioni aperte · chiusura a esaurimento
              </span>
            </div>
          </div>
        </div>

        {/* PERKS 3 card */}
        <div ref={perksRef} className="grid gap-4 md:gap-5 lg:grid-cols-3">
          {FOUNDER_PERKS.map((p) => (
            <div
              key={p.label}
              data-perk
              className="flex flex-col p-7 md:p-8"
              style={{
                background: CARD_BG,
                border: `1px solid ${CARD_BORDER}`,
                boxShadow: CARD_SHADOW,
              }}
            >
              <div className="mb-6 flex items-center justify-between">
                <p className="text-[0.7rem] font-black tracking-[0.3em] uppercase text-academy-orange">
                  {p.label}
                </p>
                <span
                  className="text-[1.8rem] font-black leading-none text-academy-orange select-none"
                  style={{ opacity: 0.4 }}
                  aria-hidden
                >
                  {p.icon}
                </span>
              </div>
              <p
                className="text-[1.05rem] font-black leading-tight"
                style={{ color: TEXT_PRIMARY }}
              >
                {p.title}
              </p>
              <p className="mt-1 text-[0.7rem] font-bold tracking-[0.22em] uppercase text-academy-orange">
                {p.sub}
              </p>
              <p
                className="mt-4 text-[0.8rem] leading-relaxed"
                style={{ color: TEXT_SECONDARY }}
              >
                {p.body}
              </p>
            </div>
          ))}
        </div>

        {/* ───────────── §03 · I DOCENTI ───────────── */}
        <div className="mt-24 md:mt-32">
          <MovementHeader num="03" title="I Docenti" headerRef={m3HeaderRef} />

          {/* Title row: headline + arrows top-right */}
          <div className="mb-10 flex items-end justify-between gap-6">
            <h2
              ref={teachersTitleRef}
              className="max-w-3xl text-[clamp(2rem,4.5vw,3.8rem)] font-black leading-[1.05] tracking-tight"
              style={{ color: TEXT_PRIMARY }}
            >
              <span className="text-academy-orange tabular-nums">
                {TEACHERS.length}
              </span>{" "}
              professionisti.{" "}
              <span className="text-academy-orange">Zero compromessi.</span>
            </h2>
            <div className="flex shrink-0 items-center gap-2">
              <CarouselArrow
                direction="prev"
                onClick={() => scrollByCard(-1)}
                disabled={!canPrev}
              />
              <CarouselArrow
                direction="next"
                onClick={() => scrollByCard(1)}
                disabled={!canNext}
              />
            </div>
          </div>

          <div ref={carouselRef} className="relative">
            {/* Scroller: prima card allineata a sx del wrapper, bleed solo a dx */}
            <div
              ref={scrollerRef}
              className="-mr-[5%] flex gap-3 overflow-x-auto pr-[5%] md:-mr-10 md:gap-4 md:pr-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              style={{ cursor: "grab" }}
              aria-label="Carosello docenti"
              onMouseDown={handleMouseDown}
            >
              {getOrderedTeachers().map((teacher, i) => (
                <TeacherCard
                  key={teacher.slug}
                  teacher={teacher}
                  index={i}
                  total={TEACHERS.length}
                />
              ))}
            </div>

            {/* Progress bar sotto */}
            <div
              className="relative mt-8 h-px"
              style={{ background: "rgba(0,0,0,0.1)" }}
              aria-hidden
            >
              <div
                className="absolute left-0 top-0 h-full bg-academy-orange transition-[width] duration-200 ease-out"
                style={{
                  width: `${Math.max(6, carouselProgress * 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
