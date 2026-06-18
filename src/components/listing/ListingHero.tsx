import Image from "next/image";

import { Container } from "@/components/ui/Container";
import { ListingSearch } from "@/components/listing/ListingSearch";
import { fill, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { CityListing } from "@/data/listing";

/** Compact catalog hero — Colosseum backdrop, "Attività a {city}" + search + rating. Figma 221:2767. */
export function ListingHero({
  city,
  lang,
  dict,
}: {
  city: CityListing;
  lang: Locale;
  dict: Dictionary;
}) {
  return (
    <section className="relative z-30 border-b border-soft-grey">
      <Image
        src="/images/hero-colosseo.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/55 to-black/45"
      />

      <Container className="flex flex-col gap-7 py-14 sm:py-16 lg:py-20">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <h1 className="text-4xl font-extrabold leading-tight text-white drop-shadow-sm sm:text-5xl lg:text-6xl">
            {fill(dict.listing.heading, { city: city.name })}
          </h1>

          <div className="flex flex-col gap-1.5 text-white">
            <div className="flex items-center gap-3">
              <span className="text-4xl font-extrabold sm:text-5xl">
                {city.rating.toFixed(1)}
              </span>
              <Image
                src="/images/rating-stars-large.svg"
                alt={fill(dict.common.ratingAlt, { rating: city.rating.toFixed(1) })}
                width={160}
                height={31}
              />
            </div>
            <span className="text-sm underline underline-offset-2 sm:text-base">
              {dict.common.basedOn}{" "}
              <strong className="font-bold">{city.reviews.toLocaleString(lang)}</strong>{" "}
              {dict.common.reviews}
            </span>
          </div>
        </div>

        <ListingSearch cityName={city.name} lang={lang} dict={dict} />

        <p className="flex items-center gap-2 text-sm font-medium text-white sm:text-base">
          <Image src="/images/icon-walking.svg" alt="" width={24} height={24} className="shrink-0" />
          {fill(dict.listing.toursDone, {
            count: String(city.toursCount),
            city: city.name,
          })}
        </p>
      </Container>
    </section>
  );
}
