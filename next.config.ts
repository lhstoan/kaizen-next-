import type { NextConfig } from "next";

const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  images: {
    // The product mockups never change under a given filename, so let the optimizer's
    // output — and the browser — hold on to a rendered size for a year instead of
    // re-validating every minute.
    minimumCacheTTL: 60 * 60 * 24 * 365,
    formats: ["image/avif", "image/webp"],
    remotePatterns: supabaseHostname
      ? [{ protocol: "https", hostname: supabaseHostname, pathname: "/storage/v1/object/public/**" }]
      : [],
  },
};

export default nextConfig;
