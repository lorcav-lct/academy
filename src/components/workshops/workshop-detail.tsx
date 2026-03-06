"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { SectionContainer } from "@/components/shared/section-container";
import { GradientText } from "@/components/shared/gradient-text";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import type { Workshop } from "@/lib/constants/workshops";
import { fadeUp, staggerContainer } from "@/lib/animations/variants";

interface WorkshopDetailProps {
  workshop: Workshop;
  otherWorkshops: Workshop[];
}

export function WorkshopDetail({ workshop, otherWorkshops }: WorkshopDetailProps) {
  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[55vh] items-center overflow-hidden pt-24">
        <div className="absolute inset-0 bg-academy-dark" />
        <div className="absolute bottom-1/4 left-1/3 h-[350px] w-[350px] rounded-full bg-academy-orange/[0.03] blur-[100px]" />

        <SectionContainer className="relative z-10">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeUp} className="mb-4 flex items-center gap-3">
              <span className="inline-block bg-academy-orange/10 px-3 py-1 text-xs font-bold tracking-[0.2em] text-academy-orange uppercase">
                Workshop Specialistico
              </span>
              <span className="text-xs tracking-wider text-academy-gray-500 uppercase">
                {workshop.duration}
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="mb-4 text-4xl font-black tracking-tight sm:text-6xl"
            >
              <GradientText>{workshop.title}</GradientText>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mb-8 max-w-xl text-lg text-academy-gray-400"
            >
              {workshop.focus}
            </motion.p>

            <motion.div variants={fadeUp}>
              <span className="inline-flex items-center gap-2 border border-academy-orange/20 bg-academy-navy/50 px-4 py-2 text-sm font-semibold text-academy-gray-200">
                <span className="h-1.5 w-1.5 bg-academy-orange" />
                {workshop.date}
              </span>
            </motion.div>
          </motion.div>
        </SectionContainer>
      </section>

      {/* Details */}
      <SectionContainer withReflection>
        <div className="grid gap-12 lg:grid-cols-2">
          <ScrollReveal>
            <div>
              <span className="mb-4 inline-block text-xs font-semibold tracking-[0.3em] text-academy-orange uppercase">
                Dettagli
              </span>
              <h2 className="mb-6 text-2xl font-black">Cosa Aspettarsi</h2>

              <div className="space-y-4">
                <div className="card-squared p-6">
                  <h3 className="mb-1 text-sm font-bold tracking-wider text-academy-orange uppercase">Focus</h3>
                  <p className="text-academy-gray-300">{workshop.focus}</p>
                </div>
                <div className="card-squared p-6">
                  <h3 className="mb-1 text-sm font-bold tracking-wider text-academy-orange uppercase">Durata</h3>
                  <p className="text-academy-gray-300">{workshop.duration}</p>
                </div>
                <div className="card-squared p-6">
                  <h3 className="mb-1 text-sm font-bold tracking-wider text-academy-orange uppercase">Data</h3>
                  <p className="text-academy-gray-300">{workshop.date}</p>
                </div>
                <div className="card-squared p-6">
                  <h3 className="mb-1 text-sm font-bold tracking-wider text-academy-orange uppercase">Caratteristiche</h3>
                  <ul className="space-y-2 text-sm text-academy-gray-400">
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1 w-1 shrink-0 bg-academy-orange" />
                      Approfondimento pratico e specialistico
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1 w-1 shrink-0 bg-academy-orange" />
                      Esperienza diretta con professionisti del settore
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1 w-1 shrink-0 bg-academy-orange" />
                      Incluso nei pack secondo la formula scelta
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div>
              <span className="mb-4 inline-block text-xs font-semibold tracking-[0.3em] text-academy-orange uppercase">
                Come Partecipare
              </span>
              <h2 className="mb-6 text-2xl font-black">Scegli il Tuo Pack</h2>
              <p className="mb-6 text-academy-gray-400">
                Questo workshop e incluso come scelta nei pack Bronzo (1 workshop), Argento (2 workshop) e Oro/Oro Plus (3 workshop).
              </p>
              <Button href="/pack" size="lg" className="w-full sm:w-auto">
                Vedi i Pack Disponibili
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </SectionContainer>

      {/* Other Workshops */}
      <SectionContainer>
        <ScrollReveal>
          <h2 className="mb-8 text-2xl font-black">Altri Workshop</h2>
        </ScrollReveal>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {otherWorkshops.slice(0, 6).map((w, i) => (
            <ScrollReveal key={w.slug} delay={i * 0.05}>
              <Link href={`/workshop/${w.slug}`} className="group block">
                <div className="card-squared p-6 transition-all duration-500 hover:glow-orange">
                  <div className="mb-3 inline-block bg-academy-orange/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-academy-orange uppercase">
                    {w.date}
                  </div>
                  <h3 className="mb-1 font-bold text-academy-gray-100 transition-colors group-hover:text-academy-orange">
                    {w.title}
                  </h3>
                  <p className="text-xs text-academy-gray-500">{w.focus}</p>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </SectionContainer>
    </>
  );
}
