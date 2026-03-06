import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { COURSES, getCourseBySlug } from "@/lib/constants/courses";
import { CourseDetail } from "@/components/courses/course-detail";

interface CoursePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return COURSES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourseBySlug(slug);
  if (!course) return {};

  return {
    title: `${course.title} — ${course.area}`,
    description: course.objective,
  };
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { slug } = await params;
  const course = getCourseBySlug(slug);
  if (!course) notFound();

  const currentIndex = COURSES.findIndex((c) => c.slug === slug);
  const prevCourse = currentIndex > 0 ? COURSES[currentIndex - 1] : null;
  const nextCourse = currentIndex < COURSES.length - 1 ? COURSES[currentIndex + 1] : null;

  return (
    <CourseDetail
      course={course}
      prevCourse={prevCourse}
      nextCourse={nextCourse}
    />
  );
}
