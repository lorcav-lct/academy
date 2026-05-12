import type { Metadata } from "next";
import { PackComparison } from "@/components/packs/pack-comparison";

export const metadata: Metadata = {
  title: "Pack & Prezzi",
  description:
    "Scegli il pack che fa per te: Start, Pro o Elite. Tutti includono il diploma Functional Strength Master Trainer (CSEN) e 2.0 CEU NSCA. Pro ed Elite aggiungono la certificazione Personal Elite Trainer FIPE.",
};

export default function PackPage() {
  return <PackComparison />;
}
