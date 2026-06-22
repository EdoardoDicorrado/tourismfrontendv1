import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { AccountLayout } from "@/components/account/AccountLayout";
import { getAgencyProfile } from "@/lib/account/client";
import { getAgencyBookingsMock } from "@/lib/account/mockBookings";
import { requireRole } from "@/lib/account/session";
import { formatMoney } from "@/lib/format";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

type Params = { lang: string };

export const metadata: Metadata = { title: "Dashboard agenzia — TourisMotion" };

/**
 * Agency dashboard (`/[lang]/agenzie/dashboard`). Agency-gated. Shows the same
 * non-editable figures as the settings page (agency code + commission), then —
 * affiliate-dashboard style — the total tours booked and the revenue earned from
 * the agency's commission percentage.
 *
 * ponytail: bookings come from the mock seam (getAgencyBookingsMock) until the
 * real API lands — swap there, page unchanged. IT strings hardcoded (preview,
 * like the affiliate dashboard); i18n deposited to marketing.
 */
export default async function AgencyDashboardPage({ params }: { params: Promise<Params> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const guard = await requireRole("agency", lang);
  if ("redirectTo" in guard) redirect(guard.redirectTo);
  const session = guard.session;

  const p = dict.account.profile;
  const profile = await getAgencyProfile(session.token);
  const { agency } = profile;
  const commissionPct = agency.commission_percent ?? 0;

  // Aggregate over ALL bookings (mock). Cancelled bookings earn no commission.
  const bookings = getAgencyBookingsMock({ tab: "all", perPage: 999 }).items;
  const active = bookings.filter((b) => b.state !== "cancelled");
  const toursBooked = active.reduce(
    (n, b) => n + b.lines.filter((l) => l.state !== "cancelled").length,
    0,
  );
  const grossEuros = active.reduce((n, b) => n + b.total.amount_cents, 0) / 100;
  const commissionRevenue = (grossEuros * commissionPct) / 100;

  return (
    <AccountLayout lang={lang} dict={dict} session={session}>
      <h2 className="mb-1 text-xl font-extrabold text-ink sm:text-2xl">Dashboard agenzia</h2>
      {session.name ? <p className="mb-6 text-ink/70">Ciao, {session.name}</p> : null}

      <div className="flex flex-col gap-6">
        {/* Dati non editabili (come nelle impostazioni): codice + commissione. */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Stat label={p.agencyCode} value={agency.code || "—"} />
          <Stat label={p.commission} value={commissionPct ? `${commissionPct}%` : "—"} />
        </div>

        {/* Affiliate-dashboard style: ricavo da commissione in evidenza. */}
        <div className="rounded-panel bg-cta p-6 text-white">
          <p className="text-sm font-semibold uppercase tracking-wide text-white/80">
            Ricavo da commissioni
          </p>
          <p className="mt-1 text-4xl font-extrabold">{formatMoney(commissionRevenue, lang)}</p>
          <p className="mt-2 text-sm text-white/80">
            Calcolato sul {commissionPct}% di commissione sui tour prenotati.
          </p>
        </div>

        {/* Tour prenotati in totale. */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Stat label="Tour prenotati" value={toursBooked.toLocaleString(lang)} />
          <Stat label="Valore prenotato" value={formatMoney(grossEuros, lang)} />
        </div>
      </div>
    </AccountLayout>
  );
}

/** Non-editable value, styled like the affiliate-dashboard stat cards. */
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-panel border border-soft-grey bg-white p-5">
      <p className="text-sm font-semibold text-ink/60">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-ink">{value}</p>
    </div>
  );
}
