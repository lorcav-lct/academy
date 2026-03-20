"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SectionContainer } from "@/components/shared/section-container";
import { GradientText } from "@/components/shared/gradient-text";
import { Button } from "@/components/ui/button";
import {
  getBundles,
  getMasterclassProducts,
  type AcademyProduct,
} from "@/lib/constants/packs";
import { getWorkshopBySlug } from "@/lib/constants/workshops";
import { formatPrice } from "@/lib/utils";
import { fadeUp, staggerContainer } from "@/lib/animations/variants";
import { createClient } from "@/lib/supabase/client";
import { MasterclassSelector } from "./masterclass-selector";

// ─── Accent colours per bundle slug ──────────────────────────────────────────
const BUNDLE_ACCENT: Record<string, string> = {
  bronzo: "#CD7F32",
  argento: "#C0C0C0",
  oro: "#D4AF37",
};

// ─── Bundle card ──────────────────────────────────────────────────────────────
function BundleCard({
  product,
  index,
  onChoose,
}: {
  product: AcademyProduct;
  index: number;
  onChoose: (product: AcademyProduct) => void;
}) {
  const accent = BUNDLE_ACCENT[product.slug] ?? "#C0C0C0";
  const needsMasterclassSelection = (product.masterclassSelectionCount ?? 0) > 0;

  async function handleClick() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const dest = `/checkout?pack=${product.slug}`;

    if (!user) {
      localStorage.setItem("pending_checkout", dest);
      window.location.href = `/auth/register?next=${encodeURIComponent(dest)}`;
      return;
    }

    if (needsMasterclassSelection) {
      onChoose(product);
    } else {
      window.location.href = dest;
    }
  }

  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      className={`relative flex flex-col overflow-hidden ${
        product.highlighted ? "glow-orange-strong" : ""
      }`}
    >
      {product.highlighted && (
        <div className="bg-academy-orange py-1.5 text-center text-xs font-bold tracking-[0.2em] text-academy-dark uppercase">
          Più popolare
        </div>
      )}

      <div
        className={`flex flex-1 flex-col p-8 ${
          product.highlighted
            ? "border-2 border-academy-orange bg-academy-navy/60"
            : "card-squared"
        }`}
      >
        {/* Accent line + tier label */}
        <div className="mb-4">
          <div className="mb-3 h-0.5 w-10" style={{ background: accent }} />
          <span
            className="text-[12px] font-bold tracking-[0.25em] uppercase"
            style={{ color: accent }}
          >
            Pack {product.name}
          </span>
        </div>

        {/* Name + subtitle */}
        <h3 className="mb-1 text-2xl font-black tracking-tight">{product.name}</h3>
        <p className="mb-4 text-sm text-academy-gray-500">{product.subtitle}</p>

        {/* Badges */}
        <div className="mb-5 flex flex-wrap gap-2">
          {product.includesAccommodation && (
            <span className="border border-amber-400/40 bg-amber-400/10 px-2.5 py-1 text-[11px] font-bold tracking-[0.15em] text-amber-400 uppercase">
              Vitto e Alloggio Inclusi
            </span>
          )}
          {(product.masterclassSelectionCount ?? 0) > 0 && (
            <span
              className="border px-2.5 py-1 text-[11px] font-bold tracking-[0.15em] uppercase"
              style={{ borderColor: `${accent}40`, color: accent, background: `${accent}10` }}
            >
              2 Masterclass a scelta
            </span>
          )}
        </div>

        {/* Price */}
        <div className="mb-6">
          {product.priceCents > 0 ? (
            <span className="text-3xl font-black text-academy-orange">
              {formatPrice(product.priceCents)}
            </span>
          ) : (
            <span className="text-lg font-bold text-academy-gray-400">Prezzo in definizione</span>
          )}
        </div>

        {/* Includes */}
        <ul className="mb-8 flex-1 space-y-3">
          {product.includes.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm">
              <svg viewBox="0 0 16 16" fill="none" className="mt-0.5 h-4 w-4 shrink-0 text-academy-orange">
                <path
                  d="M13.5 4.5L6 12L2.5 8.5"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="square"
                />
              </svg>
              <span className="text-academy-gray-300">{item}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Button
          onClick={handleClick}
          variant={product.highlighted ? "primary" : "secondary"}
          className="w-full"
        >
          {needsMasterclassSelection ? `Scegli ${product.name} →` : `Acquista ${product.name}`}
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Single masterclass card ──────────────────────────────────────────────────
function MasterclassCard({
  product,
  index,
}: {
  product: AcademyProduct;
  index: number;
}) {
  const workshop = product.workshopSlug
    ? getWorkshopBySlug(product.workshopSlug)
    : undefined;
  const trainerLabel = workshop?.trainerLabel ?? "";
  const isTbd = workshop?.tbd ?? product.priceCents === 0;

  async function handleBuy() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const dest = `/checkout?pack=${product.slug}`;
    if (!user) {
      localStorage.setItem("pending_checkout", dest);
      window.location.href = `/auth/register?next=${encodeURIComponent(dest)}`;
      return;
    }
    window.location.href = dest;
  }

  return (
    <motion.div variants={fadeUp} custom={index} className="card-squared flex flex-col p-6">
      <div className="mb-3 h-0.5 w-8 bg-academy-orange/50" />
      <h3 className="mb-1 text-base font-black leading-tight">{product.name}</h3>
      {trainerLabel && (
        <p className="mb-3 text-xs text-academy-orange">{trainerLabel}</p>
      )}
      <p className="mb-4 flex-1 text-xs leading-relaxed text-academy-gray-400">
        {product.subtitle}
      </p>

      <div className="flex items-center justify-between gap-3">
        <span className="text-lg font-black text-academy-orange">
          {product.priceCents > 0 ? formatPrice(product.priceCents) : "Da definire"}
        </span>
        {isTbd ? (
          <span className="text-xs font-semibold text-academy-gray-500">Prossimamente</span>
        ) : (
          <Button onClick={handleBuy} variant="secondary" size="sm">
            Acquista
          </Button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function PackComparison() {
  const router = useRouter();
  const bundlesRef = useRef(null);
  const masterclassRef = useRef(null);
  const isBundlesInView = useInView(bundlesRef, { once: true, margin: "-80px" });
  const isMasterclassInView = useInView(masterclassRef, { once: true, margin: "-80px" });

  const [selectorOpen, setSelectorOpen] = useState(false);
  const [selectedPack, setSelectedPack] = useState<AcademyProduct | null>(null);

  const bundles = getBundles();
  const masterclasses = getMasterclassProducts();

  function openSelector(product: AcademyProduct) {
    setSelectedPack(product);
    setSelectorOpen(true);
  }

  function handleSelectorConfirm(slugs: string[]) {
    setSelectorOpen(false);
    if (!selectedPack) return;
    const params = new URLSearchParams({ pack: selectedPack.slug });
    if (slugs[0]) params.set("mc1", slugs[0]);
    if (slugs[1]) params.set("mc2", slugs[1]);
    router.push(`/checkout?${params.toString()}`);
  }

  return (
    <>
      {/* ── Section 1: Bundles ─────────────────────────────────────────────── */}
      <SectionContainer>
        <div className="mb-10">
          <span className="text-xs font-bold tracking-[0.3em] text-academy-orange uppercase">
            I Pacchetti
          </span>
          <h2 className="mt-2 text-3xl font-black tracking-tight">
            Scegli il tuo <GradientText>percorso.</GradientText>
          </h2>
        </div>

        <motion.div
          ref={bundlesRef}
          variants={staggerContainer}
          initial="hidden"
          animate={isBundlesInView ? "visible" : "hidden"}
          className="grid gap-6 md:grid-cols-3"
        >
          {bundles.map((product, i) => (
            <BundleCard key={product.slug} product={product} index={i} onChoose={openSelector} />
          ))}
        </motion.div>
      </SectionContainer>

      {/* ── Section 2: Individual masterclasses ───────────────────────────── */}
      <SectionContainer withReflection>
        <div className="mb-10">
          <span className="text-xs font-bold tracking-[0.3em] text-academy-orange uppercase">
            Approfondimento
          </span>
          <h2 className="mt-2 text-2xl font-black">Acquista singola Masterclass</h2>
          <p className="mt-2 text-sm text-academy-gray-400">
            Sessioni intensive su temi avanzati, aperte a tutti.
          </p>
        </div>

        <motion.div
          ref={masterclassRef}
          variants={staggerContainer}
          initial="hidden"
          animate={isMasterclassInView ? "visible" : "hidden"}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {masterclasses.map((product, i) => (
            <MasterclassCard key={product.slug} product={product} index={i} />
          ))}
        </motion.div>
      </SectionContainer>

      {/* ── Masterclass selector modal ─────────────────────────────────────── */}
      {selectorOpen && selectedPack && (
        <MasterclassSelector
          packSlug={selectedPack.slug}
          count={selectedPack.masterclassSelectionCount ?? 2}
          onConfirm={handleSelectorConfirm}
          onClose={() => setSelectorOpen(false)}
        />
      )}
    </>
  );
}
