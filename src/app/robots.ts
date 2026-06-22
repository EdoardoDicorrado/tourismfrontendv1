import type { MetadataRoute } from "next";

import { absUrl, PROD_URL, SITE_URL } from "@/lib/seo/config";

/**
 * robots.txt. On any non-production host (localhost/staging/preview) we
 * Disallow everything so previews never get indexed. In prod we allow public
 * pages and block private/transactional trees across every locale prefix.
 */
export default function robots(): MetadataRoute.Robots {
  if (SITE_URL !== PROD_URL) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/*/accedi",
        "/*/area/",
        "/*/agenzie/",
        "/*/affiliati/",
        "/*/checkout",
        "/*/carrello",
        "/*/supporto",
        "/*/ds",
      ],
    },
    sitemap: absUrl("/sitemap.xml"),
    host: SITE_URL,
  };
}
