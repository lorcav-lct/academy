"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GradientText } from "@/components/shared/gradient-text";
import { ADMIN_TOGGLEABLE_WORKSHOPS } from "@/lib/constants/workshops";
import type { MasterclassVisibilityMap } from "@/lib/settings/masterclass-visibility";
import { IconArrowLeft, IconCheck, IconRefresh } from "../../_components/icons";

export default function MasterclassVisibilityPage() {
  const [visibility, setVisibility] = useState<MasterclassVisibilityMap>({});
  const [salesMode, setSalesMode] = useState(false);
  const [salesModeSaving, setSalesModeSaving] = useState(false);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/masterclasses", { cache: "no-store" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Errore caricamento visibilità");
      setLoading(false);
      return;
    }
    setVisibility(data.visibility ?? {});
    setSalesMode(data.salesMode ?? false);
    setRole(data.role ?? "");
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function isVisible(slug: string, hiddenByDefault: boolean): boolean {
    return visibility[slug] ?? !hiddenByDefault;
  }

  function toggle(slug: string, hiddenByDefault: boolean) {
    const current = isVisible(slug, hiddenByDefault);
    setVisibility((prev) => ({ ...prev, [slug]: !current }));
  }

  async function save() {
    if (role !== "admin") return;
    setSaving(true);
    setError("");
    const res = await fetch("/api/admin/masterclasses", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visibility }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Errore salvataggio");
      setSaving(false);
      return;
    }
    setVisibility(data.visibility ?? {});
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  async function toggleSalesMode() {
    if (role !== "admin" || salesModeSaving) return;
    const next = !salesMode;
    setSalesModeSaving(true);
    setError("");
    const res = await fetch("/api/admin/masterclasses", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ salesMode: next }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Errore salvataggio modalità sconti");
      setSalesModeSaving(false);
      return;
    }
    setSalesMode(data.salesMode ?? next);
    setSalesModeSaving(false);
  }

  const canEdit = role === "admin";

  return (
    <div className="space-y-6 lg:space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link
            href="/admin/contenuti"
            className="mb-4 inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.22em] text-academy-gray-500 uppercase transition-colors hover:text-academy-orange"
          >
            <IconArrowLeft className="h-3.5 w-3.5" />
            Contenuti
          </Link>
          <p className="mb-2 text-[11px] font-bold tracking-[0.3em] text-academy-orange uppercase">
            Visibilità
          </p>
          <h1 className="text-3xl font-black text-academy-gray-800 md:text-4xl">
            Attivazione <GradientText>Masterclass</GradientText>
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-academy-gray-500">
            Attiva o nascondi le masterclass sulla piattaforma. Le masterclass
            disattivate non compaiono nel catalogo né nei selettori pack.
          </p>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-2 border border-black/[0.08] bg-white px-4 py-2.5 text-[11px] font-bold tracking-[0.18em] text-academy-gray-600 uppercase transition-all hover:border-academy-orange/35 hover:text-academy-orange"
        >
          <IconRefresh className="h-3.5 w-3.5" />
          Aggiorna
        </button>
      </header>

      {error && (
        <div className="border border-red-500/25 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {role && role !== "admin" && (
        <div className="border border-amber-500/30 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Il tuo ruolo può leggere la configurazione, ma solo un admin può
          modificarla.
        </div>
      )}

      {loading ? (
        <div className="border border-black/[0.08] bg-white p-12 text-center text-sm text-academy-gray-500">
          Caricamento...
        </div>
      ) : (
        <>
          {/* Modalità Sconti — conversion-focused /masterclass layout */}
          <div
            className={`flex items-center justify-between gap-4 border px-5 py-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] ${
              salesMode
                ? "border-academy-orange/40 bg-academy-orange/[0.04]"
                : "border-black/[0.08] bg-white"
            }`}
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-black text-academy-gray-800">
                  Modalità Sconti
                </h3>
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold tracking-[0.18em] uppercase ${
                    salesMode
                      ? "bg-academy-orange/15 text-academy-orange"
                      : "bg-black/[0.06] text-academy-gray-500"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${salesMode ? "bg-academy-orange" : "bg-academy-gray-400"}`}
                  />
                  {salesMode ? "Attiva" : "Disattiva"}
                </span>
              </div>
              <p className="mt-1 text-[12px] text-academy-gray-500">
                Trasforma la pagina /masterclass in modalità conversione:
                countdown e prezzo promo nell&apos;hero, prezzi in massima
                evidenza con CTA &quot;Acquista ora&quot; sulle card e popup di
                urgenza all&apos;exit intent. Si applica al meglio con una promo
                automatica masterclass attiva (countdown e prezzi barrati).
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={salesMode}
              aria-label={
                salesMode
                  ? "Disattiva modalità sconti"
                  : "Attiva modalità sconti"
              }
              onClick={toggleSalesMode}
              disabled={!canEdit || salesModeSaving}
              style={{
                backgroundColor: salesMode ? "#F09226" : "rgba(0,0,0,0.12)",
              }}
              className="relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span
                style={{
                  transform: salesMode ? "translateX(20px)" : "translateX(2px)",
                }}
                className="absolute top-[2px] left-0 block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200"
              />
            </button>
          </div>

          <div className="overflow-hidden border border-black/[0.08] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            <div className="divide-y divide-black/[0.06]">
              {ADMIN_TOGGLEABLE_WORKSHOPS.map((w) => {
                const on = isVisible(w.slug, w.hidden ?? false);
                return (
                  <div
                    key={w.slug}
                    className="flex items-center justify-between gap-4 px-5 py-5"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-black text-academy-gray-800">
                          {w.title}
                        </h3>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold tracking-[0.18em] uppercase ${
                            on
                              ? "bg-emerald-500/10 text-emerald-700"
                              : "bg-black/[0.06] text-academy-gray-500"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${on ? "bg-emerald-500" : "bg-academy-gray-400"}`}
                          />
                          {on ? "Visibile" : "Nascosta"}
                        </span>
                      </div>
                      <p className="mt-1 text-[12px] text-academy-gray-500">
                        {w.subtitle}
                      </p>
                      <p className="mt-0.5 text-[11px] font-semibold text-academy-gray-400">
                        {w.trainerLabel} · {w.date}
                      </p>
                    </div>

                    {/* Toggle switch */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={on}
                      aria-label={
                        on ? `Nascondi ${w.title}` : `Mostra ${w.title}`
                      }
                      onClick={() =>
                        canEdit && toggle(w.slug, w.hidden ?? false)
                      }
                      disabled={!canEdit}
                      style={{
                        backgroundColor: on ? "#F09226" : "rgba(0,0,0,0.12)",
                      }}
                      className="relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 focus:outline-none disabled:cursor-not-allowed"
                    >
                      <span
                        style={{
                          transform: on
                            ? "translateX(20px)"
                            : "translateX(2px)",
                        }}
                        className="absolute top-[2px] left-0 block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200"
                      />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end border-t border-black/[0.06] bg-black/[0.015] px-5 py-4">
              <button
                onClick={save}
                disabled={!canEdit || saving}
                className="inline-flex min-w-[160px] items-center justify-center gap-1.5 bg-academy-orange px-5 py-2.5 text-[11px] font-black tracking-[0.16em] text-white uppercase transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:bg-black/10 disabled:text-academy-gray-400"
              >
                {saving ? (
                  "..."
                ) : saved ? (
                  <>
                    <IconCheck className="h-3.5 w-3.5" />
                    Salvato
                  </>
                ) : (
                  "Salva visibilità"
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
