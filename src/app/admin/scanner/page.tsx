"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { SectionContainer } from "@/components/shared/section-container";
import { GradientText } from "@/components/shared/gradient-text";
import { Button } from "@/components/ui/button";

// Dynamic import to avoid SSR issues with html5-qrcode
const QRScanner = dynamic(() => import("@/components/admin/qr-scanner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 items-center justify-center card-squared">
      <p className="text-academy-gray-400">Caricamento scanner...</p>
    </div>
  ),
});

interface ScanResult {
  valid: boolean;
  error?: string;
  ticket?: {
    id: string;
    userName: string;
    courseName: string;
    eventDate: string;
    orderId: string;
  };
}

export default function ScannerPage() {
  const [result, setResult] = useState<ScanResult | null>(null);
  const [scanning, setScanning] = useState(true);
  const [manualInput, setManualInput] = useState("");

  const handleScan = useCallback(async (data: string) => {
    setScanning(false);

    try {
      const response = await fetch("/api/qr/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrData: data }),
      });

      const result = await response.json();
      setResult(result);
    } catch {
      setResult({ valid: false, error: "Errore di connessione" });
    }
  }, []);

  function resetScanner() {
    setResult(null);
    setScanning(true);
  }

  async function handleManualValidation() {
    if (!manualInput.trim()) return;
    await handleScan(manualInput.trim());
    setManualInput("");
  }

  return (
    <section className="min-h-screen pt-32">
      <SectionContainer>
        <div className="mx-auto max-w-xl">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-black">
              <GradientText>Scanner</GradientText> QR Code
            </h1>
            <p className="text-academy-gray-400">
              Scansiona il QR code del partecipante per il check-in.
            </p>
          </div>

          {/* Scanner */}
          {scanning && !result && (
            <div className="mb-6">
              <QRScanner onScan={handleScan} />
            </div>
          )}

          {/* Result */}
          {result && (
            <div
              className={`mb-6 p-8 text-center ${
                result.valid
                  ? "border-2 border-green-500 bg-green-500/5"
                  : "border-2 border-red-500 bg-red-500/5"
              }`}
            >
              {result.valid ? (
                <>
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center bg-green-500/20">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-8 w-8 text-green-400"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path d="M4.5 12.75l6 6 9-13.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h2 className="mb-2 text-2xl font-black text-green-400">Valido</h2>
                  <div className="space-y-1 text-sm">
                    <p className="font-bold text-academy-gray-100">
                      {result.ticket?.userName}
                    </p>
                    <p className="text-academy-gray-400">
                      {result.ticket?.courseName}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center bg-red-500/20">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-8 w-8 text-red-400"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path d="M6 18 18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h2 className="mb-2 text-2xl font-black text-red-400">Non Valido</h2>
                  <p className="text-sm text-academy-gray-400">{result.error}</p>
                </>
              )}
            </div>
          )}

          {/* Actions */}
          {result && (
            <div className="mb-8 text-center">
              <Button onClick={resetScanner} variant="secondary">
                Scansiona un Altro
              </Button>
            </div>
          )}

          {/* Manual input fallback */}
          <div className="card-squared p-6">
            <h3 className="mb-3 text-xs font-bold tracking-[0.2em] text-academy-orange uppercase">
              Inserimento Manuale
            </h3>
            <div className="flex gap-3">
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Incolla il codice QR..."
                className="flex-1 border border-academy-orange/20 bg-academy-navy/50 px-4 py-2 text-sm text-academy-gray-100 outline-none focus:border-academy-orange/50"
              />
              <Button onClick={handleManualValidation} size="sm">
                Verifica
              </Button>
            </div>
          </div>
        </div>
      </SectionContainer>
    </section>
  );
}
