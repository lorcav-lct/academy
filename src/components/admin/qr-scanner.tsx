"use client";

import { useEffect, useRef, useState } from "react";

interface QRScannerProps {
  onScan: (data: string) => void;
}

export default function QRScanner({ onScan }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState("");
  const [active, setActive] = useState(false);
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;

  useEffect(() => {
    let stream: MediaStream | null = null;
    let stopped = false;
    let timer: ReturnType<typeof setInterval>;

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
        if (stopped) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        const video = videoRef.current!;
        video.srcObject = stream;
        await video.play();
        setActive(true);

        const jsQR = (await import("jsqr")).default;
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d", { willReadFrequently: true })!;

        const MAX_W = 640;

        timer = setInterval(() => {
          if (stopped) {
            clearInterval(timer);
            return;
          }
          if (
            video.readyState < video.HAVE_ENOUGH_DATA ||
            video.videoWidth === 0
          )
            return;

          const scale = video.videoWidth > MAX_W ? MAX_W / video.videoWidth : 1;
          canvas.width = Math.round(video.videoWidth * scale);
          canvas.height = Math.round(video.videoHeight * scale);
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(img.data, img.width, img.height, {
            inversionAttempts: "attemptBoth",
          });

          if (code?.data) {
            stopped = true;
            clearInterval(timer);
            stream?.getTracks().forEach((t) => t.stop());
            onScanRef.current(code.data);
          }
        }, 150);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "";
        setError(
          msg.toLowerCase().includes("permission") ||
            msg.toLowerCase().includes("denied")
            ? "Permesso fotocamera negato"
            : "Fotocamera non disponibile",
        );
      }
    }

    start();
    return () => {
      stopped = true;
      clearInterval(timer);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  if (error) {
    return (
      <div className="flex h-52 items-center justify-center border border-red-500/30 bg-red-50 p-6 text-center">
        <div>
          <p className="mb-2 font-bold text-red-700">{error}</p>
          <p className="text-xs text-red-600/80">
            Usa il codice manuale qui sotto.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden border border-black/[0.08] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="relative bg-black">
        <video
          ref={videoRef}
          className="w-full"
          muted
          playsInline
          style={{ maxHeight: 360, objectFit: "cover" }}
        />
        <canvas ref={canvasRef} className="hidden" />
        {active && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="relative h-56 w-56">
              {/* Corner brackets */}
              <span className="absolute top-0 left-0 h-6 w-6 border-t-2 border-l-2 border-academy-orange" />
              <span className="absolute top-0 right-0 h-6 w-6 border-t-2 border-r-2 border-academy-orange" />
              <span className="absolute bottom-0 left-0 h-6 w-6 border-b-2 border-l-2 border-academy-orange" />
              <span className="absolute right-0 bottom-0 h-6 w-6 border-r-2 border-b-2 border-academy-orange" />
              {/* Scanning line */}
              <div className="absolute top-0 right-0 left-0 h-0.5 animate-pulse bg-academy-orange/80" />
            </div>
          </div>
        )}
        {!active && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <p className="text-sm text-white/70">Avvio fotocamera...</p>
          </div>
        )}
      </div>
      <p className="border-t border-black/[0.06] bg-black/[0.015] py-3 text-center text-[11px] font-bold tracking-wider text-academy-gray-500 uppercase">
        Centra il QR code nel riquadro
      </p>
    </div>
  );
}
