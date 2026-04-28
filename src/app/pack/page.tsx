import type { Metadata } from "next";
import { PackComparison } from "@/components/packs/pack-comparison";

export const metadata: Metadata = {
  title: "Pack & Prezzi",
  description:
    "Scegli il pack che fa per te: Start, Pro o Elite. Ogni pack include blocchi formativi, workshop e certificazione.",
};

export default function PackPage() {
  return <PackComparison />;
}
