import type { Metadata } from "next";
import { PercorsoHero } from "@/components/percorso/percorso-hero";
import { PercorsoBlocks } from "@/components/percorso/percorso-blocks";
import { PercorsoOutcome } from "@/components/percorso/percorso-outcome";
import { PercorsoTimeline } from "@/components/percorso/percorso-timeline";
import { PercorsoCertifications } from "@/components/percorso/percorso-certifications";
import { TrainingHubSection } from "@/components/home/training-hub-section";

export const metadata: Metadata = {
  title: "Il Percorso — Diventa Personal Elite Trainer FIPE",
  description:
    "9 mesi di formazione in presenza con 33+ docenti specialisti: Functional Training, Strength & Conditioning, recupero, nutrizione e business del fitness. Certificazione Personal Elite Trainer FIPE inclusa nei pack PRO ed ELITE.",
};

export default function PercorsoPage() {
  return (
    <>
      <PercorsoHero />
      <div id="blocchi">
        <PercorsoBlocks />
      </div>
      <PercorsoOutcome />
      <PercorsoTimeline />
      <PercorsoCertifications />
      <TrainingHubSection />
    </>
  );
}
