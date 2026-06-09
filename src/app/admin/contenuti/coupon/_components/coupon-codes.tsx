"use client";

/**
 * Pannello "Codici coupon" — Stripe promotion code digitabili dal cliente al
 * checkout. Codice custom o auto-generato, usabile n volte, con scadenza, su
 * qualsiasi prodotto o su uno specifico. Fonte di verità: Stripe.
 */
import { useEffect, useMemo, useState } from "react";
import { PRODUCTS } from "@/lib/constants/packs";
import {
  IconClose,
  IconPlus,
  IconTrash,
  IconCheck,
  IconCopy,
  IconTicket,
} from "../../../_components/icons";
import type { CouponCodeRow, CouponDiscountType } from "@/lib/coupons/types";

type FormFields = {
  code: string;
  discount_type: CouponDiscountType;
  discount_value: number | "";
  max_redemptions: number | "";
  expires_at: string;
  /** "all" → qualsiasi prodotto; altrimenti slug */
  product_slug: "all" | string;
};

const emptyForm = (): FormFields => ({
  code: "",
  discount_type: "percent",
  discount_value: "",
  max_redemptions: "",
  expires_at: "",
  product_slug: "all",
});

/** Tutti i prodotti acquistabili (con un price Stripe), per lo scope per-prodotto. */
const PRODUCT_OPTIONS = PRODUCTS.filter(
  (p) => p.stripePriceId.test || p.stripePriceId.live,
).map((p) => ({ slug: p.slug, label: p.name }));

function productLabel(slug: string | null): string {
  if (!slug) return "Qualsiasi prodotto";
  return PRODUCT_OPTIONS.find((o) => o.slug === slug)?.label ?? slug;
}

/** datetime-local string per "tra N giorni" alle 23:59 di oggi. */
function inDaysLocal(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(23, 59, 0, 0);
  // toISOString è UTC → costruisco manualmente in local time
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDiscount(row: CouponCodeRow): string {
  if (row.discount_type === "percent") return `−${row.discount_value}%`;
  const amount = new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: (row.currency ?? "eur").toUpperCase(),
    maximumFractionDigits: 0,
  }).format(row.discount_value / 100);
  return `−${amount}`;
}

