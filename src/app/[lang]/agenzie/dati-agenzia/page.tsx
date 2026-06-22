import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { AccountLayout } from "@/components/account/AccountLayout";
import { getAgencyProfile, getPaymentInfo } from "@/lib/account/client";
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
  return { title: `${dict.account.settings.editAgency} — TourisMotion` };
}

/**
 * Agency data page (`/[lang]/agenzie/dati-agenzia`). Agency-gated. The contact +
 * billing summary cards moved here from the settings page (reached via the "Dati
 * agenzia" button); settings keeps only the non-editable stats (code/commission/
 * API) up top. Each card's "Modifica" links to its editable page.
 */
export default async function AgencyDataPage({ params }: { params: Promise<Params> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const guard = await requireRole("agency", lang);
  if ("redirectTo" in guard) redirect(guard.redirectTo);
  const session = guard.session;

  const t = dict.account.settings;
  const p = dict.account.profile;
  const pay = dict.account.payment;
  const [profile, payment] = await Promise.all([
    getAgencyProfile(session.token),
    getPaymentInfo(session.token),
  ]);
  const { user, agency } = profile;
  const dial = agency.phone_prefix ?? "";
  const addressLine = [agency.address_street, agency.address_street_number].filter(Boolean).join(" ");
  const cityLine = [agency.postal_code, agency.city].filter(Boolean).join(" ");

  return (
    <AccountLayout lang={lang} dict={dict} session={session} active="settings">
      <h2 className="mb-6 text-xl font-extrabold text-ink">{t.editAgency}</h2>

      <div className="flex flex-col gap-6">
        {/* Dati di contatto — riassunto read-only + Modifica → pagina editabile. */}
        <DataCard title={p.userTitle} editHref={`/${lang}/agenzie/profilo`} editLabel={t.edit}>
          <p className="font-bold">{user.name || agency.legal_name || "—"}</p>
          <p className="break-all">{user.email || agency.email || "—"}</p>
          {(user.phone || agency.phone) && (
            <p>
              {dial} {user.phone || agency.phone}
            </p>
          )}
          {addressLine && <p>{addressLine}</p>}
          {cityLine && <p>{cityLine}</p>}
        </DataCard>

        {/* Dati di fatturazione — riassunto read-only + Modifica → pagina editabile. */}
        <DataCard
          title={t.editBilling}
          editHref={`/${lang}/agenzie/profilo/pagamento`}
          editLabel={t.edit}
        >
          <p>
            <span className="text-ink/60">{pay.vatId}: </span>
            {payment.vat_id || "—"}
          </p>
          <p className="break-all">
            <span className="text-ink/60">{pay.iban}: </span>
            {payment.bank_transfer.iban || "—"}
          </p>
          <p className="break-all">
            <span className="text-ink/60">{pay.paypalEmail}: </span>
            {payment.paypal_email || "—"}
          </p>
        </DataCard>
      </div>
    </AccountLayout>
  );
}

/** Read-only data card with a "Modifica" link to the editable page. */
function DataCard({
  title,
  editHref,
  editLabel,
  children,
}: {
  title: string;
  editHref: string;
  editLabel: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-panel border border-soft-grey bg-white p-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-ink">{title}</h3>
        <Link href={editHref} className="shrink-0 text-sm font-bold text-cta hover:underline">
          {editLabel}
        </Link>
      </div>
      <div className="flex flex-col gap-1 text-base text-ink">{children}</div>
    </section>
  );
}
