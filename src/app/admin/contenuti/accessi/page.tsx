"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { GradientText } from "@/components/shared/gradient-text";
import {
  IconArrowLeft,
  IconCheck,
  IconRefresh,
} from "../../_components/icons";

type AccessRule = {
  product_slug: string;
  product_type: "bundle" | "workshop";
  label: string;
  max_entries: number | null;
  active: boolean;
  updated_at: string;
};

type DraftState = Record<
  string,
  {
    maxEntries: string;
    active: boolean;
  }
>;

const TYPE_LABEL: Record<AccessRule["product_type"], string> = {
  bundle: "Pack",
  workshop: "Masterclass",
};

function formatLimit(value: number | null): string {
  if (value == null) return "Illimitato";
  return value === 1 ? "1 ingresso" : `${value} ingressi`;
}

export default function AccessRulesPage() {
  const [rules, setRules] = useState<AccessRule[]>([]);
  const [drafts, setDrafts] = useState<DraftState>({});
  const [role, setRole] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [savedSlug, setSavedSlug] = useState<string | null>(null);
  const [batchSaving, setBatchSaving] = useState<AccessRule["product_type"] | null>(
    null,
  );

  async function load() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/access-rules", { cache: "no-store" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Errore caricamento regole");
      setLoading(false);
      return;
    }

    const list = (data.rules ?? []) as AccessRule[];
    setRules(list);
    setRole(data.role ?? "");
    setDrafts(
      Object.fromEntries(
        list.map((rule) => [
          rule.product_slug,
          {
            maxEntries:
              rule.max_entries == null ? "" : rule.max_entries.toString(),
            active: rule.active,
          },
        ]),
      ),
    );
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const grouped = useMemo(
    () => ({
      bundle: rules.filter((rule) => rule.product_type === "bundle"),
      workshop: rules.filter((rule) => rule.product_type === "workshop"),
    }),
    [rules],
  );

  const totals = useMemo(() => {
    const active = rules.filter((rule) => rule.active).length;
    const limited = rules.filter((rule) => rule.max_entries != null).length;
    return { active, limited, total: rules.length };
  }, [rules]);

  function updateDraft(slug: string, patch: Partial<DraftState[string]>) {
    setDrafts((current) => ({
      ...current,
      [slug]: { ...current[slug], ...patch },
    }));
  }

  async function save(rule: AccessRule) {
    if (role !== "admin") return;
    const draft = drafts[rule.product_slug];
    if (!draft) return;

    const trimmed = draft.maxEntries.trim();
    const maxEntries = trimmed === "" ? null : Number(trimmed);
    if (maxEntries !== null && (!Number.isFinite(maxEntries) || maxEntries <= 0)) {
      setError("Ingressi deve essere un numero positivo oppure vuoto.");
      return;
    }

    setSaving(rule.product_slug);
    setError("");
    const res = await fetch("/api/admin/access-rules", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_slug: rule.product_slug,
        max_entries: maxEntries,
        active: draft.active,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Errore salvataggio");
      setSaving(null);
      return;
    }

    const saved = data.rule as AccessRule;
    setRules((current) =>
      current.map((item) =>
        item.product_slug === saved.product_slug ? saved : item,
      ),
    );
    setSavedSlug(saved.product_slug);
    setSaving(null);
    setTimeout(() => {
      setSavedSlug((current) =>
        current === saved.product_slug ? null : current,
      );
    }, 1600);
  }

  function setGroupActive(type: AccessRule["product_type"], active: boolean) {
    setDrafts((current) => {
      const next = { ...current };
      rules
        .filter((rule) => rule.product_type === type)
        .forEach((rule) => {
          next[rule.product_slug] = {
            maxEntries:
              next[rule.product_slug]?.maxEntries ??
              (rule.max_entries == null ? "" : rule.max_entries.toString()),
            active,
          };
        });
      return next;
    });
  }

  async function saveGroup(type: AccessRule["product_type"]) {
    if (role !== "admin") return;
    const groupRules = rules.filter((rule) => rule.product_type === type);
    const updates = [];

    for (const rule of groupRules) {
      const draft = drafts[rule.product_slug];
      if (!draft) continue;

      const trimmed = draft.maxEntries.trim();
      const maxEntries = trimmed === "" ? null : Number(trimmed);
      if (
        maxEntries !== null &&
        (!Number.isFinite(maxEntries) || maxEntries <= 0)
      ) {
        setError("Ingressi deve essere un numero positivo oppure vuoto.");
        return;
      }

      updates.push({
        product_slug: rule.product_slug,
        max_entries: maxEntries,
        active: draft.active,
      });
    }

    setBatchSaving(type);
    setError("");
    const res = await fetch("/api/admin/access-rules", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updates }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Errore salvataggio gruppo");
      setBatchSaving(null);
      return;
    }

    const savedRules = (data.rules ?? []) as AccessRule[];
    const bySlug = new Map(savedRules.map((rule) => [rule.product_slug, rule]));
    setRules((current) =>
      current.map((rule) => bySlug.get(rule.product_slug) ?? rule),
    );
    setSavedSlug(type);
    setBatchSaving(null);
    setTimeout(() => {
      setSavedSlug((current) => (current === type ? null : current));
    }, 1600);
  }

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
            Check-in
          </p>
          <h1 className="text-3xl font-black text-academy-gray-800 md:text-4xl">
            Accessi <GradientText>QR</GradientText>
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-academy-gray-500">
            Definisci quante scansioni valide ha ogni QR prima di risultare
            terminato. Lascia il campo vuoto per accessi illimitati.
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

      <section className="grid gap-3 md:grid-cols-3">
        <MetricCard label="Prodotti configurati" value={totals.total} />
        <MetricCard label="Regole attive" value={totals.active} accent />
        <MetricCard label="Con limite" value={totals.limited} />
      </section>

      {error && (
        <div className="border border-red-500/25 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {role && role !== "admin" && (
        <div className="border border-amber-500/30 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Il tuo ruolo puo leggere le regole, ma solo un admin puo modificarle.
        </div>
      )}

      {loading ? (
        <div className="border border-black/[0.08] bg-white p-12 text-center text-sm text-academy-gray-500">
          Caricamento regole accesso...
        </div>
      ) : (
        <div className="grid gap-6">
          <RuleGroup
            title="Pack annuali"
            description="QR stabile per tutto il percorso: ogni scan consuma un ingresso."
            type="bundle"
            rules={grouped.bundle}
            drafts={drafts}
            role={role}
            saving={saving}
            batchSaving={batchSaving}
            savedSlug={savedSlug}
            onDraft={updateDraft}
            onSave={save}
            onGroupActive={setGroupActive}
            onGroupSave={saveGroup}
          />
          <RuleGroup
            title="Masterclass"
            description="Di default 1 ingresso. Aumenta il valore se la masterclass dura piu giornate."
            type="workshop"
            rules={grouped.workshop}
            drafts={drafts}
            role={role}
            saving={saving}
            batchSaving={batchSaving}
            savedSlug={savedSlug}
            onDraft={updateDraft}
            onSave={save}
            onGroupActive={setGroupActive}
            onGroupSave={saveGroup}
          />
        </div>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div
      className={`border p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] ${
        accent
          ? "border-academy-orange/30 bg-academy-orange/[0.06]"
          : "border-black/[0.08] bg-white"
      }`}
    >
      <p className="text-[10px] font-bold tracking-[0.24em] text-academy-gray-500 uppercase">
        {label}
      </p>
      <p className="mt-2 text-3xl font-black text-academy-gray-800 tabular-nums">
        {value}
      </p>
    </div>
  );
}

