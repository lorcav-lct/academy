"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GradientText } from "@/components/shared/gradient-text";
import {
  formatDeadline,
  isPastDeadline,
  type Deadlines,
} from "@/lib/settings/deadlines";
import { IconArrowLeft, IconCheck, IconRefresh } from "../../_components/icons";

type Field = {
  key: keyof Deadlines;
  label: string;
  desc: string;
};

const FIELDS: Field[] = [
  {
    key: "depositPurchase",
    label: "Acquisto con caparra",
    desc: "Ultimo giorno in cui un pack è acquistabile versando solo la caparra. Dopo, resta solo il pagamento intero.",
  },
  {
    key: "depositBalance",
    label: "Saldo caparra",
    desc: "Ultimo giorno entro cui chi ha versato la caparra può saldare il pacchetto.",
  },
  {
    key: "packPurchase",
    label: "Acquisto pack",
    desc: "Ultimo giorno in cui un pack è acquistabile (anche intero). Le masterclass non hanno scadenza.",
  },
];

export default function DeadlinesPage() {
  const [draft, setDraft] = useState<Deadlines | null>(null);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/deadlines", { cache: "no-store" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Errore caricamento scadenze");
      setLoading(false);
      return;
    }
    setDraft(data.deadlines as Deadlines);
    setRole(data.role ?? "");
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function save() {
    if (!draft || role !== "admin") return;
    setSaving(true);
    setError("");
    const res = await fetch("/api/admin/deadlines", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Errore salvataggio");
      setSaving(false);
      return;
    }
    setDraft(data.deadlines as Deadlines);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
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
            Disponibilità
          </p>
          <h1 className="text-3xl font-black text-academy-gray-800 md:text-4xl">
            Scadenze <GradientText>Pack & Caparra</GradientText>
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-academy-gray-500">
            Definisci fino a quando si può acquistare un pack, comprarlo con
            caparra e saldare. Le modalità di pagamento si adattano in
            automatico a queste date.
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
          Il tuo ruolo può leggere le scadenze, ma solo un admin può
          modificarle.
        </div>
      )}

      {loading || !draft ? (
        <div className="border border-black/[0.08] bg-white p-12 text-center text-sm text-academy-gray-500">
          Caricamento scadenze...
        </div>
      ) : (
        <div className="overflow-hidden border border-black/[0.08] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <div className="divide-y divide-black/[0.06]">
            {FIELDS.map((f) => {
              const value = draft[f.key];
              const past = isPastDeadline(value);
              return (
                <div
                  key={f.key}
                  className="grid gap-4 px-5 py-5 lg:grid-cols-[1fr_220px] lg:items-center"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-black text-academy-gray-800">
                        {f.label}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold tracking-[0.18em] uppercase ${
                          past
                            ? "bg-red-500/10 text-red-700"
                            : "bg-emerald-500/10 text-emerald-700"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 ${past ? "bg-red-500" : "bg-emerald-500"}`}
                        />
                        {past ? "Scaduta" : "Attiva"}
                      </span>
                    </div>
                    <p className="mt-1.5 max-w-xl text-[12px] leading-relaxed text-academy-gray-500">
                      {f.desc}
                    </p>
                    <p className="mt-1 text-[12px] font-semibold text-academy-gray-600">
                      {formatDeadline(value)}
                    </p>
                  </div>

                  <label className="block">
                    <span className="mb-1.5 block text-[10px] font-bold tracking-[0.18em] text-academy-gray-500 uppercase">
                      Data limite
                    </span>
                    <input
                      type="date"
                      value={value}
                      onChange={(e) =>
                        setDraft((d) =>
                          d ? { ...d, [f.key]: e.target.value } : d,
                        )
                      }
                      disabled={!canEdit}
                      className="w-full border border-black/[0.1] bg-white px-3 py-2 font-mono text-sm text-academy-gray-800 outline-none transition-colors focus:border-academy-orange/50 disabled:bg-black/[0.03] disabled:text-academy-gray-400"
                    />
                  </label>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end border-t border-black/[0.06] bg-black/[0.015] px-5 py-4">
            <button
              onClick={save}
              disabled={!canEdit || saving}
              className="inline-flex min-w-[150px] items-center justify-center gap-1.5 bg-academy-orange px-5 py-2.5 text-[11px] font-black tracking-[0.16em] text-white uppercase transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:bg-black/10 disabled:text-academy-gray-400"
            >
              {saving ? (
                "..."
              ) : saved ? (
                <>
                  <IconCheck className="h-3.5 w-3.5" />
                  Salvato
                </>
              ) : (
                "Salva scadenze"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
