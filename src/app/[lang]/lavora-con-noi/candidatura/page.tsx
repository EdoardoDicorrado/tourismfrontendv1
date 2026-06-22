import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CareersApplicationForm } from "@/components/careers/CareersApplicationForm";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { buildMetadata } from "@/lib/seo/metadata";

type Params = { lang: string };
type Search = { posizione?: string };

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
    path: "/lavora-con-noi/candidatura",
    title: dict.careers.form.headingBrand,
  });
}

/**
 * Standalone application page (`/[lang]/lavora-con-noi/candidatura`) — the
 * multi-step "Lavora con noi" form, moved off the landing. Without `?posizione`
 * it's a spontaneous application; with it, the title reads "Candidatura per
 * {posizione} – Step N" (the role looked up from the careers dictionary).
 */
export default async function CareersApplyPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Search>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const { posizione } = await searchParams;
  const dict = await getDictionary(lang);
  const positionTitle = posizione
    ? dict.careers.positions.items.find((p) => p.id === posizione)?.title
    : undefined;

  return (
    <>
      <Header lang={lang} dict={dict} />
      <main className="flex-1">
        <CareersApplicationForm lang={lang} dict={dict.careers} positionTitle={positionTitle} />
      </main>
      <Footer lang={lang} dict={dict} />
    </>
  );
}
