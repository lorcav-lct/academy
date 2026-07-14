"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/**
 * Tracks a Meta Pixel PageView on client-side route changes.
 * The initial PageView is fired by the inline script in the root layout;
 * this covers subsequent App Router navigations (which don't reload the page).
 */
export function MetaPixelPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRun = useRef(true);

  useEffect(() => {
    // Skip the initial mount: the first PageView is already fired by the
    // inline pixel script in the root layout.
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    if (typeof window === "undefined" || typeof window.fbq !== "function") {
      return;
    }
    window.fbq("track", "PageView");
  }, [pathname, searchParams]);

  return null;
}
