import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AccountLayout } from "@/components/account/AccountLayout";
import { AffiliateAccountData } from "@/components/account/AffiliateAccountData";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

type Params = { lang: string };

export const metadata: Metadata = { title: "Dati account — TourisMotion" };

/**
 * PREVIEW affiliate account data (`/[lang]/affiliati/profilo`). No auth gate yet
 * (affiliate session pending — full-stack #37); data is prefilled client-side from
 * the demo flag and the form mock-saves (see {@link AffiliateAccountData}).
 */
export default async function AffiliateProfilePage({ params }: { params: Promise<Params> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <AccountLayout lang={lang} dict={dict}>
      <h2 className="mb-6 text-xl font-extrabold text-ink">Dati account</h2>
      <AffiliateAccountData
        dict={dict.account.customerSettings}
        feedback={dict.account.feedback}
      />
    </AccountLayout>
  );
}
