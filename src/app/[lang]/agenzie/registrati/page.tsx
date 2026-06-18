import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AgencySignupView } from "@/components/account/AgencySignupView";
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
 * Agency registration (`/[lang]/agenzie/registrati`). Submits to the
 * `/api/auth/agency/signup` BFF and, on success, shows a "pending activation"
 * notice (no session — the account must be activated by staff first). Uses the
 * wider card since the form has two sections.
 */
export default async function AgencySignupPage({ params }: { params: Promise<Params> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <>
      <Header lang={lang} dict={dict} />
      <main className="flex-1">
        <Container className="flex justify-center py-12 sm:py-16">
          <div className="w-full max-w-[640px] rounded-[15px] border border-soft-grey bg-white p-6 sm:p-8">
            <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">
              {dict.account.agencySignup.title}
            </h1>
            <p className="mt-1 text-sm text-ink/70">{dict.account.agencySignup.subtitle}</p>
            <div className="mt-6">
              <AgencySignupView lang={lang} dict={dict.account.agencySignup} />
            </div>
          </div>
        </Container>
      </main>
      <Footer lang={lang} dict={dict} />
    </>
  );
}
