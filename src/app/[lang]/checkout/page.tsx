import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getSession } from "@/lib/account/session";
import { getCheckoutAgency } from "@/lib/checkout/agency";
import { Footer } from "@/components/layout/Footer";
import { CheckoutView } from "@/components/checkout/CheckoutView";

type Params = { lang: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: `${dict.checkout.title} — TourisMotion` };
}

export default async function CheckoutPage({ params }: { params: Promise<Params> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  // Signed-in checkout: an agency sees its stored data (contact/billing/saved
  // methods) instead of the personal-data form; any logged-in user skips the
  // email-verification interstitial (only guests verify).
  const session = await getSession();
  const agency = session?.role === "agency" ? await getCheckoutAgency(session) : null;

  // Niente Header nel checkout: flusso focalizzato, l'utente non naviga via (Figma
  // "Checkout// Mobile" non ha la top-bar). Header resta nelle altre pagine, conferma inclusa.
  return (
    <>
      <main className="flex-1">
        <CheckoutView lang={lang} dict={dict} agency={agency} loggedIn={!!session} />
      </main>
      <Footer lang={lang} dict={dict} />
    </>
  );
}
