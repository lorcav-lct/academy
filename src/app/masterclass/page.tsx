import type { Metadata } from "next";
import { WorkshopGrid } from "@/components/workshops/workshop-grid";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getMasterclassVisibility } from "@/lib/settings/masterclass-visibility";
import { getMasterclassSalesMode } from "@/lib/settings/sales-mode";
import {
  resolvePublicWorkshops,
  resolvePublicInternationalWorkshops,
} from "@/lib/constants/workshops";

export const metadata: Metadata = {
  title: "Masterclass Specialistici",
  description:
    "8 masterclass specialistici con professionisti del settore: Functional & Bulgarian, Strength, Calcio, Pallavolo, Tennis, Rugby, Running, Nuoto.",
};

export default async function MasterclassIndexPage() {
  const supabase = await createServerSupabaseClient();
  const [visibility, salesMode] = await Promise.all([
    getMasterclassVisibility(supabase),
    getMasterclassSalesMode(supabase),
  ]);
  const workshops = resolvePublicWorkshops(visibility);
  const internationalWorkshops =
    resolvePublicInternationalWorkshops(visibility);
  return (
    <WorkshopGrid
      workshops={workshops}
      internationalWorkshops={internationalWorkshops}
      salesMode={salesMode}
    />
  );
}
