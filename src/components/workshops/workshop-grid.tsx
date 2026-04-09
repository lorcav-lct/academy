"use client";

import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { GradientText } from "@/components/shared/gradient-text";
import { WORKSHOPS } from "@/lib/constants/workshops";
import { fadeUp, staggerContainer } from "@/lib/animations/variants";

const STATS = [
  { value: "8", label: "Masterclass Verticalizzati" },
  { value: "15+", label: "Professionisti in Attività" },
  { value: "1-2", label: "Giornate di Full Immersion" },
];

const REASONS = [
  {
    number: "01",
    title: "Impara da chi lo fa davvero",
    body: "Non formatori astratti. I Master sono il Performance Coach della Nazionale Brasiliana, il S&C Coach di Modena Volley, un preparatore delle Forze Speciali, il medico degli astronauti ESA. Portano il campo in aula.",
  },
  {
    number: "02",
    title: "Quello che i libri non possono darti",
    body: "La distanza tra atleta d'élite e mediocre non è nei concetti — è nei dettagli operativi. Protocolli testati, errori reali e soluzioni che nascono solo da anni di lavoro sul campo ad alto livello.",
  },
  {
    number: "03",
    title: "Verticale. Intensivo. Trasformativo.",
    body: "Un dominio, uno o due giorni, profondità totale. Nessun generalismo, nessun rumore di fondo. Il formato che produce il cambiamento più rapido nel modo di pensare e allenare.",
  },
];

