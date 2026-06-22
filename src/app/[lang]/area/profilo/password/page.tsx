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
  return { title: `${dict.account.customerSettings.securityTitle} — TourisMotion` };
}

/**
 * Customer security / password change (`/[lang]/area/profilo/password`).
 * Customer-gated. Reuses the shared {@link ChangePasswordForm}, pointed at the
 * customer BFF route. PREVIEW: that route mock-confirms until the real customer
 * password endpoint lands (full-stack).
 */
export default async function CustomerPasswordPage({ params }: { params: Promise<Params> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const guard = await requireRole("customer", lang);
  if ("redirectTo" in guard) redirect(guard.redirectTo);
  const session = guard.session;

  return (
    <AccountLayout lang={lang} dict={dict} session={session} active="password">
      <h2 className="mb-6 text-xl font-extrabold text-ink">
        {dict.account.customerSettings.securityTitle}
      </h2>
      <ChangePasswordForm
        lang={lang}
        dict={dict.account.changePassword}
        feedback={dict.account.feedback}
        action="/api/account/password"
      />
    </AccountLayout>
  );
}
