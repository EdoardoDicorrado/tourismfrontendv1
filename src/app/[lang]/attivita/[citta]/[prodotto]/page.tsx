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
import { StickyBackBar } from "@/components/product/StickyBackBar";
import { ProductTrust } from "@/components/product/ProductTrust";
import { Description } from "@/components/product/Description";
import { TextSection } from "@/components/product/TextSection";
import { IncludedList } from "@/components/product/IncludedList";
import { MeetingPoint } from "@/components/product/MeetingPoint";
import { ProductSupport } from "@/components/product/ProductSupport";
import { RelatedActivities } from "@/components/product/RelatedActivities";
import { Reviews } from "@/components/home/Reviews";
import { Faq } from "@/components/listing/Faq";
import { products } from "@/data/product";
import type { InfoRow, IncludedList as IncludedListData, MeetingPoint as MeetingPointData } from "@/data/product";
import { getProductDetail } from "@/lib/catalog";
import { getSession } from "@/lib/account/session";
import { RecordRecentlyViewed } from "@/components/product/RecordRecentlyViewed";
import type { Product } from "@/data/home";

type Params = { lang: string; citta: string; prodotto: string };

/**
 * PREVIEW fallback (ui-ux-3) — renderizza TUTTE le sezioni Figma anche quando il
 * prodotto non ha i campi editoriali compilati (es. tour che arrivano dall'API
 * senza descrizione/meeting point), così si verifica a colpo d'occhio l'intero
 * layout. I testi "Lorem ipsum" segnano i buchi di contenuto.
 * ⚠️ Rimuovere questo blocco (e ripristinare i guard condizionali sotto) quando i
 * contenuti reali sono completi: in produzione non si mostra lorem ipsum.
 */
const LOREM =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor.";
const LOREM_SHORT = "Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod.";

const PLACEHOLDER_INFO: InfoRow[] = [
  { icon: "/images/icon-cancellation.svg", title: "Lorem ipsum", text: LOREM_SHORT },
  { icon: "/images/icon-duration.svg", title: "Lorem ipsum", text: LOREM_SHORT },
  { icon: "/images/icon-languages.svg", title: "Lorem ipsum", text: LOREM_SHORT },
  { icon: "/images/icon-group.svg", title: "Lorem ipsum", text: LOREM_SHORT },
];
const placeholderList = (title: string): IncludedListData => ({
  title,
  items: [LOREM_SHORT, LOREM_SHORT, LOREM_SHORT, LOREM_SHORT],
});
const PLACEHOLDER_MEETING: MeetingPointData = {
  text: LOREM,
  mapImage: "/images/map-meeting-point.png",
  mapUrl: "#",
};

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

  // Logged-in agencies see their discounted price on the booking box (Figma agency price).
  const isAgency = (await getSession())?.role === "agency";

  // Summary recorded into the client "recently viewed" store (home row). Maps the
  // detail view model to the listing `Product` the card renders; fields the card
  // doesn't use (avatars/meta) are left empty.
  const recentlyViewed: Product = {
    id: product.slug,
    city: product.city,
    slug: product.slug,
    category: "Tour Guidato",
    title: product.title,
    image: product.gallery[0]?.src ?? "",
    avatars: [],
    rating: product.rating,
    reviewsCount: product.reviews,
    languages: product.languages,
    meta: [],
    badge: product.badge,
    priceFrom: product.priceFrom,
    oldPrice: product.oldPrice,
    currency: product.currency,
  };

  return (
    <>
      <Header lang={lang} dict={dict} />
      <RecordRecentlyViewed product={recentlyViewed} />
      <main className="flex-1">
        {/* pb-0: niente padding sotto la Descrizione, così il separatore
            Descrizione→Recensioni resta a 16px sopra/sotto (il respiro sotto lo dà
            il pt di Reviews, senza raddoppiare col pb del Container). */}
        <Container className="pt-6 pb-0">
          <ProductGallery
            images={product.gallery}
            dict={dict}
            fallbackHref={`/${lang}/attivita/${citta}`}
          />
          {/* Ancora per la barra "torna indietro" sticky: quando questo marker (fine
              galleria) scrolla sopra il viewport, la barra appare. */}
          <div id="gallery-end" aria-hidden className="h-0" />
          <div className="mt-6">
            <ProductHeader product={product} lang={lang} dict={dict} />
          </div>

          {/* Figma 64:9402 (mobile) order: Informazioni Generali → BookingBox →
              Perché piace → Descrizione. DOM order already matches the mobile flow;
              from lg the grid pulls the booking box into the sticky right column. */}
          <div className="mt-8 flex flex-col gap-8 lg:grid lg:grid-cols-[1fr_380px] lg:items-start">
            <div className="min-w-0 lg:col-start-1 lg:row-start-1">
              <InfoGenerali rows={product.info.length > 0 ? product.info : PLACEHOLDER_INFO} dict={dict} />
            </div>

            <aside className="min-w-0 lg:col-start-2 lg:row-start-1 lg:self-start lg:sticky lg:top-4">
              <BookingBox product={product} lang={lang} dict={dict} isAgency={isAgency} />
            </aside>

            <div className="flex min-w-0 flex-col gap-4 lg:col-start-1 lg:row-start-2">
              <ProductTrust dict={dict} />
              <Description text={product.description || LOREM} dict={dict} />
            </div>
          </div>
        </Container>

        {/* Recensioni: a metà pagina, subito dopo la Descrizione (Figma). Full-bleed. */}
        <Reviews lang={lang} dict={dict} />

        {/* Sezioni editoriali: separatori teal (border-cta) tra le sezioni, con
            16px di respiro sopra/sotto ogni linea (Figma 64:9402). Incluso/Escluso
            = UNA sola sezione (Figma 64:10481), non due affiancate. */}
        {/* Niente py sul Container: la linea SUPERIORE (Recensioni→Cose da sapere)
            la dà il border-t qui sotto; il respiro sopra/sotto lo danno il pb di
            Reviews e il pt interno delle sezioni, senza raddoppi. */}
        <Container>
          {/* gap-0: lo spazio (16px) attorno a ogni separatore lo dà il padding
              interno delle sezioni (Disclosure py-4 / ProductSupport py-4) + il
              border-t di apertura, così il ritmo resta uniforme come in Figma. */}
          <div className="flex flex-col border-t border-cta">
            <TextSection title={dict.product.thingsToKnow} text={product.thingsToKnow || LOREM} />
            <IncludedList
              included={product.included ?? placeholderList(dict.product.included)}
              notIncluded={product.notIncluded ?? placeholderList(dict.product.notIncluded)}
              includedTitle={dict.product.included}
              notIncludedTitle={dict.product.notIncluded}
            />
            {/* "Assistenza" — support accordion (Figma 64:10517): tra Incluso e Punto
                d'incontro, al posto del vecchio SupportBanner geco (che resta sulla home). */}
            <ProductSupport dict={dict} />
            <MeetingPoint data={product.meetingPoint ?? PLACEHOLDER_MEETING} dict={dict} />
            <TextSection title={dict.product.accessibility} text={product.accessibility || LOREM} />
          </div>
        </Container>

        <Faq dict={dict} />
        <RelatedActivities cityName={product.cityName} lang={lang} dict={dict} />
        <div className="h-28 lg:hidden" aria-hidden />
      </main>
      <StickyBackBar
        title={product.title}
        fallbackHref={`/${lang}/attivita/${citta}`}
        dict={dict}
      />
      <StickyBookingBar product={product} dict={dict} isAgency={isAgency} />
      <Footer lang={lang} dict={dict} />
    </>
  );
}
