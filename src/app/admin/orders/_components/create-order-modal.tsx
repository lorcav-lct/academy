"use client";

/**
 * Manual order creation.
 *
 * For deals closed outside the checkout (blocked card, bank transfer, extra
 * products granted commercially): pick the customer, the products, record how
 * they paid, and the order is created already fulfilled — tickets/QR included.
 */
import { useEffect, useMemo, useState } from "react";
import {
  PRODUCTS,
  getMasterclassProducts,
  getProductBySlug,
} from "@/lib/constants/packs";
import { IconCheck, IconSearch } from "../../_components/icons";

interface Customer {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
}

const PAYMENT_METHODS = [
  { id: "bonifico", label: "Bonifico" },
  { id: "scalapay", label: "Scalapay" },
  { id: "contanti", label: "Contanti" },
  { id: "carta", label: "Carta (POS)" },
  { id: "altro", label: "Altro" },
];

/** Products sellable as the order's main item (masterclasses are add-ons). */
const MAIN_PRODUCTS = PRODUCTS.filter((p) => p.type !== "workshop").sort(
  (a, b) => a.sortOrder - b.sortOrder,
);

/** Every masterclass, hidden and International included: a manual order exists
 *  precisely to grant what the public checkout can't sell. */
const MASTERCLASSES = getMasterclassProducts().sort(
  (a, b) => Number(a.international ?? false) - Number(b.international ?? false),
);

