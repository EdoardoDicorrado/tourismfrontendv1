import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { AccountLayout } from "@/components/account/AccountLayout";
import { BookingDetail } from "@/components/account/bookings/BookingDetail";
import { getAgencyBookingMock } from "@/lib/account/mockBookings";
import { requireRole } from "@/lib/account/session";
import { fill, isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

type Params = { lang: string; id: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { lang, id } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: `${fill(dict.account.bookingDetail.title, { code: id })} — TourisMotion` };
}

/**
 * Agency booking detail (`/[lang]/agenzie/prenotazioni/[id]`). Same shared
 * components as the customer detail. Agency scope = all the agency's bookings, so
 * there is no single-booking restriction (the backend will enforce that the
 * booking belongs to the agency via the token; the mock returns any booking by
 * id). Renders the shared detail + edit form.
 */
export default async function AgencyBookingDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { lang, id } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const guard = await requireRole("agency", lang);
  if ("redirectTo" in guard) redirect(guard.redirectTo);
  const session = guard.session;

  // PREVIEW: fake agency booking (the storefront API isn't wired yet — see CLAUDE.md).
  const booking = getAgencyBookingMock(id);
  if (!booking) notFound();

  return (
    <AccountLayout lang={lang} dict={dict} session={session} active="bookings">
      <BookingDetail
        booking={booking}
        lang={lang}
        dict={dict.account}
        listBase={`/${lang}/agenzie/prenotazioni`}
      />
    </AccountLayout>
  );
}
