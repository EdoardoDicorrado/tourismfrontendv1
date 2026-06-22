import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AgencyApplyWizard } from "@/components/account/AgencyApplyWizard";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Container } from "@/components/ui/Container";
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
  return { title: `${dict.account.agencySignup.title} — TourisMotion` };
}

/**
 * Agency partnership application (`/[lang]/agenzie/registrati`) — 2-step wizard +
 * confirmation, Figma "Modulo // Mobile" (447:3087 / 447:3252 / 447:3434). A
 * lead/candidatura (no account here): an operator follows up after submission.
 * Supersedes the old 25-field account form — AgencySignupForm/View are kept for
 * now (see ui-ux-4 task #3) but no longer mounted here.
 */
export default async function AgencySignupPage({ params }: { params: Promise<Params> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <>
      <Header lang={lang} dict={dict} />
      <main className="flex-1">
        <Container className="py-8 sm:py-10">
          <AgencyApplyWizard lang={lang} />
        </Container>
      </main>
      <Footer lang={lang} dict={dict} />
    </>
  );
}
