import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AccountLayout } from "@/components/account/AccountLayout";
import { BookingDetail } from "@/components/account/bookings/BookingDetail";
import { getCustomerBookingMock } from "@/lib/account/mockBookings";
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
 * PREVIEW affiliate booking detail (`/[lang]/affiliati/prenotazioni/[id]`). Shares
 * the customer detail view; back link returns to the affiliate bookings list. No
 * auth gate yet (affiliate session pending — full-stack #37); mock data.
 */
export default async function AffiliateBookingDetailPage({ params }: { params: Promise<Params> }) {
  const { lang, id } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const booking = getCustomerBookingMock(id);
  if (!booking) notFound();

  return (
    <AccountLayout lang={lang} dict={dict}>
      <BookingDetail
        booking={booking}
        lang={lang}
        dict={dict.account}
        listBase={`/${lang}/affiliati/prenotazioni`}
      />
    </AccountLayout>
  );
}
