"use client";

import { useEffect, useRef, useState } from "react";

interface QRScannerProps {
  onScan: (data: string) => void;
}

export default function QRScanner({ onScan }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string>("");
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;

  useEffect(() => {
    let controls: { stop: () => void } | null = null;

    async function start() {
      try {
        const { BrowserQRCodeReader } = await import("@zxing/browser");
        const reader = new BrowserQRCodeReader();

        if (!videoRef.current) return;

        controls = await reader.decodeFromConstraints(
          { video: { facingMode: "environment" } },
          videoRef.current,
          (result, err) => {
            if (result) {
              controls?.stop();
              onScanRef.current(result.getText());
            }
            // err is expected when no QR found in frame — ignore
            void err;
          }
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : "";
        setError(
          msg.toLowerCase().includes("permission")
            ? "Permesso fotocamera negato"
            : "Fotocamera non disponibile"
        );
      }
    }

    start();

    return () => {
      controls?.stop();
    };
  }, []);

  if (error) {
    return (
      <div className="card-squared flex h-64 items-center justify-center p-6 text-center">
        <div>
          <p className="mb-2 font-semibold text-red-400">{error}</p>
          <p className="text-xs text-academy-gray-500">
            Usa l&apos;inserimento manuale qui sotto
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden card-squared">
      <video
        ref={videoRef}
        className="w-full"
        muted
        playsInline
        style={{ maxHeight: "320px", objectFit: "cover" }}
      />
      <p className="p-3 text-center text-xs text-academy-gray-500">
        Punta la fotocamera verso il QR code del ticket
      </p>
    </div>
  );
}
