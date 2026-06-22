import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AccountLayout } from "@/components/account/AccountLayout";
import { ChangePasswordForm } from "@/components/account/ChangePasswordForm";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

type Params = { lang: string };

export const metadata: Metadata = { title: "Sicurezza — TourisMotion" };

/**
 * PREVIEW affiliate security / password change (`/[lang]/affiliati/profilo/password`).
 * Reuses the shared {@link ChangePasswordForm}, pointed at the affiliate BFF route
 * (mock-confirms until the real endpoint lands — full-stack #37). No auth gate yet.
 */
export default async function AffiliatePasswordPage({ params }: { params: Promise<Params> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <AccountLayout lang={lang} dict={dict}>
      <h2 className="mb-6 text-xl font-extrabold text-ink">Sicurezza</h2>
      <ChangePasswordForm
        lang={lang}
        dict={dict.account.changePassword}
        feedback={dict.account.feedback}
        action="/api/affiliate/password"
      />
    </AccountLayout>
  );
}
