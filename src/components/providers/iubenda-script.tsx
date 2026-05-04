"use client";

import { useEffect } from "react";

const IUBENDA_SCRIPT_ID = "iubenda-widget-script";
const IUBENDA_SCRIPT_SRC =
  "https://embeds.iubenda.com/widgets/546d6ee3-6a15-47ee-8751-1d64465669d6.js";

export function IubendaScript() {
  useEffect(() => {
    if (document.getElementById(IUBENDA_SCRIPT_ID)) return;

    const script = document.createElement("script");
    script.id = IUBENDA_SCRIPT_ID;
    script.src = IUBENDA_SCRIPT_SRC;
    script.async = true;

    // Keep the third-party widget outside React's managed DOM tree. The widget
    // can move/remove its own nodes on mobile without breaking React cleanup.
    document.head.appendChild(script);
  }, []);

  return null;
}
