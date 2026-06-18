"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { ButtonLink } from "@/components/ui/Button";
import { CardSlider } from "@/components/ui/CardSlider";
import { Container } from "@/components/ui/Container";
import { ProductCard } from "@/components/home/ProductCard";
import { cities, type Product } from "@/data/home";
import { fill, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * "Tour in offerta" — city tabs filter a localized, clickable product grid.
 * Figma node 221:1108. Offers are sourced server-side via the `lib/catalog`
 * facade (backend + fixture fallback) and passed in as props.
 */
export function Offers({
  lang,
  dict,
  offers,
}: {
  lang: Locale;
  dict: Dictionary;
  offers: Product[];
}) {
  const [activeCity, setActiveCity] = useState(cities[0].slug);

  // In home mostriamo al massimo 12 offerte per città; il resto sta nel listing
  // (bottone "Vedi tutti").
  const MAX_OFFERS = 12;
  const shown = offers.filter((o) => o.city === activeCity).slice(0, MAX_OFFERS);
  const activeName = cities.find((c) => c.slug === activeCity)?.name ?? activeCity;

  return (
    <section className="py-3 sm:py-12">
      <Container>
        <h2 className="text-2xl font-extrabold text-ink">{dict.offers.title}</h2>

        {/* Full-bleed like the card slider below (-mx-4 + px-4) so the last tab
            (Torino/Bologna) scrolls fully to the screen edge instead of being
            clipped by the Container padding, and tabs align with the cards. */}
        <div className="no-scrollbar -mx-4 mt-5 flex gap-6 overflow-x-auto px-4">
          {cities.map((city) => {
            const active = city.slug === activeCity;
            return (
              <button
                key={city.slug}
                type="button"
                onClick={() => setActiveCity(city.slug)}
                aria-pressed={active}
                className={`flex shrink-0 items-center gap-4 border-b-2 py-2 text-xl font-extrabold text-ink transition-colors ${
                  active ? "border-cta" : "border-transparent hover:text-cta"
                }`}
              >
                {city.thumb && (
                  <Image
                    src={city.thumb}
                    alt=""
                    width={36}
                    height={36}
                    className="rounded-full object-cover"
                  />
                )}
                {city.name}
              </button>
            );
          })}
        </div>

        {shown.length > 0 ? (
          <>
            <CardSlider
              label={dict.common.nextCard}
              className="no-scrollbar -mx-4 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4"
            >
              {shown.map((product) => (
                <li
                  key={product.id}
                  className="w-[267px] shrink-0 snap-start sm:w-auto"
                >
                  <ProductCard product={product} lang={lang} dict={dict} />
                </li>
              ))}
            </CardSlider>
            <div className="mt-6">
              <ButtonLink href={`/${lang}/attivita/${activeCity}`} size="md" fullWidth>
                {fill(dict.offers.seeAll, { city: activeName })}
              </ButtonLink>
            </div>
          </>
        ) : (
          <div className="mt-6 flex flex-col items-start gap-4 rounded-[10px] border border-dashed border-stroke bg-soft/40 p-8">
            <p className="text-ink/70">{fill(dict.offers.empty, { city: activeName })}</p>
            <Link
              href={`/${lang}/attivita/${activeCity}`}
              className="inline-flex items-center gap-1 text-sm font-extrabold text-cta hover:underline"
            >
              {fill(dict.offers.exploreCity, { city: activeName })}
              <span aria-hidden>→</span>
            </Link>
          </div>
        )}
      </Container>
    </section>
  );
}
