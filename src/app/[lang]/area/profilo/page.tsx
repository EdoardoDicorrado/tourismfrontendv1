import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { AccountLayout } from "@/components/account/AccountLayout";
import { CustomerProfileForm } from "@/components/account/CustomerProfileForm";
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
  return { title: `${dict.account.customerSettings.personalTitle} — TourisMotion` };
}

/**
 * Customer personal details (`/[lang]/area/profilo`). Customer-gated. PREVIEW:
 * prefilled from the session name (the only customer field we hold today — there
 * is no `/account/profile` seam yet); the form mock-saves. Wiring is a full-stack
 * task.
 */
export default async function CustomerProfilePage({ params }: { params: Promise<Params> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const guard = await requireRole("customer", lang);
  if ("redirectTo" in guard) redirect(guard.redirectTo);
  const session = guard.session;

  const [firstName = "", ...rest] = session.name.trim().split(/\s+/);
  const initial = { firstName, lastName: rest.join(" "), email: "", phone: "" };

  return (
    <AccountLayout lang={lang} dict={dict} session={session} active="profile">
      <h2 className="mb-6 text-xl font-extrabold text-ink">
        {dict.account.customerSettings.personalFormTitle}
      </h2>
      <CustomerProfileForm
        dict={dict.account.customerSettings}
        feedback={dict.account.feedback}
        initial={initial}
      />
    </AccountLayout>
  );
}
