import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  WORKSHOPS,
  PUBLIC_WORKSHOPS,
  getWorkshopBySlug,
} from "@/lib/constants/workshops";
import { WorkshopDetail } from "@/components/workshops/workshop-detail";

interface MasterclassPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return WORKSHOPS.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({
  params,
}: MasterclassPageProps): Promise<Metadata> {
  const { slug } = await params;
  const workshop = getWorkshopBySlug(slug);
  if (!workshop) return {};

  return {
    title: workshop.title,
    description: workshop.focus,
    robots: workshop.hidden
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

export default async function MasterclassPage({
  params,
}: MasterclassPageProps) {
  const { slug } = await params;
  const workshop = getWorkshopBySlug(slug);
  if (!workshop) notFound();

  // "Altri masterclass" mostra solo voci pubbliche, mai hidden.
  const otherWorkshops = PUBLIC_WORKSHOPS.filter((w) => w.slug !== slug);

  return <WorkshopDetail workshop={workshop} otherWorkshops={otherWorkshops} />;
}
