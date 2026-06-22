import type { Metadata, Viewport } from "next";
import { Raleway } from "next/font/google";
import { notFound } from "next/navigation";

import { locales, isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import {
  SITE_URL,
  SITE_NAME,
  THEME_COLOR,
  DEFAULT_OG_IMAGE,
  OG_LOCALE,
  isIndexableLocale,
} from "@/lib/seo/config";
import { organizationLd, webSiteLd } from "@/lib/seo/jsonld";
import { JsonLd } from "@/components/seo/JsonLd";
import { CartProvider } from "@/lib/cart/CartContext";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { AgencyBanner } from "@/components/layout/AgencyBanner";
import { MotionProvider } from "@/components/ui/motion/MotionProvider";
import { ToastProvider } from "@/lib/toast/ToastContext";
import "../globals.css";
import "../scrollbar.css";

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
  display: "swap",
});

type Params = { lang: string };

export function generateStaticParams(): Params[] {
  return locales.map((lang) => ({ lang }));
}

export const viewport: Viewport = { themeColor: THEME_COLOR };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    metadataBase: new URL(SITE_URL),
    title: dict.meta.title,
    description: dict.meta.description,
    // Blanket noindex for the not-yet-ready EN locale; it/es default to index.
    // Pages may still override (auth/private set their own noindex).
    robots: isIndexableLocale(lang) ? undefined : { index: false, follow: true },
    openGraph: {
      siteName: SITE_NAME,
      type: "website",
      locale: OG_LOCALE[lang] ?? OG_LOCALE.it,
      images: [{ url: DEFAULT_OG_IMAGE }],
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<Params>;
}>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    // scrollbar-gutter:stable riserva sempre lo spazio della scrollbar, così aprire
    // carrello/modale (che lockano lo scroll del body) NON nasconde la barra e NON
    // sposta il layout di sfondo.
    <html lang={lang} className={`${raleway.variable} h-full antialiased [scrollbar-gutter:stable]`}>
      <body className="min-h-full flex flex-col">
        <JsonLd data={[organizationLd(), webSiteLd(lang)]} />
        <MotionProvider>
          <CartProvider>
            <ToastProvider>
              <AgencyBanner label={dict.account.agencyBanner} />
              {children}
              <CartDrawer lang={lang} dict={dict} />
            </ToastProvider>
          </CartProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
