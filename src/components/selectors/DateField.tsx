"use client";

import { type PricingInput } from "@/lib/calendar";
import { formatDateLong } from "@/lib/format";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Popover } from "@/components/ui/Popover";
import { Calendar } from "./Calendar";
import { CalendarGlyph, FieldButton } from "./glyphs";

/**
 * Booking-box date field: a bordered trigger pill that opens the {@link Calendar}
 * overlay in a popover. Controlled — owns no date state of its own.
 */
export function DateField({
  value,
  onChange,
  pricing,
  startYear,
  startMonth,
  minIso,
  lang,
  placeholder,
  calendarLabels,
  confirmLabel,
}: {
  value: string | null;
  onChange: (iso: string) => void;
  pricing: PricingInput;
  startYear: number;
  startMonth: number;
  minIso?: string;
  lang: Locale;
  placeholder: string;
  calendarLabels: Dictionary["booking"]["calendar"];
  confirmLabel: string;
}) {
  return (
    <Popover
      align="stretch"
      sheet
      trigger={({ open, toggle, id }) => (
        <FieldButton
          id={id}
          active={open}
          onClick={toggle}
          icon={<CalendarGlyph />}
          label={value ? formatDateLong(value, lang) : placeholder}
        />
      )}
    >
      {({ close }) => (
        <Calendar
          startYear={startYear}
          startMonth={startMonth}
          pricing={pricing}
          minIso={minIso}
          selected={value}
          onSelect={onChange}
          onConfirm={close}
          onClose={close}
          lang={lang}
          labels={calendarLabels}
          confirmLabel={confirmLabel}
        />
      )}
    </Popover>
  );
}
