"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { staggerContainer, fadeUp, fadeIn } from "@/lib/animations/variants";

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 bg-academy-dark" />

      {/* Radial light reflections */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-academy-orange/[0.03] blur-[120px]" />
        <div className="absolute right-1/4 bottom-1/3 h-[400px] w-[400px] rounded-full bg-academy-orange/[0.02] blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-academy-navy-light/50 blur-[80px]" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(240,146,38,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(240,146,38,0.3) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* Decorative side lines */}
      <motion.div
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
        className="absolute left-8 top-1/4 h-32 w-px origin-top bg-gradient-to-b from-academy-orange/40 to-transparent hidden lg:block"
      />
      <motion.div
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 1.2, delay: 0.7, ease: "easeOut" }}
        className="absolute right-8 bottom-1/4 h-32 w-px origin-bottom bg-gradient-to-t from-academy-orange/40 to-transparent hidden lg:block"
      />

      {/* Content */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto max-w-5xl px-4 text-center sm:px-6"
      >
        {/* Pre-title */}
        <motion.div variants={fadeUp} className="mb-6">
          <span className="inline-block border border-academy-orange/30 bg-academy-orange/5 px-4 py-1.5 text-xs font-semibold tracking-[0.3em] text-academy-orange uppercase">
            Formazione Professionale Fitness
          </span>
        </motion.div>

        {/* Main title */}
        <motion.h1
          variants={fadeUp}
          className="mb-6 text-5xl font-black leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl"
        >
          <span className="block text-academy-gray-100">LACERTOSUS</span>
          <span className="gradient-text block">ACADEMY</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={fadeUp}
          className="mx-auto mb-4 max-w-2xl text-lg leading-relaxed text-academy-gray-400 sm:text-xl"
        >
          Un percorso unico per formare{" "}
          <span className="font-semibold text-academy-gray-200">professionisti completi</span> e{" "}
          <span className="font-semibold text-academy-gray-200">imprenditori</span> nel settore fitness.
        </motion.p>

        {/* Path keywords */}
        <motion.div
          variants={fadeUp}
          className="mb-10 flex items-center justify-center gap-3 text-sm font-bold tracking-[0.15em] text-academy-gray-500 uppercase sm:gap-4 sm:text-base"
        >
          <span className="text-academy-orange">CORPUS</span>
          <span className="text-academy-orange/40">—</span>
          <span className="text-academy-orange">VIS</span>
          <span className="text-academy-orange/40">—</span>
          <span className="text-academy-orange">VICTOR</span>
        </motion.div>

        {/* CTAs */}
        <motion.div
          variants={fadeUp}
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Button href="/percorso" size="lg">
            Scopri il Percorso
          </Button>
          <Button href="/pack" variant="outline" size="lg">
            Scegli il tuo Pack
          </Button>
        </motion.div>

        {/* Bottom decorative element */}
        <motion.div
          variants={fadeIn}
          className="mt-16 flex items-center justify-center gap-2"
        >
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-academy-orange/30" />
          <span className="text-[10px] tracking-[0.4em] text-academy-gray-600 uppercase">
            9 Mesi di Formazione in Presenza
          </span>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-academy-orange/30" />
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="flex h-10 w-6 items-start justify-center rounded-full border border-academy-gray-600 p-1.5"
        >
          <div className="h-2 w-1 rounded-full bg-academy-orange" />
        </motion.div>
      </motion.div>
    </section>
  );
}
