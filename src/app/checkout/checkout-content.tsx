"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { SectionContainer } from "@/components/shared/section-container";
import { GradientText } from "@/components/shared/gradient-text";
import { Button } from "@/components/ui/button";
import { getPackBySlug } from "@/lib/constants/packs";
import { WORKSHOPS } from "@/lib/constants/workshops";

export function CheckoutContent() {
  const searchParams = useSearchParams();
  const packSlug = searchParams.get("pack") || "oro";
  const pack = getPackBySlug(packSlug);

  const [selectedWorkshops, setSelectedWorkshops] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!pack) {
    return (
      <section className="flex min-h-screen items-center pt-24">
        <SectionContainer>
          <div className="text-center">
            <h1 className="text-2xl font-black">Pack non trovato</h1>
            <Button href="/pack" variant="secondary" className="mt-4">
              Torna ai Pack
            </Button>
          </div>
        </SectionContainer>
      </section>
    );
  }

  function toggleWorkshop(slug: string) {
    setSelectedWorkshops((prev) => {
      if (prev.includes(slug)) {
        return prev.filter((s) => s !== slug);
      }
      if (prev.length >= pack!.workshopCount) {
        return prev;
      }
      return [...prev, slug];
    });
  }

  async function handleCheckout() {
    if (selectedWorkshops.length < pack!.workshopCount) {
      setError(`Seleziona ${pack!.workshopCount} workshop`);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packId: pack!.slug,
          priceId: "", // Will be set when Stripe products are configured
          workshopIds: selectedWorkshops,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Errore durante il checkout");
      }
    } catch {
      setError("Errore di connessione");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="min-h-screen pt-32">
      <SectionContainer>
        <div className="mx-auto max-w-3xl">
          <div className="mb-12">
            <span className="mb-2 inline-block text-xs font-semibold tracking-[0.3em] text-academy-orange uppercase">
              Checkout
            </span>
            <h1 className="mb-2 text-3xl font-black">
              Pack <GradientText>{pack.name}</GradientText>
            </h1>
            <p className="text-academy-gray-400">{pack.description}</p>
          </div>

          {/* Pack summary */}
          <div className="card-squared mb-8 p-8">
            <h2 className="mb-4 text-xs font-bold tracking-[0.2em] text-academy-orange uppercase">
              Il Tuo Pack Include
            </h2>
            <ul className="space-y-2">
              {pack.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-academy-gray-300">
                  <span className="h-1 w-1 bg-academy-orange" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Workshop selection */}
          {pack.workshopCount > 0 && (
            <div className="mb-8">
              <h2 className="mb-2 text-lg font-bold">
                Seleziona {pack.workshopCount} Workshop
              </h2>
              <p className="mb-6 text-sm text-academy-gray-400">
                Scegli i workshop specialistici che preferisci ({selectedWorkshops.length}/{pack.workshopCount} selezionati)
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                {WORKSHOPS.map((w) => {
                  const selected = selectedWorkshops.includes(w.slug);
                  const disabled =
                    !selected && selectedWorkshops.length >= pack!.workshopCount;

                  return (
                    <button
                      key={w.slug}
                      onClick={() => toggleWorkshop(w.slug)}
                      disabled={disabled}
                      className={`p-4 text-left transition-all ${
                        selected
                          ? "border-2 border-academy-orange bg-academy-orange/10 glow-orange"
                          : disabled
                          ? "card-squared opacity-40 cursor-not-allowed"
                          : "card-squared cursor-pointer hover:border-academy-orange/30"
                      }`}
                    >
                      <div className="mb-1 text-[10px] font-bold tracking-wider text-academy-orange uppercase">
                        {w.date}
                      </div>
                      <h3 className="text-sm font-bold">{w.title}</h3>
                      <p className="mt-1 text-xs text-academy-gray-500">{w.focus}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-4 border border-red-400/20 bg-red-400/5 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Checkout button */}
          <div className="card-squared flex items-center justify-between p-8">
            <div>
              <p className="text-sm text-academy-gray-400">Totale</p>
              <p className="text-2xl font-black text-academy-orange">
                {pack.priceCents > 0
                  ? new Intl.NumberFormat("it-IT", {
                      style: "currency",
                      currency: "EUR",
                    }).format(pack.priceCents / 100)
                  : "Prezzo in definizione"}
              </p>
              <p className="text-xs text-academy-gray-500">IVA inclusa</p>
            </div>
            <Button
              onClick={handleCheckout}
              disabled={loading || pack.priceCents === 0}
              size="lg"
            >
              {loading ? "Caricamento..." : "Procedi al Pagamento"}
            </Button>
          </div>
        </div>
      </SectionContainer>
    </section>
  );
}
