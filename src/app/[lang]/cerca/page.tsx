import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { fill, isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { formatDateLong } from "@/lib/format";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ProductCard } from "@/components/home/ProductCard";
import { getListingProducts } from "@/lib/catalog";
import type { Product } from "@/data/home";

type Params = { lang: string };
type Search = { [key: string]: string | string[] | undefined };

/** searchParams values can be string | string[]; take the first occurrence. */
function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

/** Tokenised AND match over the searchable fields of a product. */
function matches(product: Product, terms: string[]): boolean {
  if (terms.length === 0) return true;
  const haystack = [product.title, product.category, product.city, ...product.meta]
    .join(" ")
    .toLowerCase();
  return terms.every((term) => haystack.includes(term));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: `${dict.search.button} — TourisMotion` };
}

/**
 * Search results (`/[lang]/cerca`). Target of the home Hero and listing search
 * forms. The storefront search API on tatanka3 does not exist yet (see CLAUDE.md),
 * so results are filtered from the same mock fixtures as the listing page; swap
 * `listingProducts` for a `backendFetch()` query once the catalog API lands.
 */
export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Search>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const sp = await searchParams;
  const dict = await getDictionary(lang);

  const query = first(sp.q).trim();
  const rawDate = first(sp.date).trim();
  const dateLabel = /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? formatDateLong(rawDate, lang) : rawDate;

  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  // Catalog comes from the storefront API (fixture fallback). All seeded tours
  // live under Roma today; widen this once the API supports cross-city search.
  const catalog = await getListingProducts("roma", lang);
  const results = catalog.filter((p) => matches(p, terms));

  return (
    <>
      <Header lang={lang} dict={dict} />
      <main className="flex-1">
        <Container className="py-8 sm:py-10">
          <form
            action={`/${lang}/cerca`}
            className="mx-auto flex w-full max-w-[760px] items-center justify-between gap-3 rounded-full border border-stroke bg-white py-2 pl-6 pr-2 shadow-sm"
          >
            <div className="flex flex-1 items-center gap-3 sm:gap-4">
              <Image
                src="/images/icon-search.svg"
                alt=""
                width={24}
                height={24}
                className="shrink-0"
              />
              <input
                type="search"
                name="q"
                defaultValue={query}
                placeholder={dict.search.homePlaceholder}
                aria-label={dict.search.homePlaceholder}
                className="w-full bg-transparent text-base text-ink outline-none placeholder:text-stroke sm:text-lg"
              />
            </div>
            {rawDate && <input type="hidden" name="date" value={rawDate} />}
            <Button type="submit" pill size="md" className="shrink-0 sm:px-7 sm:text-lg">
              {dict.search.button}
            </Button>
          </form>

          <div className="mt-8">
            <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">
              {query
                ? fill(dict.search.resultsTitle, { q: query })
                : dict.search.allResults}
            </h1>
            <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink/70">
              <span>{fill(dict.search.resultsCount, { count: String(results.length) })}</span>
              {dateLabel && (
                <span className="inline-flex items-center gap-1 rounded-full bg-soft-grey px-3 py-1 font-medium text-ink">
                  {dict.search.dateLabel}: {dateLabel}
                </span>
              )}
            </p>
          </div>

          {results.length > 0 ? (
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((p) => (
                <ProductCard key={p.id} product={p} lang={lang} dict={dict} />
              ))}
            </div>
          ) : (
            <div className="mt-10 flex flex-col items-center gap-4 rounded-[10px] border border-stroke-2 bg-white py-14 text-center">
              <h2 className="text-lg font-bold text-ink">
                {fill(dict.search.noResultsTitle, { q: query })}
              </h2>
              <p className="max-w-md text-sm text-ink/70">{dict.search.noResultsHint}</p>
              <ButtonLink href={`/${lang}/attivita/roma`} size="sm">
                {dict.search.exploreAll}
              </ButtonLink>
            </div>
          )}
        </Container>
      </main>
      <Footer lang={lang} dict={dict} />
    </>
  );
}
