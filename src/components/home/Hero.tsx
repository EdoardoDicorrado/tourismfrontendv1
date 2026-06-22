import Image from "next/image";

import { Container } from "@/components/ui/Container";
import { HomeSearchBar } from "@/components/search/HomeSearchBar";
import { RecentlyViewed } from "@/components/home/RecentlyViewed";
import type { Destination, Product } from "@/data/home";
import type { Attraction } from "@/data/listing";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * Homepage hero — full-bleed backdrop with the headline, search trigger and
 * social-proof line bottom-aligned. Figma node 1:756: content left-aligned and
 * bottom-anchored (24px padding); headline Raleway Bold 32px white; a borderless
 * rounded search pill (no "Cerca" button); social-proof in soft-blue, 14px.
 */
export function Hero({
  lang,
  dict,
  destinations,
  attractions,
  products,
}: {
  lang: Locale;
  dict: Dictionary;
  destinations: Destination[];
  attractions: Attraction[];
  products: Product[];
}) {
  return (
    <section className="relative isolate flex min-h-[503px] flex-col justify-end overflow-hidden py-6">
      <Image
        src="/images/hero-pisa.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-t from-black/45 via-black/15 to-transparent"
      />

      <Container className="flex flex-col items-start gap-4">
        <h1 className="text-[32px] font-bold leading-tight text-white sm:text-5xl">
          {dict.home.headline}
        </h1>

        <HomeSearchBar
          lang={lang}
          dict={dict}
          destinations={destinations}
          attractions={attractions}
          products={products}
        />

        <p className="flex items-start gap-4 text-sm font-medium text-soft">
          {/* Figma node 1:763: soft-blue (#def3fb) ticket glyph, matching the
              social-proof text. Distinct asset from the TrustBar's #007ca2 icon. */}
          <Image
            src="/images/icon-ticket-soft.svg"
            alt=""
            width={21}
            height={21}
            className="mt-0.5 shrink-0"
          />
          {dict.home.travelers}
        </p>

        {/* "Sei ancora interessato a:" lives inside the hero, right below the
            social-proof line; renders nothing unless a (demo) user is signed in.
            `products` = il catalogo tour reale, usato per scartare voci stale dalla
            cronologia e completare la riga con tour esistenti. */}
        <RecentlyViewed lang={lang} dict={dict} products={products} />
      </Container>
    </section>
  );
}
