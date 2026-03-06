"use client";

import { motion, useInView } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { fadeUp } from "@/lib/animations/variants";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  variants?: typeof fadeUp;
  delay?: number;
  once?: boolean;
}

export function ScrollReveal({
  children,
  className,
  variants = fadeUp,
  delay = 0,
  once = true,
}: ScrollRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
