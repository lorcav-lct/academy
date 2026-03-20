"use client";

import { useEffect, useRef, useState } from "react";

const SIZE = 52;
const R = 19;
const C = 2 * Math.PI * R;

export function ScrollProgress() {
  const containerRef = useRef<HTMLDivElement>(null);
  const circleRef    = useRef<SVGCircleElement>(null);
  const [pct, setPct] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll <= 0) return;
      const progress = Math.min(1, window.scrollY / maxScroll);
      const p = Math.round(progress * 100);
      setPct(p);
      if (circleRef.current) {
        circleRef.current.style.strokeDashoffset = String(C * (1 - progress));
      }
      setVisible(progress > 0.008);
    };

    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed right-7 z-50 transition-opacity duration-500"
      style={{
        bottom: "var(--sp-bottom, 28px)",
        transition: "bottom 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.5s",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
      }}
      aria-label={`Scroll: ${pct}%`}
    >
      <div className="relative flex items-center justify-center" style={{ width: SIZE, height: SIZE }}>
        {/* Light bg disc */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(0,0,0,0.1)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
          }}
        />

        {/* SVG rings */}
        <svg
          width={SIZE}
          height={SIZE}
          className="absolute inset-0"
          style={{ transform: "rotate(-90deg)" }}
        >
          {/* Track */}
          <circle
            cx={SIZE / 2} cy={SIZE / 2} r={R}
            fill="none"
            stroke="rgba(0,0,0,0.1)"
            strokeWidth="1.8"
          />
          {/* Progress */}
          <circle
            ref={circleRef}
            cx={SIZE / 2} cy={SIZE / 2} r={R}
            fill="none"
            stroke="#F09226"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C}
            style={{ transition: "stroke-dashoffset 0.12s linear" }}
          />
        </svg>

        {/* Percentage label */}
        <span
          className="relative z-10 tabular-nums select-none"
          style={{
            fontSize: "0.58rem",
            fontWeight: 800,
            color: "#1a1a1a",
            letterSpacing: "-0.01em",
            lineHeight: 1,
          }}
        >
          {pct}%
        </span>
      </div>
    </div>
  );
}
