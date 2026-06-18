import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { AccountLayout } from "@/components/account/AccountLayout";
import { PaymentForm } from "@/components/account/PaymentForm";
import { getPaymentInfo } from "@/lib/account/client";
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
  return { title: `${dict.account.payment.title} — TourisMotion` };
}

/**
 * Agency payout details (`/[lang]/agenzie/profilo/pagamento`). Agency-gated.
 * Loads PaymentInfo via the account-client seam and renders the editable form
 * (PayPal + bank transfer + guarantees).
 */
export default async function AgencyPaymentPage({ params }: { params: Promise<Params> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const guard = await requireRole("agency", lang);
  if ("redirectTo" in guard) redirect(guard.redirectTo);
  const session = guard.session;

  const payment = await getPaymentInfo(session.token);

  return (
    <AccountLayout lang={lang} dict={dict} session={session} active="payment">
      <h2 className="mb-6 text-xl font-extrabold text-ink">{dict.account.payment.title}</h2>
      <PaymentForm
        lang={lang}
        dict={dict.account.payment}
        feedback={dict.account.feedback}
        payment={payment}
      />
    </AccountLayout>
  );
}
