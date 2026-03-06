import type { Metadata } from "next";
import { WorkshopGrid } from "@/components/workshops/workshop-grid";

export const metadata: Metadata = {
  title: "Workshop Specialistici",
  description:
    "8 workshop specialistici con professionisti del settore: Hyrox, Calcio, Functional Training, Endurance, Nuoto, Rugby, Volley, Sport da Combattimento.",
};

export default function WorkshopIndexPage() {
  return <WorkshopGrid />;
}
