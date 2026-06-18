import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CustomerVerifyEmail } from "@/components/account/CustomerVerifyEmail";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Container } from "@/components/ui/Container";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

type Params = { lang: string };
type Search = { [key: string]: string | string[] | undefined };

/** First value of a (possibly repeated) query param. */
function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: `${dict.account.verifyEmail.title} — TourisMotion` };
}

/**
 * Customer email verification (`/[lang]/area/verifica-email`). The link in the
 * verification email lands here with `?token=…`; the client confirms it via the
 * BFF. Without a token, a "resend verification email" form is shown. Double opt-in.
 */
export default async function VerifyEmailPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Search>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const sp = await searchParams;
  const token = first(sp.token);

  return (
    <>
      <Header lang={lang} dict={dict} />
      <main className="flex-1">
        <Container className="flex justify-center py-12 sm:py-16">
          <div className="w-full max-w-[420px] rounded-[15px] border border-soft-grey bg-white p-6 sm:p-8">
            <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">
              {dict.account.verifyEmail.title}
            </h1>
            <div className="mt-6">
              <CustomerVerifyEmail
                lang={lang}
                token={token || undefined}
                dict={dict.account.verifyEmail}
              />
            </div>
          </div>
        </Container>
      </main>
      <Footer lang={lang} dict={dict} />
    </>
  );
}
