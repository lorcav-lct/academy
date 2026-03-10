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
    let frameId: number;

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (stopped) { stream.getTracks().forEach(t => t.stop()); return; }

        const video = videoRef.current!;
        video.srcObject = stream;
        await video.play();
        setActive(true);

        const jsQR = (await import("jsqr")).default;
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d")!;

        function tick() {
          if (stopped || video.readyState !== video.HAVE_ENOUGH_DATA) {
            frameId = requestAnimationFrame(tick);
            return;
          }
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0);
          const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(img.data, img.width, img.height, {
            inversionAttempts: "dontInvert",
          });
          if (code) {
            stopped = true;
            stream?.getTracks().forEach(t => t.stop());
            onScanRef.current(code.data);
            return;
          }
          frameId = requestAnimationFrame(tick);
        }

        frameId = requestAnimationFrame(tick);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "";
        setError(
          msg.toLowerCase().includes("permission") || msg.toLowerCase().includes("denied")
            ? "Permesso fotocamera negato"
            : "Fotocamera non disponibile"
        );
      }
    }

    start();
    return () => {
      stopped = true;
      cancelAnimationFrame(frameId);
      stream?.getTracks().forEach(t => t.stop());
    };
  }, []);

  if (error) {
    return (
      <div className="card-squared flex h-52 items-center justify-center p-6 text-center">
        <div>
          <p className="mb-2 font-semibold text-red-400">{error}</p>
          <p className="text-xs text-academy-gray-500">Usa l&apos;inserimento manuale qui sotto</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden card-squared">
      <div className="relative">
        <video
          ref={videoRef}
          className="w-full"
          muted
          playsInline
          style={{ maxHeight: 320, objectFit: "cover" }}
        />
        <canvas ref={canvasRef} className="hidden" />
        {active && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-48 w-48 border-2 border-academy-orange/70">
              <div className="h-1 w-full animate-pulse bg-academy-orange/50" />
            </div>
          </div>
        )}
        {!active && (
          <div className="absolute inset-0 flex items-center justify-center bg-academy-dark/60">
            <p className="text-sm text-academy-gray-400">Avvio fotocamera...</p>
          </div>
        )}
      </div>
      <p className="p-3 text-center text-xs text-academy-gray-500">
        Inquadra il QR code nel riquadro arancione
      </p>
    </div>
  );
}
