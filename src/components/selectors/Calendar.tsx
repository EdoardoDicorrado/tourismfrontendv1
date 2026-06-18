"use client";

import { useState } from "react";

import { addMonth, buildMonth, type PricingInput } from "@/lib/calendar";
import { formatMonthYear, weekdayShortNames } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Chevron, CloseButton, Stepper } from "./glyphs";

/**
 * Reusable calendar overlay: header + close ×, real month navigation, per-day
 * availability (green = various / yellow = few / sold out), optional prices,
 * legend and a confirm action. Used by the booking box and the search bar.
 *
 * Localized via `lang` (month/weekday names) + `labels`; `title` overrides the
 * default header so callers can show a contextual prompt (e.g. "When in {city}?").
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

  const atStart = view.year === startYear && view.month === startMonth;
  const last = addMonth(startYear, startMonth, monthsAhead);
  const atEnd = view.year === last.year && view.month === last.month;

  const go = (delta: number) => setView((v) => addMonth(v.year, v.month, delta));

  return (
    <div className="rounded-[15px] border border-stroke-2 bg-white p-4 shadow-xl">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="font-bold text-cta">{title ?? labels.title}</p>
        <CloseButton onClick={onClose} label={labels.close} />
      </div>

      <div className="mb-3 flex items-center justify-between">
        <Stepper aria-label={labels.prevMonth} disabled={atStart} onClick={() => go(-1)}>
          <Chevron dir="left" />
        </Stepper>
        <span className="font-bold text-ink">{formatMonthYear(view.year, view.month, lang)}</span>
        <Stepper aria-label={labels.nextMonth} disabled={atEnd} onClick={() => go(1)}>
          <Chevron dir="right" />
        </Stepper>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-ink">
        {weekdays.map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {month.weeks.flat().map((cell, idx) => {
          const d = cell.day;
          if (!d) return <span key={`blank-${idx}`} aria-hidden />;

          const isSel = d.iso === selected;
          const sold = d.availability === "none";
          const pastDisabled = d.disabled && !sold;

          const border = isSel
            ? "border-cta"
            : d.availability === "high"
              ? "border-emerald-500"
              : d.availability === "low"
                ? "border-rate"
                : "border-transparent";

          const tone = isSel
            ? "bg-cta text-white"
            : sold
              ? "text-ink/30"
              : pastDisabled
                ? "text-ink/25"
                : "text-ink hover:bg-soft";

          return (
            <button
              key={d.iso}
              type="button"
              disabled={d.disabled}
              onClick={() => onSelect(d.iso)}
              aria-pressed={isSel}
              aria-label={d.iso}
              className={`relative flex min-h-[40px] flex-col items-center justify-center rounded-md border-b-2 py-1.5 text-xs transition ${tone} ${border}`}
            >
              <span className={`font-semibold ${sold ? "line-through" : ""}`}>{d.day}</span>
              {showPrices && (
                <span className={isSel ? "text-white/90" : sold ? "text-badge" : "text-ink/60"}>
                  {sold ? "—" : `${d.price}€`}
                </span>
              )}
              {d.discount && !isSel && !d.disabled && (
                <span className="absolute -right-1 -top-1 rounded-full bg-badge px-1 text-[9px] font-bold text-white">
                  %
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-col gap-1 rounded-[10px] bg-soft p-3 text-xs">
        <span>
          <strong className="font-bold text-emerald-600">{labels.legendHighLabel}</strong>{" "}
          {labels.legendHigh}
        </span>
        <span>
          <strong className="font-bold text-rate">{labels.legendLowLabel}</strong> {labels.legendLow}
        </span>
      </div>
      {showPrices && (
        <p className="mt-2 text-center text-[11px] text-cta">{labels.priceNote}</p>
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
  );
}
