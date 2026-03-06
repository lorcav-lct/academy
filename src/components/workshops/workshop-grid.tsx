"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { SectionContainer } from "@/components/shared/section-container";
import { GradientText } from "@/components/shared/gradient-text";
import { WORKSHOPS } from "@/lib/constants/workshops";
import { fadeUp, staggerContainer } from "@/lib/animations/variants";

export function WorkshopGrid() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-16">
        <div className="absolute inset-0 bg-academy-dark" />
        <div className="absolute bottom-0 left-1/4 h-[400px] w-[400px] rounded-full bg-academy-orange/[0.03] blur-[120px]" />

        <SectionContainer className="relative z-10">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.span
              variants={fadeUp}
              className="mb-4 inline-block text-xs font-semibold tracking-[0.3em] text-academy-orange uppercase"
            >
              Specializzazioni
            </motion.span>
            <motion.h1
              variants={fadeUp}
              className="mb-4 text-4xl font-black tracking-tight sm:text-6xl"
            >
              Workshop <GradientText>Specialistici</GradientText>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="max-w-2xl text-lg text-academy-gray-400"
            >
              8 approfondimenti pratici con professionisti e specialisti del settore,
              indipendenti dai blocchi formativi principali.
            </motion.p>
          </motion.div>
        </SectionContainer>
      </section>

      {/* Grid */}
      <SectionContainer>
        <motion.div
          ref={ref}
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {WORKSHOPS.map((workshop, i) => (
            <motion.div key={workshop.slug} variants={fadeUp} custom={i}>
              <Link href={`/workshop/${workshop.slug}`} className="group block h-full">
                <div className="card-squared flex h-full flex-col p-8 transition-all duration-500 hover:glow-orange">
                  {/* Date */}
                  <div className="mb-5 inline-block self-start bg-academy-orange/10 px-3 py-1 text-[10px] font-bold tracking-wider text-academy-orange uppercase">
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
                    <span className="text-[10px] font-medium tracking-wider text-academy-gray-600 uppercase">
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
        </motion.div>
      </SectionContainer>
    </>
  );
}
