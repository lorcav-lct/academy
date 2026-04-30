import type { Metadata } from "next";
import { WorkshopGrid } from "@/components/workshops/workshop-grid";

export const metadata: Metadata = {
  title: "Masterclass Specialistici",
  description:
    "9 masterclass specialistici con professionisti del settore: Functional & Bulgarian, Strength, Calcio, Volley, Hyrox, Rugby, Running, Sport da Combattimento, Nuoto.",
};

export default function MasterclassIndexPage() {
  return <WorkshopGrid />;
}
