import type { Metadata } from "next";
import { WorkshopGrid } from "@/components/workshops/workshop-grid";

export const metadata: Metadata = {
  title: "Masterclass Specialistici",
  description:
    "8 masterclass specialistici con professionisti del settore: Functional & Bulgarian, Strength, Calcio, Pallavolo, Tennis, Rugby, Running, Nuoto.",
};

export default function MasterclassIndexPage() {
  return <WorkshopGrid />;
}
