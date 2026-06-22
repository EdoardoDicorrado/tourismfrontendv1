"use client";

import { useState } from "react";

import { addMonth, buildMonth, type PricingInput } from "@/lib/calendar";
import { formatMonthYear, weekdayShortNames } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Chevron } from "./glyphs";

/** Per-day availability → the 5px bar colour under each cell (Figma 64:5906). */
const BAR = {
  high: "#238d00", // green — varie opzioni
  low: "#cbc829", // yellow — poche opzioni
  muted: "#aed5e3", // sold out / before minIso (stroke-2)
} as const;

/** Round month-nav control (bigger than the shared Stepper, per the Figma). */
function NavButton({ children, ...rest }: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-stroke text-ink transition hover:border-cta hover:text-cta disabled:opacity-30 disabled:hover:border-stroke disabled:hover:text-ink"
      {...rest}
    >
      {children}
    </button>
  );
}

/**
 * Range date-picker for the listing search — taller cells, a per-day
 * availability bar and start→end range selection. Visual: Figma node 64:5906
 * ("Calendario Lisitng"), distinct from the single-date {@link Calendar} used on
 * the product page (which is left untouched). Controlled: the parent owns the
 * `start`/`end` ISO strings and gets every change via `onChange`.
 */
export function RangeCalendar({
  startYear,
  startMonth,
  pricing,
  start,
  end,
  onChange,
  onConfirm,
  onClose,
  minIso,
  monthsAhead = 11,
  lang,
  labels,
  confirmLabel,
  title,
  grabber = true,
}: {
  startYear: number;
  startMonth: number; // 0-11, earliest navigable month
  pricing: PricingInput;
  start: string | null;
  end: string | null;
  onChange: (start: string | null, end: string | null) => void;
  onConfirm: () => void;
  onClose: () => void;
  minIso?: string;
  monthsAhead?: number;
  lang: Locale;
  labels: Dictionary["booking"]["calendar"];
  confirmLabel: string;
  title: string;
  /** Drag-handle grabber in the header — show on the bottom-sheet, hide on the
   *  desktop anchored dropdown (no drag-to-dismiss there). */
  grabber?: boolean;
}) {
  const [view, setView] = useState({ year: startYear, month: startMonth });
  const month = buildMonth(view.year, view.month, pricing, minIso);
  const weekdays = weekdayShortNames(lang);

  // Always render 6 week-rows (42 cells) so the calendar height stays CONSTANT
  // when paging months — a 4/5-row month must not make the sheet grow/shrink.
  const cells = month.weeks.flat();
  const gridCells =
    cells.length < 42
      ? [...cells, ...Array.from({ length: 42 - cells.length }, () => ({ day: null }))]
      : cells;

  const atStart = view.year === startYear && view.month === startMonth;
  const last = addMonth(startYear, startMonth, monthsAhead);
  const atEnd = view.year === last.year && view.month === last.month;
  const go = (delta: number) => setView((v) => addMonth(v.year, v.month, delta));

  // Range rule: first pick (or a pick before the current start, or after a
  // complete range) starts a fresh range; the next pick on/after start closes it.
  const pick = (iso: string) => {
    if (!start || end || iso < start) {
      onChange(iso, null);
    } else {
      onChange(start, iso);
    }
  };

  return (
    <div className="flex max-h-[90vh] flex-col rounded-t-[20px] bg-white">
      {/* Header — same chrome as the filters sheet: grabber handle + soft round
          close (so the two listing sheets share one top treatment). */}
      <div className="shrink-0 border-b border-soft-grey px-4 pb-3 pt-3">
        {grabber && (
          <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-stroke/60" aria-hidden />
        )}
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-extrabold text-cta">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={labels.close}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-soft text-ink transition-colors hover:bg-[color-mix(in_oklab,var(--color-soft),var(--color-cta)_12%)]"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Month nav */}
      <div className="flex shrink-0 items-center gap-4 px-4 py-2">
        <NavButton aria-label={labels.prevMonth} disabled={atStart} onClick={() => go(-1)}>
          <Chevron dir="left" />
        </NavButton>
        <span className="flex-1 text-center text-base font-bold text-ink">
          {formatMonthYear(view.year, view.month, lang)}
        </span>
        <NavButton aria-label={labels.nextMonth} disabled={atEnd} onClick={() => go(1)}>
          <Chevron dir="right" />
        </NavButton>
      </div>

      {/* Grid (scrolls if the sheet runs out of height) */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4">
        <div className="grid grid-cols-7">
          {weekdays.map((d, i) => (
            <span key={i} className="py-2 text-center text-base font-extrabold text-ink">
              {d}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {gridCells.map((cell, idx) => {
            const d = cell.day;
            if (!d) {
              return (
                <span key={`blank-${idx}`} className="flex flex-col" aria-hidden>
                  <span className="h-11 border border-transparent" />
                  <span className="h-[5px] w-full" />
                </span>
              );
            }

            const isStart = d.iso === start;
            const isEnd = d.iso === end;
            const isEndpoint = isStart || isEnd;
            const inRange = !!(start && end && d.iso > start && d.iso < end);

            const barColor = d.disabled
              ? BAR.muted
              : d.availability === "high"
                ? BAR.high
                : d.availability === "low"
                  ? BAR.low
                  : BAR.muted;

            const cellTone = isEndpoint
              ? "border-cta bg-cta text-white"
              : inRange
                ? "border-soft bg-soft text-ink"
                : d.disabled
                  ? "border-soft text-[#aed5e3]"
                  : "border-soft text-ink hover:bg-soft";

            return (
              <button
                key={d.iso}
                type="button"
                disabled={d.disabled}
                onClick={() => pick(d.iso)}
                aria-label={d.iso}
                aria-pressed={isEndpoint}
                className="flex flex-col"
              >
                <span
                  className={`flex h-11 items-center justify-center border text-xl font-medium transition-colors ${cellTone}`}
                >
                  {d.day}
                </span>
                <span className="h-[5px] w-full" style={{ backgroundColor: barColor }} aria-hidden />
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend + confirm */}
      <div className="flex shrink-0 flex-col gap-5 border-t border-soft-grey px-4 py-5">
        <div className="flex items-center gap-2.5 rounded-[10px] bg-soft p-3 text-xs">
          <div className="flex flex-col gap-2">
            <span>
              <strong className="font-bold" style={{ color: BAR.high }}>
                {labels.legendHighLabel}
              </strong>{" "}
              {labels.legendHigh}
            </span>
            <span>
              <strong className="font-bold" style={{ color: BAR.low }}>
                {labels.legendLowLabel}
              </strong>{" "}
              {labels.legendLow}
            </span>
          </div>
        </div>

        <Button type="button" onClick={onConfirm} disabled={!start} size="md" fullWidth>
          {confirmLabel}
        </Button>
      </div>
    </div>
  );
}
