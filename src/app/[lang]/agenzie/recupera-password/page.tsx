import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PasswordRecoveryForm } from "@/components/account/PasswordRecoveryForm";
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
  return { title: `${dict.account.forgotPassword.title} — TourisMotion` };
}

/**
 * Agency password recovery (`/[lang]/agenzie/recupera-password`). Two states on
 * one page, switched by `?token=`:
 *   - no token → request a reset email (forgot mode).
 *   - `?token=…` (from the reset email link) → set a new password (reset mode).
 *
 * Both submit to the `/api/auth/password` BFF.
 */
export default async function PasswordRecoveryPage({
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
  const email = first(sp.email);
  const isReset = token.length > 0;
  const heading = isReset ? dict.account.resetPassword : dict.account.forgotPassword;

  return (
    <>
      <Header lang={lang} dict={dict} />
      <main className="flex-1">
        <Container className="flex justify-center py-12 sm:py-16">
          <div className="w-full max-w-[420px] rounded-[15px] border border-soft-grey bg-white p-6 sm:p-8">
            <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">{heading.title}</h1>
            <p className="mt-1 text-sm text-ink/70">{heading.subtitle}</p>
            <div className="mt-6">
              <PasswordRecoveryForm
                lang={lang}
                token={isReset ? token : undefined}
                email={email || undefined}
                forgot={dict.account.forgotPassword}
                reset={dict.account.resetPassword}
                backToLoginHref={`/${lang}/agenzie/accedi`}
              />
            </div>
          </div>
        </Container>
      </main>
      <Footer lang={lang} dict={dict} />
    </>
  );
}
