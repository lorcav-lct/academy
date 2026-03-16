import type { Metadata } from "next";
import { WorkshopGrid } from "@/components/workshops/workshop-grid";

export const metadata: Metadata = {
  title: "Masterclass Specialistici",
  description:
    "8 masterclass specialistici con professionisti del settore: Hyrox, Calcio, Functional Training, Endurance, Nuoto, Rugby, Volley, Sport da Combattimento.",
};

export default function MasterclassIndexPage() {
  return <WorkshopGrid />;
}
