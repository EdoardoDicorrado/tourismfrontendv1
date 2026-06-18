import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    // Our own design SVGs (icons, logos) are served via next/image from /public.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Catalog media (cover/thumb) comes from the backend's Spatie storage:
    // localhost in dev, the tatanka3 host in prod. Limited to /storage/**.
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "8000", pathname: "/storage/**" },
      { protocol: "https", hostname: "tatanka3.stiamolavorando.net", pathname: "/storage/**" },
    ],
    // Next 16's optimizer refuses upstreams that resolve to a private IP (SSRF
    // guard). The dev backend is localhost (-> 127.0.0.1/::1), so allow it ONLY
    // outside production; prod (tatanka3, public IP) keeps the guard on.
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
  },
};

export default nextConfig;
