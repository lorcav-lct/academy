"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Player from "@vimeo/player";

type Props = {
  vimeoId: string;
  isDark: boolean;
  className?: string;
  /** Border shown around the video frame and control bar. Defaults to a theme-aware subtle border. */
  borderColor?: string;
};

export function VideoBlock({ vimeoId, isDark, className, borderColor }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);
  const fsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);
  const [volume, setVolume] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFsControls, setShowFsControls] = useState(false);
  const [showVolume, setShowVolume] = useState(false);

  useEffect(() => {
    if (!containerRef.current || playerRef.current) return;
    const player = new Player(containerRef.current, {
      id: parseInt(vimeoId),
      background: true,
      loop: true,
      responsive: true,
      dnt: true,
    });
    playerRef.current = player;
    player.on("play", () => setPlaying(true));
    player.on("pause", () => setPlaying(false));
    player.on("timeupdate", ({ seconds }: { seconds: number }) => {
      if (!isSeeking) setCurrentTime(seconds);
    });
    player
      .getDuration()
      .then((d) => setDuration(d))
      .catch(() => {});
    return () => {
      player.off("play");
      player.off("pause");
      player.off("timeupdate");
      player.destroy().catch(() => {});
      playerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vimeoId]);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

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

  const seekTo = useCallback(
    (seconds: number) => {
      const p = playerRef.current;
      if (!p || duration === 0) return;
      const t = Math.max(0, Math.min(seconds, duration));
      p.setCurrentTime(t).catch(() => {});
      setCurrentTime(t);
    },
    [duration],
  );

  const rewind10 = useCallback(() => {
    seekTo(currentTime - 10);
  }, [seekTo, currentTime]);

  const onSeekStart = useCallback(() => setIsSeeking(true), []);
  const onSeekChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTime(parseFloat(e.target.value));
  }, []);
  const onSeekEnd = useCallback(
    (e: React.SyntheticEvent<HTMLInputElement>) => {
      seekTo(parseFloat(e.currentTarget.value));
      setIsSeeking(false);
    },
    [seekTo],
  );

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

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

  const border =
    borderColor ?? (isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)");
  const ctrl = "rgba(255,255,255,0.9)";
  const ctrlBg = "rgba(0,0,0,0.55)";
  const ctrlBgThemed = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const ctrlBorderThemed = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
  const ctrlTextThemed = isDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.65)";

  function ControlBar({ overlay }: { overlay: boolean }) {
    const bg = overlay ? ctrlBg : ctrlBgThemed;
    const btnBorder = overlay ? "rgba(255,255,255,0.14)" : ctrlBorderThemed;
    const iconColor = overlay ? ctrl : ctrlTextThemed;
    const sepColor = overlay
      ? "rgba(255,255,255,0.18)"
      : isDark
        ? "rgba(255,255,255,0.12)"
        : "rgba(0,0,0,0.1)";
    const seekTrack = overlay
      ? "rgba(255,255,255,0.22)"
      : isDark
        ? "rgba(255,255,255,0.14)"
        : "rgba(0,0,0,0.12)";
    const timeColor = overlay
      ? "rgba(255,255,255,0.55)"
      : isDark
        ? "rgba(180,180,200,0.45)"
        : "#aaa";
    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
      <div
        className={`flex flex-col gap-1.5 ${overlay ? "px-4 pb-4" : "py-0"}`}
      >
        <div className="flex items-center gap-2">
          <span
            className="text-[0.58rem] font-bold tabular-nums shrink-0 w-9 text-right"
            style={{ color: timeColor }}
          >
            {fmt(currentTime)}
          </span>
          <div className="relative flex-1 h-3 flex items-center">
            <div
              className="absolute inset-y-0 left-0 my-auto h-[3px] pointer-events-none"
              style={{ width: `${progress}%`, background: "#F09226" }}
            />
            <div
              className="absolute inset-y-0 right-0 my-auto h-[3px] pointer-events-none"
              style={{ width: `${100 - progress}%`, background: seekTrack }}
            />
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.5}
              value={currentTime}
              onMouseDown={onSeekStart}
              onTouchStart={onSeekStart}
              onChange={onSeekChange}
              onMouseUp={onSeekEnd}
              onTouchEnd={onSeekEnd}
              className="relative w-full h-3 cursor-pointer opacity-0"
              style={{ zIndex: 1 }}
              aria-label="Posizione video"
            />
          </div>
          <span
            className="text-[0.58rem] font-bold tabular-nums shrink-0 w-9"
            style={{ color: timeColor }}
          >
            {fmt(duration)}
          </span>
        </div>

        <div className="flex items-center gap-2">
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

          <div className="h-5 w-px shrink-0" style={{ background: sepColor }} />

          <button
            onClick={rewind10}
            className="flex items-center justify-center h-10 w-10 shrink-0 transition-opacity duration-150 hover:opacity-60 focus-visible:outline-none"
            style={{ background: bg, border: `1px solid ${btnBorder}` }}
            aria-label="Indietro 10 secondi"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 4V1L5.5 5.5 10 10V7a5 5 0 11-5 5H3a7 7 0 107-8z"
                fill={iconColor}
              />
              <text
                x="10"
                y="15.5"
                textAnchor="middle"
                fontSize="5.5"
                fontWeight="700"
                fill={iconColor}
                fontFamily="system-ui"
              >
                10
              </text>
            </svg>
          </button>

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
      </div>
    );
  }

  return (
    <div
      ref={wrapperRef}
      className={`w-full ${className ?? ""}`}
      onMouseMove={isFullscreen ? onFsMouseMove : undefined}
    >
      <div
        className="relative w-full overflow-hidden"
        style={{
          aspectRatio: "16 / 9",
          background: "#000",
          border: `1px solid ${border}`,
        }}
      >
        <div
          ref={containerRef}
          className="absolute inset-0 [&>iframe]:absolute [&>iframe]:inset-0 [&>iframe]:h-full [&>iframe]:w-full [&>iframe]:border-none"
        />
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
