"use client";

import { useEffect, useRef } from "react";
import { trackMetaViewContent } from "@/app/actions/meta-track";

interface MetaViewContentProps {
  contentId: string;
  contentName: string;
  /** Product price in euros, when known. */
  value?: number;
}

/**
 * Fires a Meta ViewContent event once per mount via a Server Action. Renders
 * nothing. Placed on product detail pages; the actual send happens server-side
 * so it works without the browser Pixel.
 */
export function MetaViewContent({
  contentId,
  contentName,
  value,
}: MetaViewContentProps) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    void trackMetaViewContent({ contentId, contentName, value }).catch(
      () => {},
    );
  }, [contentId, contentName, value]);

  return null;
}
