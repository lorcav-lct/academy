"use client";

import { useTheme } from "@/components/providers/theme-provider";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isLight = theme === "light";

  return (
    <button
      onClick={toggle}
      aria-label={isLight ? "Passa a tema scuro" : "Passa a tema chiaro"}
      className="shrink-0 relative flex items-center cursor-pointer"
      style={{
        width: "52px",
        height: "26px",
        borderRadius: "13px",
        border: `1px solid ${isLight ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.14)"}`,
        background: isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.05)",
        transition: "border-color 0.3s ease, background 0.3s ease",
      }}
    >
      {/* Sliding indicator */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #F09226, #f5a84d)",
          left: isLight ? "28px" : "2px",
          transition: "left 0.35s cubic-bezier(0.4,0,0.2,1)",
          boxShadow: "0 0 8px rgba(240,146,38,0.45)",
        }}
      />

      {/* Moon icon */}
      <svg
        aria-hidden
        xmlns="http://www.w3.org/2000/svg"
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        style={{
          position: "absolute",
          left: "7px",
          color: !isLight ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.25)",
          transition: "color 0.3s ease",
          zIndex: 1,
        }}
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>

      {/* Sun icon */}
      <svg
        aria-hidden
        xmlns="http://www.w3.org/2000/svg"
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        style={{
          position: "absolute",
          right: "7px",
          color: isLight ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.3)",
          transition: "color 0.3s ease",
          zIndex: 1,
        }}
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
    </button>
  );
}