function RuleGroup({
  title,
  description,
  type,
  rules,
  drafts,
  role,
  saving,
  batchSaving,
  savedSlug,
  onDraft,
  onSave,
  onGroupActive,
  onGroupSave,
}: {
  title: string;
  description: string;
  type: AccessRule["product_type"];
  rules: AccessRule[];
  drafts: DraftState;
  role: string;
  saving: string | null;
  batchSaving: AccessRule["product_type"] | null;
  savedSlug: string | null;
  onDraft: (slug: string, patch: Partial<DraftState[string]>) => void;
  onSave: (rule: AccessRule) => void;
  onGroupActive: (type: AccessRule["product_type"], active: boolean) => void;
  onGroupSave: (type: AccessRule["product_type"]) => void;
}) {
  const canEdit = role === "admin";
  const isWorkshopGroup = type === "workshop";
  const activeDrafts = rules.filter(
    (rule) => drafts[rule.product_slug]?.active ?? rule.active,
  ).length;
  const allActive = rules.length > 0 && activeDrafts === rules.length;
  const noneActive = activeDrafts === 0;
  const groupDirty = rules.some((rule) => {
    const draft = drafts[rule.product_slug] ?? {
      maxEntries: rule.max_entries == null ? "" : rule.max_entries.toString(),
      active: rule.active,
    };
    return (
      draft.active !== rule.active ||
      draft.maxEntries !==
        (rule.max_entries == null ? "" : rule.max_entries.toString())
    );
  });

  return (
    <section className="overflow-hidden border border-black/[0.08] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/[0.06] bg-black/[0.015] px-5 py-4">
        <div>
          <h2 className="text-[12px] font-black tracking-[0.24em] text-academy-gray-800 uppercase">
            {title}
          </h2>
          <p className="mt-1 text-[12px] text-academy-gray-500">
            {description}
          </p>
        </div>
        {isWorkshopGroup ? (
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 border border-black/[0.08] bg-white px-3 py-2">
              <span className="text-[10px] font-bold tracking-[0.18em] text-academy-gray-500 uppercase">
                Tutte
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={allActive}
                aria-label="Attiva o disattiva tutte le masterclass"
                onClick={() => onGroupActive(type, !allActive)}
                disabled={!canEdit}
                className={`relative inline-flex h-8 w-[82px] shrink-0 items-center border p-1 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-academy-orange/40 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-45 ${
                  allActive
                    ? "border-academy-orange bg-academy-orange text-[#111]"
                    : noneActive
                      ? "border-black/[0.12] bg-black/[0.05] text-academy-gray-500"
                      : "border-academy-orange/45 bg-academy-orange/15 text-academy-orange"
                }`}
              >
                <span
                  className={`absolute top-1 h-6 w-6 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.18)] transition-[left] duration-200 ${
                    allActive ? "left-[52px]" : "left-1"
                  }`}
                  aria-hidden
                />
                <span
                  className={`absolute left-3 text-[9px] font-black tracking-[0.16em] uppercase transition-opacity ${
                    allActive ? "opacity-100" : "opacity-0"
                  }`}
                  aria-hidden
                >
                  On
                </span>
                <span
                  className={`absolute right-2 text-[9px] font-black tracking-[0.16em] uppercase transition-opacity ${
                    allActive ? "opacity-0" : "opacity-100"
                  }`}
                  aria-hidden
                >
                  {noneActive ? "Off" : "Mix"}
                </span>
              </button>
            </div>

            <button
              onClick={() => onGroupSave(type)}
              disabled={!canEdit || !groupDirty || batchSaving === type}
              className="inline-flex min-w-[154px] items-center justify-center gap-1.5 bg-academy-orange px-4 py-2.5 text-[10px] font-black tracking-[0.16em] text-white uppercase transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:bg-black/10 disabled:text-academy-gray-400"
            >
              {batchSaving === type ? (
                "..."
              ) : savedSlug === type ? (
                <>
                  <IconCheck className="h-3.5 w-3.5" />
                  Salvate
                </>
              ) : (
                "Salva masterclass"
              )}
            </button>
          </div>
        ) : (
          <span className="text-[11px] font-bold tracking-[0.18em] text-academy-orange uppercase">
            {rules.length} regole
          </span>
        )}
      </div>

      <div className="divide-y divide-black/[0.06]">
        {rules.map((rule) => {
          const draft = drafts[rule.product_slug] ?? {
            maxEntries: "",
            active: rule.active,
          };
          const dirty =
            draft.active !== rule.active ||
            draft.maxEntries !==
              (rule.max_entries == null ? "" : rule.max_entries.toString());
          const canEdit = role === "admin";

          return (
            <div
              key={rule.product_slug}
              className="grid gap-4 px-5 py-4 lg:grid-cols-[1fr_180px_140px_130px] lg:items-center"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold tracking-[0.18em] uppercase ${
                      rule.active
                        ? "bg-emerald-500/10 text-emerald-700"
                        : "bg-black/[0.04] text-academy-gray-500"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 ${
                        rule.active ? "bg-emerald-500" : "bg-academy-gray-400"
                      }`}
                    />
                    {rule.active ? "Attivo" : "Disattivato"}
                  </span>
                  <span className="text-[10px] font-bold tracking-[0.18em] text-academy-gray-400 uppercase">
                    {TYPE_LABEL[rule.product_type]}
                  </span>
                </div>
                <h3 className="mt-2 truncate text-sm font-black text-academy-gray-800">
                  {rule.label}
                </h3>
                <p className="mt-1 font-mono text-[11px] text-academy-gray-500">
                  {rule.product_slug}
                </p>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-[10px] font-bold tracking-[0.18em] text-academy-gray-500 uppercase">
                  Ingressi
                </span>
                <input
                  type="number"
                  min={1}
                  value={draft.maxEntries}
                  onChange={(e) =>
                    onDraft(rule.product_slug, { maxEntries: e.target.value })
                  }
                  disabled={!canEdit}
                  placeholder="Illimitato"
                  className="w-full border border-black/[0.1] bg-white px-3 py-2 font-mono text-sm text-academy-gray-800 outline-none transition-colors focus:border-academy-orange/50 disabled:bg-black/[0.03] disabled:text-academy-gray-400"
                />
              </label>

              <div className="flex items-center justify-between gap-3 lg:justify-start">
                <span className="text-[10px] font-bold tracking-[0.18em] text-academy-gray-500 uppercase">
                  Stato
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={draft.active}
                  aria-label={`${draft.active ? "Disattiva" : "Attiva"} ${rule.label}`}
                  onClick={() =>
                    onDraft(rule.product_slug, { active: !draft.active })
                  }
                  disabled={!canEdit}
                  className={`group relative inline-flex h-8 w-[76px] shrink-0 items-center border p-1 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-academy-orange/40 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-45 ${
                    draft.active
                      ? "border-academy-orange bg-academy-orange text-[#111]"
                      : "border-black/[0.12] bg-black/[0.05] text-academy-gray-500"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-6 w-6 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.18)] transition-[left] duration-200 ${
                      draft.active ? "left-[46px]" : "left-1"
                    }`}
                    aria-hidden
                  />
                  <span
                    className={`absolute text-[9px] font-black tracking-[0.16em] uppercase transition-opacity ${
                      draft.active
                        ? "left-3 opacity-100"
                        : "left-3 opacity-0"
                    }`}
                    aria-hidden
                  >
                    On
                  </span>
                  <span
                    className={`absolute right-2 text-[9px] font-black tracking-[0.16em] uppercase transition-opacity ${
                      draft.active ? "opacity-0" : "opacity-100"
                    }`}
                    aria-hidden
                  >
                    Off
                  </span>
                </button>
              </div>

              <div className="flex items-center justify-between gap-3 lg:justify-end">
                <span className="text-[11px] font-bold text-academy-gray-500">
                  {formatLimit(rule.max_entries)}
                </span>
                <button
                  onClick={() => onSave(rule)}
                  disabled={!canEdit || !dirty || saving === rule.product_slug}
                  className="inline-flex min-w-[96px] items-center justify-center gap-1.5 bg-academy-orange px-3 py-2 text-[10px] font-black tracking-[0.16em] text-white uppercase transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:bg-black/10 disabled:text-academy-gray-400"
                >
                  {saving === rule.product_slug ? (
                    "..."
                  ) : savedSlug === rule.product_slug ? (
                    <>
                      <IconCheck className="h-3.5 w-3.5" />
                      Salvato
                    </>
                  ) : (
                    "Salva"
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
