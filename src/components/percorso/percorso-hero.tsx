"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import Player from "@vimeo/player";
import { useTheme } from "@/components/providers/theme-provider";
import { COURSES, FIPE_SESSIONS } from "@/lib/constants/courses";

const VIMEO_ID = "1161847546";

// ── Helpers ───────────────────────────────────────────────────────────────────

// "11-12 Settembre" → "Settembre"
const monthOnly = (d: string) => d.split(" ").at(-1) ?? d;

// 9 month abbreviations in order
const MONTH_ABBRS = [
  "SET",
  "OTT",
  "NOV",
  "DIC",
  "GEN",
  "FEB",
  "MAR",
  "APR",
  "MAG",
];

// Phase spans for phase-label row (flex proportions)
const MONTH_PHASES = [
  { label: "CORPUS", span: 2 },
  { label: "FIPE I", span: 1 },
  { label: "VIS", span: 2 },
  { label: "FIPE II", span: 1 },
  { label: "VICTOR", span: 2 },
  { label: "FIPE III", span: 1 },
] as const;

// ── Tilt helpers ──────────────────────────────────────────────────────────────

function tiltIn(e: React.MouseEvent<HTMLDivElement>) {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  el.style.setProperty(
    "--mx",
    (((e.clientX - r.left) / r.width) * 100).toFixed(1) + "%",
  );
  el.style.setProperty(
    "--my",
    (((e.clientY - r.top) / r.height) * 100).toFixed(1) + "%",
  );
  gsap.to(el, {
    rotateX: -((e.clientY - (r.top + r.height / 2)) / (r.height / 2)) * 3,
    rotateY: ((e.clientX - (r.left + r.width / 2)) / (r.width / 2)) * 3,
    duration: 0.4,
    ease: "power2.out",
    transformPerspective: 1100,
  });
}

function tiltOut(e: React.MouseEvent<HTMLDivElement>) {
  gsap.to(e.currentTarget, {
    rotateX: 0,
    rotateY: 0,
    duration: 0.9,
    ease: "elastic.out(1,0.4)",
  });
}

// ── Custom video player ───────────────────────────────────────────────────────

