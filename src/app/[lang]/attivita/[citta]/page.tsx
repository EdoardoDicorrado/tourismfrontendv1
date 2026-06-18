import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { fill, isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getListingAttractions, getListingProducts } from "@/lib/catalog";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ListingHero } from "@/components/listing/ListingHero";
import { ListingResults } from "@/components/listing/ListingResults";
import { Attractions } from "@/components/listing/Attractions";
import { Faq } from "@/components/listing/Faq";
import { Reviews } from "@/components/home/Reviews";
import { SupportBanner } from "@/components/home/SupportBanner";
import { cityListings } from "@/data/listing";

type Params = { lang: string; citta: string };

/** Pre-render the cities we have fixtures for; the catalog API will drive these later. */
export function generateStaticParams(): { citta: string }[] {
  return Object.keys(cityListings).map((citta) => ({ citta }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { lang, citta } = await params;
  const city = cityListings[citta];
  if (!isLocale(lang) || !city) return {};
  const dict = await getDictionary(lang);
  return {
    title: fill(dict.listing.metaTitle, { city: city.name }),
    description: fill(dict.listing.metaDescription, { city: city.name }),
  };
}

export default async function ListingPage({ params }: { params: Promise<Params> }) {
  const { lang, citta } = await params;
  if (!isLocale(lang)) notFound();
  const city = cityListings[citta];
  if (!city) notFound();
  const dict = await getDictionary(lang);
  const [products, attractions] = await Promise.all([
    getListingProducts(citta, lang),
    getListingAttractions(lang),
  ]);

  return (
    <>
      <Header lang={lang} dict={dict} />
      <main className="flex-1">
        <ListingHero city={city} lang={lang} dict={dict} />
        <ListingResults lang={lang} dict={dict} products={products} />
        <Attractions dict={dict} attractions={attractions} />
        <Faq dict={dict} />
        <Reviews
          lang={lang}
          dict={dict}
          title={fill(dict.reviews.listingTitle, { city: city.name })}
          cta={dict.reviews.listingCta}
        />
        <SupportBanner dict={dict} />
      </main>
      <Footer lang={lang} dict={dict} />
    </>
  );
}
