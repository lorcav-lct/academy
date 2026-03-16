"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { SectionContainer } from "@/components/shared/section-container";
import { GradientText } from "@/components/shared/gradient-text";
import { Button } from "@/components/ui/button";
import { PRODUCTS, type AcademyProduct } from "@/lib/constants/packs";
import { formatPrice } from "@/lib/utils";
import { fadeUp, staggerContainer } from "@/lib/animations/variants";
import { createClient } from "@/lib/supabase/client";

const TYPE_LABEL: Record<AcademyProduct["type"], string> = {
  course: "Blocco Formativo",
  certification: "Certificazione",
  workshop: "Master",
};

const TYPE_COLOR: Record<AcademyProduct["type"], string> = {
  course: "#F09226",
  certification: "#D4AF37",
  workshop: "#7B8FA1",
};

function ProductCard({ product, index }: { product: AcademyProduct; index: number }) {
  const accentColor = TYPE_COLOR[product.type];

  async function handleBuy() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const dest = `/checkout?pack=${product.slug}`;
    if (!user) {
      localStorage.setItem("pending_checkout", dest);
      window.location.href = `/auth/register?next=${encodeURIComponent(dest)}`;
      return;
    }
    window.location.href = dest;
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
          Consigliato
        </div>
      )}

      <div
        className={`flex flex-1 flex-col p-8 ${
          product.highlighted
            ? "border-2 border-academy-orange bg-academy-navy/60"
            : "card-squared"
        }`}
      >
        {/* Type badge */}
        <div className="mb-4">
          <div
            className="mb-3 h-0.5 w-10"
            style={{ background: accentColor }}
          />
          <span
            className="text-[12px] font-bold tracking-[0.25em] uppercase"
            style={{ color: accentColor }}
          >
            {TYPE_LABEL[product.type]}
          </span>
        </div>

        {/* Name + subtitle */}
        <h3 className="mb-1 text-2xl font-black tracking-tight">{product.name}</h3>
        <p className="mb-4 text-sm text-academy-gray-500">{product.subtitle}</p>

        {/* Price */}
        <div className="mb-6">
          {product.priceCents > 0 ? (
            <span className="text-3xl font-black text-academy-orange">
              {formatPrice(product.priceCents)}
            </span>
          ) : (
            <span className="text-lg font-bold text-academy-gray-400">
              Prezzo in definizione
            </span>
          )}
        </div>

        {/* Includes */}
        <ul className="mb-8 flex-1 space-y-3">
          {product.includes.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm">
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
              <span className="text-academy-gray-300">{item}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Button
          onClick={product.priceCents > 0 ? handleBuy : undefined}
          variant={product.highlighted ? "primary" : "secondary"}
          className="w-full"
          disabled={product.priceCents === 0}
        >
          {product.priceCents === 0 ? "Prossimamente" : `Acquista ${product.name}`}
        </Button>
      </div>
    </motion.div>
  );
}

export function PackComparison() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const courses = PRODUCTS.filter((p) => p.type === "course");
  const certifications = PRODUCTS.filter((p) => p.type === "certification");

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
              Formazione Modulare
            </motion.span>
            <motion.h1
              variants={fadeUp}
              className="mb-4 text-4xl font-black tracking-tight sm:text-6xl"
            >
              Costruisci il Tuo <GradientText>Percorso</GradientText>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mx-auto max-w-2xl text-lg text-academy-gray-400"
            >
              Ogni blocco si acquista singolarmente. Segui il percorso completo o scegli il modulo che ti serve.
            </motion.p>
          </motion.div>
        </SectionContainer>
      </section>

      {/* Blocchi formativi */}
      <SectionContainer>
        <div className="mb-10">
          <span className="text-xs font-bold tracking-[0.3em] text-academy-orange uppercase">
            I Tre Blocchi
          </span>
          <h2 className="mt-2 text-2xl font-black">Percorso Formativo</h2>
        </div>
        <motion.div
          ref={ref}
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid gap-6 md:grid-cols-3"
        >
          {courses.map((product, i) => (
            <ProductCard key={product.slug} product={product} index={i} />
          ))}
        </motion.div>
      </SectionContainer>

      {/* Certificazione */}
      {certifications.length > 0 && (
        <SectionContainer withReflection>
          <div className="mb-10">
            <span className="text-xs font-bold tracking-[0.3em] text-academy-orange uppercase">
              Riconoscimento Professionale
            </span>
            <h2 className="mt-2 text-2xl font-black">Certificazione</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {certifications.map((product, i) => (
              <ProductCard key={product.slug} product={product} index={i} />
            ))}
          </div>
        </SectionContainer>
      )}

      {/* Master singoli */}
      <SectionContainer>
        <div className="card-squared p-8 text-center">
          <span className="mb-2 inline-block text-xs font-bold tracking-[0.3em] text-academy-orange uppercase">
            Approfondimento
          </span>
          <h2 className="mb-3 text-2xl font-black">Master Specialistici</h2>
          <p className="mb-6 text-academy-gray-400">
            Sessioni intensive di un giorno su temi avanzati. Acquistabili singolarmente, aperti a tutti.
          </p>
          <Button href="/masterclass" variant="secondary">
            Scopri i Master
          </Button>
        </div>
      </SectionContainer>
    </>
  );
}
