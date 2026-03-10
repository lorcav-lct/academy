"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { SectionContainer } from "@/components/shared/section-container";
import { GradientText } from "@/components/shared/gradient-text";
import { Button } from "@/components/ui/button";
import { getPackBySlug } from "@/lib/constants/packs";

export function CheckoutContent() {
  const searchParams = useSearchParams();
  const packSlug = searchParams.get("pack") || "primal";
  const pack = getPackBySlug(packSlug);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!pack) {
    return (
      <section className="flex min-h-screen items-center pt-24">
        <SectionContainer>
          <div className="text-center">
            <h1 className="text-2xl font-black">Prodotto non trovato</h1>
            <Button href="/pack" variant="secondary" className="mt-4">
              Torna ai Prodotti
            </Button>
          </div>
        </SectionContainer>
      </section>
    );
  }

  async function handleCheckout() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packId: pack!.slug,
          priceId: pack!.stripePriceId,
          workshopIds: [],
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
              <GradientText>{pack.name}</GradientText>
            </h1>
            <p className="text-academy-gray-400">{pack.subtitle}</p>
          </div>

          {/* Product summary */}
          <div className="card-squared mb-8 p-8">
            <h2 className="mb-4 text-xs font-bold tracking-[0.2em] text-academy-orange uppercase">
              Cosa Include
            </h2>
            <ul className="space-y-2">
              {pack.includes.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-academy-gray-300">
                  <span className="h-1 w-1 bg-academy-orange" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 border border-red-400/20 bg-red-400/5 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Checkout summary + CTA */}
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
              {loading
                ? "Caricamento..."
                : pack.priceCents === 0
                ? "Prossimamente"
                : "Procedi al Pagamento"}
            </Button>
          </div>
        </div>
      </SectionContainer>
    </section>
  );
}
