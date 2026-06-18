"use client";

import { useState } from "react";

import { formatDateLong } from "@/lib/format";
import { Popover } from "@/components/ui/Popover";
import { RangeCalendar } from "@/components/selectors/RangeCalendar";
import { CalendarGlyph } from "@/components/selectors/glyphs";
import { useListingFilters, type DateRange } from "@/components/listing/ListingFiltersProvider";
import { fill, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/** Mock pricing for the search calendar (real availability lands with the API). */
const SEARCH_PRICING = { basePrice: 34, lowPrice: 22, discountPercent: 20 };
const TODAY_ISO = "2026-06-08";

/**
 * Listing hero search: the date pill opens the {@link RangeCalendar} (taller,
 * range-aware — Figma 64:5906). Confirming a range does NOT navigate to /cerca —
 * it commits the range to the shared {@link useListingFilters} state so the
 * results below filter in place. The pill reflects the committed range.
 */
export function ListingSearch({
  cityName,
  lang,
  dict,
}: {
  cityName: string;
  lang: Locale;
  dict: Dictionary;
}) {
  const { range, setRange } = useListingFilters();
  // Draft edited inside the open calendar; committed to the shared state only on
  // "Conferma" (so the results don't churn while the user is still picking).
  const [draft, setDraft] = useState<DateRange>(range);

  const { start, end } = range;
  const pillLabel = start
    ? end && end !== start
      ? `${formatDateLong(start, lang)} – ${formatDateLong(end, lang)}`
      : formatDateLong(start, lang)
    : fill(dict.search.cityPlaceholder, { city: cityName });

  return (
    <div className="flex w-full max-w-[760px] items-center rounded-full border border-stroke bg-white px-5 py-2.5 shadow-lg">
      <Popover
        align="start"
        sheet
        className="relative w-full"
        trigger={({ open, toggle, id }) => (
          <button
            type="button"
            onClick={() => {
              setDraft(range); // seed the calendar with the committed range
              toggle();
            }}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls={id}
            className="flex w-full items-center gap-3 py-2 text-left"
          >
            <span className="shrink-0">
              <CalendarGlyph />
            </span>
            <span className={`truncate text-base sm:text-lg ${start ? "text-ink" : "text-stroke"}`}>
              {pillLabel}
            </span>
          </button>
        )}
      >
        {({ close }) => (
          <RangeCalendar
            startYear={2026}
            startMonth={5}
            pricing={SEARCH_PRICING}
            minIso={TODAY_ISO}
            start={draft.start}
            end={draft.end}
            onChange={(s, e) => setDraft({ start: s, end: e })}
            // Confirm applies the range IN PAGE (no navigation): commit + close.
            onConfirm={() => {
              setRange(draft);
              close();
            }}
            // Dismissing without confirming discards the draft.
            onClose={() => {
              setDraft(range);
              close();
            }}
            lang={lang}
            labels={dict.booking.calendar}
            confirmLabel={dict.booking.confirm}
            title={fill(dict.search.calendarTitle, { city: cityName })}
          />
        )}
      </Popover>
    </div>
  );
}
