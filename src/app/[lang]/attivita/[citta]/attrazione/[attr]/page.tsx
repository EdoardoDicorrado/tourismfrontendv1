import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { fill, isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getListingAttractions, getListingProducts } from "@/lib/catalog";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ListingHero } from "@/components/listing/ListingHero";
import { ListingResults } from "@/components/listing/ListingResults";
import { ListingFiltersProvider } from "@/components/listing/ListingFiltersProvider";
import { Reviews } from "@/components/home/Reviews";
import { SupportBanner } from "@/components/home/SupportBanner";
import { cityListings, type CityListing } from "@/data/listing";

type Params = { lang: string; citta: string; attr: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { lang, citta, attr } = await params;
  const city = cityListings[citta];
  if (!isLocale(lang) || !city) return {};
  const dict = await getDictionary(lang);
  const attraction = (await getListingAttractions(lang)).find((a) => a.slug === attr);
  if (!attraction) return {};
  return {
    title: fill(dict.listing.metaTitle, { city: attraction.name }),
    description: fill(dict.listing.metaDescription, { city: attraction.name }),
  };
}

/**
 * Dedicated listing for a single attraction (e.g. "Attività al Colosseo"). Reuses
 * the city-listing layout but the products are pre-filtered to the ones tagged
 * `attr-<slug>`. Reached by tapping an attraction card in the city listing.
 */
export default async function AttractionListingPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { lang, citta, attr } = await params;
  if (!isLocale(lang)) notFound();
  const city = cityListings[citta];
  if (!city) notFound();
  const dict = await getDictionary(lang);
  const [allProducts, attractions] = await Promise.all([
    getListingProducts(citta, lang),
    getListingAttractions(lang),
  ]);
  const attraction = attractions.find((a) => a.slug === attr);
  if (!attraction) notFound();

  const products = allProducts.filter((p) => (p.tags ?? []).includes(`attr-${attr}`));

  // The hero reuses the city-listing hero with the attraction as the "place":
  // heading "Attività a {attraction}", rating from the parent city, tour count
  // from the filtered set.
  const attractionAsCity: CityListing = {
    slug: attr,
    name: attraction.name,
    toursCount: String(products.length),
    rating: city.rating,
    reviews: city.reviews,
  };

  return (
    <>
      <Header lang={lang} dict={dict} />
      <main className="flex-1">
        <ListingFiltersProvider>
          <ListingHero city={attractionAsCity} lang={lang} dict={dict} />
          <ListingResults lang={lang} dict={dict} products={products} />
        </ListingFiltersProvider>
        <Reviews
          lang={lang}
          dict={dict}
          title={fill(dict.reviews.listingTitle, { city: attraction.name })}
        />
        <SupportBanner dict={dict} />
      </main>
      <Footer lang={lang} dict={dict} />
    </>
  );
}
