"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { SectionContainer } from "@/components/shared/section-container";
import { GradientText } from "@/components/shared/gradient-text";
import { Button } from "@/components/ui/button";
import { fadeUp, staggerContainer } from "@/lib/animations/variants";

const outcomes = [
  "Comprendere anatomia, biomeccanica e fisiologia applicate",
  "Valutare il soggetto e analizzare il movimento",
  "Costruire programmi di Functional Training e S&C",
  "Lavorare con atleti e operatori tattici",
  "Collaborare con professionisti sanitari",
  "Gestire il cliente con professionalità",
  "Costruire e sviluppare la propria attività nel fitness",
  "Applicare competenze avanzate grazie ai workshop specialistici",
  "Ottenere la certificazione FipexLacertosus",
  "Diventare imprenditore di se stesso",
];

export function PercorsoOutcome() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <SectionContainer withReflection>
      <motion.div
        ref={ref}
        variants={staggerContainer}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        <motion.div variants={fadeUp} className="mb-12 text-center">
          <span className="mb-4 inline-block text-xs font-semibold tracking-[0.3em] text-academy-orange uppercase">
            Profilo in Uscita
          </span>
          <h2 className="mb-4 text-3xl font-black tracking-tight sm:text-5xl">
            Cosa Saprai <GradientText>Fare</GradientText>
          </h2>
          <p className="mx-auto max-w-2xl text-academy-gray-400">
            Al termine del percorso, sarai un professionista completo pronto ad entrare nel mondo del lavoro.
          </p>
        </motion.div>

        <div className="mx-auto grid max-w-4xl gap-3 sm:grid-cols-2">
          {outcomes.map((outcome, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              custom={i}
              className="flex items-start gap-3 p-4 card-squared"
            >
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center bg-academy-orange/20">
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  className="h-3 w-3 text-academy-orange"
                >
                  <path
                    d="M13.5 4.5L6 12L2.5 8.5"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="square"
                  />
                </svg>
              </div>
              <span className="text-sm text-academy-gray-300">{outcome}</span>
            </motion.div>
          ))}
        </div>

        <motion.div variants={fadeUp} className="mt-12 text-center">
          <Button href="/pack" size="lg">
            Inizia il Percorso
          </Button>
        </motion.div>
      </motion.div>
    </SectionContainer>
  );
}
