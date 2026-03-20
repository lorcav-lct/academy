import type { Metadata } from "next";
import { TeachersGrid } from "@/components/docenti/teachers-grid";

export const metadata: Metadata = {
  title: "I Docenti",
  description:
    "Scopri il corpo docente di Lacertosus Academy: ricercatori universitari, professionisti d'élite e campioni internazionali.",
};

export default function DocentiPage() {
  return (
    <main className="min-h-screen pt-32 pb-24">
      <TeachersGrid />
    </main>
  );
}
