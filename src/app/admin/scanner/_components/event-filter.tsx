"use client";

import { getMasterclassProducts } from "@/lib/constants/packs";

export type ScannerFilter =
  | { mode: "all" }
  | { mode: "bundle" }
  | { mode: "masterclass"; slug: string | null };

const MASTERCLASSES = getMasterclassProducts()
  .filter((p) => p.slug !== "sostieni-progetto")
  .sort((a, b) => a.sortOrder - b.sortOrder);

const MODES = [
  { key: "all", label: "Tutti" },
  { key: "bundle", label: "Percorso" },
  { key: "masterclass", label: "Masterclass" },
] as const;

/** Label leggibile del filtro attivo, o null se non filtra nulla. */
export function filterLabel(filter: ScannerFilter): string | null {
  if (filter.mode === "bundle") return "Percorso Academy";
  if (filter.mode === "masterclass") {
    if (!filter.slug) return "Tutte le masterclass";
    return MASTERCLASSES.find((p) => p.slug === filter.slug)?.name ?? null;
  }
  return null;
}

/** Payload da unire al body di /api/qr/validate. */
export function filterPayload(filter: ScannerFilter) {
  if (filter.mode === "bundle") return { expectedType: "bundle" };
  if (filter.mode === "masterclass")
    return filter.slug
      ? { expectedSlug: filter.slug }
      : { expectedType: "workshop" };
  return {};
}

interface EventFilterProps {
  value: ScannerFilter;
  onChange: (filter: ScannerFilter) => void;
}

export function EventFilter({ value, onChange }: EventFilterProps) {
  function selectMode(key: (typeof MODES)[number]["key"]) {
    if (key === "masterclass") {
      onChange({ mode: "masterclass", slug: null });
    } else {
      onChange({ mode: key });
    }
  }

  return (
    <div className="border border-black/[0.08] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="flex">
        {MODES.map((mode) => {
          const isActive = value.mode === mode.key;
          return (
            <button
              key={mode.key}
              onClick={() => selectMode(mode.key)}
              aria-pressed={isActive}
              className={`flex-1 border-r border-black/[0.06] py-3 text-[11px] font-bold tracking-[0.15em] uppercase transition-colors last:border-r-0 ${
                isActive
                  ? "bg-academy-orange text-white"
                  : "text-academy-gray-500 hover:bg-black/[0.02] hover:text-academy-gray-800"
              }`}
            >
              {mode.label}
            </button>
          );
        })}
      </div>

      {value.mode === "masterclass" && (
        <div className="border-t border-black/[0.06] p-3">
          <label htmlFor="scanner-masterclass" className="sr-only">
            Masterclass da filtrare
          </label>
          <select
            id="scanner-masterclass"
            value={value.slug ?? ""}
            onChange={(e) =>
              onChange({ mode: "masterclass", slug: e.target.value || null })
            }
            className="w-full border border-black/[0.1] bg-white px-3 py-2.5 text-sm font-bold text-academy-gray-800 outline-none transition-colors focus:border-academy-orange/50"
          >
            <option value="">Tutte le masterclass</option>
            {MASTERCLASSES.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
