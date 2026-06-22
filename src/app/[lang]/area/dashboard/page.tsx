import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { AccountLayout } from "@/components/account/AccountLayout";
import { ButtonLink } from "@/components/ui/Button";
import { CancelBookingButton } from "@/components/account/bookings/CancelBookingButton";
import { VoucherPreview } from "@/components/account/bookings/VoucherPreview";
import { formatStartAt } from "@/components/account/bookings/datetime";
import { getBookings } from "@/lib/account/client";
import { getCustomerBookingsMock } from "@/lib/account/mockBookings";
import { PREVIEW_CUSTOMER_TOKEN, requireRole } from "@/lib/account/session";
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
  return { title: `${dict.account.dashboard.title} — TourisMotion` };
}

/**
 * Customer dashboard (`/[lang]/area/dashboard`). Customer-gated. A simple landing
 * for the active booking: voucher + cancel on it, plus shortcuts to the full
 * bookings list and to support. PREVIEW: the demo session renders the mock active
 * booking until the customer bookings API lands.
 */
export default async function CustomerDashboardPage({ params }: { params: Promise<Params> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const guard = await requireRole("customer", lang);
  if ("redirectTo" in guard) redirect(guard.redirectTo);
  const session = guard.session;
  if (session.role !== "customer") notFound();

  const d = dict.account.dashboard;

  // The active booking = the first "current" reservation.
  const result =
    session.token === PREVIEW_CUSTOMER_TOKEN
      ? getCustomerBookingsMock({ tab: "current" })
      : await getBookings({ token: session.token, tab: "current" });
  const booking = result.items[0] ?? null;
  const line = booking?.lines[0];

  return (
    <AccountLayout lang={lang} dict={dict} session={session} active="bookings">
      <h2 className="mb-6 text-xl font-extrabold text-ink">{d.title}</h2>

      <div className="flex flex-col gap-6">
        {/* Prenotazione attiva — voucher + annulla. */}
        <section className="rounded-panel border border-soft-grey bg-white p-6">
          <h3 className="text-lg font-extrabold text-ink">{d.activeTitle}</h3>
          {booking && line ? (
            <div className="mt-4 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <p className="font-bold text-ink">{line.product_name ?? "—"}</p>
                <p className="text-sm text-ink/70">{formatStartAt(line.slot_start, lang)}</p>
                <p className="text-sm text-ink/60">
                  {d.codeLabel}: {booking.code}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <VoucherPreview booking={booking} lang={lang} />
                <CancelBookingButton bookingId={booking.uuid} dict={dict.account} />
              </div>
            </div>
          ) : (
            <p className="mt-4 text-ink/60">{d.noActive}</p>
          )}
        </section>

        {/* Vai a tutte le prenotazioni. */}
        <ButtonLink
          href={`/${lang}/area/prenotazioni`}
          variant="primary"
          size="lg"
          className="self-start"
        >
          {d.allBookings}
        </ButtonLink>

        {/* Supporto. */}
        <section className="rounded-panel border border-soft-grey bg-white p-6">
          <h3 className="text-lg font-extrabold text-ink">{d.supportTitle}</h3>
          <p className="mt-1 text-sm text-ink/70">{d.supportDesc}</p>
          <ButtonLink
            href={`/${lang}/supporto`}
            variant="outline"
            size="md"
            className="mt-4 self-start"
          >
            {d.supportCta}
          </ButtonLink>
        </section>
      </div>
    </AccountLayout>
  );
}
