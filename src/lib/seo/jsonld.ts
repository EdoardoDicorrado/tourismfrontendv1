/**
 * Schema.org JSON-LD builders. Return plain objects; render with `<JsonLd>`.
 *
 * Note (claude-seo, 2026): Google retired FAQ rich results for all sites on
 * 2026-05-07 — no FAQPage builder here for SERP gain. HowTo is also deprecated.
 * All image URLs passed in must already be absolute.
 */
import { absUrl, ORG_LOGO, SITE_NAME, SITE_URL } from "./config";

type Json = Record<string, unknown>;

export function organizationLd(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: absUrl(ORG_LOGO),
    sameAs: ["https://www.linkedin.com/company/tourismotion"],
  };
}

export function webSiteLd(lang: string): Json {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: lang,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: absUrl(`/${lang}/cerca?q={search_term_string}`),
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/** items in crawl order: Home first. `path` is absolute-from-root incl. locale. */
export function breadcrumbLd(items: { name: string; path: string }[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absUrl(it.path),
    })),
  };
}

export function productLd(p: {
  name: string;
  description?: string;
  images: string[];
  url: string;
  price?: number;
  currency?: string;
  availability?: string;
  rating?: number;
  reviewCount?: number;
}): Json {
  const offer: Json = {
    "@type": "Offer",
    url: p.url,
    priceCurrency: p.currency ?? "EUR",
    availability: p.availability ?? "https://schema.org/InStock",
  };
  if (typeof p.price === "number") offer.price = p.price;

  const out: Json = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description,
    image: p.images,
    brand: { "@type": "Brand", name: SITE_NAME },
    offers: offer,
  };
  // Only emit AggregateRating with real review volume.
  if (typeof p.rating === "number" && typeof p.reviewCount === "number" && p.reviewCount > 0) {
    out.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: p.rating,
      reviewCount: p.reviewCount,
    };
  }
  return out;
}

export function articleLd(a: {
  headline: string;
  description?: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
  url: string;
}): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: a.headline,
    description: a.description,
    image: a.image ? [a.image] : undefined,
    datePublished: a.datePublished,
    dateModified: a.dateModified ?? a.datePublished,
    mainEntityOfPage: a.url,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: absUrl(ORG_LOGO) },
    },
  };
}

/** A list of items (listing/blog index) → ItemList of URLs. */
export function itemListLd(urls: string[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: urls.map((url, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url,
    })),
  };
}