function VideoBlock({ isDark }: { isDark: boolean }) {
  const wrapperRef = useRef<HTMLDivElement>(null); // outer wrapper (fullscreen target)
  const containerRef = useRef<HTMLDivElement>(null); // SDK mounts iframe here
  const playerRef = useRef<Player | null>(null);
  const fsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);
  const [volume, setVolume] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFsControls, setShowFsControls] = useState(false);
  const [showVolume, setShowVolume] = useState(false);

  // Init Vimeo SDK — SDK creates the iframe → browser autoplay policy respected
  useEffect(() => {
    if (!containerRef.current || playerRef.current) return;
    const player = new Player(containerRef.current, {
      id: parseInt(VIMEO_ID),
      background: true, // enables silent autoplay loop, hides native controls
      loop: true,
      responsive: true,
      dnt: true,
    });
    playerRef.current = player;
    player.on("play", () => setPlaying(true));
    player.on("pause", () => setPlaying(false));
    return () => {
      player.off("play");
      player.off("pause");
      player.destroy().catch(() => {});
      playerRef.current = null;
    };
  }, []);

  // Track fullscreen state
  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  // Auto-hide controls in fullscreen
  const scheduleFsHide = useCallback(() => {
    if (fsTimerRef.current) clearTimeout(fsTimerRef.current);
    fsTimerRef.current = setTimeout(() => {
      setShowFsControls(false);
      setShowVolume(false);
    }, 2400);
  }, []);

  const onFsMouseMove = useCallback(() => {
    setShowFsControls(true);
    scheduleFsHide();
  }, [scheduleFsHide]);

  // Player actions
  const togglePlay = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    if (playing) p.pause();
    else p.play().catch(() => {});
  }, [playing]);

  const toggleMute = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    if (muted) {
      const next = volume > 0 ? volume : 0.7;
      p.setVolume(next);
      p.setMuted(false);
      setVolume(next);
      setMuted(false);
    } else {
      p.setMuted(true);
      setMuted(true);
    }
  }, [muted, volume]);

  const setVolumeLevel = useCallback((v: number) => {
    const p = playerRef.current;
    if (!p) return;
    p.setVolume(v);
    p.setMuted(v === 0);
    setVolume(v);
    setMuted(v === 0);
  }, []);

  const enterFullscreen = useCallback(() => {
    const el = wrapperRef.current;
    if (!el) return;
    if (el.requestFullscreen) el.requestFullscreen();
    else
      (
        el as HTMLElement & { webkitRequestFullscreen?: () => void }
      ).webkitRequestFullscreen?.();
  }, []);

  const exitFullscreen = useCallback(() => {
    document.exitFullscreen?.();
  }, []);

  // ── Shared control bar JSX ──────────────────────────────────────────────────
  const border = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)";

  // In fullscreen: white icons on dark bg. Outside: themed.
  const ctrl = "rgba(255,255,255,0.9)";
  const ctrlBg = "rgba(0,0,0,0.55)";
  const ctrlBgThemed = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const ctrlBorderThemed = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
  const ctrlTextThemed = isDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.65)";

  // Shared control bar: [FS | sep | Play | Volume ]
  function ControlBar({ overlay }: { overlay: boolean }) {
    const bg = overlay ? ctrlBg : ctrlBgThemed;
    const btnBorder = overlay ? "rgba(255,255,255,0.14)" : ctrlBorderThemed;
    const iconColor = overlay ? ctrl : ctrlTextThemed;
    const sepColor = overlay
      ? "rgba(255,255,255,0.18)"
      : isDark
        ? "rgba(255,255,255,0.12)"
        : "rgba(0,0,0,0.1)";

    return (
      <div className={`flex items-center gap-2 ${overlay ? "px-4 pb-4" : ""}`}>
        {/* Fullscreen — leftmost */}
        <button
          onClick={overlay ? exitFullscreen : enterFullscreen}
          className="flex items-center justify-center h-10 w-10 shrink-0 transition-opacity duration-150 hover:opacity-60 focus-visible:outline-none"
          style={{ background: bg, border: `1px solid ${btnBorder}` }}
          aria-label={overlay ? "Esci da schermo intero" : "Schermo intero"}
        >
          {overlay ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 13 13"
              fill="none"
              stroke={iconColor}
              strokeWidth="1.5"
              strokeLinecap="square"
            >
              <path d="M4 1v3H1M9 1v3h3M1 9h3v3M9 10v3h3" />
            </svg>
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 13 13"
              fill="none"
              stroke={iconColor}
              strokeWidth="1.5"
              strokeLinecap="square"
            >
              <path d="M1 4V1h3M9 1h3v3M12 9v3H9M4 12H1V9" />
            </svg>
          )}
        </button>

        {/* Separator */}
        <div className="h-5 w-px shrink-0" style={{ background: sepColor }} />

        {/* Play / Pause — accent color */}
        <button
          onClick={togglePlay}
          className="flex items-center justify-center h-10 w-10 shrink-0 transition-opacity duration-150 hover:opacity-70 focus-visible:outline-none"
          style={{ background: bg, border: `1px solid ${btnBorder}` }}
          aria-label={playing ? "Pausa" : "Riproduci"}
        >
          {playing ? (
            <svg width="15" height="17" viewBox="0 0 12 14" fill="#F09226">
              <rect x="1" y="1" width="3.5" height="12" rx="0.5" />
              <rect x="7.5" y="1" width="3.5" height="12" rx="0.5" />
            </svg>
          ) : (
            <svg width="15" height="17" viewBox="0 0 12 14" fill="#F09226">
              <path d="M2 1.5L11 7L2 12.5V1.5Z" />
            </svg>
          )}
        </button>

        {/* Volume */}
        <div
          className="relative flex items-center"
          onMouseEnter={() => setShowVolume(true)}
          onMouseLeave={() => setShowVolume(false)}
        >
          <button
            onClick={toggleMute}
            className="flex items-center justify-center h-10 w-10 shrink-0 transition-opacity duration-150 hover:opacity-60 focus-visible:outline-none"
            style={{ background: bg, border: `1px solid ${btnBorder}` }}
            aria-label={muted ? "Attiva audio" : "Silenzia"}
          >
            {muted || volume === 0 ? (
              <svg
                width="20"
                height="17"
                viewBox="0 0 16 14"
                fill="none"
                stroke={iconColor}
                strokeWidth="1.4"
                strokeLinecap="square"
              >
                <path
                  d="M1 5h3l4-4v12l-4-4H1z"
                  fill={iconColor}
                  stroke="none"
                />
                <path d="M11 4l4 6M15 4l-4 6" />
              </svg>
            ) : volume < 0.5 ? (
              <svg
                width="20"
                height="17"
                viewBox="0 0 16 14"
                fill="none"
                stroke={iconColor}
                strokeWidth="1.4"
                strokeLinecap="square"
              >
                <path
                  d="M1 5h3l4-4v12l-4-4H1z"
                  fill={iconColor}
                  stroke="none"
                />
                <path d="M11 4.5a4 4 0 010 5" />
              </svg>
            ) : (
              <svg
                width="20"
                height="17"
                viewBox="0 0 16 14"
                fill="none"
                stroke={iconColor}
                strokeWidth="1.4"
                strokeLinecap="square"
              >
                <path
                  d="M1 5h3l4-4v12l-4-4H1z"
                  fill={iconColor}
                  stroke="none"
                />
                <path d="M11 4.5a4 4 0 010 5M13 2a7 7 0 010 10" />
              </svg>
            )}
          </button>
          <div
            className="overflow-hidden transition-all duration-200 flex items-center"
            style={{
              width: showVolume ? "72px" : "0px",
              opacity: showVolume ? 1 : 0,
            }}
          >
            <input
              type="range"
              min={0}
              max={1}
              step={0.02}
              value={muted ? 0 : volume}
              onChange={(e) => setVolumeLevel(parseFloat(e.target.value))}
              className="w-full h-0.5 cursor-pointer accent-academy-orange"
              style={{ marginLeft: "8px" }}
              aria-label="Volume"
            />
          </div>
        </div>

        <div className="flex-1" />
      </div>
    );
  }

  return (
    <div
      ref={wrapperRef}
      className="w-full"
      onMouseMove={isFullscreen ? onFsMouseMove : undefined}
    >
      {/* ── Video ───────────────────────────────────────────────────────────── */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          aspectRatio: "16 / 9",
          background: "#000",
          border: `1px solid ${border}`,
        }}
      >
        {/* SDK iframe target */}
        <div
          ref={containerRef}
          className="absolute inset-0 [&>iframe]:absolute [&>iframe]:inset-0 [&>iframe]:h-full [&>iframe]:w-full [&>iframe]:border-none"
        />

        {/* Controls overlay — only in fullscreen */}
        {isFullscreen && (
          <div
            className="absolute inset-0 flex flex-col justify-end transition-opacity duration-300"
            style={{
              opacity: showFsControls ? 1 : 0,
              pointerEvents: showFsControls ? "auto" : "none",
              background:
                "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)",
            }}
          >
            <ControlBar overlay />
          </div>
        )}
      </div>

      {/* ── Controls bar — below video when NOT fullscreen ───────────────── */}
      {!isFullscreen && (
        <div
          style={{
            borderLeft: `1px solid ${border}`,
            borderRight: `1px solid ${border}`,
            borderBottom: `1px solid ${border}`,
            padding: "6px 12px",
          }}
        >
          <ControlBar overlay={false} />
        </div>
      )}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function PercorsoHero() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".js-ph-text > *", {
        opacity: 0,
        y: 24,
        stagger: 0.1,
        duration: 0.75,
        ease: "power3.out",
        delay: 0.1,
      });
      gsap.from(".js-ph-video", {
        opacity: 0,
        scale: 0.97,
        duration: 0.9,
        ease: "power3.out",
        delay: 0.35,
      });
      gsap.from(".js-ph-cell", {
        opacity: 0,
        y: 22,
        stagger: 0.06,
        duration: 0.7,
        ease: "power3.out",
        delay: 0.5,
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const fipeSorted = [...FIPE_SESSIONS].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );
  const coursesSorted = [...COURSES].sort((a, b) => a.sortOrder - b.sortOrder);

  const th = isDark ? "#f5f5fa" : "#0a0a1a";
  const tb = isDark ? "rgba(180,180,200,0.65)" : "#555";
  const ts = isDark ? "rgba(120,120,140,0.5)" : "#888";
  const borderSubtle = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";

  return (
    <section ref={sectionRef} className="themed-section relative">
      {/* ── Background — covers both the viewport slot and below-fold cards ── */}
      <div className="absolute inset-0 section-bg" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: isDark
            ? "radial-gradient(ellipse at 68% 48%, rgba(240,146,38,0.055) 0%, transparent 52%), radial-gradient(ellipse at 18% 78%, rgba(42,95,168,0.04) 0%, transparent 48%)"
            : "radial-gradient(ellipse at 68% 42%, rgba(212,98,42,0.06) 0%, transparent 50%), radial-gradient(ellipse at 15% 72%, rgba(42,95,168,0.04) 0%, transparent 50%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.022]"
        style={{
          backgroundImage: `linear-gradient(to right, ${isDark ? "#fff" : "#000"} 1px, transparent 1px), linear-gradient(to bottom, ${isDark ? "#fff" : "#000"} 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
      />

      {/* ── SLOT 1: viewport-height — Row 1 centrata come in Pack ───────────── */}
      {/*   Identico al pattern Pack: height 100svh + flex center + pt-24/28    */}
      <div
        className="relative z-10 flex items-center overflow-hidden"
        style={{ height: "100svh" }}
      >
        <div className="w-full mx-auto max-w-[1440px] px-[5%] md:px-10 pt-24 md:pt-28 pb-8">
          {/* ── ROW 1: Text left + Video right ──────────────────────────────── */}
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-14">
            {/* Left — copy */}
            <div className="js-ph-text flex flex-col justify-center lg:w-[42%]">
              <span className="label-tag mb-5 block">Il Metodo Lacertosus</span>
              <h1
                className="font-black tracking-[-0.025em] leading-[0.93] text-[clamp(2.6rem,5.2vw,4.8rem)]"
                style={{ color: th }}
              >
                Il Percorso
                <br />
                <span className="gradient-text">Formativo</span>
              </h1>
              <p
                className="mt-6 max-w-[440px] text-[0.95rem] leading-relaxed"
                style={{ color: tb }}
              >
                Tre blocchi progressivi. Tre sessioni di certificazione FIPE.{" "}
                <span
                  className="font-semibold"
                  style={{ color: isDark ? "rgba(220,220,235,0.9)" : "#222" }}
                >
                  9 mesi per trasformarti in professionista completo del
                  fitness.
                </span>
              </p>

              {/* Stats pills */}
              <div className="mt-7 flex flex-wrap gap-3">
                {[
                  { val: "9", unit: "mesi" },
                  { val: "100%", unit: "in presenza" },
                  { val: "33+", unit: "docenti" },
                  { val: "3", unit: "certificazioni" },
                ].map((s) => (
                  <div
                    key={s.unit}
                    className="flex flex-col items-center px-4 py-2.5"
                    style={{
                      border: `1px solid ${borderSubtle}`,
                      background: isDark
                        ? "rgba(255,255,255,0.03)"
                        : "rgba(0,0,0,0.02)",
                      minWidth: "68px",
                    }}
                  >
                    <span
                      className="text-xl font-black leading-none"
                      style={{ color: "#F09226" }}
                    >
                      {s.val}
                    </span>
                    <span
                      className="mt-1 text-[0.62rem] font-bold tracking-[0.18em] uppercase"
                      style={{ color: ts }}
                    >
                      {s.unit}
                    </span>
                  </div>
                ))}
              </div>

              <Link
                href="#calendario"
                className="group mt-9 inline-flex items-center justify-between gap-4 px-6 py-3.5 w-fit transition-opacity duration-200 hover:opacity-85"
                style={{
                  background: "#F09226",
                  color: "#010015",
                }}
              >
                <span className="text-[0.82rem] font-black tracking-[0.16em] uppercase">
                  Scopri il Calendario
                </span>
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center font-black transition-transform duration-300 group-hover:translate-x-0.5"
                  style={{
                    border: "1.5px solid rgba(1,0,21,0.25)",
                    color: "#010015",
                  }}
                >
                  ↓
                </span>
              </Link>
            </div>

            {/* Right — video */}
            <div className="js-ph-video lg:w-[58%]">
              <VideoBlock isDark={isDark} />
            </div>
          </div>
        </div>
      </div>

      {/* ── SLOT 2: below fold — Row 2 + Row 3 ──────────────────────────────── */}
      <div className="relative z-10 w-full mx-auto max-w-[1440px] px-[5%] md:px-10 pb-14 md:pb-16">
        {/* ── ROW 2: 3 equal block cards ──────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          {coursesSorted.map((course, i) => (
            <div
              key={course.slug}
              className="js-ph-cell bento-card bento-card--themed bento-interactive"
              onMouseMove={tiltIn}
              onMouseLeave={tiltOut}
            >
              <Link
                href={`/corsi/${course.slug}`}
                className="group flex flex-col justify-between h-full p-6 md:p-7"
                style={{ minHeight: "clamp(190px, 18vw, 240px)" }}
              >
                {/* Top row */}
                <div className="flex items-start justify-between">
                  <span className="text-[0.54rem] font-black tracking-[0.35em] text-academy-orange/40 uppercase">
                    Blocco {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-academy-orange/25 group-hover:text-academy-orange/70 transition-colors duration-200 text-sm font-black">
                    →
                  </span>
                </div>

                {/* Content */}
                <div>
                  {/* Accent line */}
                  <div
                    className="h-0.5 w-8 mb-4"
                    style={{
                      background:
                        "linear-gradient(90deg, rgba(240,146,38,0.5), transparent)",
                    }}
                  />
                  <h3
                    className="text-[2rem] font-black tracking-[-0.02em] leading-none"
                    style={{ color: th }}
                  >
                    {course.title}
                  </h3>
                  <p className="text-[0.64rem] font-bold tracking-[0.2em] text-academy-orange/55 uppercase mt-2">
                    {course.area}
                  </p>

                  {/* Month labels */}
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {course.dates.map((d) => (
                      <span
                        key={d}
                        className="text-[0.65rem] font-semibold px-2.5 py-1"
                        style={{
                          color: isDark ? "rgba(180,180,200,0.5)" : "#777",
                          border: `1px solid ${borderSubtle}`,
                        }}
                      >
                        {monthOnly(d)}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* ── ROW 3: 9 Mesi + Certificazione ──────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* ── 9 Mesi — neutral month timeline ─────────────────────────────── */}
          <div
            className="js-ph-cell bento-card bento-card--themed bento-interactive flex flex-col justify-between p-7 md:p-8"
            onMouseMove={tiltIn}
            onMouseLeave={tiltOut}
          >
            <div className="flex items-end gap-4">
              <span className="text-[clamp(4rem,7vw,6rem)] font-black leading-none gradient-text">
                9
              </span>
              <div className="mb-1.5">
                <p
                  className="text-xl font-black tracking-tight"
                  style={{ color: th }}
                >
                  Mesi Formativi
                </p>
                <p className="text-[0.77rem] mt-0.5" style={{ color: tb }}>
                  Settembre 2026 → Maggio 2027
                </p>
              </div>
            </div>

            {/* Phase label row */}
            <div className="flex gap-[3px] mt-6 mb-1">
              {MONTH_PHASES.map((phase) => (
                <div
                  key={phase.label}
                  className="overflow-hidden"
                  style={{ flex: phase.span }}
                >
                  <span
                    className="text-[0.47rem] font-black tracking-[0.15em] uppercase"
                    style={{
                      color: isDark ? "rgba(180,180,200,0.35)" : "#bbb",
                    }}
                  >
                    {phase.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Month bars — neutral, uniform */}
            <div className="flex gap-[3px]">
              {MONTH_ABBRS.map((m, i) => (
                <div
                  key={m}
                  className="flex flex-1 flex-col items-center gap-1.5"
                >
                  <div
                    className="w-full"
                    style={{
                      height: "26px",
                      background: isDark
                        ? `rgba(255,255,255,${0.07 + i * 0.018})`
                        : `rgba(0,0,0,${0.055 + i * 0.014})`,
                    }}
                  />
                  <span
                    className="text-[0.44rem] font-bold tracking-widest"
                    style={{ color: isDark ? "rgba(142,142,147,0.6)" : "#bbb" }}
                  >
                    {m}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Certificazione — progression design ─────────────────────────── */}
          <div
            className="js-ph-cell bento-card bento-card--themed bento-interactive flex flex-col justify-between p-7 md:p-8"
            onMouseMove={tiltIn}
            onMouseLeave={tiltOut}
          >
            <div>
              <span className="label-tag mb-4 block">
                Certificazione Ufficiale
              </span>
              <p
                className="text-[1.4rem] font-black tracking-tight leading-tight"
                style={{ color: th }}
              >
                FIPE{" "}
                <span className="text-base font-semibold" style={{ color: tb }}>
                  × Lacertosus
                </span>
              </p>
              <p
                className="text-[0.8rem] mt-2 leading-relaxed"
                style={{ color: tb }}
              >
                Una certificazione unica, costruita in tre momenti progressivi
                lungo il percorso.
              </p>
            </div>

            {/* Progression path */}
            <div>
              <div className="flex items-center">
                {/* 3 milestone nodes */}
                {fipeSorted.map((fipe, fi) => (
                  <div
                    key={fipe.slug}
                    className="flex items-center"
                    style={{ flex: fi < 2 ? "1 1 0" : "0 0 auto" }}
                  >
                    <div className="flex flex-col items-center gap-1.5 shrink-0">
                      <div
                        className="h-7 w-7 rounded-full flex items-center justify-center"
                        style={{
                          border: `1.5px solid rgba(240,146,38,${0.28 + fi * 0.1})`,
                          background: `rgba(240,146,38,${0.05 + fi * 0.03})`,
                        }}
                      >
                        <span
                          className="text-[0.6rem] font-black"
                          style={{
                            color: `rgba(240,146,38,${0.55 + fi * 0.15})`,
                          }}
                        >
                          {fi + 1}
                        </span>
                      </div>
                      <span
                        className="text-[0.48rem] font-bold"
                        style={{ color: ts }}
                      >
                        dopo
                      </span>
                      <span
                        className="text-[0.54rem] font-black"
                        style={{
                          color: isDark ? "rgba(200,200,220,0.6)" : "#555",
                        }}
                      >
                        {fipe.afterBlock}
                      </span>
                    </div>

                    {/* Connector — not after last node */}
                    {fi < 2 && (
                      <div
                        className="flex-1 h-px mx-1.5"
                        style={{
                          background: `rgba(240,146,38,${0.15 + fi * 0.07})`,
                        }}
                      />
                    )}
                  </div>
                ))}

                {/* Final connector + cert badge */}
                <div
                  className="flex-1 h-px mx-1.5"
                  style={{ background: "rgba(240,146,38,0.3)" }}
                />
                <div className="flex flex-col items-center gap-1.5 shrink-0">
                  <div
                    className="h-7 px-2.5 flex items-center justify-center"
                    style={{
                      background: "rgba(240,146,38,0.1)",
                      border: "1.5px solid rgba(240,146,38,0.45)",
                    }}
                  >
                    <span className="text-[0.55rem] font-black tracking-wider text-academy-orange">
                      CERT.
                    </span>
                  </div>
                  <span className="text-[0.48rem] font-bold text-academy-orange/50">
                    FIPE
                  </span>
                  <span className="text-[0.54rem] font-black text-academy-orange/70">
                    Ufficiale
                  </span>
                </div>
              </div>

              <p className="text-[0.72rem] mt-5" style={{ color: ts }}>
                Al completamento del percorso ottieni l&apos;attestazione
                ufficiale FIPE × Lacertosus.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
