import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://academy.lacertosus.com";

// Block crawlers on staging/preview to avoid duplicate content with production.
const isProductionDomain = SITE_URL.includes("academy.lacertosus.com");

export default function robots(): MetadataRoute.Robots {
  if (!isProductionDomain) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/account",
          "/account/",
          "/api/",
          "/auth/",
          "/checkout",
          "/conferma",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
