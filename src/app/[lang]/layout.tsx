import type { Metadata } from "next";
import { Raleway } from "next/font/google";
import { notFound } from "next/navigation";

import { locales, isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { CartProvider } from "@/lib/cart/CartContext";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { AgencyBanner } from "@/components/layout/AgencyBanner";
import { MotionProvider } from "@/components/ui/motion/MotionProvider";
import { ToastProvider } from "@/lib/toast/ToastContext";
import "../globals.css";

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
  display: "swap",
});

type Params = { lang: string };

export function generateStaticParams(): Params[] {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.meta.title, description: dict.meta.description };
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
    <html lang={lang} className={`${raleway.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
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
