import { redirect } from "next/navigation";

import { defaultLocale, isLocale } from "@/lib/i18n/config";

/**
 * Agency invitation deep-link (e.g. `/agenzia/12345`, sent by email). Resolves the
 * agency number to the full-screen agency login, carrying it as `?agency=` so the
 * login can identify / pre-fill the agency once a backend lookup (number → email)
 * exists. The email + link generation are backend-side (out of the frontend scope);
 * this is just the landing redirect.
 *
 * Decision pending (ui-ux-3 #27): whether `?agency=` pre-populates the email field
 * or stays a pure deep-link. For now it's forwarded but unused by the login page.
 */
export default async function AgencyDeepLink({
  params,
}: {
  params: Promise<{ lang: string; numero: string }>;
}) {
  const { lang, numero } = await params;
  const locale = isLocale(lang) ? lang : defaultLocale;
  redirect(`/${locale}/agenzie/accedi?agency=${encodeURIComponent(numero)}`);
}
