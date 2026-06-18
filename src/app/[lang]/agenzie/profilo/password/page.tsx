import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { AccountLayout } from "@/components/account/AccountLayout";
import { ChangePasswordForm } from "@/components/account/ChangePasswordForm";
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
  return { title: `${dict.account.changePassword.title} — TourisMotion` };
}

/**
 * Agency password change (`/[lang]/agenzie/profilo/password`). Agency-gated.
 * The form posts to `/api/agency/password`; no server data to load.
 */
export default async function AgencyPasswordPage({ params }: { params: Promise<Params> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const guard = await requireRole("agency", lang);
  if ("redirectTo" in guard) redirect(guard.redirectTo);
  const session = guard.session;

  return (
    <AccountLayout lang={lang} dict={dict} session={session} active="password">
      <h2 className="mb-6 text-xl font-extrabold text-ink">{dict.account.changePassword.title}</h2>
      <ChangePasswordForm
        lang={lang}
        dict={dict.account.changePassword}
        feedback={dict.account.feedback}
      />
    </AccountLayout>
  );
}