function formatDate(iso: string | null): string {
  if (!iso) return "Nessuna";
  return new Date(iso).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const inputClass =
  "w-full border border-black/[0.12] bg-white px-3 py-2.5 text-sm text-academy-gray-800 placeholder:text-academy-gray-400 focus:border-academy-orange focus:outline-none";
const selectClass = `${inputClass} appearance-none`;

export function CouponCodesPanel() {
  const [coupons, setCoupons] = useState<CouponCodeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormFields | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/coupons", { cache: "no-store" });
    const data = await res.json();
    if (data.coupons) setCoupons(data.coupons);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  /** Crea il coupon rapido: 10% · 1 uso · +7gg · qualsiasi prodotto, codice auto. */
  async function quickCreate() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          discount_type: "percent",
          discount_value: 10,
          max_redemptions: 1,
          expires_at: new Date(inDaysLocal(7)).toISOString(),
          product_slug: "all",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Errore sconosciuto");
        return;
      }
      await load();
    } catch {
      setError("Errore di connessione");
    } finally {
      setSaving(false);
    }
  }

  async function save() {
    if (!form) return;
    if (typeof form.discount_value !== "number" || form.discount_value <= 0) {
      setError("Inserisci un valore di sconto valido");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code.trim() || undefined,
          discount_type: form.discount_type,
          discount_value:
            form.discount_type === "amount"
              ? Math.round(Number(form.discount_value) * 100)
              : Number(form.discount_value),
          max_redemptions:
            typeof form.max_redemptions === "number" && form.max_redemptions > 0
              ? form.max_redemptions
              : null,
          expires_at: form.expires_at
            ? new Date(form.expires_at).toISOString()
            : null,
          product_slug: form.product_slug,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Errore sconosciuto");
        return;
      }
      await load();
      setForm(null);
    } catch {
      setError("Errore di connessione");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(row: CouponCodeRow) {
    const res = await fetch(`/api/admin/coupons/${row.id}`, {
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

  async function remove(row: CouponCodeRow) {
    if (
      !confirm(
        `Eliminare il coupon "${row.code}"? Verrà disattivato e archiviato su Stripe.`,
      )
    )
      return;
    const res = await fetch(`/api/admin/coupons/${row.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setCoupons((prev) => prev.filter((c) => c.id !== row.id));
    } else {
      const data = await res.json();
      alert(`Errore: ${data?.error ?? "sconosciuto"}`);
    }
  }

  async function copyCode(row: CouponCodeRow) {
    try {
      await navigator.clipboard.writeText(row.code);
      setCopiedId(row.id);
      setTimeout(() => setCopiedId((id) => (id === row.id ? null : id)), 1500);
    } catch {
      /* clipboard non disponibile */
    }
  }

  const sorted = useMemo(
    () =>
      [...coupons].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      ),
    [coupons],
  );

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <p className="max-w-xl text-sm text-academy-gray-500">
          Codici <strong>digitabili dal cliente</strong> al checkout. Codice
          personalizzato o generato in automatico, usabile n volte, con
          scadenza. Validi su qualsiasi prodotto o su uno specifico.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={quickCreate}
            disabled={saving}
            className="inline-flex items-center gap-2 border border-academy-orange bg-academy-orange/10 px-4 py-2.5 text-[12px] font-bold tracking-wider text-academy-orange uppercase transition-colors hover:bg-academy-orange/20 disabled:opacity-50"
            title="10% · 1 uso · 7 giorni · qualsiasi prodotto"
          >
            <IconTicket className="h-4 w-4" />
            Coupon rapido 10%
          </button>
          <button
            onClick={() => {
              setForm(emptyForm());
              setError(null);
            }}
            className="inline-flex items-center gap-2 bg-academy-orange px-5 py-2.5 text-[12px] font-bold tracking-wider text-white uppercase transition-opacity hover:opacity-90"
          >
            <IconPlus className="h-4 w-4" />
            Nuovo coupon
          </button>
        </div>
      </div>

      {error && !form && (
        <div className="border border-red-500/30 bg-red-500/5 px-4 py-3 text-[13px] text-red-700">
          {error}
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <p className="text-sm text-academy-gray-500">Caricamento…</p>
      ) : sorted.length === 0 ? (
        <EmptyState onQuick={quickCreate} saving={saving} />
      ) : (
        <ul className="space-y-2">
          {sorted.map((row) => {
            const exhausted =
              row.max_redemptions != null &&
              row.times_redeemed >= row.max_redemptions;
            return (
              <li
                key={row.id}
                className="border border-black/[0.08] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                          row.active && !exhausted
                            ? "bg-emerald-500/10 text-emerald-700"
                            : "bg-academy-gray-200/50 text-academy-gray-600"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 ${
                            row.active && !exhausted
                              ? "bg-emerald-500"
                              : "bg-academy-gray-500"
                          }`}
                        />
                        {exhausted
                          ? "Esaurito"
                          : row.active
                            ? "Attivo"
                            : "Disattivato"}
                      </span>
                      <span className="text-[11px] font-semibold text-academy-gray-500">
                        {productLabel(row.product_slug)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="bg-academy-gray-100 px-2.5 py-1 font-mono text-base font-bold tracking-wider text-academy-gray-800">
                        {row.code}
                      </code>
                      <button
                        onClick={() => copyCode(row)}
                        className="inline-flex items-center gap-1 border border-black/[0.1] bg-white px-2 py-1.5 text-[10px] font-bold tracking-wider text-academy-gray-500 uppercase transition-all hover:border-academy-orange/30 hover:text-academy-orange"
                        title="Copia codice"
                      >
                        {copiedId === row.id ? (
                          <>
                            <IconCheck className="h-3 w-3" /> Copiato
                          </>
                        ) : (
                          <>
                            <IconCopy className="h-3 w-3" /> Copia
                          </>
                        )}
                      </button>
                    </div>
                    <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-academy-gray-600">
                      <span>
                        <span className="text-academy-gray-400">Sconto:</span>{" "}
                        <span className="font-bold text-academy-orange">
                          {formatDiscount(row)}
                        </span>
                      </span>
                      <span>
                        <span className="text-academy-gray-400">Usi:</span>{" "}
                        <span className="font-semibold">
                          {row.times_redeemed}
                          {row.max_redemptions != null
                            ? ` / ${row.max_redemptions}`
                            : " / ∞"}
                        </span>
                      </span>
                      <span>
                        <span className="text-academy-gray-400">Scadenza:</span>{" "}
                        <span className="font-semibold">
                          {formatDate(row.expires_at)}
                        </span>
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() => toggleActive(row)}
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
                      onClick={() => remove(row)}
                      className="border border-black/[0.1] bg-white p-2 text-academy-gray-500 transition-all hover:border-red-500/30 hover:text-red-600"
                      aria-label="Elimina"
                      title="Elimina"
                    >
                      <IconTrash className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Modal nuovo coupon */}
      {form && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-md"
          onClick={() => setForm(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-black/[0.06] bg-white px-6 py-4">
              <h2 className="text-lg font-black text-academy-gray-800">
                Nuovo codice coupon
              </h2>
              <button
                onClick={() => setForm(null)}
                className="text-academy-gray-500 hover:text-academy-gray-800"
                aria-label="Chiudi"
              >
                <IconClose className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 p-6">
              {/* Codice */}
              <Field label="Codice (vuoto = generato automaticamente)">
                <input
                  value={form.code}
                  onChange={(e) =>
                    setForm({ ...form, code: e.target.value.toUpperCase() })
                  }
                  placeholder="es. WELCOME10 — lascia vuoto per auto-generare"
                  className={`${inputClass} font-mono tracking-wider`}
                />
              </Field>

              {/* Tipo + valore */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Tipo sconto">
                  <select
                    value={form.discount_type}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        discount_type: e.target.value as CouponDiscountType,
                      })
                    }
                    className={selectClass}
                  >
                    <option value="percent">Percentuale (%)</option>
                    <option value="amount">Importo fisso (€)</option>
                  </select>
                </Field>
                <Field
                  label={
                    form.discount_type === "amount" ? "Sconto in €" : "Sconto %"
                  }
                >
                  <input
                    type="number"
                    min={0}
                    max={form.discount_type === "percent" ? 100 : undefined}
                    value={form.discount_value}
                    onChange={(e) => {
                      const v = e.target.value;
                      setForm({
                        ...form,
                        discount_value: v === "" ? "" : Number(v),
                      });
                    }}
                    placeholder={form.discount_type === "amount" ? "50" : "10"}
                    className={inputClass}
                  />
                </Field>
              </div>

              {/* Ambito prodotto */}
              <Field label="Validità">
                <select
                  value={form.product_slug}
                  onChange={(e) =>
                    setForm({ ...form, product_slug: e.target.value })
                  }
                  className={selectClass}
                >
                  <option value="all">Qualsiasi prodotto</option>
                  {PRODUCT_OPTIONS.map((opt) => (
                    <option key={opt.slug} value={opt.slug}>
                      Solo: {opt.label}
                    </option>
                  ))}
                </select>
              </Field>

              {/* Max usi + scadenza */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Massimo utilizzi (vuoto = illimitato)">
                  <input
                    type="number"
                    min={0}
                    value={form.max_redemptions}
                    onChange={(e) => {
                      const v = e.target.value;
                      setForm({
                        ...form,
                        max_redemptions: v === "" ? "" : Number(v),
                      });
                    }}
                    placeholder="es. 1"
                    className={inputClass}
                  />
                </Field>
                <Field label="Scadenza (opzionale)">
                  <input
                    type="datetime-local"
                    value={form.expires_at}
                    onChange={(e) =>
                      setForm({ ...form, expires_at: e.target.value })
                    }
                    className={inputClass}
                  />
                </Field>
              </div>

              {/* Shortcut scadenza */}
              <div className="flex flex-wrap gap-2">
                {[7, 14, 30].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() =>
                      setForm({ ...form, expires_at: inDaysLocal(days) })
                    }
                    className="border border-black/[0.12] bg-white px-3 py-1.5 text-[11px] font-bold tracking-wider text-academy-gray-600 uppercase hover:border-academy-orange/40 hover:text-academy-orange"
                  >
                    +{days} giorni
                  </button>
                ))}
                {form.expires_at && (
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, expires_at: "" })}
                    className="px-3 py-1.5 text-[11px] font-bold tracking-wider text-academy-gray-400 uppercase hover:text-red-600"
                  >
                    Rimuovi scadenza
                  </button>
                )}
              </div>

              {error && (
                <div className="border border-red-500/30 bg-red-500/5 px-4 py-3 text-[13px] text-red-700">
                  {error}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-end gap-2 border-t border-black/[0.06] pt-4">
                <button
                  onClick={() => setForm(null)}
                  className="border border-black/[0.12] bg-white px-4 py-2.5 text-[12px] font-bold tracking-wider text-academy-gray-700 uppercase hover:border-black/30"
                >
                  Annulla
                </button>
                <button
                  onClick={save}
                  disabled={saving}
                  className="inline-flex items-center gap-2 bg-academy-orange px-5 py-2.5 text-[12px] font-bold tracking-wider text-white uppercase hover:opacity-90 disabled:opacity-50"
                >
                  {saving ? "Creo…" : "Crea coupon"}
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

function EmptyState({
  onQuick,
  saving,
}: {
  onQuick: () => void;
  saving: boolean;
}) {
  return (
    <div className="border border-black/[0.08] bg-white p-12 text-center">
      <h3 className="text-base font-bold text-academy-gray-800">
        Nessun codice coupon
      </h3>
      <p className="mt-1 max-w-md mx-auto text-sm text-academy-gray-500">
        Genera il primo codice. Il “Coupon rapido” crea uno sconto del 10%
        valido 7 giorni, usabile una volta, su qualsiasi prodotto.
      </p>
      <button
        onClick={onQuick}
        disabled={saving}
        className="mt-5 inline-flex items-center gap-2 bg-academy-orange px-5 py-2.5 text-[12px] font-bold tracking-wider text-white uppercase hover:opacity-90 disabled:opacity-50"
      >
        <IconTicket className="h-4 w-4" />
        Crea coupon rapido 10%
      </button>
    </div>
  );
}
