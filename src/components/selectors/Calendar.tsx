"use client";

import { useState } from "react";

import { addMonth, buildMonth, type PricingInput } from "@/lib/calendar";
import { formatMonthYear, weekdayShortNames } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Chevron } from "./glyphs";

/* Figma "Calendario prodotto" (node 64:12382). Availability/badge colors are raw
 * design fills with no matching token yet (green #238d00 / yellow #cbc829 / red
 * #ff004c) — tokenization is queued with design-system; swap to tokens once added. */
const AVAIL_HIGH = "#238d00"; // green — varie opzioni
const AVAIL_LOW = "#cbc829"; // yellow — poche opzioni
const MUTED = "#aed5e3"; // sold out / before minIso (stroke-2)
const PROMO_RED = "#ff004c"; // discounted price + % mark

/** Fixed cell content height — keeps the sheet the SAME height across months. */
const CELL_H = "h-[52px]";

/**
 * Date-picker bottom sheet (mobile): grabber + header + close ○, month navigation,
 * a 7-col month grid where each day shows its number + lowest price, a 5px
 * availability bar (green = various / yellow = few options) and a bare red % on
 * discounted days, then a legend and a confirm action. Mounted by the booking box
 * via {@link DateField}.
 *
 * Height is constant across months (always 6 week-rows) and the panel is
 * drag-to-dismiss (grey grabber) — matching the listing {@link RangeCalendar}.
 *
 * Localized via `lang` (month/weekday names) + `labels`; `title` overrides the
 * default header so callers can show a contextual prompt.
 */
