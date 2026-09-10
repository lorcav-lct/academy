"use client";

import { IconCheck, IconClose } from "../../_components/icons";

export interface ScanResult {
  valid: boolean;
  error?: string;
  /** true = il ticket esiste ma appartiene a un altro evento del filtro attivo */
  mismatch?: boolean;
  ticket?: {
    id: string;
    userName: string;
    courseName: string;
    eventDate: string;
    orderId: string;
    usedEntries?: number;
    maxEntries?: number | null;
    remainingEntries?: number | null;
  };
}

interface ScanResultCardProps {
  result: ScanResult;
  /** Filtro attivo al momento della scansione, per il messaggio di mismatch. */
  filterLabel: string | null;
  onForce: () => void;
}

export function ScanResultCard({
  result,
  filterLabel,
  onForce,
}: ScanResultCardProps) {
  const tone = result.valid
    ? "border-emerald-500 bg-emerald-50"
    : result.mismatch
      ? "border-amber-500 bg-amber-50"
      : "border-red-500 bg-red-50";

  return (
    <div
      className={`relative overflow-hidden border-2 p-8 text-center shadow-[0_4px_24px_rgba(0,0,0,0.06)] ${tone}`}
    >
      {result.valid ? (
        <>
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center bg-emerald-500 text-white">
            <IconCheck className="h-10 w-10" strokeWidth={3} />
          </div>
          <h2 className="mb-1 text-3xl font-black text-emerald-700">Valido</h2>
          <p className="mb-5 text-[12px] font-bold tracking-[0.2em] text-emerald-700/80 uppercase">
            Check-in autorizzato
          </p>
          <div className="mx-auto max-w-xs space-y-2 border border-emerald-500/20 bg-white p-4">
            <Field label="Nome" value={result.ticket?.userName || "—"} />
            <Field label="Corso" value={result.ticket?.courseName || "—"} />
            {typeof result.ticket?.usedEntries === "number" && (
              <Field
                label="Ingressi"
                value={formatEntries(
                  result.ticket.usedEntries,
                  result.ticket.maxEntries,
                )}
              />
            )}
            {typeof result.ticket?.remainingEntries === "number" && (
              <Field
                label="Residui"
                value={result.ticket.remainingEntries.toString()}
              />
            )}
            {result.ticket?.eventDate && (
              <Field label="Data" value={result.ticket.eventDate} />
            )}
          </div>
        </>
      ) : result.mismatch ? (
        <>
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center bg-amber-500 text-3xl font-black text-white">
            !
          </div>
          <h2 className="mb-1 text-3xl font-black text-amber-700">
            Evento diverso
          </h2>
          <p className="mb-5 text-[12px] font-bold tracking-[0.2em] text-amber-700/80 uppercase">
            Nessun ingresso registrato
          </p>
          <p className="text-sm text-amber-800">
            {result.error || "Il ticket non corrisponde al filtro attivo"}
          </p>
          <div className="mx-auto mt-5 max-w-xs space-y-2 border border-amber-500/20 bg-white p-4">
            <Field label="Nome" value={result.ticket?.userName || "—"} />
            <Field
              label="Ticket per"
              value={result.ticket?.courseName || "—"}
            />
            {filterLabel && <Field label="Filtro" value={filterLabel} />}
          </div>
          <button
            onClick={onForce}
            className="mt-5 w-full bg-amber-600 py-3 text-[12px] font-bold tracking-wider text-white uppercase transition-all hover:brightness-110"
          >
            Valida comunque
          </button>
        </>
      ) : (
        <>
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center bg-red-500 text-white">
            <IconClose className="h-10 w-10" strokeWidth={3} />
          </div>
          <h2 className="mb-1 text-3xl font-black text-red-700">Non valido</h2>
          <p className="mb-5 text-[12px] font-bold tracking-[0.2em] text-red-700/80 uppercase">
            Accesso negato
          </p>
          <p className="text-sm text-red-700">
            {result.error || "Codice non riconosciuto"}
          </p>
          {typeof result.ticket?.usedEntries === "number" && (
            <div className="mx-auto mt-5 max-w-xs space-y-2 border border-red-500/20 bg-white p-4">
              <Field label="Nome" value={result.ticket.userName || "—"} />
              <Field label="Corso" value={result.ticket.courseName || "—"} />
              <Field
                label="Ingressi"
                value={formatEntries(
                  result.ticket.usedEntries,
                  result.ticket.maxEntries,
                )}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function formatEntries(used: number, max: number | null | undefined): string {
  return max == null ? `${used} / illimitati` : `${used} / ${max}`;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-[10px] font-bold tracking-[0.2em] text-academy-gray-500 uppercase">
        {label}
      </span>
      <span className="truncate text-right text-sm font-bold text-academy-gray-800">
        {value}
      </span>
    </div>
  );
}
