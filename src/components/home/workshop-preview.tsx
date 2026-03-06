"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { SectionContainer } from "@/components/shared/section-container";
import { GradientText } from "@/components/shared/gradient-text";
import { Button } from "@/components/ui/button";
import { WORKSHOPS } from "@/lib/constants/workshops";
import { fadeUp, staggerContainer } from "@/lib/animations/variants";

export function WorkshopPreview() {
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
        {/* Header */}
        <motion.div variants={fadeUp} className="mb-12 text-center">
          <span className="mb-4 inline-block text-xs font-semibold tracking-[0.3em] text-academy-orange uppercase">
            Specializzazioni
          </span>
          <h2 className="mb-4 text-3xl font-black tracking-tight sm:text-5xl">
            <GradientText>8 Workshop</GradientText> Specialistici
          </h2>
          <p className="mx-auto max-w-2xl text-academy-gray-400">
            Approfondimenti pratici con professionisti e specialisti di settore.
            Inclusi nei pack secondo la formula scelta.
          </p>
        </motion.div>

        {/* Workshop grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {WORKSHOPS.map((workshop, i) => (
            <motion.div key={workshop.slug} variants={fadeUp} custom={i}>
              <Link href={`/workshop/${workshop.slug}`} className="group block">
                <div className="card-squared relative overflow-hidden p-6 transition-all duration-500 hover:glow-orange">
                  {/* Date badge */}
                  <div className="mb-4 inline-block bg-academy-orange/10 px-2.5 py-1 text-[10px] font-bold tracking-wider text-academy-orange uppercase">
                    {workshop.date}
                  </div>

                  {/* Title */}
                  <h3 className="mb-2 text-base font-bold text-academy-gray-100 transition-colors group-hover:text-academy-orange">
                    {workshop.title}
                  </h3>

                  {/* Focus */}
                  <p className="mb-4 text-xs leading-relaxed text-academy-gray-500">
                    {workshop.focus}
                  </p>

                  {/* Duration */}
                  <span className="text-[10px] font-medium tracking-wider text-academy-gray-600 uppercase">
                    {workshop.duration}
                  </span>

                  {/* Hover arrow */}
                  <div className="absolute right-4 bottom-4 translate-x-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                    <span className="text-academy-orange">→</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div variants={fadeUp} className="mt-12 text-center">
          <Button href="/pack" variant="secondary">
            Scopri i Pack con Workshop inclusi
          </Button>
        </motion.div>
      </motion.div>
    </SectionContainer>
  );
}
