import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AffiliatesAudience } from "@/components/partner/AffiliatesAudience";
import { AffiliatesBenefits } from "@/components/partner/AffiliatesBenefits";
import { AffiliatesFaq } from "@/components/partner/AffiliatesFaq";
import { AffiliatesHero } from "@/components/partner/AffiliatesHero";
import { AffiliatesHowItWorks } from "@/components/partner/AffiliatesHowItWorks";
import { AffiliatesTools } from "@/components/partner/AffiliatesTools";
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
    path: "/partner/affiliati",
    title: t.meta.title,
    description: t.meta.description,
  });
}

/**
 * Public "Affiliati" landing (`/[lang]/partner/affiliati`, Figma 447:3585).
 * Marketing page for the affiliate programme; the "Diventa affiliato" CTAs lead to
 * the 2-step request page (`/partner/affiliati/candidati`). Footer links here from
 * the "Collabora con noi" column.
 */
export default async function AffiliatesLandingPage({ params }: { params: Promise<Params> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const t = affiliatesCopy[lang];

  return (
    <>
      <Header lang={lang} dict={dict} />
      <main className="flex-1">
        <AffiliatesHero lang={lang} t={t} />
        <AffiliatesBenefits t={t} />
        <AffiliatesHowItWorks t={t} />
        <AffiliatesTools t={t} />
        <AffiliatesAudience lang={lang} t={t} />
        <AffiliatesFaq t={t} />
      </main>
      <Footer lang={lang} dict={dict} />
    </>
  );
}
