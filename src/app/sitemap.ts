import type { MetadataRoute } from "next";
import { COURSES } from "@/lib/constants/courses";
import { PUBLIC_WORKSHOPS } from "@/lib/constants/workshops";

const SITE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://academy.lacertosus.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, priority: 1.0 },
    { url: `${SITE_URL}/percorso`, lastModified: now, priority: 0.9 },
    { url: `${SITE_URL}/masterclass`, lastModified: now, priority: 0.9 },
    { url: `${SITE_URL}/pack`, lastModified: now, priority: 0.9 },
    { url: `${SITE_URL}/docenti`, lastModified: now, priority: 0.7 },
  ];

  const courseRoutes: MetadataRoute.Sitemap = COURSES.map((c) => ({
    url: `${SITE_URL}/percorso/${c.slug}`,
    lastModified: now,
    priority: 0.8,
  }));

  const workshopRoutes: MetadataRoute.Sitemap = PUBLIC_WORKSHOPS.map((w) => ({
    url: `${SITE_URL}/masterclass/${w.slug}`,
    lastModified: now,
    priority: 0.7,
  }));

  return [...staticRoutes, ...courseRoutes, ...workshopRoutes];
}