export function WorkshopGrid() {
  const heroRef = useRef(null);
  const whyRef = useRef(null);
  const gridRef = useRef(null);

  const isWhyInView = useInView(whyRef, { once: true, margin: "-100px" });
  const isGridInView = useInView(gridRef, { once: true, margin: "-80px" });

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <>
      {/* ─────────────────────────────────────────────
          HERO — LIGHT THEME
      ───────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative flex min-h-[92vh] items-center overflow-hidden bg-white"
      >
        {/* Geometric background decoration */}
        <div className="pointer-events-none absolute inset-0 select-none overflow-hidden">
          {/* Concentric arcs — top right */}
          <div className="absolute -right-40 -top-40 h-[700px] w-[700px] rounded-full border-[70px] border-academy-orange/[0.05]" />
          <div className="absolute -right-20 -top-20 h-[500px] w-[500px] rounded-full border-[1px] border-academy-orange/[0.12]" />
          <div className="absolute right-20 top-20 h-[300px] w-[300px] rounded-full border-[1px] border-gray-200/60" />

          {/* Subtle dot grid */}
          <div
            className="absolute inset-0 opacity-[0.018]"
            style={{
              backgroundImage:
                "radial-gradient(circle, #F09226 1px, transparent 1px)",
              backgroundSize: "36px 36px",
            }}
          />

          {/* Large ghost word — bottom */}
          <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
            <span
              className="block text-center font-black uppercase tracking-tighter text-black/[0.028]"
              style={{ fontSize: "clamp(64px, 17vw, 200px)" }}
            >
              Masterclass
            </span>
          </div>

          {/* Orange accent diagonal stripe */}
          <div
            className="absolute left-0 top-0 h-full w-1 origin-top-left -translate-x-full bg-gradient-to-b from-transparent via-academy-orange/20 to-transparent"
            style={{ left: "calc(5% + 12px)" }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 mx-auto w-full max-w-[1440px] px-[5%] py-32 md:px-10">
          <motion.div
            style={{ y: heroY, opacity: heroOpacity }}
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="max-w-4xl"
          >
            {/* Eyebrow */}
            <motion.div
              variants={fadeUp}
              className="mb-8 flex items-center gap-4"
            >
              <div className="h-px w-10 bg-academy-orange" />
              <span className="text-xs font-bold uppercase tracking-[0.45em] text-academy-orange">
                Specializzazioni Verticali
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              className="mb-6 font-black leading-[0.92] tracking-tight text-black"
              style={{ fontSize: "clamp(48px, 8.5vw, 100px)" }}
            >
              Master
              <wbr />
              class
              <br />
              <span className="gradient-text">Specialistici.</span>
            </motion.h1>

            {/* Subline */}
            <motion.p
              variants={fadeUp}
              className="mb-14 max-w-xl text-lg leading-relaxed text-gray-500"
            >
              8 approfondimenti intensivi con professionisti che vivono ogni
              giorno ciò che insegnano. Verticale, pratico, trasformativo.
            </motion.p>

            {/* Stats */}
            <motion.div
              variants={fadeUp}
              className="mb-14 flex flex-wrap gap-10 border-l-2 border-academy-orange/30 pl-8"
            >
              {STATS.map((stat) => (
                <div key={stat.label} className="flex flex-col">
                  <span className="text-[clamp(28px,4vw,44px)] font-black leading-none text-academy-orange">
                    {stat.value}
                  </span>
                  <span className="mt-1 text-xs font-semibold uppercase tracking-widest text-gray-400">
                    {stat.label}
                  </span>
                </div>
              ))}
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
              variants={fadeUp}
              className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.3em] text-gray-300"
            >
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="h-8 w-px bg-gradient-to-b from-gray-300 to-transparent"
              />
              Scopri tutti i Master
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          WHY SPECIALIZE — DARK MANIFESTO
      ───────────────────────────────────────────── */}
      <section
        ref={whyRef}
        className="relative overflow-hidden bg-academy-dark py-28 md:py-36"
      >
        {/* Ambient blobs */}
        <div className="pointer-events-none absolute left-1/4 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-academy-orange/[0.04] blur-[140px]" />
        <div className="pointer-events-none absolute bottom-0 right-1/4 h-[500px] w-[500px] translate-x-1/3 rounded-full bg-academy-gold/[0.03] blur-[120px]" />

        <div className="relative z-10 mx-auto max-w-[1440px] px-[5%] md:px-10">
          {/* Section header */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={isWhyInView ? "visible" : "hidden"}
            className="mb-20"
          >
            <motion.div
              variants={fadeUp}
              className="mb-5 flex items-center gap-3"
            >
              <div className="h-px w-8 bg-academy-orange/50" />
              <span className="text-xs font-bold uppercase tracking-[0.45em] text-academy-orange/70">
                Il metodo
              </span>
            </motion.div>

            <motion.h2
              variants={fadeUp}
              className="mb-6 max-w-4xl font-black leading-[1.05] tracking-tight"
              style={{ fontSize: "clamp(32px, 5.5vw, 68px)" }}
            >
              <span className="text-white">
                La specializzazione verticale
                <br />
                non è un&rsquo;opzione.
              </span>{" "}
              <GradientText>È il vantaggio.</GradientText>
            </motion.h2>

            <motion.p
              variants={fadeUp}
              className="max-w-2xl text-lg leading-relaxed text-academy-gray-400"
            >
              In un settore saturo di generalisti, chi si distingue è chi sa
              fare una cosa meglio di chiunque altro. I Masterclass Lacertosus
              sono costruiti attorno a questa verità.
            </motion.p>
          </motion.div>

          {/* Reasons — bento grid */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={isWhyInView ? "visible" : "hidden"}
            className="mb-12 grid gap-5 md:grid-cols-3"
          >
            {REASONS.map((reason, i) => (
              <motion.div
                key={reason.number}
                variants={fadeUp}
                custom={i}
                className="bento-card group relative overflow-hidden p-8"
              >
                {/* Watermark number */}
                <span className="pointer-events-none absolute -right-2 -top-4 select-none text-[90px] font-black leading-none text-white/[0.035]">
                  {reason.number}
                </span>

                {/* Accent bar */}
                <div className="mb-6 h-[2px] w-10 bg-academy-orange transition-all duration-500 group-hover:w-16" />

                {/* Number tag */}
                <span className="mb-3 block text-[10px] font-bold uppercase tracking-[0.45em] text-academy-orange/60">
                  {reason.number}
                </span>

                {/* Title */}
                <h3 className="mb-4 text-xl font-bold text-academy-gray-100 transition-colors group-hover:text-white">
                  {reason.title}
                </h3>

                {/* Body */}
                <p className="text-sm leading-relaxed text-academy-gray-500">
                  {reason.body}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Elite names callout */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate={isWhyInView ? "visible" : "hidden"}
            transition={{ delay: 0.45 }}
            className="bento-card-accent flex flex-col gap-5 p-8 md:flex-row md:items-center"
          >
            {/* Icon */}
            <div className="shrink-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-academy-orange/10">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-5 w-5 text-academy-orange"
                  aria-hidden="true"
                >
                  <path
                    d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z"
                    fill="currentColor"
                  />
                </svg>
              </div>
            </div>
            {/* Text */}
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.35em] text-academy-orange">
                Chi trovi nei Masterclass
              </p>
              <p className="text-sm leading-relaxed text-academy-gray-300">
                Il Performance Coach della Nazionale Brasiliana. Il S&amp;C
                Coach di Modena Volley e della Nazionale Italiana. Un
                preparatore delle Forze Speciali dell&rsquo;Esercito Italiano.
                Ricercatori universitari tra i più citati al mondo nel loro
                campo. Non docenti. Professionisti in attività, ogni giorno, ad
                alto livello.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          GRID
      ───────────────────────────────────────────── */}
      <section className="bg-academy-dark py-16 md:py-24">
        <div className="mx-auto max-w-[1440px] px-[5%] md:px-10">
          <motion.div
            ref={gridRef}
            variants={staggerContainer}
            initial="hidden"
            animate={isGridInView ? "visible" : "hidden"}
          >
            <motion.div variants={fadeUp} className="mb-10">
              <h2 className="mb-1 text-2xl font-black tracking-tight text-academy-gray-100">
                Tutti i Masterclass
              </h2>
              <p className="text-sm text-academy-gray-500">
                Seleziona un masterclass per vedere programma, docente e date.
              </p>
            </motion.div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {WORKSHOPS.map((workshop, i) => (
                <motion.div key={workshop.slug} variants={fadeUp} custom={i}>
                  <Link
                    href={`/masterclass/${workshop.slug}`}
                    className="group block h-full"
                  >
                    <div className="card-squared flex h-full flex-col p-8 transition-all duration-500 hover:glow-orange">
                      {/* Date */}
                      <div className="mb-5 inline-block self-start bg-academy-orange/10 px-3 py-1 text-[12px] font-bold tracking-wider text-academy-orange uppercase">
                        {workshop.date}
                      </div>

                      {/* Title */}
                      <h3 className="mb-3 text-lg font-bold text-academy-gray-100 transition-colors group-hover:text-academy-orange">
                        {workshop.title}
                      </h3>

                      {/* Focus */}
                      <p className="mb-4 flex-1 text-sm leading-relaxed text-academy-gray-500">
                        {workshop.focus}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-medium tracking-wider text-academy-gray-600 uppercase">
                          {workshop.duration}
                        </span>
                        <span className="text-sm text-academy-orange opacity-0 transition-all group-hover:opacity-100">
                          →
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
