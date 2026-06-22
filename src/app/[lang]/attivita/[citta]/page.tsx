import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { fill, isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getListingAttractions, getListingProducts } from "@/lib/catalog";
import { buildMetadata } from "@/lib/seo/metadata";
import { absUrl } from "@/lib/seo/config";
import { breadcrumbLd, itemListLd } from "@/lib/seo/jsonld";
import { JsonLd } from "@/components/seo/JsonLd";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ListingHero } from "@/components/listing/ListingHero";
import { ListingResults } from "@/components/listing/ListingResults";
import { ListingFiltersProvider } from "@/components/listing/ListingFiltersProvider";
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
  return buildMetadata({
    lang,
    path: `/attivita/${citta}`,
    title: fill(dict.listing.metaTitle, { city: city.name }),
    description: fill(dict.listing.metaDescription, { city: city.name }),
  });
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

  const productUrls = products
    .filter((p) => p.slug)
    .map((p) => absUrl(`/${lang}/attivita/${citta}/${p.slug}`));
  const crumbs = breadcrumbLd([
    { name: "Home", path: `/${lang}` },
    { name: city.name, path: `/${lang}/attivita/${citta}` },
  ]);

  return (
    <>
      <JsonLd data={[itemListLd(productUrls), crumbs]} />
      <Header lang={lang} dict={dict} />
      {/* Desktop (Figma 221:2766): le Recensioni salgono SOPRA Attrazioni + FAQ.
          Si riordina SOLO da lg in su con flex `order`; i wrapper sono
          `display:contents` su mobile (nessun box, ordine = DOM) così il mobile
          resta congelato e identico. */}
      <main className="flex-1 lg:flex lg:flex-col">
        <ListingFiltersProvider>
          <ListingHero city={city} lang={lang} dict={dict} />
          <ListingResults lang={lang} dict={dict} products={products} />
        </ListingFiltersProvider>
        <div className="contents lg:block lg:order-2">
          <Attractions lang={lang} citta={citta} dict={dict} attractions={attractions} />
        </div>
        <div className="contents lg:block lg:order-3">
          <Faq dict={dict} />
        </div>
        <div className="contents lg:block lg:order-1">
          <Reviews
            lang={lang}
            dict={dict}
            title={fill(dict.reviews.listingTitle, { city: city.name })}
            slider
            loopTo={9}
          />
        </div>
        <div className="contents lg:block lg:order-4">
          <SupportBanner dict={dict} />
        </div>
      </main>
      <Footer lang={lang} dict={dict} />
    </>
  );
}
