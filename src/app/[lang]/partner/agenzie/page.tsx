import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AgenciesAudience } from "@/components/partner/AgenciesAudience";
import { AgenciesBenefits } from "@/components/partner/AgenciesBenefits";
import { AgenciesHero } from "@/components/partner/AgenciesHero";
import { AgenciesHowItWorks } from "@/components/partner/AgenciesHowItWorks";
import { AgenciesJoin } from "@/components/partner/AgenciesJoin";
import { AgenciesMission } from "@/components/partner/AgenciesMission";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { agenciesCopy } from "@/lib/i18n/dictionaries/agencies";

type Params = { lang: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = agenciesCopy[lang];
  return { title: t.meta.title, description: t.meta.description };
}

/**
 * Public travel-agencies landing (`/[lang]/partner/agenzie`, Figma 447:2752).
 * Marketing page for the B2B agency programme — distinct from the authenticated
 * portal under `/[lang]/agenzie/*`. CTAs point to the agency signup module.
 */
export default async function AgenciesLandingPage({ params }: { params: Promise<Params> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const t = agenciesCopy[lang];

  return (
    <>
      <Header lang={lang} dict={dict} />
      <main className="flex-1">
        <AgenciesHero lang={lang} t={t} />
        <AgenciesBenefits t={t} />
        <AgenciesHowItWorks t={t} />
        <AgenciesAudience t={t} />
        <AgenciesMission t={t} />
        <AgenciesJoin lang={lang} t={t} />
      </main>
      <Footer lang={lang} dict={dict} />
    </>
  );
}
