import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WORKSHOPS, getWorkshopBySlug } from "@/lib/constants/workshops";
import { WorkshopDetail } from "@/components/workshops/workshop-detail";

interface WorkshopPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return WORKSHOPS.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }: WorkshopPageProps): Promise<Metadata> {
  const { slug } = await params;
  const workshop = getWorkshopBySlug(slug);
  if (!workshop) return {};

  return {
    title: workshop.title,
    description: workshop.focus,
  };
}

export default async function WorkshopPage({ params }: WorkshopPageProps) {
  const { slug } = await params;
  const workshop = getWorkshopBySlug(slug);
  if (!workshop) notFound();

  const currentIndex = WORKSHOPS.findIndex((w) => w.slug === slug);
  const otherWorkshops = WORKSHOPS.filter((_, i) => i !== currentIndex);

  return <WorkshopDetail workshop={workshop} otherWorkshops={otherWorkshops} />;
}
