"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { SectionContainer } from "@/components/shared/section-container";
import { GradientText } from "@/components/shared/gradient-text";
import { Button } from "@/components/ui/button";
import { PACKS } from "@/lib/constants/packs";
import { formatPrice } from "@/lib/utils";
import { fadeUp, staggerContainer } from "@/lib/animations/variants";

const featureMatrix = [
  { label: "Blocco CORPUS", key: "corpus" },
  { label: "Blocco VIS", key: "vis" },
  { label: "Blocco VICTOR", key: "victor" },
  { label: "Sessioni FIPE", key: "fipe" },
  { label: "Certificazione FipexLacertosus", key: "cert" },
  { label: "Workshop inclusi", key: "workshops" },
  { label: "Alloggio", key: "accommodation" },
  { label: "Trasporti", key: "transport" },
];

function getFeatureValue(packSlug: string, featureKey: string): string | boolean {
  const pack = PACKS.find((p) => p.slug === packSlug)!;
  switch (featureKey) {
    case "corpus":
    case "vis":
      return true;
    case "victor":
      return pack.includesBlocks.includes("VICTOR");
    case "fipe":
      return pack.includesFipe;
    case "cert":
      return pack.includesCertification;
    case "workshops":
      return `${pack.workshopCount} a scelta`;
    case "accommodation":
      return pack.includesAccommodation;
    case "transport":
      return pack.includesTransport;
    default:
      return false;
  }
}

function PackCard({ pack, index }: { pack: typeof PACKS[0]; index: number }) {
  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      className={`relative flex flex-col overflow-hidden ${
        pack.highlighted ? "glow-orange-strong" : ""
      }`}
    >
      {pack.highlighted && (
        <div className="bg-academy-orange py-1.5 text-center text-xs font-bold tracking-[0.2em] text-academy-dark uppercase">
          Piu Popolare
        </div>
      )}

      <div
        className={`flex flex-1 flex-col p-8 ${
          pack.highlighted
            ? "border-2 border-academy-orange bg-academy-navy/60"
            : "card-squared"
        }`}
      >
        {/* Pack name with colored accent */}
        <div className="mb-4">
          <div
            className="mb-3 inline-block h-1 w-12"
            style={{
              background: pack.tier === "oro-plus"
                ? "linear-gradient(90deg, #D4AF37, #F09226)"
                : pack.color,
            }}
          />
          <h3 className="text-2xl font-black tracking-tight">{pack.name}</h3>
        </div>

        {/* Price */}
        <div className="mb-4">
          {pack.priceCents > 0 ? (
            <span className="text-3xl font-black text-academy-orange">
              {formatPrice(pack.priceCents)}
            </span>
          ) : (
            <span className="text-lg font-bold text-academy-gray-400">
              Prezzo in definizione
            </span>
          )}
        </div>

        {/* Description */}
        <p className="mb-6 text-sm leading-relaxed text-academy-gray-400">
          {pack.description}
        </p>

        {/* Features */}
        <ul className="mb-8 flex-1 space-y-3">
          {pack.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5 text-sm">
              <svg
                viewBox="0 0 16 16"
                fill="none"
                className="mt-0.5 h-4 w-4 shrink-0 text-academy-orange"
              >
                <path
                  d="M13.5 4.5L6 12L2.5 8.5"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="square"
                />
              </svg>
              <span className="text-academy-gray-300">{feature}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Button
          href={`/checkout?pack=${pack.slug}`}
          variant={pack.highlighted ? "primary" : "secondary"}
          className="w-full"
        >
          Scegli {pack.name}
        </Button>
      </div>
    </motion.div>
  );
}

export function PackComparison() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-16">
        <div className="absolute inset-0 bg-academy-dark" />
        <div className="absolute top-1/3 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-academy-orange/[0.03] blur-[120px]" />

        <SectionContainer className="relative z-10 text-center">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.span
              variants={fadeUp}
              className="mb-4 inline-block text-xs font-semibold tracking-[0.3em] text-academy-orange uppercase"
            >
              Modi di Partecipazione
            </motion.span>
            <motion.h1
              variants={fadeUp}
              className="mb-4 text-4xl font-black tracking-tight sm:text-6xl"
            >
              Scegli il Tuo <GradientText>Pack</GradientText>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mx-auto max-w-2xl text-lg text-academy-gray-400"
            >
              Quattro formule flessibili per personalizzare la tua esperienza in base alle tue necessita.
            </motion.p>
          </motion.div>
        </SectionContainer>
      </section>

      {/* Pack cards */}
      <SectionContainer>
        <motion.div
          ref={ref}
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid gap-6 md:grid-cols-2 xl:grid-cols-4"
        >
          {PACKS.map((pack, i) => (
            <PackCard key={pack.slug} pack={pack} index={i} />
          ))}
        </motion.div>
      </SectionContainer>

      {/* Feature comparison table */}
      <SectionContainer withReflection>
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-black">Confronto Dettagliato</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-academy-orange/10">
                <th className="pb-4 pr-4 text-left text-sm font-medium text-academy-gray-500">
                  Caratteristica
                </th>
                {PACKS.map((pack) => (
                  <th
                    key={pack.slug}
                    className="pb-4 text-center text-sm font-bold tracking-wider text-academy-gray-200 uppercase"
                  >
                    {pack.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {featureMatrix.map((feature) => (
                <tr
                  key={feature.key}
                  className="border-b border-white/5"
                >
                  <td className="py-4 pr-4 text-sm text-academy-gray-400">
                    {feature.label}
                  </td>
                  {PACKS.map((pack) => {
                    const val = getFeatureValue(pack.slug, feature.key);
                    return (
                      <td key={pack.slug} className="py-4 text-center">
                        {typeof val === "boolean" ? (
                          val ? (
                            <span className="inline-flex h-5 w-5 items-center justify-center bg-academy-orange/20">
                              <svg
                                viewBox="0 0 16 16"
                                fill="none"
                                className="h-3 w-3 text-academy-orange"
                              >
                                <path
                                  d="M13.5 4.5L6 12L2.5 8.5"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                  strokeLinecap="square"
                                />
                              </svg>
                            </span>
                          ) : (
                            <span className="text-academy-gray-700">—</span>
                          )
                        ) : (
                          <span className="text-sm font-semibold text-academy-gray-300">
                            {val}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionContainer>
    </>
  );
}
