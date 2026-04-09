import type { Metadata } from "next";
import { PercorsoTimeline } from "@/components/percorso/percorso-timeline";
import { PercorsoHero } from "@/components/percorso/percorso-hero";
import { PercorsoOutcome } from "@/components/percorso/percorso-outcome";
import { TrainingHubSection } from "@/components/home/training-hub-section";

export const metadata: Metadata = {
  title: "Il Percorso Formativo",
  description:
    "Scopri il percorso CORPUS → VIS → VICTOR: 9 mesi di formazione in presenza per diventare un professionista del fitness completo.",
};

export default function PercorsoPage() {
  return (
    <>
      <PercorsoHero />
      <PercorsoTimeline />
      <PercorsoOutcome />
      <TrainingHubSection />
    </>
  );
}
