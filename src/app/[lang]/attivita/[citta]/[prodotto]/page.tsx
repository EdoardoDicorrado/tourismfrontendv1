import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductHeader } from "@/components/product/ProductHeader";
import { InfoGenerali } from "@/components/product/InfoGenerali";
import { BookingBox } from "@/components/product/BookingBox";
import { StickyBookingBar } from "@/components/product/StickyBookingBar";
import { ProductTrust } from "@/components/product/ProductTrust";
import { Description } from "@/components/product/Description";
import { TextSection } from "@/components/product/TextSection";
import { IncludedList } from "@/components/product/IncludedList";
import { MeetingPoint } from "@/components/product/MeetingPoint";
import { RelatedActivities } from "@/components/product/RelatedActivities";
import { Reviews } from "@/components/home/Reviews";
import { Faq } from "@/components/listing/Faq";
import { SupportBanner } from "@/components/home/SupportBanner";
import { products } from "@/data/product";
import { getProductDetail } from "@/lib/catalog";

type Params = { lang: string; citta: string; prodotto: string };

export function generateStaticParams(): { citta: string; prodotto: string }[] {
  return Object.values(products).map((p) => ({ citta: p.city, prodotto: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { lang, citta, prodotto } = await params;
  if (!isLocale(lang)) return {};
  const product = await getProductDetail(citta, prodotto, lang);
  if (!product) return {};
  return {
    title: `${product.title} — TourisMotion`,
    description: product.shortDescription,
  };
}

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const { lang, citta, prodotto } = await params;
  if (!isLocale(lang)) notFound();
  const product = await getProductDetail(citta, prodotto, lang);
  if (!product) notFound();
  const dict = await getDictionary(lang);

  return (
    <>
      <Header lang={lang} dict={dict} />
      <main className="flex-1">
        <Container className="py-6">
          <ProductGallery images={product.gallery} dict={dict} />
          <div className="mt-6">
            <ProductHeader product={product} lang={lang} dict={dict} />
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
            <aside className="lg:col-start-2 lg:row-start-1 lg:self-start lg:sticky lg:top-4">
              <BookingBox product={product} lang={lang} dict={dict} />
            </aside>

            <div className="flex flex-col gap-10 lg:col-start-1 lg:row-start-1">
              {product.info.length > 0 && <InfoGenerali rows={product.info} dict={dict} />}
              <ProductTrust dict={dict} />
              {product.description && <Description text={product.description} dict={dict} />}
              {product.thingsToKnow && (
                <TextSection title={dict.product.thingsToKnow} text={product.thingsToKnow} />
              )}
              {(product.included || product.notIncluded) && (
                <div className="grid gap-8 sm:grid-cols-2">
                  {product.included && (
                    <IncludedList data={product.included} included title={dict.product.included} />
                  )}
                  {product.notIncluded && (
                    <IncludedList data={product.notIncluded} included={false} title={dict.product.notIncluded} />
                  )}
                </div>
              )}
              {product.meetingPoint && <MeetingPoint data={product.meetingPoint} dict={dict} />}
              {product.accessibility && (
                <TextSection title={dict.product.accessibility} text={product.accessibility} />
              )}
            </div>
          </div>
        </Container>

        <Reviews lang={lang} dict={dict} />
        <Faq dict={dict} />
        <RelatedActivities cityName={product.cityName} lang={lang} dict={dict} />
        <SupportBanner dict={dict} />
        <div className="h-28 lg:hidden" aria-hidden />
      </main>
      <StickyBookingBar product={product} dict={dict} />
      <Footer lang={lang} dict={dict} />
    </>
  );
}
