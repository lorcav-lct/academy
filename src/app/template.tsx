"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { smoothScrollTo } from "@/lib/scroll";

export default function Template({ children }: { children: ReactNode }) {
  // Reset scroll position on every page navigation
  useEffect(() => {
    smoothScrollTo(0, { immediate: true });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  );
}
