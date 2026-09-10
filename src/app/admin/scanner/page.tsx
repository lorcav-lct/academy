"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { GradientText } from "@/components/shared/gradient-text";
import { IconRefresh, IconSearch } from "../_components/icons";
import {
  EventFilter,
  filterLabel,
  filterPayload,
  type ScannerFilter,
} from "./_components/event-filter";
import { ScanResultCard, type ScanResult } from "./_components/scan-result";

const QRScanner = dynamic(() => import("@/components/admin/qr-scanner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-72 items-center justify-center border border-black/[0.08] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <p className="text-sm text-academy-gray-500">Caricamento scanner...</p>
    </div>
  ),
});

export default function ScannerPage() {
  const [result, setResult] = useState<ScanResult | null>(null);
  const [scanning, setScanning] = useState(true);
  const [manualInput, setManualInput] = useState("");
  const [validating, setValidating] = useState(false);
  const [filter, setFilter] = useState<ScannerFilter>({ mode: "all" });
  const [lastCode, setLastCode] = useState("");

  const handleScan = useCallback(
    async (data: string, allowMismatch = false) => {
      setScanning(false);
      setValidating(true);
      setLastCode(data);
      try {
        const response = await fetch("/api/qr/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            qrData: data,
            ...filterPayload(filter),
            allowMismatch,
          }),
        });
        const result = await response.json();
        setResult(result);
      } catch {
        setResult({ valid: false, error: "Errore di connessione" });
      }
      setValidating(false);
    },
    [filter],
  );

  function resetScanner() {
    setResult(null);
    setScanning(true);
  }

  const activeFilter = filterLabel(filter);

  async function handleManualValidation() {
    if (!manualInput.trim()) return;
    await handleScan(manualInput.trim());
    setManualInput("");
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <header>
        <p className="mb-2 text-[11px] font-bold tracking-[0.3em] text-academy-orange uppercase">
          Check-in
        </p>
        <h1 className="text-3xl font-black text-academy-gray-800 md:text-4xl">
          <GradientText>Scanner</GradientText> QR
        </h1>
        <p className="mt-2 text-sm text-academy-gray-500">
          Scansiona il QR del partecipante o inserisci manualmente il codice
          ticket.
        </p>
      </header>

      <EventFilter
        value={filter}
        onChange={(next) => {
          setFilter(next);
          resetScanner();
        }}
      />

      {/* Scanner */}
      {scanning && !result && !validating && (
        <div className="space-y-2">
          <QRScanner onScan={handleScan} />
          {activeFilter && (
            <p className="text-center text-[11px] font-bold tracking-[0.15em] text-academy-orange uppercase">
              Filtro attivo · {activeFilter}
            </p>
          )}
        </div>
      )}

      {/* Validating state */}
      {validating && (
        <div className="flex h-72 items-center justify-center border border-black/[0.08] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <div className="text-center">
            <div className="mx-auto mb-3 h-10 w-10 animate-spin border-2 border-academy-orange/30 border-t-academy-orange" />
            <p className="text-sm font-bold tracking-wider text-academy-gray-700 uppercase">
              Verifica in corso...
            </p>
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <ScanResultCard
          result={result}
          filterLabel={activeFilter}
          onForce={() => handleScan(lastCode, true)}
        />
      )}

      {/* Reset */}
      {result && (
        <button
          onClick={resetScanner}
          className="flex w-full items-center justify-center gap-2 bg-academy-orange py-3 text-[12px] font-bold tracking-wider text-white uppercase transition-all hover:brightness-110"
        >
          <IconRefresh className="h-4 w-4" />
          Scansiona un altro
        </button>
      )}

      {/* Manual input */}
      <div className="border border-black/[0.08] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="border-b border-black/[0.06] px-5 py-3">
          <h3 className="text-[11px] font-bold tracking-[0.25em] text-academy-gray-700 uppercase">
            Verifica manuale
          </h3>
        </div>
        <div className="p-5">
          <p className="mb-3 text-[12px] text-academy-gray-500">
            Inserisci il{" "}
            <strong className="text-academy-gray-800">codice ticket</strong>{" "}
            visibile in fondo alla card del partecipante (es:{" "}
            <code className="font-mono text-academy-orange">a1b2c3d4-...</code>)
          </p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <IconSearch className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-academy-gray-400" />
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleManualValidation();
                }}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                className="w-full border border-black/[0.1] bg-white py-2.5 pr-3 pl-10 font-mono text-sm text-academy-gray-800 outline-none transition-colors focus:border-academy-orange/50"
              />
            </div>
            <button
              onClick={handleManualValidation}
              disabled={!manualInput.trim() || validating}
              className="shrink-0 bg-academy-orange px-5 text-[11px] font-bold tracking-wider text-white uppercase transition-all hover:brightness-110 disabled:opacity-50"
            >
              Verifica
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
