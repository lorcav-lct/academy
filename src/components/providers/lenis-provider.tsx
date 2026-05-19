"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      // Respect user preference: no smooth scrolling, no Lenis init.
      return;
    }

    const lenis = new Lenis({
      // Smoothness — higher lerp = snappier, lower = silkier
      lerp: 0.1,
      duration: 1.2,
      // Default Lenis behavior: smooth wheel + no smoothing on touch (mobile native)
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1,
      // Auto-detect nested scrollable containers (modals, drawers, dropdowns)
      // so native scroll works inside them without manual data-lenis-prevent.
      allowNestedScroll: true,
    });

    window.__lenis = lenis;

    // ── GSAP ScrollTrigger integration (official recipe) ──
    gsap.registerPlugin(ScrollTrigger);
    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    const rafCallback = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(rafCallback);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.off("scroll", onScroll);
      gsap.ticker.remove(rafCallback);
      lenis.destroy();
      if (window.__lenis === lenis) {
        delete window.__lenis;
      }
    };
  }, []);

  return <>{children}</>;
}
