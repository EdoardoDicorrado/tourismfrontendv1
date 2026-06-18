import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ApplyPromo } from "@/components/careers/ApplyPromo";
import { CareersApplicationForm } from "@/components/careers/CareersApplicationForm";
import { CareersHero } from "@/components/careers/CareersHero";
import { OpenPositions } from "@/components/careers/OpenPositions";
import { WhyWorkWithUs } from "@/components/careers/WhyWorkWithUs";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

type Params = { lang: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.careers.meta.title, description: dict.careers.meta.description };
}

/**
 * "Lavora con noi" (`/[lang]/lavora-con-noi`) — careers landing: hero, why work
 * with us, searchable open positions, the application promo and the multi-step
 * application form (data → documents → confirmation). Figma section "Lavora con
 * noi" (447:1448). Footer links here from the "Azienda" column.
 */
export default async function CareersPage({ params }: { params: Promise<Params> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <>
      <Header lang={lang} dict={dict} />
      <main className="flex-1">
        <CareersHero dict={dict} />
        <WhyWorkWithUs dict={dict} />
        <OpenPositions dict={dict.careers} />
        <ApplyPromo dict={dict.careers} />
        <CareersApplicationForm lang={lang} dict={dict.careers} />
      </main>
      <Footer lang={lang} dict={dict} />
    </>
  );
}
