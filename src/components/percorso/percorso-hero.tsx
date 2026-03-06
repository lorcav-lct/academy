"use client";

import { motion } from "framer-motion";
import { SectionContainer } from "@/components/shared/section-container";
import { GradientText } from "@/components/shared/gradient-text";
import { fadeUp, staggerContainer } from "@/lib/animations/variants";

export function PercorsoHero() {
  return (
    <section className="relative flex min-h-[70vh] items-center overflow-hidden pt-24">
      {/* Background */}
      <div className="absolute inset-0 bg-academy-dark" />
      <div className="absolute top-1/3 left-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-academy-orange/[0.03] blur-[120px]" />

      <SectionContainer className="relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="max-w-3xl"
        >
          <motion.span
            variants={fadeUp}
            className="mb-4 inline-block text-xs font-semibold tracking-[0.3em] text-academy-orange uppercase"
          >
            Il Metodo Lacertosus
          </motion.span>

          <motion.h1
            variants={fadeUp}
            className="mb-6 text-4xl font-black leading-tight tracking-tight sm:text-6xl lg:text-7xl"
          >
            Il Percorso{" "}
            <GradientText>Formativo</GradientText>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mb-8 max-w-xl text-lg leading-relaxed text-academy-gray-400"
          >
            Tre blocchi formativi progressivi, intervallati da sessioni di certificazione
            FipexLacertosus. Un percorso che ti trasforma in{" "}
            <span className="font-semibold text-academy-gray-200">professionista completo</span>.
          </motion.p>

          {/* Path visual */}
          <motion.div
            variants={fadeUp}
            className="flex items-center gap-4 text-sm font-black tracking-[0.2em] uppercase"
          >
            <span className="text-academy-orange">CORPUS</span>
            <div className="h-px w-8 bg-academy-orange/30" />
            <span className="text-academy-orange">VIS</span>
            <div className="h-px w-8 bg-academy-orange/30" />
            <span className="text-academy-orange">VICTOR</span>
          </motion.div>
        </motion.div>
      </SectionContainer>
    </section>
  );
}
