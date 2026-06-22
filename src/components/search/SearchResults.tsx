"use client";

import Image from "next/image";
import Link from "next/link";

import type { Destination, Product } from "@/data/home";
import type { Attraction } from "@/data/listing";
import { ButtonLink } from "@/components/ui/Button";
import { fill } from "@/lib/i18n/config";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type Props = {
  lang: Locale;
  dict: Dictionary;
  /** Current query string (already raw; trimmed/tokenised here). */
  query: string;
  destinations: Destination[];
  attractions: Attraction[];
  products: Product[];
  /** Called when a row/CTA is followed, so the host can close its popup/dropdown. */
  onNavigate: () => void;
  /** Desktop dropdown: shorter rows, no description (just title/eyebrow + badge). */
  compact?: boolean;
};

/** Tokenised AND match over a product's searchable fields — mirrors `/[lang]/cerca`. */
function matches(product: Product, terms: string[]): boolean {
  if (terms.length === 0) return true;
  const haystack = [product.title, product.category, product.city, ...product.meta]
    .join(" ")
    .toLowerCase();
  return terms.every((term) => haystack.includes(term));
}

/** Product detail when a slug exists, otherwise the city listing (see ProductCard). */
function productHref(lang: Locale, p: Product): string {
  return p.slug ? `/${lang}/attivita/${p.city}/${p.slug}` : `/${lang}/attivita/${p.city}`;
}

/**
 * Shared search content: empty state shows curated destinations + attractions;
 * typing filters the catalog live ("Tutto su: {q}"). Rendered both by the mobile
 * full-screen {@link SearchOverlay} and the desktop dropdown (HomeSearchDesktop).
 */
export function SearchResults({
  lang,
  dict,
  query,
  destinations,
  attractions,
  products,
  onNavigate,
  compact = false,
}: Props) {
  const trimmed = query.trim();
  const terms = trimmed.toLowerCase().split(/\s+/).filter(Boolean);
  const results = trimmed ? products.filter((p) => matches(p, terms)) : [];

  if (trimmed) {
    return (
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-extrabold text-ink">
          {fill(dict.search.allAbout, { q: trimmed })}
        </h2>
        {results.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {results.map((p) => (
              <li key={p.id}>
                <ResultCard
                  href={productHref(lang, p)}
                  image={p.image}
                  title={p.title}
                  badge={p.badge}
                  text={p.meta.join(" · ")}
                  onNavigate={onNavigate}
                  compact={compact}
                />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-2 flex flex-col items-center gap-4 rounded-card border border-stroke-2 bg-white py-12 text-center">
            <h3 className="text-lg font-bold text-ink">
              {fill(dict.search.noResultsTitle, { q: trimmed })}
            </h3>
            <p className="max-w-md text-sm text-ink/70">{dict.search.noResultsHint}</p>
            <ButtonLink href={`/${lang}/attivita/roma`} onClick={onNavigate} size="sm" className="px-6 py-3">
              {dict.search.exploreAll}
            </ButtonLink>
          </div>
        )}
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-extrabold text-ink">{dict.search.suggestionsTitle}</h2>
        <ul className="flex flex-col gap-2">
          {destinations.map((d) => (
            <li key={d.slug}>
              <ResultCard
                href={`/${lang}/attivita/${d.slug}`}
                image={d.image}
                title={d.name}
                badge={d.badge}
                text={d.description}
                onNavigate={onNavigate}
                compact={compact}
              />
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-extrabold text-ink">{dict.search.attractionsTitle}</h2>
        <ul className="flex flex-col gap-2">
          {attractions.map((a) => (
            <li key={a.slug}>
              <ResultCard
                href={`/${lang}/cerca?q=${encodeURIComponent(a.name)}`}
                image={a.image}
                eyebrow={a.city}
                title={a.name}
                text={a.description}
                onNavigate={onNavigate}
                compact={compact}
              />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

/**
 * Horizontal media card used for every row (suggestions + results).
 * `compact` (desktop dropdown): shorter row — smaller thumbnail, no min-height, and
 * the description is dropped (only eyebrow/title + badge).
 */
function ResultCard({
  href,
  image,
  eyebrow,
  title,
  badge,
  text,
  onNavigate,
  compact = false,
}: {
  href: string;
  image: string;
  eyebrow?: string;
  title: string;
  badge?: string;
  text?: string;
  onNavigate: () => void;
  compact?: boolean;
}) {
  // ds-guard-ignore-next-line: min-h/thumbnail card mobile (dimensioni Figma, nessun token)
  const cardCls = `flex items-stretch overflow-hidden rounded-card border border-soft bg-white transition-colors hover:border-cta focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta ${compact ? "" : "min-h-[96px]"}`;
  // ds-guard-ignore-next-line: larghezza thumbnail mobile (Figma, nessun token)
  const thumbCls = compact ? "relative w-20 shrink-0" : "relative w-[120px] shrink-0 sm:w-[141px]";
  return (
    <Link href={href} onClick={onNavigate} className={cardCls}>
      <div className={thumbCls}>
        <Image src={image} alt="" fill sizes="141px" className="object-cover" />
      </div>
      <div
        className={`flex min-w-0 flex-1 flex-col justify-center ${compact ? "gap-0.5 px-3 py-1.5" : "gap-1.5 px-4 py-2"}`}
      >
        {eyebrow && <span className="text-xs font-semibold uppercase text-cta">{eyebrow}</span>}
        <h3 className="font-extrabold uppercase leading-tight text-ink sm:text-lg">{title}</h3>
        {badge && (
          <span className="inline-flex w-fit rounded-badge bg-badge px-2 py-1 text-xs font-extrabold text-white">
            {badge}
          </span>
        )}
        {!compact && text && <p className="line-clamp-2 text-xs leading-snug text-ink/80">{text}</p>}
      </div>
    </Link>
  );
}
