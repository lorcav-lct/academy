"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { SectionContainer } from "@/components/shared/section-container";
import { GradientText } from "@/components/shared/gradient-text";
import { COURSES } from "@/lib/constants/courses";
import { fadeUp, staggerContainer } from "@/lib/animations/variants";

const blockIcons: Record<string, string> = {
  CORPUS: "I",
  VIS: "II",
  VICTOR: "III",
};

const blockDescriptions: Record<string, string> = {
  CORPUS: "Fondamenta scientifiche e metodologiche del Functional Training",
  VIS: "Sviluppo delle capacità prestative e costruzione dell'atleta",
  VICTOR: "Integrazione completa e formazione del professionista",
};

export function PathOverview() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <SectionContainer withReflection>
      <motion.div
        ref={ref}
        variants={staggerContainer}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {/* Section header */}
        <motion.div variants={fadeUp} className="mb-16 text-center">
          <span className="mb-4 inline-block text-xs font-semibold tracking-[0.3em] text-academy-orange uppercase">
            Il Metodo
          </span>
          <h2 className="mb-4 text-3xl font-black tracking-tight sm:text-5xl">
            La Progressione del{" "}
            <GradientText>Percorso</GradientText>
          </h2>
          <p className="mx-auto max-w-2xl text-academy-gray-400">
            Tre blocchi formativi progressivi che ti trasformeranno da appassionato
            a professionista del fitness.
          </p>
        </motion.div>

        {/* Path timeline */}
        <div className="relative grid gap-6 md:grid-cols-3 md:gap-8">
          {/* Connecting line (desktop) */}
          <div className="absolute top-1/2 left-0 right-0 hidden h-px bg-gradient-to-r from-transparent via-academy-orange/20 to-transparent md:block" />

          {COURSES.map((course, i) => (
            <motion.div
              key={course.slug}
              variants={fadeUp}
              custom={i}
              className="group relative"
            >
              <div className="card-squared relative overflow-hidden p-8 transition-all duration-500 hover:glow-orange">
                {/* Block number */}
                <div
                  className="mb-6 flex h-14 w-14 items-center justify-center border-2 text-xl font-black transition-all duration-300 group-hover:bg-academy-orange/10"
                  style={{ borderColor: "rgba(240, 146, 38, 0.4)" }}
                >
                  <span className="text-academy-orange">
                    {blockIcons[course.blockName]}
                  </span>
                </div>

                {/* Title */}
                <h3 className="mb-1 text-2xl font-black tracking-tight text-academy-gray-100">
                  {course.title}
                </h3>
                <p className="mb-4 text-sm font-semibold tracking-wide text-academy-orange uppercase">
                  {course.area}
                </p>

                {/* Description */}
                <p className="mb-6 text-sm leading-relaxed text-academy-gray-400">
                  {blockDescriptions[course.blockName]}
                </p>

                {/* Duration & Dates */}
                <div className="mb-6 flex items-center gap-4 text-xs text-academy-gray-500">
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-1.5 w-1.5 bg-academy-orange" />
                    {course.duration}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-1.5 w-1.5 bg-academy-orange/50" />
                    {course.dates[0]}
                  </span>
                </div>

                {/* Link */}
                <Button
                  href={`/corsi/${course.slug}`}
                  variant="ghost"
                  size="sm"
                  className="group/btn"
                >
                  Scopri di più
                  <span className="transition-transform group-hover/btn:translate-x-1">
                    →
                  </span>
                </Button>

                {/* Decorative corner */}
                <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-bl from-academy-orange/5 to-transparent" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* FIPE note */}
        <motion.div variants={fadeUp} className="mt-12 text-center">
          <p className="text-sm text-academy-gray-500">
            Ogni blocco è seguito da una{" "}
            <span className="font-semibold text-academy-gray-300">
              Sessione Formativa FipexLacertosus
            </span>{" "}
            per consolidare le competenze acquisite.
          </p>
        </motion.div>
      </motion.div>
    </SectionContainer>
  );
}
