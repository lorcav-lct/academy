import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/workshop",
        destination: "/masterclass",
        permanent: true,
      },
      {
        source: "/workshop/:slug",
        destination: "/masterclass/:slug",
        permanent: true,
      },
      {
        source: "/corsi/:slug",
        destination: "/percorso/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
