"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { SectionContainer } from "@/components/shared/section-container";
import { COURSES } from "@/lib/constants/courses";
import { FIPE_SESSIONS } from "@/lib/constants/courses";
import { fadeUp, staggerContainer } from "@/lib/animations/variants";

interface TimelineItem {
  slug: string;
  title: string;
  type: "block" | "fipe";
  area?: string;
  objective?: string;
  curriculum?: string[];
  dates: string[];
  sortOrder: number;
}

function buildTimeline(): TimelineItem[] {
  const blocks: TimelineItem[] = COURSES.map((c) => ({
    slug: c.slug,
    title: c.title,
    type: "block" as const,
    area: c.area,
    objective: c.objective,
    curriculum: c.curriculum,
    dates: c.dates,
    sortOrder: c.sortOrder,
  }));

  const fipe: TimelineItem[] = FIPE_SESSIONS.map((f) => ({
    slug: f.slug,
    title: f.title,
    type: "fipe" as const,
    dates: f.dates,
    sortOrder: f.sortOrder,
  }));

  return [...blocks, ...fipe].sort((a, b) => a.sortOrder - b.sortOrder);
}

function TimelineCard({ item, index }: { item: TimelineItem; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  const isBlock = item.type === "block";

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`relative flex ${index % 2 === 0 ? "md:justify-start" : "md:justify-end"}`}
    >
      <div className={`w-full md:w-[45%] ${isBlock ? "" : "opacity-80"}`}>
        <div
          className={`card-squared p-8 transition-all duration-500 ${
            isBlock ? "hover:glow-orange" : "border-dashed"
          }`}
        >
          {/* Dates */}
          <div className="mb-3 flex flex-wrap gap-2">
            {item.dates.map((d) => (
              <span
                key={d}
                className="inline-block bg-academy-orange/10 px-2.5 py-1 text-[10px] font-bold tracking-wider text-academy-orange uppercase"
              >
                {d}
              </span>
            ))}
          </div>

          {/* Title */}
          <h3 className={`mb-1 font-black tracking-tight ${isBlock ? "text-2xl" : "text-lg"}`}>
            {item.title}
          </h3>

          {isBlock && item.area && (
            <p className="mb-3 text-sm font-semibold tracking-wide text-academy-orange uppercase">
              {item.area}
            </p>
          )}

          {isBlock && item.objective && (
            <p className="mb-4 text-sm text-academy-gray-400">{item.objective}</p>
          )}

          {/* Curriculum */}
          {isBlock && item.curriculum && (
            <ul className="mb-4 space-y-1.5">
              {item.curriculum.map((c) => (
                <li key={c} className="flex items-start gap-2 text-sm text-academy-gray-400">
                  <span className="mt-1.5 h-1 w-1 shrink-0 bg-academy-orange" />
                  {c}
                </li>
              ))}
            </ul>
          )}

          {isBlock && (
            <Link
              href={`/corsi/${item.slug}`}
              className="inline-flex items-center gap-1 text-sm font-semibold text-academy-orange transition-colors hover:text-academy-orange-light"
            >
              Scopri il blocco →
            </Link>
          )}

          {!isBlock && (
            <p className="text-xs text-academy-gray-500">
              Sessione formativa e di certificazione FipexLacertosus
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function PercorsoTimeline() {
  const timeline = buildTimeline();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <SectionContainer>
      <motion.div
        ref={ref}
        variants={staggerContainer}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        <motion.div variants={fadeUp} className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-black tracking-tight sm:text-4xl">
            Calendario Formativo
          </h2>
          <p className="mx-auto max-w-xl text-academy-gray-400">
            9 mesi di formazione strutturata. Ogni blocco si costruisce sulle fondamenta del precedente.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative space-y-8">
          {/* Vertical line */}
          <div className="absolute left-4 top-0 bottom-0 hidden w-px bg-gradient-to-b from-academy-orange/30 via-academy-orange/10 to-transparent md:left-1/2 md:block" />

          {timeline.map((item, i) => (
            <div key={item.slug} className="relative">
              {/* Timeline dot */}
              <div className="absolute left-4 top-8 z-10 hidden h-3 w-3 -translate-x-1/2 md:left-1/2 md:block">
                <div
                  className={`h-full w-full ${
                    item.type === "block" ? "bg-academy-orange" : "border border-academy-orange/50 bg-academy-dark"
                  }`}
                />
              </div>
              <TimelineCard item={item} index={i} />
            </div>
          ))}
        </div>
      </motion.div>
    </SectionContainer>
  );
}
