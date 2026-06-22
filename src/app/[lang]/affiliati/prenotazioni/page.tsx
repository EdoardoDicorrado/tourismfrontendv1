import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AccountLayout } from "@/components/account/AccountLayout";
import { BookingList } from "@/components/account/bookings/BookingList";
import { getCustomerBookingsMock } from "@/lib/account/mockBookings";
import type { BookingTab } from "@/lib/account/types";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

type Params = { lang: string };
type Search = { [key: string]: string | string[] | undefined };

const TABS: BookingTab[] = ["all", "current", "travelled", "cancelled"];

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

function parseTab(raw: string): BookingTab {
  return (TABS as string[]).includes(raw) ? (raw as BookingTab) : "all";
}

function parsePage(raw: string): number {
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: `${dict.account.bookings.title} — TourisMotion` };
}

/**
 * PREVIEW affiliate bookings (`/[lang]/affiliati/prenotazioni`). Affiliates can
 * book trips too, so they get their own bookings list — separate from the
 * customer area (which is role-gated and would bounce an affiliate to login).
 *
 * No auth gate yet (affiliate role/session pending backend — full-stack #37); data
 * comes from the shared booking mock. Swap to the affiliate-scoped seam + a real
 * gate when the session lands; the page shape stays the same.
 */
export default async function AffiliateBookingsPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Search>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const sp = await searchParams;
  const tab = parseTab(first(sp.tab));
  const q = first(sp.q).trim();
  const page = parsePage(first(sp.page));

  const result = getCustomerBookingsMock({ tab, q, page });

  return (
    <AccountLayout lang={lang} dict={dict}>
      <BookingList
        result={result}
        tab={tab}
        q={q}
        lang={lang}
        dict={dict.account}
        listBase={`/${lang}/affiliati/prenotazioni`}
      />
    </AccountLayout>
  );
}
