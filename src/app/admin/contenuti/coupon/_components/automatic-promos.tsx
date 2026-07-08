"use client";

/**
 * Pannello "Promo automatiche" — sconto applicato in automatico al checkout in
 * base a categoria/prodotto, senza codice. Comportamento invariato rispetto alla
 * versione precedente della pagina (sync con Stripe via /api/admin/promos).
 */
import { useEffect, useMemo, useState } from "react";
import { PRODUCTS } from "@/lib/constants/packs";
import {
  IconClose,
  IconEdit,
  IconPlus,
  IconTrash,
  IconCheck,
} from "../../../_components/icons";
import type {
  PromoDiscountType,
  PromoProductType,
  PromoRow,
} from "@/lib/promos/types";

type EditableFields = {
  product_type: PromoProductType;
  /** "all" → category-wide; oppure uno slug specifico */
  scope: "all" | string;
  active: boolean;
  name: string;
  headline: string;
  subtitle: string;
  discount_type: PromoDiscountType;
  discount_value_eur: number | "";
  starts_at: string;
  ends_at: string;
  max_redemptions: number | "";
};

const emptyForm = (): EditableFields => ({
  product_type: "pack",
  scope: "all",
  active: true,
  name: "",
  headline: "",
  subtitle: "",
  discount_type: "amount",
  discount_value_eur: "",
  starts_at: "",
  ends_at: "",
  max_redemptions: "",
});

function rowToForm(row: PromoRow): EditableFields {
  return {
    product_type: row.product_type,
    scope: row.slug ?? "all",
    active: row.active,
    name: row.name,
    headline: row.headline ?? "",
    subtitle: row.subtitle ?? "",
    discount_type: row.discount_type,
    discount_value_eur:
      row.discount_type === "amount"
        ? Math.round(row.discount_value / 100)
        : row.discount_value,
    starts_at: row.starts_at ? row.starts_at.slice(0, 16) : "",
    ends_at: row.ends_at ? row.ends_at.slice(0, 16) : "",
    max_redemptions: row.max_redemptions ?? "",
  };
}

function formToPayload(form: EditableFields) {
  const value =
    typeof form.discount_value_eur === "number" ? form.discount_value_eur : 0;
  return {
    product_type: form.product_type,
    slug: form.scope === "all" ? null : form.scope,
    active: form.active,
    name: form.name,
    headline: form.headline || null,
    subtitle: form.subtitle || null,
    discount_type: form.discount_type,
    discount_value:
      form.discount_type === "amount" ? Math.round(value * 100) : value,
    starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
    ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
    max_redemptions:
      typeof form.max_redemptions === "number" && form.max_redemptions > 0
        ? form.max_redemptions
        : null,
  };
}

const PACK_OPTIONS = PRODUCTS.filter((p) => p.type === "bundle").map((p) => ({
  slug: p.slug,
  label: `Pack ${p.name}`,
}));
const MASTERCLASS_OPTIONS = PRODUCTS.filter((p) => p.type === "workshop").map(
  (p) => ({ slug: p.slug, label: p.name }),
);

function getProductLabel(
  product_type: PromoProductType,
  slug: string | null,
): string {
  if (product_type === "fipe") return "Personal Trainer FIPE";
  if (!slug) {
    return product_type === "pack" ? "Tutti i Pack" : "Tutte le Masterclass";
  }
  const opts = product_type === "pack" ? PACK_OPTIONS : MASTERCLASS_OPTIONS;
  return opts.find((o) => o.slug === slug)?.label ?? slug;
}

