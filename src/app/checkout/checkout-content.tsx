"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { SectionContainer } from "@/components/shared/section-container";
import { GradientText } from "@/components/shared/gradient-text";
import { Button } from "@/components/ui/button";
import { getPackBySlug } from "@/lib/constants/packs";
import { getWorkshopBySlug } from "@/lib/constants/workshops";
import { createClient } from "@/lib/supabase/client";

export function CheckoutContent() {
  const searchParams = useSearchParams();
  const packSlug = searchParams.get("pack") || "corpus";
  const mc1 = searchParams.get("mc1") ?? "";
  const mc2 = searchParams.get("mc2") ?? "";
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

  // Resolve masterclass slugs → workshop titles (only for bundles with selection)
  const masterclassIds = [mc1, mc2].filter(Boolean);
  const selectedMasterclasses =
    pack.type === "bundle" && (pack.masterclassSelectionCount ?? 0) > 0
      ? masterclassIds.map((slug) => getWorkshopBySlug(slug)).filter(Boolean)
      : [];

  // Build the full checkout URL (used for post-auth redirect)
  function buildCheckoutUrl() {
    const params = new URLSearchParams({ pack: packSlug });
    if (mc1) params.set("mc1", mc1);
    if (mc2) params.set("mc2", mc2);
    return `/checkout?${params.toString()}`;
  }

  async function handleCheckout() {
    if (!pack) return;
    setLoading(true);
    setError("");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const next = buildCheckoutUrl();
      localStorage.setItem("pending_checkout", next);
      window.location.href = `/auth/register?next=${encodeURIComponent(next)}`;
      return;
    }

    try {
      const response = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packId: pack.slug,
          priceId: pack.stripePriceId,
          workshopIds: [],
          masterclassIds: masterclassIds,
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

            {/* Selected masterclasses */}
            {selectedMasterclasses.length > 0 && (
              <div className="mt-6 border-t border-white/10 pt-5">
                <p className="mb-3 text-xs font-bold tracking-[0.2em] text-academy-orange uppercase">
                  Masterclass Selezionate
                </p>
                <ul className="space-y-2">
                  {selectedMasterclasses.map((w) => (
                    <li
                      key={w!.slug}
                      className="flex items-center gap-2 text-sm text-academy-gray-300"
                    >
                      <svg
                        viewBox="0 0 16 16"
                        fill="none"
                        className="h-4 w-4 shrink-0 text-academy-orange"
                      >
                        <path
                          d="M13.5 4.5L6 12L2.5 8.5"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="square"
                        />
                      </svg>
                      <span>
                        <span className="font-semibold">{w!.title}</span>
                        {w!.trainerLabel && (
                          <span className="ml-1 text-academy-gray-500">— {w!.trainerLabel}</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
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
