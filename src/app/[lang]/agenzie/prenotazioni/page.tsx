import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { AccountLayout } from "@/components/account/AccountLayout";
import { BookingList } from "@/components/account/bookings/BookingList";
import { getAgencyBookingsMock } from "@/lib/account/mockBookings";
import { requireRole } from "@/lib/account/session";
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
 * Agency bookings list (`/[lang]/agenzie/prenotazioni`). Same components as the
 * customer list; the difference is scope — agencies see ALL the agency's bookings
 * (no `bookingId` restriction). Reads tab/q/page from the URL.
 */
export default async function AgencyBookingsPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Search>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const guard = await requireRole("agency", lang);
  if ("redirectTo" in guard) redirect(guard.redirectTo);
  const session = guard.session;

  const sp = await searchParams;
  const tab = parseTab(first(sp.tab));
  const q = first(sp.q).trim();
  const page = parsePage(first(sp.page));

  // PREVIEW: fake agency bookings (the storefront API isn't wired yet — see CLAUDE.md).
  const result = getAgencyBookingsMock({ tab, q, page });

  return (
    <AccountLayout lang={lang} dict={dict} session={session} active="bookings">
      <BookingList
        result={result}
        tab={tab}
        q={q}
        lang={lang}
        dict={dict.account}
        listBase={`/${lang}/agenzie/prenotazioni`}
        voucherPreview
      />
    </AccountLayout>
  );
}
