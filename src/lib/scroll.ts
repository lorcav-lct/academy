import type Lenis from "lenis";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

type ScrollTarget = number | string | HTMLElement;

interface SmoothScrollOptions {
  offset?: number;
  immediate?: boolean;
  duration?: number;
}

export function smoothScrollTo(
  target: ScrollTarget,
  opts: SmoothScrollOptions = {},
): void {
  if (typeof window === "undefined") return;

  const lenis = window.__lenis;
  const { offset = 0, immediate = false, duration } = opts;

  if (lenis) {
    lenis.scrollTo(target, {
      offset,
      immediate,
      duration,
    });
    return;
  }

  // Fallback when Lenis is unavailable (SSR mismatch, reduced motion, etc.)
  const behavior: ScrollBehavior = immediate ? "auto" : "smooth";

  if (typeof target === "number") {
    window.scrollTo({ top: target + offset, behavior });
    return;
  }

  const el =
    typeof target === "string" ? document.querySelector(target) : target;

  if (el instanceof HTMLElement) {
    const top = el.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top, behavior });
  }
}

export function getLenis(): Lenis | undefined {
  if (typeof window === "undefined") return undefined;
  return window.__lenis;
}
