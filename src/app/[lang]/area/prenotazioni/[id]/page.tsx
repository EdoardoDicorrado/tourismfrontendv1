import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { AccountLayout } from "@/components/account/AccountLayout";
import { BookingDetail } from "@/components/account/bookings/BookingDetail";
import { getBooking } from "@/lib/account/client";
import { getCustomerBookingMock } from "@/lib/account/mockBookings";
import { PREVIEW_CUSTOMER_TOKEN, requireRole } from "@/lib/account/session";
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
 * Customer booking detail (`/[lang]/area/prenotazioni/[id]`). Beyond the role
 * gate, ownership is enforced by the backend: the user-scoped token only resolves
 * the user's own reservations, so an `id` belonging to someone else makes
 * `getBooking` return null → 404. Renders the shared detail + edit form.
 */
export default async function CustomerBookingDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { lang, id } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const guard = await requireRole("customer", lang);
  if ("redirectTo" in guard) redirect(guard.redirectTo);
  const session = guard.session;
  // `requireRole("customer")` guarantees the customer role; narrow the union.
  if (session.role !== "customer") notFound();

  // PREVIEW: the demo session (sentinel token) resolves from mock fixtures.
  const booking =
    session.token === PREVIEW_CUSTOMER_TOKEN
      ? getCustomerBookingMock(id)
      : await getBooking(id, session.token);
  if (!booking) notFound();

  return (
    <AccountLayout lang={lang} dict={dict} session={session} active="bookings">
      <BookingDetail
        booking={booking}
        lang={lang}
        dict={dict.account}
        listBase={`/${lang}/area/prenotazioni`}
      />
    </AccountLayout>
  );
}