function formatEUR(cents: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function CreateOrderModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Customer[]>([]);
  const [searching, setSearching] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);

  const [packSlug, setPackSlug] = useState("");
  const [addons, setAddons] = useState<string[]>([]);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("bonifico");
  const [silent, setSilent] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsForce, setNeedsForce] = useState(false);

  // Debounced lookup: the admin types an email, we resolve it to a real account
  // (an order needs a user_id, and the customer must see the tickets).
  useEffect(() => {
    if (customer) return;
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setSearching(true);
    const timer = setTimeout(async () => {
      const res = await fetch(
        `/api/admin/customers?q=${encodeURIComponent(q)}`,
      ).catch(() => null);
      if (cancelled) return;
      const data = res && res.ok ? await res.json() : { customers: [] };
      setResults(data.customers ?? []);
      setSearching(false);
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, customer]);

  function toggleAddon(slug: string) {
    setNeedsForce(false);
    setAddons((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  }

  const listPriceCents = useMemo(() => {
    const slugs = [...(packSlug ? [packSlug] : []), ...addons];
    return slugs.reduce(
      (sum, slug) => sum + (getProductBySlug(slug)?.priceCents ?? 0),
      0,
    );
  }, [packSlug, addons]);

  const canSubmit =
    !!customer && (packSlug !== "" || addons.length > 0) && !saving;

  async function submit(force = false) {
    if (!customer) return;
    setSaving(true);
    setError(null);
    const parsed = parseFloat(amount.replace(",", "."));
    const amountCents =
      Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed * 100) : null;

    const res = await fetch("/api/admin/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: customer.id,
        packId: packSlug || null,
        addonSlugs: addons,
        amountCents,
        paymentMethod: method,
        silent,
        force,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Errore durante la creazione dell'ordine");
      setNeedsForce(res.status === 409 && Array.isArray(data.alreadyOwned));
      setSaving(false);
      return;
    }
    setSaving(false);
    onCreated();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4"
      onClick={() => !saving && onClose()}
    >
      <div
        className="my-8 w-full max-w-lg border border-black/[0.08] bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="mb-1 text-[11px] font-bold tracking-[0.3em] text-academy-orange uppercase">
          Nuovo ordine
        </p>
        <h2 className="text-xl font-black text-academy-gray-800">
          Assegna un pack o una masterclass
        </h2>
        <p className="mt-1 text-[13px] text-academy-gray-500">
          Per pagamenti conclusi fuori Stripe. L&apos;ordine nasce già pagato:
          ticket, QR ed email di conferma vengono generati subito.
        </p>

        <div className="mt-5 space-y-5">
          {/* Customer */}
          <div>
            <label className="mb-1.5 block text-[11px] font-bold tracking-wider text-academy-gray-500 uppercase">
              Cliente
            </label>
            {customer ? (
              <div className="flex items-center justify-between gap-3 border border-academy-orange/40 bg-academy-orange/5 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-academy-gray-800">
                    {customer.full_name || "—"}
                  </p>
                  <p className="truncate text-[12px] text-academy-gray-500">
                    {customer.email}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCustomer(null);
                    setQuery("");
                    setNeedsForce(false);
                  }}
                  className="shrink-0 text-[11px] font-bold tracking-wider text-academy-gray-500 uppercase hover:text-academy-orange"
                >
                  Cambia
                </button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <IconSearch className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-academy-gray-400" />
                  <input
                    type="text"
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Cerca per email o nome..."
                    className="w-full border border-black/[0.1] bg-white py-2.5 pr-3 pl-10 text-sm text-academy-gray-800 placeholder-academy-gray-400 outline-none focus:border-academy-orange/50"
                  />
                </div>
                {query.trim().length >= 2 && (
                  <ul className="mt-2 max-h-44 divide-y divide-black/[0.04] overflow-y-auto border border-black/[0.08]">
                    {searching && results.length === 0 && (
                      <li className="px-3 py-2.5 text-[13px] text-academy-gray-500">
                        Ricerca...
                      </li>
                    )}
                    {!searching && results.length === 0 && (
                      <li className="px-3 py-2.5 text-[13px] text-academy-gray-500">
                        Nessun account trovato. Il cliente deve registrarsi
                        prima.
                      </li>
                    )}
                    {results.map((c) => (
                      <li key={c.id}>
                        <button
                          type="button"
                          onClick={() => setCustomer(c)}
                          className="w-full px-3 py-2.5 text-left transition-colors hover:bg-academy-orange/5"
                        >
                          <span className="block text-sm font-bold text-academy-gray-800">
                            {c.full_name || "—"}
                          </span>
                          <span className="block text-[12px] text-academy-gray-500">
                            {c.email}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>

          {/* Pack */}
          <div>
            <label className="mb-1.5 block text-[11px] font-bold tracking-wider text-academy-gray-500 uppercase">
              Pack / prodotto principale
            </label>
            <select
              value={packSlug}
              onChange={(e) => {
                setPackSlug(e.target.value);
                setNeedsForce(false);
              }}
              className="w-full border border-black/[0.1] bg-white px-3 py-2.5 text-sm text-academy-gray-800 outline-none focus:border-academy-orange/50"
            >
              <option value="">— Nessuno (solo masterclass) —</option>
              {MAIN_PRODUCTS.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name} · {formatEUR(p.priceCents)}
                </option>
              ))}
            </select>
          </div>

          {/* Masterclasses */}
          <div>
            <label className="mb-1.5 block text-[11px] font-bold tracking-wider text-academy-gray-500 uppercase">
              Masterclass ({addons.length} selezionate)
            </label>
            <div className="max-h-56 space-y-1 overflow-y-auto border border-black/[0.08] p-2">
              {MASTERCLASSES.map((m) => {
                const checked = addons.includes(m.slug);
                return (
                  <label
                    key={m.slug}
                    className={`flex cursor-pointer items-center gap-2.5 px-2 py-1.5 text-[13px] transition-colors ${
                      checked
                        ? "bg-academy-orange/10 text-academy-gray-800"
                        : "text-academy-gray-600 hover:bg-black/[0.02]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleAddon(m.slug)}
                      className="h-4 w-4 accent-academy-orange"
                    />
                    <span className="min-w-0 flex-1 truncate">{m.name}</span>
                    {m.international && (
                      <span className="shrink-0 bg-black/[0.05] px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-academy-gray-500 uppercase">
                        Int
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
            <div className="mt-1.5 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() =>
                  setAddons(
                    addons.length === MASTERCLASSES.length
                      ? []
                      : MASTERCLASSES.map((m) => m.slug),
                  )
                }
                className="text-[11px] font-bold tracking-wider text-academy-gray-500 uppercase hover:text-academy-orange"
              >
                {addons.length === MASTERCLASSES.length
                  ? "Deseleziona tutte"
                  : "Seleziona tutte"}
              </button>
              {listPriceCents > 0 && (
                <span className="text-[11px] text-academy-gray-400 tabular-nums">
                  listino {formatEUR(listPriceCents)}
                </span>
              )}
            </div>
          </div>

          {/* Payment */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[11px] font-bold tracking-wider text-academy-gray-500 uppercase">
                Metodo
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full border border-black/[0.1] bg-white px-3 py-2.5 text-sm text-academy-gray-800 outline-none focus:border-academy-orange/50"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-bold tracking-wider text-academy-gray-500 uppercase">
                Importo incassato (€)
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="es. 5900"
                className="w-full border border-black/[0.1] bg-white px-3 py-2.5 text-sm text-academy-gray-800 placeholder-academy-gray-400 outline-none focus:border-academy-orange/50"
              />
            </div>
          </div>
          <p className="-mt-3 text-[11px] text-academy-gray-400">
            L&apos;importo compare nell&apos;email di conferma e nella lista
            ordini. Se lo lasci vuoto l&apos;email mostra il prezzo di listino
            {listPriceCents > 0 ? ` (${formatEUR(listPriceCents)})` : ""} e
            l&apos;ordine risulta a €0 in lista.
          </p>

          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-academy-gray-700">
            <input
              type="checkbox"
              checked={!silent}
              onChange={(e) => setSilent(!e.target.checked)}
              className="h-4 w-4 accent-academy-orange"
            />
            Invia email di conferma con i QR
          </label>
        </div>

        {error && (
          <div className="mt-4 border border-red-500/30 bg-red-50 px-3 py-2 text-[13px] text-red-700">
            <p>{error}</p>
            {needsForce && (
              <button
                type="button"
                onClick={() => submit(true)}
                disabled={saving}
                className="mt-2 text-[11px] font-bold tracking-wider text-red-700 uppercase underline disabled:opacity-50"
              >
                Crea comunque
              </button>
            )}
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            disabled={saving}
            className="border border-black/[0.1] bg-white px-4 py-2.5 text-[12px] font-bold tracking-wider text-academy-gray-600 uppercase transition-colors hover:text-academy-gray-800 disabled:opacity-50"
          >
            Annulla
          </button>
          <button
            onClick={() => submit(false)}
            disabled={!canSubmit}
            className="flex items-center gap-2 bg-academy-orange px-5 py-2.5 text-[12px] font-bold tracking-wider text-white uppercase transition-all hover:brightness-110 disabled:opacity-50"
          >
            <IconCheck className="h-3.5 w-3.5" />
            {saving
              ? "Creazione..."
              : silent
                ? "Crea senza email"
                : "Crea e invia email"}
          </button>
        </div>
      </div>
    </div>
  );
}
