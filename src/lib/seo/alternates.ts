import type { Metadata } from "next";

import { absUrl, INDEXABLE_LOCALES, X_DEFAULT_LOCALE } from "./config";

/**
 * Canonical + hreflang block for a public, indexable page.
 *
 * @param pathNoLocale path WITHOUT the `/[lang]` prefix, leading slash.
 *   "" or "/" = home; e.g. "/attivita/roma", "/blog/colosseo".
 * @param currentLang locale being rendered (canonical is self-referencing).
 *
 * Emits hreflang only for it+es (+x-default→it). EN is deliberately excluded.
 */
export function buildAlternates(pathNoLocale: string, currentLang: string): NonNullable<Metadata["alternates"]> {
  const sub = pathNoLocale === "/" || pathNoLocale === "" ? "" : pathNoLocale;
  const languages: Record<string, string> = {};
  for (const loc of INDEXABLE_LOCALES) languages[loc] = absUrl(`/${loc}${sub}`);
  languages["x-default"] = absUrl(`/${X_DEFAULT_LOCALE}${sub}`);
  return { canonical: absUrl(`/${currentLang}${sub}`), languages };
}
