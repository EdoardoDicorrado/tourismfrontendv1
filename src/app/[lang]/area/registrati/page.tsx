import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { CustomerSignupView } from "@/components/account/CustomerSignupView";
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
  return { title: `${dict.account.customerSignup.title} — TourisMotion` };
}

/**
 * Customer registration (`/[lang]/area/registrati`). Classic email+password signup
 * with double opt-in: on success the view shows a "check your email" notice (no
 * session — the user must verify the email first). Submits to the
 * `/api/auth/customer/register` BFF.
 */
export default async function CustomerSignupPage({ params }: { params: Promise<Params> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const session = await getSession();
  if (session?.role === "customer") {
    redirect(`/${lang}/area/prenotazioni`);
  }

  return (
    <>
      <Header lang={lang} dict={dict} />
      <main className="flex-1">
        <Container className="flex justify-center py-12 sm:py-16">
          <div className="w-full max-w-[480px] rounded-[15px] border border-soft-grey bg-white p-6 sm:p-8">
            <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">
              {dict.account.customerSignup.title}
            </h1>
            <p className="mt-1 text-sm text-ink/70">{dict.account.customerSignup.subtitle}</p>
            <div className="mt-6">
              <CustomerSignupView lang={lang} dict={dict.account.customerSignup} />
            </div>
          </div>
        </Container>
      </main>
      <Footer lang={lang} dict={dict} />
    </>
  );
}
