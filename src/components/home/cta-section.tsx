"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { SectionContainer } from "@/components/shared/section-container";
import { fadeUp, staggerContainer } from "@/lib/animations/variants";

export function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <SectionContainer className="relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-academy-orange/[0.04] blur-[150px]" />
      </div>

      <motion.div
        ref={ref}
        variants={staggerContainer}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="relative text-center"
      >
        <motion.div variants={fadeUp}>
          <span className="mb-4 inline-block text-xs font-semibold tracking-[0.3em] text-academy-orange uppercase">
            Inizia Ora
          </span>
        </motion.div>

        <motion.h2
          variants={fadeUp}
          className="mb-6 text-3xl font-black tracking-tight sm:text-5xl lg:text-6xl"
        >
          Forma il Tuo{" "}
          <span className="gradient-text">Futuro</span>
        </motion.h2>

        <motion.p
          variants={fadeUp}
          className="mx-auto mb-10 max-w-xl text-lg text-academy-gray-400"
        >
          La Lacertosus Academy non forma semplici istruttori.
          <br />
          <span className="font-semibold text-academy-gray-200">
            Forma professionisti. Forma imprenditori.
          </span>
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Button href="/pack" size="lg">
            Scegli il Tuo Pack
          </Button>
          <Button href="/percorso" variant="ghost" size="lg">
            Esplora il Percorso →
          </Button>
        </motion.div>

        {/* Decorative lines */}
        <motion.div
          variants={fadeUp}
          className="mt-16 flex items-center justify-center gap-6"
        >
          <div className="h-px w-24 bg-gradient-to-r from-transparent to-academy-orange/20" />
          <div className="h-2 w-2 rotate-45 border border-academy-orange/30" />
          <div className="h-px w-24 bg-gradient-to-l from-transparent to-academy-orange/20" />
        </motion.div>
      </motion.div>
    </SectionContainer>
  );
}
