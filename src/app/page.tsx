import { HeroSection } from "@/components/home/hero-section";
import { PathOverview } from "@/components/home/path-overview";
import { StatsSection } from "@/components/home/stats-section";
import { ValueProposition } from "@/components/home/value-proposition";
import { WorkshopPreview } from "@/components/home/workshop-preview";
import { CTASection } from "@/components/home/cta-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <PathOverview />
      <StatsSection />
      <ValueProposition />
      <WorkshopPreview />
      <CTASection />
    </>
  );
}
