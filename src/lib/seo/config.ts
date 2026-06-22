/**
 * SEO single source of truth — client-safe (no `server-only` imports) so it can
 * feed metadata, sitemap, robots, JSON-LD and client share helpers alike.
 *
 * Locale policy: only `it` and `es` are indexed for now. EN content is still
 * incomplete, so EN pages are served but kept OUT of sitemap/hreflang and forced
 * to `noindex` (see `buildMetadata`). Flip by adding "en" to INDEXABLE_LOCALES.
 */

/** Canonical host, no trailing slash. Prod overrides via NEXT_PUBLIC_SITE_URL. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://tourismotion.com").replace(/\/+$/, "");
export const PROD_URL = "https://tourismotion.com";
export const SITE_NAME = "TourisMotion";
export const BRAND_SUFFIX = " — TourisMotion";

export const INDEXABLE_LOCALES = ["it", "es"] as const;
export type IndexableLocale = (typeof INDEXABLE_LOCALES)[number];
export const X_DEFAULT_LOCALE = "it";

/** og:locale code per app locale. */
export const OG_LOCALE: Record<string, string> = { it: "it_IT", es: "es_ES", en: "en_US" };

// `<meta name="theme-color">` needs a literal color (a CSS var would be ignored
// by the browser), so this mirrors --color-cta by hand.
export const THEME_COLOR = "#007ca2"; // ds-guard-ignore
// ponytail: interim OG = the logo (real asset, no 404). Swap for a 1200x630 brand
// OG image when design ships it — then add width/height back in buildMetadata.
export const DEFAULT_OG_IMAGE = "/images/logo-tourismotion.png";
export const ORG_LOGO = "/images/logo-tourismotion.png";

/** Absolute URL on the canonical host. */
export const absUrl = (path: string): string => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

export const isIndexableLocale = (lang: string): lang is IndexableLocale =>
  (INDEXABLE_LOCALES as readonly string[]).includes(lang);
