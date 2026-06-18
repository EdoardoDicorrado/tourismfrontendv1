import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getSession } from "@/lib/account/session";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { CustomerLoginForm } from "@/components/account/CustomerLoginForm";

type Params = { lang: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: `${dict.account.customerLogin.title} — TourisMotion` };
}

/**
 * Customer login (`/[lang]/area/accedi`). Classic email + password sign-in; the
 * session is scoped to the user (all their bookings). The actual auth happens in
 * the BFF `POST /api/auth/customer/login`, which sets the httpOnly session cookie.
 *
 * If a customer session already exists, skip the form and go to the bookings
 * list. (An agency session does NOT satisfy a customer login — they keep seeing
 * the form, which is fine; the customer flow is independent.)
 */
export default async function CustomerLoginPage({ params }: { params: Promise<Params> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const session = await getSession();
  if (session?.role === "customer") {
    redirect(`/${lang}/area/prenotazioni`);
  }

  const t = dict.account.customerLogin;

  return (
    <>
      <Header lang={lang} dict={dict} />
      <main className="flex-1">
        <Container className="flex justify-center py-12 sm:py-16">
          <div className="w-full max-w-[420px] rounded-[15px] border border-soft-grey bg-white p-6 sm:p-8">
            <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">{t.title}</h1>
            <p className="mt-1 text-sm text-ink/70">{t.subtitle}</p>
            <div className="mt-6">
              <CustomerLoginForm lang={lang} dict={t} />
            </div>
          </div>
        </Container>
      </main>
      <Footer lang={lang} dict={dict} />
    </>
  );
}