function formatEUR(cents: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const PRODUCT_TYPE_LABEL: Record<PromoProductType, string> = {
  pack: "Pack",
  masterclass: "Masterclass",
  fipe: "FIPE",
};

const inputClass =
  "w-full border border-black/[0.12] bg-white px-3 py-2.5 text-sm text-academy-gray-800 placeholder:text-academy-gray-400 focus:border-academy-orange focus:outline-none";
const selectClass = `${inputClass} appearance-none`;

export function AutomaticPromosPanel() {
  const [promos, setPromos] = useState<PromoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<EditableFields | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/promos", { cache: "no-store" });
    const data = await res.json();
    if (data.promos) setPromos(data.promos);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function startCreate() {
    setEditingId(null);
    setEditing(emptyForm());
    setError(null);
  }

  function startEdit(row: PromoRow) {
    setEditingId(row.id);
    setEditing(rowToForm(row));
    setError(null);
  }

  function cancel() {
    setEditing(null);
    setEditingId(null);
    setError(null);
  }

  async function save() {
    if (!editing) return;
    setSaving(true);
    setError(null);

    const payload = formToPayload(editing);
    const url = editingId
      ? `/api/admin/promos/${editingId}`
      : "/api/admin/promos";
    const method = editingId ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Errore sconosciuto");
        setSaving(false);
        return;
      }
      await load();
      cancel();
    } catch {
      setError("Errore di connessione");
    } finally {
      setSaving(false);
    }
  }

  async function remove(row: PromoRow) {
    if (
      !confirm(
        `Eliminare la promo "${row.name}"? Il coupon Stripe verrà archiviato.`,
      )
    )
      return;
    const res = await fetch(`/api/admin/promos/${row.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setPromos((prev) => prev.filter((p) => p.id !== row.id));
    } else {
      const data = await res.json();
      alert(`Errore: ${data?.error ?? "sconosciuto"}`);
    }
  }

  async function toggleActive(row: PromoRow) {
    const res = await fetch(`/api/admin/promos/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !row.active }),
    });
    if (res.ok) {
      await load();
    } else {
      const data = await res.json();
      alert(`Errore: ${data?.error ?? "sconosciuto"}`);
    }
  }

  const grouped = useMemo(() => {
    const packs = promos.filter((p) => p.product_type === "pack");
    const mc = promos.filter((p) => p.product_type === "masterclass");
    const fipe = promos.filter((p) => p.product_type === "fipe");
    return { packs, mc, fipe };
  }, [promos]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <p className="max-w-xl text-sm text-academy-gray-500">
          Sconti applicati <strong>in automatico</strong> al checkout su tutti i
          pack o tutte le masterclass (o su un singolo prodotto). Nessun codice
          da digitare. Sync automatico con Stripe.
        </p>
        <button
          onClick={startCreate}
          className="inline-flex items-center gap-2 bg-academy-orange px-5 py-2.5 text-[12px] font-bold tracking-wider text-white uppercase transition-opacity hover:opacity-90"
        >
          <IconPlus className="h-4 w-4" />
          Nuova promo
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-academy-gray-500">Caricamento…</p>
      ) : promos.length === 0 ? (
        <EmptyState onCreate={startCreate} />
      ) : (
        <div className="space-y-6">
          {grouped.packs.length > 0 && (
            <PromoGroup
              title="Pack"
              promos={grouped.packs}
              onEdit={startEdit}
              onToggle={toggleActive}
              onDelete={remove}
            />
          )}
          {grouped.mc.length > 0 && (
            <PromoGroup
              title="Masterclass"
              promos={grouped.mc}
              onEdit={startEdit}
              onToggle={toggleActive}
              onDelete={remove}
            />
          )}
          {grouped.fipe.length > 0 && (
            <PromoGroup
              title="FIPE"
              promos={grouped.fipe}
              onEdit={startEdit}
              onToggle={toggleActive}
              onDelete={remove}
            />
          )}
        </div>
      )}

      {/* Modal */}
      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-md"
          onClick={cancel}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-black/[0.06] bg-white px-6 py-4">
              <h2 className="text-lg font-black text-academy-gray-800">
                {editingId ? "Modifica promo" : "Nuova promo"}
              </h2>
              <button
                onClick={cancel}
                className="text-academy-gray-500 hover:text-academy-gray-800"
                aria-label="Chiudi"
              >
                <IconClose className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 p-6">
              {/* Categoria target */}
              <Field label="Categoria">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {(["pack", "masterclass", "fipe"] as const).map((cat) => {
                    const selected = editing.product_type === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() =>
                          setEditing({
                            ...editing,
                            product_type: cat,
                            scope: "all", // reset scope quando cambi categoria
                          })
                        }
                        className={`flex flex-col items-start gap-1 border px-4 py-3 text-left transition-all ${
                          selected
                            ? "border-academy-orange bg-academy-orange/10"
                            : "border-black/[0.12] bg-white hover:border-black/30"
                        }`}
                      >
                        <span
                          className={`text-[10px] font-bold tracking-[0.2em] uppercase ${
                            selected
                              ? "text-academy-orange"
                              : "text-academy-gray-500"
                          }`}
                        >
                          {selected ? "✓ Selezionato" : "Categoria"}
                        </span>
                        <span className="text-sm font-bold text-academy-gray-800">
                          {PRODUCT_TYPE_LABEL[cat]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </Field>

              {/* Ambito: tutti vs singolo prodotto — non applicabile a FIPE
                  (prodotto singolo), la promo copre l'unico corso FIPE. */}
              {editing.product_type !== "fipe" && (
                <Field label="Ambito">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setEditing({ ...editing, scope: "all" })}
                      className={`flex flex-col items-start gap-1 border px-4 py-3 text-left transition-all ${
                        editing.scope === "all"
                          ? "border-academy-orange bg-academy-orange/10"
                          : "border-black/[0.12] bg-white hover:border-black/30"
                      }`}
                    >
                      <span
                        className={`text-[10px] font-bold tracking-[0.2em] uppercase ${
                          editing.scope === "all"
                            ? "text-academy-orange"
                            : "text-academy-gray-500"
                        }`}
                      >
                        {editing.scope === "all" ? "✓ Selezionato" : "Opzione"}
                      </span>
                      <span className="text-sm font-bold text-academy-gray-800">
                        {editing.product_type === "pack"
                          ? "Tutti i Pack"
                          : "Tutte le Masterclass"}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        // Se passiamo a "singolo" ma scope è "all", pre-seleziona il primo
                        const opts =
                          editing.product_type === "pack"
                            ? PACK_OPTIONS
                            : MASTERCLASS_OPTIONS;
                        const next =
                          editing.scope === "all"
                            ? (opts[0]?.slug ?? "all")
                            : editing.scope;
                        setEditing({ ...editing, scope: next });
                      }}
                      className={`flex flex-col items-start gap-1 border px-4 py-3 text-left transition-all ${
                        editing.scope !== "all"
                          ? "border-academy-orange bg-academy-orange/10"
                          : "border-black/[0.12] bg-white hover:border-black/30"
                      }`}
                    >
                      <span
                        className={`text-[10px] font-bold tracking-[0.2em] uppercase ${
                          editing.scope !== "all"
                            ? "text-academy-orange"
                            : "text-academy-gray-500"
                        }`}
                      >
                        {editing.scope !== "all" ? "✓ Selezionato" : "Opzione"}
                      </span>
                      <span className="text-sm font-bold text-academy-gray-800">
                        Solo un{" "}
                        {editing.product_type === "pack"
                          ? "Pack specifico"
                          : "Masterclass specifica"}
                      </span>
                    </button>
                  </div>
                  {editing.scope !== "all" && (
                    <select
                      value={editing.scope}
                      onChange={(e) =>
                        setEditing({ ...editing, scope: e.target.value })
                      }
                      className={`${selectClass} mt-2`}
                    >
                      {(editing.product_type === "pack"
                        ? PACK_OPTIONS
                        : MASTERCLASS_OPTIONS
                      ).map((opt) => (
                        <option key={opt.slug} value={opt.slug}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  )}
                </Field>
              )}

              {/* Name */}
              <Field label="Nome promo (mostrato in badge)">
                <input
                  value={editing.name}
                  onChange={(e) =>
                    setEditing({ ...editing, name: e.target.value })
                  }
                  placeholder="es. LANCIO PACK"
                  className={inputClass}
                />
              </Field>

              {/* Headline + subtitle */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Headline (opzionale)">
                  <input
                    value={editing.headline}
                    onChange={(e) =>
                      setEditing({ ...editing, headline: e.target.value })
                    }
                    placeholder="es. Sconto di lancio attivo"
                    className={inputClass}
                  />
                </Field>
                <Field label="Sottotitolo (opzionale)">
                  <input
                    value={editing.subtitle}
                    onChange={(e) =>
                      setEditing({ ...editing, subtitle: e.target.value })
                    }
                    placeholder="es. fino al 30 giugno"
                    className={inputClass}
                  />
                </Field>
              </div>

              {/* Discount type + value */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Tipo sconto">
                  <select
                    value={editing.discount_type}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        discount_type: e.target.value as PromoDiscountType,
                      })
                    }
                    className={selectClass}
                  >
                    <option value="amount">Importo fisso (€)</option>
                    <option value="percent">Percentuale (%)</option>
                  </select>
                </Field>
                <Field
                  label={
                    editing.discount_type === "amount"
                      ? "Sconto in €"
                      : "Sconto %"
                  }
                >
                  <input
                    type="number"
                    min={0}
                    max={editing.discount_type === "percent" ? 100 : undefined}
                    value={editing.discount_value_eur}
                    onChange={(e) => {
                      const v = e.target.value;
                      setEditing({
                        ...editing,
                        discount_value_eur: v === "" ? "" : Number(v),
                      });
                    }}
                    placeholder={
                      editing.discount_type === "amount" ? "800" : "15"
                    }
                    className={inputClass}
                  />
                </Field>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Inizio (opzionale)">
                  <input
                    type="datetime-local"
                    value={editing.starts_at}
                    onChange={(e) =>
                      setEditing({ ...editing, starts_at: e.target.value })
                    }
                    className={inputClass}
                  />
                </Field>
                <Field label="Scadenza (opzionale)">
                  <input
                    type="datetime-local"
                    value={editing.ends_at}
                    onChange={(e) =>
                      setEditing({ ...editing, ends_at: e.target.value })
                    }
                    className={inputClass}
                  />
                </Field>
              </div>

              {/* Max redemptions */}
              <Field label="Massimo utilizzi (opzionale)">
                <input
                  type="number"
                  min={0}
                  value={editing.max_redemptions}
                  onChange={(e) => {
                    const v = e.target.value;
                    setEditing({
                      ...editing,
                      max_redemptions: v === "" ? "" : Number(v),
                    });
                  }}
                  placeholder="es. 50"
                  className={inputClass}
                />
              </Field>

              {/* Active toggle */}
              <label className="flex items-center gap-3 border border-black/[0.08] bg-academy-gray-100/40 p-3">
                <input
                  type="checkbox"
                  checked={editing.active}
                  onChange={(e) =>
                    setEditing({ ...editing, active: e.target.checked })
                  }
                  className="h-4 w-4 accent-academy-orange"
                />
                <div className="flex-1">
                  <p className="text-sm font-bold text-academy-gray-800">
                    Promo attiva
                  </p>
                  <p className="text-[11px] text-academy-gray-500">
                    Se attiva, viene applicata automaticamente al checkout e
                    mostrata sul sito. Sostituisce eventuali altre promo attive
                    sulla stessa categoria.
                  </p>
                </div>
              </label>

              {error && (
                <div className="border border-red-500/30 bg-red-500/5 px-4 py-3 text-[13px] text-red-700">
                  {error}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-end gap-2 border-t border-black/[0.06] pt-4">
                <button
                  onClick={cancel}
                  className="border border-black/[0.12] bg-white px-4 py-2.5 text-[12px] font-bold tracking-wider text-academy-gray-700 uppercase hover:border-black/30"
                >
                  Annulla
                </button>
                <button
                  onClick={save}
                  disabled={saving}
                  className="inline-flex items-center gap-2 bg-academy-orange px-5 py-2.5 text-[12px] font-bold tracking-wider text-white uppercase hover:opacity-90 disabled:opacity-50"
                >
                  {saving
                    ? "Salvo…"
                    : editingId
                      ? "Salva modifiche"
                      : "Crea promo"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Sub-components ─────────────────────────────────────────────── */

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-bold tracking-[0.2em] text-academy-gray-500 uppercase">
        {label}
      </span>
      {children}
    </label>
  );
}

function PromoGroup({
  title,
  promos,
  onEdit,
  onToggle,
  onDelete,
}: {
  title: string;
  promos: PromoRow[];
  onEdit: (row: PromoRow) => void;
  onToggle: (row: PromoRow) => void;
  onDelete: (row: PromoRow) => void;
}) {
  return (
    <div>
      <h2 className="mb-3 text-[11px] font-bold tracking-[0.3em] text-academy-gray-500 uppercase">
        {title}
      </h2>
      <ul className="space-y-2">
        {promos.map((row) => (
          <li
            key={row.id}
            className="border border-black/[0.08] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                      row.active
                        ? "bg-emerald-500/10 text-emerald-700"
                        : "bg-academy-gray-200/50 text-academy-gray-600"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 ${
                        row.active ? "bg-emerald-500" : "bg-academy-gray-500"
                      }`}
                    />
                    {row.active ? "Attiva" : "Inattiva"}
                  </span>
                  <span className="text-[11px] font-semibold text-academy-gray-500">
                    {getProductLabel(row.product_type, row.slug)}
                  </span>
                </div>
                <h3 className="text-base font-bold text-academy-gray-800">
                  {row.name}
                </h3>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-academy-gray-600">
                  <span>
                    <span className="text-academy-gray-400">Sconto:</span>{" "}
                    <span className="font-bold text-academy-orange">
                      {row.discount_type === "amount"
                        ? `−${formatEUR(row.discount_value)}`
                        : `−${row.discount_value}%`}
                    </span>
                  </span>
                  <span>
                    <span className="text-academy-gray-400">Scadenza:</span>{" "}
                    <span className="font-semibold">
                      {formatDate(row.ends_at)}
                    </span>
                  </span>
                  {row.max_redemptions != null && (
                    <span>
                      <span className="text-academy-gray-400">Max usi:</span>{" "}
                      <span className="font-semibold">
                        {row.max_redemptions}
                      </span>
                    </span>
                  )}
                  {row.stripe_coupon_id && (
                    <span className="font-mono text-[10px] text-academy-gray-400">
                      stripe: {row.stripe_coupon_id}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={() => onToggle(row)}
                  className={`inline-flex items-center gap-1.5 border px-3 py-2 text-[10px] font-bold tracking-wider uppercase transition-all ${
                    row.active
                      ? "border-black/[0.1] bg-white text-academy-gray-700 hover:border-red-500/30 hover:text-red-600"
                      : "border-emerald-500/30 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  }`}
                  title={row.active ? "Disattiva" : "Attiva"}
                >
                  {row.active ? (
                    "Disattiva"
                  ) : (
                    <>
                      <IconCheck className="h-3 w-3" />
                      Attiva
                    </>
                  )}
                </button>
                <button
                  onClick={() => onEdit(row)}
                  className="border border-black/[0.1] bg-white p-2 text-academy-gray-500 transition-all hover:border-academy-orange/30 hover:text-academy-orange"
                  aria-label="Modifica"
                  title="Modifica"
                >
                  <IconEdit className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => onDelete(row)}
                  className="border border-black/[0.1] bg-white p-2 text-academy-gray-500 transition-all hover:border-red-500/30 hover:text-red-600"
                  aria-label="Elimina"
                  title="Elimina"
                >
                  <IconTrash className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="border border-black/[0.08] bg-white p-12 text-center">
      <h3 className="text-base font-bold text-academy-gray-800">
        Nessuna promo automatica creata
      </h3>
      <p className="mt-1 max-w-md mx-auto text-sm text-academy-gray-500">
        Crea la prima promo per offrire sconti automatici su tutti i pack o
        tutte le masterclass. Sync automatico con Stripe.
      </p>
      <button
        onClick={onCreate}
        className="mt-5 inline-flex items-center gap-2 bg-academy-orange px-5 py-2.5 text-[12px] font-bold tracking-wider text-white uppercase hover:opacity-90"
      >
        <IconPlus className="h-4 w-4" />
        Crea promo
      </button>
    </div>
  );
}
