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

      {/* Desktop/tablet (Figma 221:2767): hero COMPATTO in 2 colonne. SINISTRA =
          titolo + ricerca + tour (titolo SUBITO sopra la ricerca, non distaccato —
          Edoardo). DESTRA = rating allineato al CENTRO verticale (items-center sul
          row). Mobile (<sm): colonna unica, rating nascosto → titolo, ricerca, tour
          (congelato, padding/gap base invariati). */}
      <Container className="flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:py-16 lg:gap-10 lg:py-10">
        <div className="flex min-w-0 flex-col gap-6 sm:flex-1 sm:gap-7 lg:gap-4">
          <h1 className="text-4xl font-extrabold leading-tight text-white drop-shadow-sm sm:text-5xl lg:text-[52px]">{/* ds-guard-ignore: heading hero Figma desktop 64px, fuori type-scale */}
            {fill(dict.listing.heading, { city: city.name })}
          </h1>

          <ListingSearch cityName={city.name} lang={lang} dict={dict} />

          <p className="flex items-center gap-2 text-sm font-medium text-white sm:text-base">
            <Image src="/images/icon-walking.svg" alt="" width={24} height={24} className="shrink-0" />
            {fill(dict.listing.toursDone, {
              count: String(city.toursCount),
              city: city.name,
            })}
          </p>
        </div>

        {/* Rating: nascosto su mobile (Figma 64:2887). Da sm = colonna a destra,
            centrata verticalmente sulla colonna sinistra. Figma 221:4991: punteggio +
            stelle + "basato su N recensioni". */}
        <div className="hidden shrink-0 flex-col items-end gap-1.5 text-white sm:flex lg:gap-4">
          <span className="text-4xl font-extrabold leading-none sm:text-5xl lg:text-[52px]">{/* ds-guard-ignore: rate hero Figma desktop 64px, fuori type-scale */}
            {city.rating.toFixed(1)}
          </span>
          <Image
            src="/images/rating-stars-large.svg"
            alt={fill(dict.common.ratingAlt, { rating: city.rating.toFixed(1) })}
            width={160}
            height={31}
            className="lg:h-9 lg:w-auto"
          />
          <span className="text-right text-sm underline underline-offset-2 sm:text-base lg:text-xl">
            {dict.common.basedOn}{" "}
            <strong className="font-bold">{city.reviews.toLocaleString(lang)}</strong>{" "}
            {dict.common.reviews}
          </span>
        </div>
      </Container>
    </section>
  );
}
