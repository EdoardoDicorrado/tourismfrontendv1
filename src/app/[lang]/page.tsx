import { notFound } from "next/navigation";

import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import {
  getHomeDestinations,
  getHomeOffers,
  getHomePartners,
  getHomeReviews,
  getListingAttractions,
  getListingProducts,
} from "@/lib/catalog";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { RecentlyViewed } from "@/components/home/RecentlyViewed";
import { TrustBar } from "@/components/home/TrustBar";
import { Offers } from "@/components/home/Offers";
import { Reviews } from "@/components/home/Reviews";
import { Destinations } from "@/components/home/Destinations";
import { Partners } from "@/components/home/Partners";
import { SupportBanner } from "@/components/home/SupportBanner";

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const [destinations, offers, attractions, searchProducts, partners, reviews] =
    await Promise.all([
      getHomeDestinations(lang),
      getHomeOffers(lang),
      getListingAttractions(lang),
      // All seeded tours live under Roma today; widen once the catalog API supports
      // cross-city search (matches the `/[lang]/cerca` results page).
      getListingProducts("roma", lang),
      getHomePartners(),
      getHomeReviews(),
    ]);

  return (
    <>
      <Header lang={lang} dict={dict} />
      <main className="flex-1">
        <Hero
          lang={lang}
          dict={dict}
          destinations={destinations}
          attractions={attractions}
          products={searchProducts}
        />
        <RecentlyViewed lang={lang} dict={dict} />
        <TrustBar />
        <Offers lang={lang} dict={dict} offers={offers} />
        <Reviews lang={lang} dict={dict} cta={dict.reviews.listingCta} reviews={reviews} />
        <Destinations lang={lang} dict={dict} destinations={destinations} />
        <Partners dict={dict} partners={partners} />
        <SupportBanner dict={dict} />
      </main>
      <Footer lang={lang} dict={dict} />
    </>
  );
}
