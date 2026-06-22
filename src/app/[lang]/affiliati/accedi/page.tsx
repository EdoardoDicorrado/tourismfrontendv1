import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AffiliateLoginForm } from "@/components/account/AffiliateLoginForm";
import { isLocale } from "@/lib/i18n/config";

type Params = { lang: string };

export const metadata: Metadata = { title: "Accedi come affiliato — TourisMotion" };

/**
 * Affiliate sign-in (`/[lang]/affiliati/accedi`). Full-screen focused entry that
 * mirrors the agency login (logo + centered card). PREVIEW: no real auth — it
 * lands straight on the affiliate dashboard (affiliate role/session pending
 * full-stack). Strings hardcoded IT for this first pass (i18n deposited).
 */
export default async function AffiliateLoginPage({ params }: { params: Promise<Params> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

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
          <h1 className="text-center text-2xl font-extrabold text-ink sm:text-3xl">
            Accedi come affiliato
          </h1>
          <p className="mt-2 text-center text-sm text-ink/70">Entra nella tua area affiliati.</p>
          <div className="mt-6">
            <AffiliateLoginForm lang={lang} />
          </div>
        </div>
      </div>
    </main>
  );
}
