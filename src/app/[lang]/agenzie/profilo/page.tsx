import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { AccountLayout } from "@/components/account/AccountLayout";
import { AgencyProfileForm } from "@/components/account/AgencyProfileForm";
import { getAgencyProfile } from "@/lib/account/client";
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
  return { title: `${dict.account.profile.title} — TourisMotion` };
}

/**
 * Agency profile (`/[lang]/agenzie/profilo`). Agency-gated. Loads the profile
 * via the account-client seam and renders the editable form; read-only company
 * flags are shown disabled inside the form.
 */
export default async function AgencyProfilePage({ params }: { params: Promise<Params> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const guard = await requireRole("agency", lang);
  if ("redirectTo" in guard) redirect(guard.redirectTo);
  const session = guard.session;

  const profile = await getAgencyProfile(session.token);

  return (
    <AccountLayout lang={lang} dict={dict} session={session} active="profile">
      <h2 className="mb-6 text-xl font-extrabold text-ink">{dict.account.profile.title}</h2>
      <AgencyProfileForm
        dict={dict.account.profile}
        feedback={dict.account.feedback}
        profile={profile}
      />
    </AccountLayout>
  );
}
