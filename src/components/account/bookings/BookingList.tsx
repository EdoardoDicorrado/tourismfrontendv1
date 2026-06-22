import { Pagination, Tabs } from "@/components/account/ui";
import type { Booking, BookingTab, Paginated } from "@/lib/account/types";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

import { BookingCard } from "./BookingCard";
import { BookingSearch } from "./BookingSearch";

/**
 * Bookings list section: tabs (all/current/travelled/cancelled) + code search +
 * the booking cards + pagination. Shared verbatim by the customer and agency
 * pages — only `listBase` (used for tabs/search/pagination links) and
 * `detailBase` (card detail links) differ.
 *
 * Server component: `result` is already fetched & filtered by the page via the
 * account seam; the active tab/q come from `searchParams`. Pagination/tab links
 * preserve the other active params.
 */
export function BookingList({
  result,
  tab,
  q,
  lang,
  dict,
  listBase,
  voucherPreview = false,
}: {
  result: Paginated<Booking>;
  tab: BookingTab;
  q: string;
  lang: Locale;
  dict: Dictionary["account"];
  /** Route for this list, e.g. `/it/area/prenotazioni`. Cards link to `${listBase}/{id}`. */
  listBase: string;
  /** Agency/affiliate: voucher button opens a preview (wallet + PDF). */
  voucherPreview?: boolean;
}) {
  const tabs: { value: BookingTab; label: string }[] = [
    { value: "all", label: dict.nav.all },
    { value: "current", label: dict.nav.current },
    { value: "travelled", label: dict.nav.travelled },
    { value: "cancelled", label: dict.nav.cancelled },
  ];

  // Preserve tab + q across pagination links.
  const paginationBase = `${listBase}?tab=${encodeURIComponent(tab)}${q ? `&q=${encodeURIComponent(q)}` : ""}`;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-extrabold text-ink sm:text-2xl">{dict.bookings.title}</h1>

      <Tabs items={tabs} active={tab} baseHref={listBase} param="tab" ariaLabel={dict.bookings.title} />

      <BookingSearch action={listBase} q={q} tab={tab} dict={dict} />

      {result.items.length > 0 ? (
        <div className="flex flex-col gap-4">
          {result.items.map((booking) => (
            <BookingCard
              key={booking.uuid}
              booking={booking}
              lang={lang}
              dict={dict}
              detailBase={listBase}
              voucherPreview={voucherPreview}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-[10px] border border-dashed border-stroke bg-soft/40 py-14 text-center">
          <p className="max-w-md text-sm text-ink/70">{dict.bookings.empty}</p>
        </div>
      )}

      <Pagination
        current_page={result.meta.current_page}
        per_page={result.meta.per_page}
        total={result.meta.total}
        baseHref={paginationBase}
        param="page"
        ariaLabel={dict.bookings.title}
      />
    </div>
  );
}
