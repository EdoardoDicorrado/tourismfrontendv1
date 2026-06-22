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
import { BookingProvider } from "@/components/product/BookingContext";
import { ProductOptions } from "@/components/product/ProductOptions";
import { StickyBookingBar } from "@/components/product/StickyBookingBar";
import { StickyBackBar } from "@/components/product/StickyBackBar";
import { ProductTrust } from "@/components/product/ProductTrust";
import { ShareButton } from "@/components/product/ShareButton";
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
import { buildMetadata } from "@/lib/seo/metadata";
import { absUrl } from "@/lib/seo/config";
import { productLd, breadcrumbLd } from "@/lib/seo/jsonld";
import { JsonLd } from "@/components/seo/JsonLd";
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
  return buildMetadata({
    lang,
    path: `/attivita/${citta}/${prodotto}`,
    title: product.title,
    description: product.shortDescription,
    image: product.gallery[0]?.src,
    type: "website",
  });
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

  // SEO structured data: Product (with offer + rating) and the breadcrumb trail.
  const productImages = product.gallery.map((g) => (g.src.startsWith("/") ? absUrl(g.src) : g.src));
  const productUrl = absUrl(`/${lang}/attivita/${citta}/${prodotto}`);
  const ld = productLd({
    name: product.title,
    description: product.shortDescription,
    images: productImages,
    url: productUrl,
    price: product.priceFrom,
    currency: product.currency,
    rating: product.rating,
    reviewCount: product.reviews,
  });
  const crumbs = breadcrumbLd([
    { name: "Home", path: `/${lang}` },
    { name: product.cityName, path: `/${lang}/attivita/${citta}` },
    { name: product.title, path: `/${lang}/attivita/${citta}/${prodotto}` },
  ]);

  return (
    <>
      <JsonLd data={[ld, crumbs]} />
      <Header lang={lang} dict={dict} />
      <RecordRecentlyViewed product={recentlyViewed} />
      <main className="flex-1">
        {/* DESKTOP (lg+) — 2 colonne. SINISTRA: titolo+meta, galleria (thumb verticali),
            descrizione breve, info generali, descrizione lunga, recensioni, editoriali,
            FAQ. DESTRA: BookingBox (card bianca) + "Perché piace ai nostri clienti",
            sticky fino allo slider "altre attività". Sotto lg il grid è INERTE (solo
            classi lg:*) → tutto rende IDENTICO al mobile (CONGELATO, #86). Istanze
            UNICHE (BookingBox/ProductTrust/Header/Gallery): l'ordine DOM tiene il
            mobile; su desktop reorder via lg:order — niente id #prenota duplicato. */}
        {/* BookingProvider: counts/data condivisi tra il BookingBox (colonna destra)
            e le opzioni in colonna principale (ProductOptions, desktop). */}
        <BookingProvider product={product}>
        <div className="lg:mx-auto lg:grid lg:max-w-[var(--container-site)] lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-8">
          {/* A — colonna SINISTRA, riga 1. Mobile (block): galleria → header → info.
              Desktop (lg:flex + lg:order): header(1) → galleria(2) → descr.breve(3) →
              info(4). Le mt-* mobile sono azzerate su desktop (lg:mt-0, spazio = gap-6). */}
          <Container className="pt-6 pb-0 lg:col-start-1 lg:row-start-1 lg:min-w-0 lg:flex lg:flex-col lg:gap-6">
            <div className="lg:order-2">
              <ProductGallery
                images={product.gallery}
                dict={dict}
                fallbackHref={`/${lang}/attivita/${citta}`}
              />
              {/* Ancora per la barra "torna indietro" sticky (mobile): quando questo
                  marker (fine galleria) scrolla sopra il viewport, la barra appare. */}
              <div id="gallery-end" aria-hidden className="h-0" />
            </div>
            <div className="mt-6 lg:order-1 lg:mt-0">
              <ProductHeader product={product} lang={lang} dict={dict} />
            </div>
            {/* Descrizione breve: su DESKTOP sotto la galleria (Edoardo); su mobile è
                dentro ProductHeader (qui hidden). */}
            <p className="hidden text-base text-ink/80 lg:order-3 lg:block">
              {product.shortDescription}
            </p>
            {/* Opzioni (Edoardo / Figma 221:8186): su DESKTOP nella colonna principale
                SUBITO SOTTO la descrizione breve, non nel box a destra. Su mobile niente
                qui — restano inline nel BookingBox (flow congelato). */}
            <div className="hidden lg:order-4 lg:block">
              <ProductOptions product={product} lang={lang} dict={dict} />
            </div>
            <div className="mt-8 lg:order-5 lg:mt-0">
              <InfoGenerali rows={product.info.length > 0 ? product.info : PLACEHOLDER_INFO} dict={dict} />
            </div>
          </Container>

          {/* DESTRA — BookingBox (card bianca su lg) + "Perché piace ai nostri clienti".
              UNICA istanza: mobile in flusso (box=4° posto, trust=5°), desktop colonna
              sticky che copre entrambe le righe (row-span-2). px mobile per il gutter
              del box + il full-bleed dello slider trust; lg:px-0 = card a filo colonna. */}
          <aside className="mt-8 flex min-w-0 flex-col gap-8 px-4 sm:px-6 lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:mt-0 lg:gap-6 lg:self-start lg:px-0 lg:pt-6 lg:sticky lg:top-6">
            {/* Condividi — solo desktop, in cima alla colonna destra in linea col
                titolo (Edoardo). Su mobile non c'è (layout congelato). */}
            <div className="hidden lg:flex lg:justify-end">
              <ShareButton title={product.title} />
            </div>
            <BookingBox product={product} lang={lang} dict={dict} isAgency={isAgency} />
            <ProductTrust dict={dict} />
          </aside>

          {/* B — colonna SINISTRA, riga 2: descrizione lunga, recensioni, sezioni
              editoriali, FAQ. mt-4 = ex gap-4 (trust → descrizione) su mobile. */}
          <div className="mt-4 min-w-0 lg:col-start-1 lg:row-start-2 lg:mt-0">
            <Container className="pb-0">
              <Description text={product.description || LOREM} dict={dict} />
            </Container>

            {/* Recensioni: subito dopo la Descrizione (Figma). Il pt di Reviews dà il
                respiro sopra (il Container sopra ha pb-0). `slider` = scorrevole
                manualmente (freccia + drag della CardSlider), NESSUN auto-slide. */}
            <Reviews lang={lang} dict={dict} slider />

            {/* Sezioni editoriali: separatori teal (border-cta) tra le sezioni, con
                16px di respiro sopra/sotto ogni linea (Figma 64:9402). Incluso/Escluso
                = UNA sola sezione (Figma 64:10481), non due affiancate. Niente py sul
                Container: la linea superiore la dà il border-t; il respiro lo danno il
                pb di Reviews e il pt interno delle sezioni, senza raddoppi. */}
            <Container>
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
          </div>
        </div>
        </BookingProvider>

        {/* FINE blocco 2 colonne: "Altre attività su {città}" = slider full-width. */}
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
