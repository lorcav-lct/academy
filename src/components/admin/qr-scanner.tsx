"use client";

import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface QRScannerProps {
  onScan: (data: string) => void;
}

export default function QRScanner({ onScan }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<string>("qr-reader");

  useEffect(() => {
    const scanner = new Html5Qrcode(containerRef.current);
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          scanner.stop().catch(console.error);
          onScan(decodedText);
        },
        () => {
          // Ignore scan failures (no QR found in frame)
        }
      )
      .catch((err) => {
        console.error("Scanner start error:", err);
      });

    return () => {
      scanner.stop().catch(() => {});
    };
  }, [onScan]);

  return (
    <div className="overflow-hidden card-squared">
      <div id={containerRef.current} className="w-full" />
      <p className="p-3 text-center text-xs text-academy-gray-500">
        Punta la fotocamera verso il QR code del ticket
      </p>
    </div>
  );
}
