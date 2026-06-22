import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { AgencyLoginForm } from "@/components/account/AgencyLoginForm";
import { getSession } from "@/lib/account/session";
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
  return { title: `${dict.account.agencyLogin.title} — TourisMotion` };
}

/**
 * Agency sign-in (`/[lang]/agenzie/accedi`). Full-screen focused entry: agencies
 * reach it from a direct emailed link (`…/agenzia/<n>`), so it drops the
 * storefront header/footer and centers a single card. Email + password → BFF
 * `/api/auth/agency`, which sets the httpOnly session cookie. Already-authenticated
 * agencies are redirected straight to their bookings list.
 */
export default async function AgencyLoginPage({ params }: { params: Promise<Params> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  // Skip the form if already signed in as an agency (redirect OUTSIDE try/catch).
  const session = await getSession();
  if (session?.role === "agency") redirect(`/${lang}`);

  const dict = await getDictionary(lang);
  const t = dict.account.agencyLogin;

  return (
    <main className="flex min-h-[100svh] items-center justify-center bg-soft px-4 py-10">
      <div className="w-full max-w-[420px]">
        <Link href={`/${lang}`} aria-label="TourisMotion" className="mb-8 flex justify-center">
          <Image
            src="/images/logo-tourismotion.png"
            alt="TourisMotion"
            width={96}
            height={22}
            priority
            className="h-8 w-auto"
          />
        </Link>
        <div className="rounded-[15px] border border-soft-grey bg-white p-6 sm:p-8">
          <h1 className="text-center text-2xl font-extrabold text-ink sm:text-3xl">{t.title}</h1>
          <p className="mt-2 text-center text-sm text-ink/70">{t.subtitle}</p>
          <div className="mt-6">
            <AgencyLoginForm lang={lang} dict={t} />
          </div>
        </div>
      </div>
    </main>
  );
}
