import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DEFAULT_HERO_SLIDES } from "@/lib/constants/hero-slides";
import { HeroSection } from "@/components/home/hero-section";
import { SocialProofBar } from "@/components/home/social-proof-bar";
import { ValueProposition } from "@/components/home/value-proposition";
import { PackPreview } from "@/components/home/pack-preview";
import { PathOverview } from "@/components/home/path-overview";
import { FaqSection } from "@/components/home/faq-section";
import { CTASection } from "@/components/home/cta-section";

export default async function HomePage() {
  /* Fetch hero slides from DB, fall back to static defaults */
  let slides = DEFAULT_HERO_SLIDES;
  try {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase
      .from("hero_slides")
      .select("*")
      .eq("active", true)
      .order("sort_order", { ascending: true });
    if (data && data.length > 0) slides = data;
  } catch {
    /* table not yet migrated — use defaults */
  }

  return (
    <>
      {/* #1  Hero */}
      <HeroSection slides={slides} />
      {/* #2  Perché Lacertosus */}
      <ValueProposition />
      {/* #3  I Numeri — Social Proof Bento */}
      <SocialProofBar />
      {/* #4  Pack / Pricing */}
      <PackPreview />
      {/* #5  I 3 Blocchi Formativi */}
      <PathOverview />
      {/* #6  FAQ */}
      <FaqSection />
      {/* #12 CTA Finale */}
      <CTASection />
    </>
  );
}
