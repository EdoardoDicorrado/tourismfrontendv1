"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";

import { formatDateLong } from "@/lib/format";
import { Popover } from "@/components/ui/Popover";
import { RangeCalendar } from "@/components/selectors/RangeCalendar";
import { CalendarGlyph } from "@/components/selectors/glyphs";
import { useListingFilters, type DateRange } from "@/components/listing/ListingFiltersProvider";
import { useIsDesktop } from "@/components/ui/useMediaQuery";
import { useHydrated } from "@/lib/useHydrated";
import { fill, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/** Mock pricing for the search calendar (real availability lands with the API). */
const SEARCH_PRICING = { basePrice: 34, lowPrice: 22, discountPercent: 20 };
const TODAY_ISO = "2026-06-08";

// prettier-ignore
// ds-guard-ignore-next-line: max-w-[760px] = larghezza barra ricerca listing (Figma, nessun token)
const BAR_CLS = "flex w-full max-w-[760px] items-center rounded-full border border-stroke bg-white px-5 py-2.5 shadow-lg";
const PILL_CLS = "flex w-full items-center gap-3 py-2 text-left";

/**
 * Listing hero search: the date pill opens the {@link RangeCalendar} (range-aware,
 * Figma 64:5906). Confirming a range does NOT navigate to /cerca — it commits the
 * range to the shared {@link useListingFilters} state so the results below filter
 * in place. The pill reflects the committed range.
 *
 * MOBILE: bottom-sheet (Popover sheet). DESKTOP (lg+): the calendar drops under the
 * bar, portaled to <body> so the sticky filter bar can't trap/clip it — full bar
 * width, simple fade-in, no drag grabber (closes via outside-click / Esc / ×).
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
  const isDesktop = useIsDesktop();

  const { start, end } = range;
  const pillLabel = start
    ? end && end !== start
      ? `${formatDateLong(start, lang)} – ${formatDateLong(end, lang)}`
      : formatDateLong(start, lang)
    : fill(dict.search.cityPlaceholder, { city: cityName });

  // Shared calendar element; `grabber` only on the mobile sheet (no drag on desktop).
  const calendar = (close: () => void, grabber: boolean) => (
    <RangeCalendar
      startYear={2026}
      startMonth={5}
      pricing={SEARCH_PRICING}
      minIso={TODAY_ISO}
      start={draft.start}
      end={draft.end}
      onChange={(s, e) => setDraft({ start: s, end: e })}
      onConfirm={() => {
        setRange(draft);
        close();
      }}
      onClose={() => {
        setDraft(range);
        close();
      }}
      grabber={grabber}
      lang={lang}
      labels={dict.booking.calendar}
      confirmLabel={dict.booking.confirm}
      title={fill(dict.search.calendarTitle, { city: cityName })}
    />
  );

  const pillSpan = (
    <>
      <span className="shrink-0">
        <CalendarGlyph />
      </span>
      <span className={`truncate text-base sm:text-lg ${start ? "text-ink" : "text-stroke"}`}>
        {pillLabel}
      </span>
    </>
  );

  if (isDesktop) {
    return <DesktopBar pillSpan={pillSpan} seed={() => setDraft(range)} calendar={calendar} />;
  }

  return (
    <div className={BAR_CLS}>
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
            className={PILL_CLS}
          >
            {pillSpan}
          </button>
        )}
      >
        {({ close }) => calendar(close, true)}
      </Popover>
    </div>
  );
}

/**
 * Desktop date bar: pill + calendar dropdown portaled to <body> at the bar's
 * document coords (absolute + scroll offsets) → scrolls natively with the page,
 * never trapped by the sticky filter bar's stacking context, full bar width.
 */
function DesktopBar({
  pillSpan,
  seed,
  calendar,
}: {
  pillSpan: React.ReactNode;
  seed: () => void;
  calendar: (close: () => void, grabber: boolean) => React.ReactNode;
}) {
  const hydrated = useHydrated();
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<{ top: number; left: number; width: number } | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const place = () => {
      const r = barRef.current?.getBoundingClientRect();
      if (r) setRect({ top: r.bottom + window.scrollY + 8, left: r.left + window.scrollX, width: r.width });
    };
    place();
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!barRef.current?.contains(t) && !popRef.current?.contains(t)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", place);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", place);
    };
  }, [open]);

  return (
    <div ref={barRef} className={BAR_CLS}>
      <button
        type="button"
        onClick={() => {
          seed();
          setOpen(true);
        }}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={PILL_CLS}
      >
        {pillSpan}
      </button>

      {hydrated &&
        open &&
        rect &&
        createPortal(
          <motion.div
            ref={popRef}
            initial={reduceMotion ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.18, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: "absolute", top: rect.top, left: rect.left, width: rect.width }}
            className="z-[var(--z-dropdown)] overflow-hidden rounded-sheet bg-white shadow-sheet"
          >
            {calendar(() => setOpen(false), false)}
          </motion.div>,
          document.body,
        )}
    </div>
  );
}
