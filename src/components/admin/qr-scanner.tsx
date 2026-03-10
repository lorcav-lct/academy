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
          video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        if (stopped) { stream.getTracks().forEach(t => t.stop()); return; }

        const video = videoRef.current!;
        video.srcObject = stream;
        await video.play();
        setActive(true);

        const jsQR = (await import("jsqr")).default;
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d", { willReadFrequently: true })!;

        timer = setInterval(() => {
          if (stopped) { clearInterval(timer); return; }
          if (video.readyState < video.HAVE_ENOUGH_DATA || video.videoWidth === 0) return;

          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0);

          const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(img.data, img.width, img.height, {
            inversionAttempts: "attemptBoth",
          });

          if (code?.data) {
            stopped = true;
            clearInterval(timer);
            stream?.getTracks().forEach(t => t.stop());
            onScanRef.current(code.data);
          }
        }, 400);
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
      clearInterval(timer);
      stream?.getTracks().forEach(t => t.stop());
    };
  }, []);

  if (error) {
    return (
      <div className="card-squared flex h-52 items-center justify-center p-6 text-center">
        <div>
          <p className="mb-2 font-semibold text-red-400">{error}</p>
          <p className="text-xs text-academy-gray-500">Usa il codice manuale qui sotto</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden card-squared">
      <div className="relative bg-black">
        <video ref={videoRef} className="w-full" muted playsInline style={{ maxHeight: 320, objectFit: "cover" }} />
        <canvas ref={canvasRef} className="hidden" />
        {active && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="relative h-52 w-52">
              <div className="absolute inset-0 border-2 border-academy-orange/60" />
              <div className="absolute left-0 right-0 top-0 h-0.5 animate-pulse bg-academy-orange/70" />
            </div>
          </div>
        )}
        {!active && (
          <div className="absolute inset-0 flex items-center justify-center bg-academy-dark/80">
            <p className="text-sm text-academy-gray-400">Avvio fotocamera...</p>
          </div>
        )}
      </div>
      <p className="p-3 text-center text-xs text-academy-gray-500">
        Centra il QR code nel riquadro
      </p>
    </div>
  );
}
