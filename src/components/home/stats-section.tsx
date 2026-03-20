"use client";

import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useRef, useEffect } from "react";
import { SectionContainer } from "@/components/shared/section-container";

interface Stat {
  value: number;
  suffix: string;
  label: string;
}

const stats: Stat[] = [
  { value: 9, suffix: " mesi", label: "Di formazione intensiva" },
  { value: 3, suffix: " blocchi", label: "Formativi progressivi" },
  { value: 8, suffix: " workshop", label: "Specialistici opzionali" },
  { value: 1, suffix: "", label: "Certificazione professionale" },
];

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      animate(count, value, { duration: 1.5, ease: "easeOut" });
    }
  }, [isInView, count, value]);

  return (
    <span ref={ref} className="tabular-nums">
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}

export function StatsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <SectionContainer className="border-y border-academy-orange/5 bg-academy-darker/50">
      <motion.div
        ref={ref}
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-12"
      >
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.1 + 0.2, duration: 0.5 }}
            className="text-center"
          >
            <div className="mb-2 text-3xl font-black text-academy-orange sm:text-4xl">
              <AnimatedCounter value={stat.value} suffix={stat.suffix} />
            </div>
            <p className="text-xs font-medium tracking-wide text-academy-gray-300 uppercase sm:text-sm">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </SectionContainer>
  );
}
