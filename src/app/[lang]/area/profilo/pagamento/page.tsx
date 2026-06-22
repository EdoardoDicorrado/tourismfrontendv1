import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { AccountLayout } from "@/components/account/AccountLayout";
import { CustomerPaymentMethodForm } from "@/components/account/CustomerPaymentMethodForm";
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
  return { title: `${dict.account.customerSettings.paymentTitle} — TourisMotion` };
}

/**
 * Customer payment methods (`/[lang]/area/profilo/pagamento`). Customer-gated.
 * PREVIEW: client-only card form (no saved-cards backend; real methods are PSP-
 * tokenized — full-stack task).
 */
export default async function CustomerPaymentPage({ params }: { params: Promise<Params> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const guard = await requireRole("customer", lang);
  if ("redirectTo" in guard) redirect(guard.redirectTo);
  const session = guard.session;

  return (
    <AccountLayout lang={lang} dict={dict} session={session} active="payment">
      <h2 className="mb-6 text-xl font-extrabold text-ink">
        {dict.account.customerSettings.paymentFormTitle}
      </h2>
      <CustomerPaymentMethodForm
        dict={dict.account.customerSettings}
        feedback={dict.account.feedback}
      />
    </AccountLayout>
  );
}
