"use client";

import MuxPlayer from "@mux/mux-player-react";

type Props = {
  playbackId: string;
  isDark: boolean;
  className?: string;
  borderColor?: string;
  /** Aspect ratio for the player frame. Defaults to "9 / 16" (vertical). */
  aspectRatio?: string;
  /** Optional poster override. If omitted, Mux generates one from the playback. */
  poster?: string;
  /** Tracking metadata for Mux Data. */
  videoTitle?: string;
};

const ORANGE = "#F09226";

export function VideoBlockMux({
  playbackId,
  isDark,
  className,
  borderColor,
  aspectRatio = "9 / 16",
  poster,
  videoTitle = "Lacertosus Academy",
}: Props) {
  const border =
    borderColor ?? (isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)");

  return (
    <div className={`w-full ${className ?? ""}`}>
      <div
        className="relative w-full overflow-hidden mx-auto"
        style={{
          aspectRatio,
          maxWidth: "min(100%, 480px)",
          background: "#000",
          border: `1px solid ${border}`,
        }}
      >
        <MuxPlayer
          playbackId={playbackId}
          streamType="on-demand"
          autoPlay="muted"
          muted
          loop
          playsInline
          accentColor={ORANGE}
          poster={poster}
          metadata={{ video_title: videoTitle }}
          style={{
            aspectRatio,
            width: "100%",
            height: "100%",
            display: "block",
            ["--media-object-fit" as string]: "contain",
            ["--media-background-color" as string]: "#000",
          }}
        />
      </div>
    </div>
  );
}
