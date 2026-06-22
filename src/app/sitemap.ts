import type { MetadataRoute } from "next";

import { absUrl, INDEXABLE_LOCALES, X_DEFAULT_LOCALE } from "@/lib/seo/config";
import { products } from "@/data/product";
import { cityListings } from "@/data/listing";
import { articleSlugs } from "@/data/blog";

type Entry = MetadataRoute.Sitemap[number];
type ChangeFreq = NonNullable<Entry["changeFrequency"]>;

/** One sitemap entry (x-default loc) with it+es hreflang alternates. EN excluded. */
function entry(pathNoLocale: string, priority: number, changeFrequency: ChangeFreq): Entry {
  const sub = pathNoLocale === "/" ? "" : pathNoLocale;
  const languages: Record<string, string> = {};
  for (const loc of INDEXABLE_LOCALES) languages[loc] = absUrl(`/${loc}${sub}`);
  return {
    url: absUrl(`/${X_DEFAULT_LOCALE}${sub}`),
    lastModified: new Date(),
    changeFrequency,
    priority,
    alternates: { languages },
  };
}

/** Only public, indexable pages. Auth/account/checkout/private are omitted on purpose. */
export default function sitemap(): MetadataRoute.Sitemap {
  const out: MetadataRoute.Sitemap = [
    entry("/", 1, "daily"),
    entry("/recensioni", 0.6, "weekly"),
    entry("/chi-siamo", 0.5, "monthly"),
    entry("/blog", 0.7, "daily"),
    entry("/partner/agenzie", 0.6, "monthly"),
    entry("/partner/affiliati", 0.6, "monthly"),
    entry("/lavora-con-noi", 0.5, "monthly"),
  ];

  for (const citta of Object.keys(cityListings)) {
    out.push(entry(`/attivita/${citta}`, 0.9, "daily"));
  }
  for (const p of Object.values(products)) {
    out.push(entry(`/attivita/${p.city}/${p.slug}`, 0.8, "weekly"));
  }
  for (const slug of articleSlugs) {
    out.push(entry(`/blog/${slug}`, 0.6, "monthly"));
  }

  return out;
}
