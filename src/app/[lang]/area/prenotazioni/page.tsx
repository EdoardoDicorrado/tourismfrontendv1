import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { AccountLayout } from "@/components/account/AccountLayout";
import { BookingList } from "@/components/account/bookings/BookingList";
import { getBookings } from "@/lib/account/client";
import { getCustomerBookingsMock } from "@/lib/account/mockBookings";
import { PREVIEW_CUSTOMER_TOKEN, requireRole } from "@/lib/account/session";
import type { BookingTab } from "@/lib/account/types";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

type Params = { lang: string };
type Search = { [key: string]: string | string[] | undefined };

const TABS: BookingTab[] = ["all", "current", "travelled", "cancelled"];

/** searchParams values can be string | string[]; take the first occurrence. */
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
 * Customer bookings list (`/[lang]/area/prenotazioni`). The user-scoped session
 * token resolves ALL of the user's reservations (backend filters by `user_id`).
 * Reads tab/q/page from the URL and pulls the (already filtered + paginated)
 * list via the account seam, forwarding the session token.
 */
export default async function CustomerBookingsPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Search>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const guard = await requireRole("customer", lang);
  if ("redirectTo" in guard) redirect(guard.redirectTo);
  const session = guard.session;
  // `requireRole("customer")` guarantees the customer role; narrow the union.
  if (session.role !== "customer") notFound();

  const sp = await searchParams;
  const tab = parseTab(first(sp.tab));
  const q = first(sp.q).trim();
  const page = parsePage(first(sp.page));

  // PREVIEW: the demo session (sentinel token) renders mock bookings until the
  // customer bookings API lands; a real session hits the seam.
  const result =
    session.token === PREVIEW_CUSTOMER_TOKEN
      ? getCustomerBookingsMock({ tab, q, page })
      : await getBookings({ token: session.token, tab, q, page });

  return (
    <AccountLayout lang={lang} dict={dict} session={session} active="bookings">
      <BookingList
        result={result}
        tab={tab}
        q={q}
        lang={lang}
        dict={dict.account}
        listBase={`/${lang}/area/prenotazioni`}
      />
    </AccountLayout>
  );
}