export function Calendar({
  startYear,
  startMonth,
  pricing,
  selected,
  onSelect,
  onConfirm,
  onClose,
  minIso,
  showPrices = true,
  monthsAhead = 11,
  lang,
  labels,
  confirmLabel,
  title,
}: {
  startYear: number;
  startMonth: number; // 0-11, earliest navigable month
  pricing: PricingInput;
  selected: string | null;
  onSelect: (iso: string) => void;
  onConfirm: () => void;
  onClose: () => void;
  minIso?: string;
  showPrices?: boolean;
  monthsAhead?: number;
  lang: Locale;
  labels: Dictionary["booking"]["calendar"];
  confirmLabel: string;
  title?: string;
}) {
  const [view, setView] = useState({ year: startYear, month: startMonth });
  const month = buildMonth(view.year, view.month, pricing, minIso);
  const weekdays = weekdayShortNames(lang);

  // Always render 6 week-rows (42 cells) so the height stays CONSTANT when paging
  // months — a 4/5-row month must not make the sheet grow/shrink.
  const cells = month.weeks.flat();
  const gridCells =
    cells.length < 42
      ? [...cells, ...Array.from({ length: 42 - cells.length }, () => ({ day: null }))]
      : cells;

  const atStart = view.year === startYear && view.month === startMonth;
  const last = addMonth(startYear, startMonth, monthsAhead);
  const atEnd = view.year === last.year && view.month === last.month;

  const go = (delta: number) => setView((v) => addMonth(v.year, v.month, delta));

  return (
    <div className="flex max-h-[90vh] flex-col overflow-hidden rounded-t-[15px] bg-white">
      {/* Grabber — drag the sheet down to dismiss. */}
      <span
        className="mx-auto mt-2 h-1.5 w-10 shrink-0 rounded-full bg-stroke/50"
        aria-hidden
      />

      {/* Header */}
      <div className="flex shrink-0 items-center gap-4 border-b border-soft-grey px-4 py-2">
        <p className="flex-1 text-[20px] font-extrabold text-cta">{title ?? labels.title}</p>
        <button
          type="button"
          onClick={onClose}
          aria-label={labels.close}
          className="grid size-11 shrink-0 place-items-center rounded-full text-cta transition hover:bg-soft"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="12" cy="12" r="10.5" stroke="currentColor" strokeWidth="1.6" />
            <path
              d="M8.5 8.5l7 7M15.5 8.5l-7 7"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Month navigation */}
      <div className="flex shrink-0 items-center justify-between px-4 py-2">
        <button
          type="button"
          aria-label={labels.prevMonth}
          disabled={atStart}
          onClick={() => go(-1)}
          className="grid size-11 place-items-center text-ink transition disabled:opacity-30"
        >
          <Chevron dir="left" />
        </button>
        <span className="text-base font-bold text-ink">
          {formatMonthYear(view.year, view.month, lang)}
        </span>
        <button
          type="button"
          aria-label={labels.nextMonth}
          disabled={atEnd}
          onClick={() => go(1)}
          className="grid size-11 place-items-center text-ink transition disabled:opacity-30"
        >
          <Chevron dir="right" />
        </button>
      </div>

      {/* Weekday header */}
      <div className="grid shrink-0 grid-cols-7 px-4 text-center text-base font-bold text-ink">
        {weekdays.map((d, i) => (
          <span key={i} className="py-1">
            {d}
          </span>
        ))}
      </div>

      {/* Day grid (scrolls only if the viewport can't fit the 6 rows) */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-2">
        <div className="grid grid-cols-7">
          {gridCells.map((cell, idx) => {
            const d = cell.day;
            if (!d) {
              return (
                <span key={`blank-${idx}`} className="flex flex-col" aria-hidden>
                  <span className={`${CELL_H} border border-transparent`} />
                  <span className="h-[5px] w-full" />
                </span>
              );
            }

            const isSel = d.iso === selected;
            const sold = d.availability === "none";
            const pastDisabled = d.disabled && !sold;

            const barColor = sold
              ? "transparent"
              : d.disabled
                ? MUTED
                : d.availability === "high"
                  ? AVAIL_HIGH
                  : AVAIL_LOW;

            return (
              <button
                key={d.iso}
                type="button"
                disabled={d.disabled}
                onClick={() => onSelect(d.iso)}
                aria-pressed={isSel}
                aria-label={d.iso}
                className="flex flex-col disabled:cursor-not-allowed"
              >
                <div
                  className={`relative flex ${CELL_H} flex-col items-center justify-center border transition ${
                    isSel ? "border-cta bg-cta/5" : "border-soft"
                  } ${pastDisabled ? "opacity-40" : ""}`}
                >
                  <span
                    className={`text-[20px] font-medium leading-none ${
                      sold ? "text-ink/40 line-through" : "text-ink"
                    }`}
                  >
                    {d.day}
                  </span>
                  {showPrices && (
                    <span
                      className={`mt-1 text-[12px] font-medium leading-none ${
                        sold ? "text-ink/40" : d.discount ? "text-[#ff004c]" : "text-ink"
                      }`}
                    >
                      {sold ? "—" : `${d.price}€`}
                    </span>
                  )}
                  {!!d.discount && !sold && !isSel && (
                    <span
                      aria-hidden
                      className="absolute right-1 top-0.5 text-[11px] font-bold leading-none"
                      style={{ color: PROMO_RED }}
                    >
                      %
                    </span>
                  )}
                </div>
                <span
                  aria-hidden
                  className="h-[5px] w-full"
                  style={{ backgroundColor: barColor }}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend + note + confirm */}
      <div className="shrink-0 px-4 pb-5 pt-3">
        <div className="flex items-center gap-3 rounded-[10px] bg-soft px-3 py-3">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            className="shrink-0 text-cta"
            aria-hidden
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.6" />
            <circle cx="12" cy="7.5" r="1.1" fill="currentColor" />
            <path d="M12 11v5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <div className="text-[12px] leading-tight text-ink">
            <p>
              <strong className="font-bold" style={{ color: AVAIL_HIGH }}>
                {labels.legendHighLabel}
              </strong>{" "}
              {labels.legendHigh}
            </p>
            <p className="mt-1">
              <strong className="font-bold" style={{ color: AVAIL_LOW }}>
                {labels.legendLowLabel}
              </strong>{" "}
              {labels.legendLow}
            </p>
          </div>
        </div>

        {showPrices && (
          <p className="mt-3 text-center text-[12px] text-cta">{labels.priceNote}</p>
        )}

        <Button
          type="button"
          onClick={onConfirm}
          disabled={!selected}
          size="md"
          fullWidth
          className="mt-3"
        >
          {confirmLabel}
        </Button>
      </div>
    </div>
  );
}
