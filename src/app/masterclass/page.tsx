import type { Metadata } from "next";
import { WorkshopGrid } from "@/components/workshops/workshop-grid";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getMasterclassVisibility } from "@/lib/settings/masterclass-visibility";
import { resolvePublicWorkshops } from "@/lib/constants/workshops";

export const metadata: Metadata = {
  title: "Masterclass Specialistici",
  description:
    "8 masterclass specialistici con professionisti del settore: Functional & Bulgarian, Strength, Calcio, Pallavolo, Tennis, Rugby, Running, Nuoto.",
};

export default async function MasterclassIndexPage() {
  const supabase = await createServerSupabaseClient();
  const visibility = await getMasterclassVisibility(supabase);
  const workshops = resolvePublicWorkshops(visibility);
  return <WorkshopGrid workshops={workshops} />;
}
