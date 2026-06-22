import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AffiliateRequestForm } from "@/components/partner/AffiliateRequestForm";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { affiliatesCopy } from "@/lib/i18n/dictionaries/affiliates";
import { buildMetadata } from "@/lib/seo/metadata";

type Params = { lang: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = affiliatesCopy[lang];
  return buildMetadata({
    lang,
    path: "/partner/affiliati/candidati",
    title: t.form.title,
  });
}

/** Affiliate request — 2-step form page reached from the "Diventa affiliato" CTAs. */
export default async function AffiliateRequestPage({ params }: { params: Promise<Params> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const t = affiliatesCopy[lang];

  return (
    <>
      <Header lang={lang} dict={dict} />
      <main className="flex-1">
        <AffiliateRequestForm lang={lang} t={t} />
      </main>
      <Footer lang={lang} dict={dict} />
    </>
  );
}
