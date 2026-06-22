import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { AccountLayout } from "@/components/account/AccountLayout";
import { PasswordSection } from "@/components/account/PasswordSection";
import { TwoFactorCard } from "@/components/account/TwoFactorCard";
import { requireRole } from "@/lib/account/session";
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
  return { title: `${dict.account.settings.security} — TourisMotion` };
}

/**
 * Agency security (`/[lang]/agenzie/profilo/sicurezza`). Agency-gated. Password
 * change (posts to `/api/agency/password`) + two-factor authentication (preview).
 */
export default async function AgencySecurityPage({ params }: { params: Promise<Params> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const guard = await requireRole("agency", lang);
  if ("redirectTo" in guard) redirect(guard.redirectTo);
  const session = guard.session;

  return (
    <AccountLayout lang={lang} dict={dict} session={session} active="settings">
      <h2 className="mb-6 text-xl font-extrabold text-ink">{dict.account.settings.security}</h2>
      <div className="flex flex-col gap-10">
        <section className="flex flex-col gap-4">
          <h3 className="text-lg font-extrabold text-ink">{dict.account.changePassword.title}</h3>
          <PasswordSection
            lang={lang}
            dict={dict.account.changePassword}
            feedback={dict.account.feedback}
          />
        </section>
        <TwoFactorCard dict={dict.account.twoFactor} />
      </div>
    </AccountLayout>
  );
}
