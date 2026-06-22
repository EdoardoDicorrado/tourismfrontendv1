import type { Metadata } from "next";

import { absUrl, BRAND_SUFFIX, DEFAULT_OG_IMAGE, isIndexableLocale, OG_LOCALE, SITE_NAME } from "./config";
import { buildAlternates } from "./alternates";

type BuildMetadataInput = {
  lang: string;
  /** Path WITHOUT the `/[lang]` prefix, leading slash. "" or "/" = home. */
  path: string;
  title: string;
  description?: string;
  /** OG/twitter image, absolute or root-relative. Defaults to the brand OG. */
  image?: string;
  type?: "website" | "article";
  /** Force noindex (auth/private/transactional pages). EN is always noindex regardless. */
  index?: boolean;
  follow?: boolean;
};

/** Append the brand suffix unless the title already mentions the brand. */
function withBrand(title: string): string {
  return title.includes(SITE_NAME) ? title : `${title}${BRAND_SUFFIX}`;
}

/**
 * One factory for every page's `<head>`: title (brand-suffixed), description,
 * canonical, hreflang (it+es+x-default), Open Graph, Twitter and robots.
 *
 * Indexability = caller's `index` AND locale is it/es. EN never gets indexed and
 * never emits hreflang (only a self canonical).
 */
export function buildMetadata({
  lang,
  path,
  title,
  description,
  image,
  type = "website",
  index = true,
  follow = true,
}: BuildMetadataInput): Metadata {
  const indexable = index && isIndexableLocale(lang);
  const fullTitle = withBrand(title);
  const ogImage = image ?? DEFAULT_OG_IMAGE;
  const url = absUrl(`/${lang}${path === "/" || path === "" ? "" : path}`);

  return {
    title: fullTitle,
    description,
    alternates: indexable ? buildAlternates(path, lang) : { canonical: url },
    robots: { index: indexable, follow, googleBot: { index: indexable, follow } },
    openGraph: {
      title: fullTitle,
      description,
      type,
      siteName: SITE_NAME,
      url,
      locale: OG_LOCALE[lang] ?? OG_LOCALE.it,
      images: [{ url: ogImage, alt: title }],
    },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: [ogImage] },
  };
}
