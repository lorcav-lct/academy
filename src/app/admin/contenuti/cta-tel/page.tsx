"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const FIELDS = [
  {
    key: "cta_phone",
    label: "Numero di telefono",
    placeholder: "+390521607870",
    type: "tel",
  },
  {
    key: "cta_label",
    label: "Testo CTA",
    placeholder: "Chiamaci ora",
    type: "text",
  },
  {
    key: "cta_sublabel",
    label: "Sottotitolo",
    placeholder: "Siamo qui per aiutarti",
    type: "text",
  },
] as const;

type FieldKey = (typeof FIELDS)[number]["key"];
type Settings = Record<FieldKey, string>;

const DEFAULTS: Settings = {
  cta_phone: "+390521607870",
  cta_label: "Chiamaci ora",
  cta_sublabel: "Siamo qui per aiutarti",
};

export default function AdminCtaTelPage() {
  const [values, setValues] = useState<Settings>({ ...DEFAULTS });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data, error: err } = await supabase
        .from("site_settings")
        .select("key, value")
        .in(
          "key",
          FIELDS.map((f) => f.key),
        );
      if (err) {
        setError(err.message);
        return;
      }
      if (data) {
        const map = Object.fromEntries(
          data.map((r) => [r.key, r.value]),
        ) as Partial<Settings>;
        setValues((prev) => ({ ...prev, ...map }));
      }
    })();
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError(null);
    const supabase = createClient();
    const rows = FIELDS.map((f) => ({
      key: f.key,
      value: values[f.key],
      updated_at: new Date().toISOString(),
    }));
    const { error: err } = await supabase
      .from("site_settings")
      .upsert(rows, { onConflict: "key" });
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <section className="min-h-screen pt-32 pb-20">
      <div className="mx-auto max-w-xl px-6">
        <div className="mb-10">
          <Link
            href="/admin/contenuti"
            className="text-[0.62rem] text-academy-gray-500 hover:text-academy-orange uppercase tracking-[0.2em] mb-3 block"
          >
            ← Contenuti
          </Link>
          <h1 className="text-3xl font-black text-white">
            CTA <span className="text-academy-orange">Telefonica</span>
          </h1>
          <p className="text-sm text-academy-gray-400 mt-1">
            Modifica il widget di contatto flottante visibile in basso a destra
            su tutto il sito.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-sm border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Preview */}
        <div className="mb-8 rounded-sm border border-academy-orange/15 bg-academy-orange/[0.03] p-5">
          <p className="mb-3 text-[0.65rem] font-bold uppercase tracking-[0.25em] text-academy-orange/60">
            Anteprima
          </p>
          <div
            className="inline-flex w-[220px] flex-col overflow-hidden rounded-sm border border-academy-orange/28"
            style={{ background: "rgba(26,26,26,0.97)" }}
          >
            <div
              className="h-0.5 w-full"
              style={{
                background:
                  "linear-gradient(90deg, #F09226, rgba(240,146,38,0.5))",
              }}
            />
            <div className="flex items-center gap-3 p-3 pb-2">
              <div
                className="flex h-9 w-9 shrink-0 items-end justify-center overflow-hidden rounded-full"
                style={{
                  background: "rgba(240,146,38,0.12)",
                  border: "1.5px solid rgba(240,146,38,0.3)",
                }}
              >
                <svg
                  viewBox="0 0 40 44"
                  width="28"
                  height="32"
                  fill="none"
                  style={{ marginBottom: "-2px" }}
                >
                  <circle cx="20" cy="13" r="7" fill="rgba(240,146,38,0.55)" />
                  <path
                    d="M4 40c0-8.837 7.163-16 16-16s16 7.163 16 16"
                    fill="rgba(240,146,38,0.4)"
                  />
                </svg>
              </div>
              <div>
                <p className="text-[0.78rem] font-black text-white">
                  {values.cta_label || DEFAULTS.cta_label}
                </p>
                <p className="text-[0.62rem] text-white/40">
                  {values.cta_sublabel || DEFAULTS.cta_sublabel}
                </p>
              </div>
            </div>
            <div
              className="flex items-center justify-between px-3 py-2"
              style={{
                background: "rgba(240,146,38,0.12)",
                borderTop: "1px solid rgba(240,146,38,0.14)",
              }}
            >
              <span className="text-[0.68rem] font-black text-academy-orange">
                {values.cta_phone || DEFAULTS.cta_phone}
              </span>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-5">
          {FIELDS.map((field) => (
            <div key={field.key}>
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-academy-gray-400">
                {field.label}
              </label>
              <input
                type={field.type}
                value={values[field.key]}
                placeholder={field.placeholder}
                onChange={(e) =>
                  setValues((v) => ({ ...v, [field.key]: e.target.value }))
                }
                className="w-full rounded-sm border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-colors focus:border-academy-orange/50 focus:bg-white/[0.07]"
              />
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3 text-sm font-black tracking-[0.18em] uppercase transition-all disabled:opacity-50"
            style={{ background: "#F09226", color: "#111111" }}
          >
            {saving ? "Salvataggio…" : "Salva modifiche"}
          </button>
          {saved && (
            <span className="text-sm font-semibold text-emerald-400">
              ✓ Salvato
            </span>
          )}
        </div>

        <p className="mt-4 text-[0.65rem] text-academy-gray-600">
          Le modifiche sono visibili immediatamente sul sito. Il widget appare
          dopo 1.8 secondi dal caricamento della pagina.
        </p>
      </div>
    </section>
  );
}
