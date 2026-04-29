import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { COURSES, getCourseBySlug } from "@/lib/constants/courses";
import { PercorsoBlockDetail } from "@/components/percorso/percorso-block-detail";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return COURSES.map((c) => ({ slug: c.slug }));
}

const SEO_DESC: Record<string, string> = {
  function:
    "Functional Training, anatomia e biomeccanica applicata: pattern di movimento, valutazione funzionale, programmazione e attrezzi. Blocco I del percorso Lacertosus Academy — 2 weekend in presenza con 7 docenti.",
  strength:
    "Strength & Conditioning, tecnica con bilanciere, sprint e potenza, periodizzazione e preparazione atletica per atleti e operatori tattici. Blocco II del percorso Lacertosus Academy — 2 weekend con 7 docenti.",
  science:
    "Recupero, nutrizione applicata alla performance, psicologia del movimento, attività fisica e malattie neurodegenerative, business e branding del fitness. Blocco III del percorso Lacertosus Academy — 2 weekend con 12 docenti.",
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourseBySlug(slug);
  if (!course) return {};

  return {
    title: `${course.title} — ${course.area} · Lacertosus Academy`,
    description: SEO_DESC[slug] ?? course.objective,
  };
}

export default async function BlockPage({ params }: PageProps) {
  const { slug } = await params;
  const course = getCourseBySlug(slug);
  if (!course) notFound();

  const sorted = [...COURSES].sort((a, b) => a.sortOrder - b.sortOrder);
  const idx = sorted.findIndex((c) => c.slug === slug);
  const prevCourse = idx > 0 ? sorted[idx - 1] : null;
  const nextCourse = idx < sorted.length - 1 ? sorted[idx + 1] : null;

  return (
    <PercorsoBlockDetail
      course={course}
      prevCourse={prevCourse}
      nextCourse={nextCourse}
    />
  );
}
