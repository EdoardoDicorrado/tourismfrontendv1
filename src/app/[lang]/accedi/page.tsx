import { notFound, redirect } from "next/navigation";

import { isLocale } from "@/lib/i18n/config";

type Params = { lang: string };

/**
 * Legacy customer sign-in entry (`/[lang]/accedi`). The header "Accedi" link
 * still points here, but the real customer login now lives in the personal area
 * at `/[lang]/area/accedi` (passwordless: email + booking code). To keep a single
 * source of truth for the login UI, this route just redirects there.
 *
 * Why redirect instead of two separate doors: the customer login is the only
 * top-nav entry; the agency login is reached from `/[lang]/agenzie/accedi`
 * (linked from within the area / footer), so a generic chooser here would add a
 * pointless extra click for the common case. The redirect preserves the existing
 * header link without duplicating the form.
 */
export default async function LegacyLoginRedirect({ params }: { params: Promise<Params> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  redirect(`/${lang}/area/accedi`);
}
