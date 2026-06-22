import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { buildMetadata } from "@/lib/seo/metadata";
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
import { TrustBar } from "@/components/home/TrustBar";
import { Offers } from "@/components/home/Offers";
import { Reviews } from "@/components/home/Reviews";
import { Destinations } from "@/components/home/Destinations";
import { Partners } from "@/components/home/Partners";
import { SupportBanner } from "@/components/home/SupportBanner";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return buildMetadata({
    lang,
    path: "/",
    title: dict.meta.title,
    description: dict.meta.description,
  });
}

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
      {/* overflow-x-clip: il marquee Partners fa full-bleed con calc(50%-50vw)
          (sborda di ~scrollbar-width); clip qui evita lo scroll orizzontale
          senza creare uno scroll-container (no break su sticky). */}
      <main className="flex-1 overflow-x-clip">
        <Hero
          lang={lang}
          dict={dict}
          destinations={destinations}
          attractions={attractions}
          products={searchProducts}
        />
        <TrustBar />
        <Offers lang={lang} dict={dict} offers={offers} />
        <Reviews lang={lang} dict={dict} cta={dict.reviews.listingCta} reviews={reviews} slider loopTo={9} />
        <Destinations lang={lang} dict={dict} destinations={destinations} />
        <Partners dict={dict} partners={partners} />
        <SupportBanner dict={dict} />
      </main>
      <Footer lang={lang} dict={dict} />
    </>
  );
}
