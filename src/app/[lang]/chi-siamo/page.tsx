import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AboutHero } from "@/components/about/AboutHero";
import { AboutStats } from "@/components/about/AboutStats";
import { AboutStory } from "@/components/about/AboutStory";
import { WhyChooseUs } from "@/components/about/WhyChooseUs";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { buildMetadata } from "@/lib/seo/metadata";

type Params = { lang: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return buildMetadata({
    lang,
    path: "/chi-siamo",
    title: dict.about.meta.title,
    description: dict.about.meta.description,
  });
}

/**
 * "Chi siamo" (`/[lang]/chi-siamo`) — about page: hero, the Tourismotion story
 * and mission, key numbers and the "why choose us" cards with the careers CTA.
 * Figma section "Chi siamo" (447:1231). Linked from the footer "Azienda" column
 * and from the careers application confirmation.
 */
export default async function AboutPage({ params }: { params: Promise<Params> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <>
      <Header lang={lang} dict={dict} />
      <main className="flex-1">
        <AboutHero dict={dict} />
        <AboutStory dict={dict} />
        <AboutStats dict={dict} />
        <WhyChooseUs lang={lang} dict={dict} />
      </main>
      <Footer lang={lang} dict={dict} />
    </>
  );
}
