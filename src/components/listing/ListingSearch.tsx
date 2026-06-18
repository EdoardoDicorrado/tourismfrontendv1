"use client";

import { useState } from "react";

import { formatDateLong } from "@/lib/format";
import { Popover } from "@/components/ui/Popover";
import { Button } from "@/components/ui/Button";
import { Calendar } from "@/components/selectors/Calendar";
import { CalendarGlyph } from "@/components/selectors/glyphs";
import { fill, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/** Mock pricing for the search calendar (real availability lands with the API). */
const SEARCH_PRICING = { basePrice: 34, lowPrice: 22, discountPercent: 20 };
const TODAY_ISO = "2026-06-08";

/**
 * Listing hero search: the date pill ("Quanto tempo sarai a {city}?") opens the
 * shared {@link Calendar} overlay. Submits the chosen date to /{lang}/cerca.
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
  const [date, setDate] = useState<string | null>(null);

  return (
    <form
      action={`/${lang}/cerca`}
      className="flex w-full max-w-[760px] items-center gap-3 rounded-full border border-stroke bg-white py-2 pl-5 pr-2 shadow-lg"
    >
      <input type="hidden" name="date" value={date ?? ""} />
      <Popover
        align="start"
        sheet
        className="relative flex-1"
        trigger={({ open, toggle, id }) => (
          <button
            type="button"
            onClick={toggle}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls={id}
            className="flex w-full items-center gap-3 py-2 text-left"
          >
            <span className="shrink-0">
              <CalendarGlyph />
            </span>
            <span className={`truncate text-base sm:text-lg ${date ? "text-ink" : "text-stroke"}`}>
              {date ? formatDateLong(date, lang) : fill(dict.search.cityPlaceholder, { city: cityName })}
            </span>
          </button>
        )}
      >
        {({ close }) => (
          <Calendar
            startYear={2026}
            startMonth={5}
            pricing={SEARCH_PRICING}
            minIso={TODAY_ISO}
            showPrices={false}
            selected={date}
            onSelect={setDate}
            onConfirm={close}
            onClose={close}
            lang={lang}
            labels={dict.booking.calendar}
            confirmLabel={dict.booking.confirm}
            title={fill(dict.search.calendarTitle, { city: cityName })}
          />
        )}
      </Popover>
      <Button type="submit" pill size="md" className="shrink-0 sm:px-7 sm:text-lg">
        {dict.search.button}
      </Button>
    </form>
  );
}
