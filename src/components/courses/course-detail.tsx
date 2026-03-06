"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { SectionContainer } from "@/components/shared/section-container";
import { GradientText } from "@/components/shared/gradient-text";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import type { Course } from "@/lib/constants/courses";
import { fadeUp, staggerContainer } from "@/lib/animations/variants";

interface CourseDetailProps {
  course: Course;
  prevCourse: Course | null;
  nextCourse: Course | null;
}

export function CourseDetail({ course, prevCourse, nextCourse }: CourseDetailProps) {
  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[60vh] items-center overflow-hidden pt-24">
        <div className="absolute inset-0 bg-academy-dark" />
        <div className="absolute top-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-academy-orange/[0.03] blur-[120px]" />

        <SectionContainer className="relative z-10">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeUp} className="mb-4 flex items-center gap-3">
              <span className="inline-block bg-academy-orange/10 px-3 py-1 text-xs font-bold tracking-[0.2em] text-academy-orange uppercase">
                Blocco {course.blockNumber}
              </span>
              <span className="text-xs tracking-wider text-academy-gray-500 uppercase">
                {course.duration}
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="mb-2 text-5xl font-black tracking-tight sm:text-7xl lg:text-8xl"
            >
              <GradientText>{course.title}</GradientText>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mb-4 text-xl font-semibold tracking-wide text-academy-gray-300 uppercase"
            >
              {course.area}
            </motion.p>

            <motion.p
              variants={fadeUp}
              className="max-w-xl text-lg text-academy-gray-400"
            >
              {course.objective}
            </motion.p>

            {/* Dates */}
            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
              {course.dates.map((d) => (
                <span
                  key={d}
                  className="inline-flex items-center gap-2 border border-academy-orange/20 bg-academy-navy/50 px-4 py-2 text-sm font-semibold text-academy-gray-200"
                >
                  <span className="h-1.5 w-1.5 bg-academy-orange" />
                  {d}
                </span>
              ))}
            </motion.div>
          </motion.div>
        </SectionContainer>
      </section>

      {/* Curriculum */}
      <SectionContainer withReflection>
        <ScrollReveal>
          <div className="mb-12">
            <span className="mb-4 inline-block text-xs font-semibold tracking-[0.3em] text-academy-orange uppercase">
              Piano Formativo
            </span>
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
              Cosa Imparerai
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid gap-4 sm:grid-cols-2">
          {course.curriculum.map((item, i) => (
            <ScrollReveal key={i} delay={i * 0.05}>
              <div className="group card-squared flex items-start gap-4 p-6 transition-all duration-500 hover:glow-orange">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-academy-orange/30 bg-academy-orange/5 text-sm font-black text-academy-orange transition-all group-hover:bg-academy-orange/10">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div>
                  <p className="text-base font-semibold text-academy-gray-200">
                    {item}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </SectionContainer>

      {/* CTA */}
      <SectionContainer>
        <ScrollReveal>
          <div className="text-center">
            <h2 className="mb-4 text-3xl font-black">
              Pronto a iniziare <GradientText>{course.title}</GradientText>?
            </h2>
            <p className="mx-auto mb-8 max-w-lg text-academy-gray-400">
              Scegli il pack che include questo blocco formativo e inizia il tuo percorso.
            </p>
            <Button href="/pack" size="lg">
              Scegli il Tuo Pack
            </Button>
          </div>
        </ScrollReveal>
      </SectionContainer>

      {/* Navigation */}
      <SectionContainer className="border-t border-academy-orange/5">
        <div className="flex items-center justify-between">
          {prevCourse ? (
            <Link
              href={`/corsi/${prevCourse.slug}`}
              className="group flex items-center gap-3 text-academy-gray-400 transition-colors hover:text-academy-orange"
            >
              <span className="transition-transform group-hover:-translate-x-1">←</span>
              <div>
                <span className="text-xs tracking-wider uppercase">Blocco Precedente</span>
                <p className="font-bold text-academy-gray-200 group-hover:text-academy-orange">
                  {prevCourse.title}
                </p>
              </div>
            </Link>
          ) : (
            <div />
          )}
          {nextCourse ? (
            <Link
              href={`/corsi/${nextCourse.slug}`}
              className="group flex items-center gap-3 text-right text-academy-gray-400 transition-colors hover:text-academy-orange"
            >
              <div>
                <span className="text-xs tracking-wider uppercase">Blocco Successivo</span>
                <p className="font-bold text-academy-gray-200 group-hover:text-academy-orange">
                  {nextCourse.title}
                </p>
              </div>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </SectionContainer>
    </>
  );
}
