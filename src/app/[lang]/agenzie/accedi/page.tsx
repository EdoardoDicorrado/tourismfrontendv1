import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { AgencyLoginForm } from "@/components/account/AgencyLoginForm";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Container } from "@/components/ui/Container";
import { getSession } from "@/lib/account/session";
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
  return { title: `${dict.account.agencyLogin.title} — TourisMotion` };
}

/**
 * Agency sign-in (`/[lang]/agenzie/accedi`). Email + password → BFF
 * `/api/auth/agency`, which sets the httpOnly session cookie. Already-authenticated
 * agencies are redirected straight to their bookings list.
 */
export default async function AgencyLoginPage({ params }: { params: Promise<Params> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  // Skip the form if already signed in as an agency (redirect OUTSIDE try/catch).
  const session = await getSession();
  if (session?.role === "agency") redirect(`/${lang}/agenzie/prenotazioni`);

  const dict = await getDictionary(lang);

  return (
    <>
      <Header lang={lang} dict={dict} />
      <main className="flex-1">
        <Container className="flex justify-center py-12 sm:py-16">
          <div className="w-full max-w-[420px] rounded-[15px] border border-soft-grey bg-white p-6 sm:p-8">
            <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">
              {dict.account.agencyLogin.title}
            </h1>
            <p className="mt-1 text-sm text-ink/70">{dict.account.agencyLogin.subtitle}</p>
            <div className="mt-6">
              <AgencyLoginForm lang={lang} dict={dict.account.agencyLogin} />
            </div>
          </div>
        </Container>
      </main>
      <Footer lang={lang} dict={dict} />
    </>
  );
}
