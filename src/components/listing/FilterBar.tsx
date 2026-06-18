"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Container } from "@/components/ui/Container";
import { Popover } from "@/components/ui/Popover";
import { Button } from "@/components/ui/Button";
import { filterFacets, filterGroups, type FilterOption } from "@/data/listing";
import { fill } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type FacetLabels = Dictionary["filters"]["facets"];
type GroupTitles = Dictionary["filters"]["groups"];
type OptionLabels = Dictionary["filters"]["options"];

/**
 * Sliders/adjustments glyph (same path as icon-filter.svg) drawn with
 * `currentColor` so it can be tinted CTA inside the round trigger.
 */
function SlidersIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 11 11" fill="none" aria-hidden xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.87485 4.81278C7.22034 4.81273 7.5566 4.70119 7.83363 4.49475C8.11067 4.28832 8.31371 3.998 8.41256 3.66695H9.62485C9.74641 3.66695 9.86299 3.61866 9.94894 3.53271C10.0349 3.44675 10.0832 3.33018 10.0832 3.20862C10.0832 3.08706 10.0349 2.97048 9.94894 2.88453C9.86299 2.79857 9.74641 2.75029 9.62485 2.75029H8.41256C8.31354 2.41941 8.11044 2.12929 7.83342 1.92303C7.55639 1.71676 7.22023 1.60536 6.87485 1.60536C6.52947 1.60536 6.19331 1.71676 5.91628 1.92303C5.63926 2.12929 5.43616 2.41941 5.33714 2.75029H1.37485C1.25329 2.75029 1.13671 2.79857 1.05076 2.88453C0.964806 2.97048 0.916517 3.08706 0.916517 3.20862C0.916517 3.33018 0.964806 3.44675 1.05076 3.53271C1.13671 3.61866 1.25329 3.66695 1.37485 3.66695H5.33714C5.436 3.998 5.63903 4.28832 5.91607 4.49475C6.1931 4.70119 6.52936 4.81273 6.87485 4.81278ZM1.37485 7.33362C1.25329 7.33362 1.13671 7.38191 1.05076 7.46786C0.964806 7.55381 0.916517 7.67039 0.916517 7.79195C0.916517 7.91351 0.964806 8.03009 1.05076 8.11604C1.13671 8.202 1.25329 8.25028 1.37485 8.25028H2.35798C2.45699 8.58116 2.66009 8.87128 2.93712 9.07754C3.21414 9.2838 3.55031 9.39521 3.89568 9.39521C4.24106 9.39521 4.57723 9.2838 4.85425 9.07754C5.13127 8.87128 5.33438 8.58116 5.43339 8.25028H9.62485C9.74641 8.25028 9.86299 8.202 9.94894 8.11604C10.0349 8.03009 10.0832 7.91351 10.0832 7.79195C10.0832 7.67039 10.0349 7.55381 9.94894 7.46786C9.86299 7.38191 9.74641 7.33362 9.62485 7.33362H5.43339C5.33438 7.00274 5.13127 6.71262 4.85425 6.50636C4.57723 6.3001 4.24106 6.18869 3.89568 6.18869C3.55031 6.18869 3.21414 6.3001 2.93712 6.50636C2.66009 6.71262 2.45699 7.00274 2.35798 7.33362H1.37485Z"
        fill="currentColor"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden xmlns="http://www.w3.org/2000/svg">
      <path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronIcon({ up }: { up: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className={`transition-transform ${up ? "rotate-180" : ""}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden xmlns="http://www.w3.org/2000/svg">
      <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function NavChevron({ left = false }: { left?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden xmlns="http://www.w3.org/2000/svg">
      <path
        d={left ? "M10 3.5L5.5 8L10 12.5" : "M6 3.5L10.5 8L6 12.5"}
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Pill facet toggle: active = CTA fill, inactive = soft fill (Figma 64:2909). */
function Chip({ on, label, onClick }: { on: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={
        on
          ? "shrink-0 rounded-full bg-cta px-4 py-2.5 text-sm font-semibold text-white transition-colors"
          : "shrink-0 rounded-full bg-soft px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-[color-mix(in_oklab,var(--color-soft),var(--color-cta)_12%)]"
      }
    >
      {label}
    </button>
  );
}

/** Checkbox row in the advanced-filters sheet (square box + label + optional hint). */
function CheckRow({
  on,
  label,
  hint,
  onClick,
}: {
  on: boolean;
  label: string;
  hint?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={on}
      onClick={onClick}
      className="flex w-full items-start gap-3 py-2.5 text-left"
    >
      <span
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
          on ? "border-cta bg-cta text-white" : "border-stroke text-transparent"
        }`}
      >
        <CheckIcon />
      </span>
      <span className="flex flex-col">
        <span className="text-base font-semibold leading-tight text-ink">{label}</span>
        {hint && <span className="mt-0.5 text-sm text-ink/60">{hint}</span>}
      </span>
    </button>
  );
}

/**
 * Mobile filter bar (Figma 64:5078): a round CTA-outlined sliders button that
 * opens the advanced-filters bottom-sheet, followed by horizontally scrollable
 * quick-facet chips. The sheet is **sectioned with checkboxes** (Viator-style:
 * Ora del giorno / Lingue / Durata / Offerte) with a sticky "Cancella tutto" +
 * "Vedi N risultati" footer. Controlled — the active set + toggles live in the
 * parent so the chips, the sheet and the result grid all share one state.
 */
export function FilterBar({
  dict,
  active,
  onToggle,
  onClear,
  resultCount,
}: {
  dict: Dictionary;
  active: Set<string>;
  onToggle: (id: string) => void;
  onClear: () => void;
  resultCount: number;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Quick-filter chips: GetYourGuide-style edge fades + scroll arrows. Track how
  // far the row is scrolled so the fade/arrow only show where there's more to see.
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const updateArrows = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateArrows();
    window.addEventListener("resize", updateArrows);
    return () => window.removeEventListener("resize", updateArrows);
  }, [updateArrows]);

  // Selected quick filters jump to the FRONT of the row (active-first, stable order
  // so unselected chips keep their relative order). On every selection change reset
  // the scroll to the start, so the promoted chips are actually visible up front.
  const activeKey = [...active].sort().join(",");
  useEffect(() => {
    scrollerRef.current?.scrollTo({ left: 0, behavior: "smooth" });
  }, [activeKey]);

  const orderedFacets = [...filterFacets].sort(
    (a, b) => Number(active.has(b.id)) - Number(active.has(a.id)),
  );

  const scrollChips = (dir: 1 | -1) =>
    scrollerRef.current?.scrollBy({ left: dir * 180, behavior: "smooth" });

  const facetLabel = (id: string) => dict.filters.facets[id as keyof FacetLabels] ?? id;
  const groupTitle = (id: string) => dict.filters.groups[id as keyof GroupTitles] ?? id;
  const optionMeta = (id: string) => dict.filters.options[id as keyof OptionLabels];

  const toggleExpand = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const visibleOptions = (groupId: string, options: FilterOption[], collapseAfter?: number) =>
    collapseAfter && !expanded.has(groupId) ? options.slice(0, collapseAfter) : options;

  return (
    <section className="sticky top-0 z-30 border-b border-soft-grey bg-white py-4">
      <Container className="flex items-center gap-3">
        <Popover
          sheet
          className="relative shrink-0"
          trigger={({ open, toggle, id }) => (
            <button
              type="button"
              onClick={toggle}
              aria-haspopup="dialog"
              aria-expanded={open}
              aria-controls={id}
              aria-label={dict.filters.button}
              className={`flex h-10 items-center justify-center gap-1 rounded-full border border-cta transition-colors ${
                active.size > 0 ? "bg-cta px-3 text-white" : "w-10 text-cta hover:bg-soft"
              }`}
            >
              <SlidersIcon />
              {active.size > 0 && (
                <span className="text-base font-bold leading-none">+{active.size}</span>
              )}
            </button>
          )}
        >
          {({ close }) => (
            <div className="flex max-h-[88vh] flex-col rounded-t-[20px] bg-white shadow-2xl">
              {/* Header */}
              <div className="shrink-0 border-b border-soft-grey px-4 pb-3 pt-3">
                <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-stroke/60" aria-hidden />
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-extrabold text-ink">{dict.filters.button}</h2>
                  <button
                    type="button"
                    onClick={close}
                    aria-label={dict.filters.close}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-soft text-ink transition-colors hover:bg-[color-mix(in_oklab,var(--color-soft),var(--color-cta)_12%)]"
                  >
                    <CloseIcon />
                  </button>
                </div>
              </div>

              {/* Scrollable sections */}
              <div className="min-h-0 flex-1 overflow-y-auto px-4">
                {filterGroups.map((group) => {
                  const opts = visibleOptions(group.id, group.options, group.collapseAfter);
                  const canExpand =
                    !!group.collapseAfter && group.options.length > group.collapseAfter;
                  return (
                    <section
                      key={group.id}
                      className="border-t border-soft-grey py-4 first:border-t-0"
                    >
                      <h3 className="mb-1 text-lg font-extrabold text-ink">
                        {groupTitle(group.id)}
                      </h3>
                      <div>
                        {opts.map((opt) => {
                          const meta = optionMeta(opt.id);
                          return (
                            <CheckRow
                              key={opt.id}
                              on={active.has(opt.id)}
                              label={meta?.label ?? opt.id}
                              hint={opt.hasHint ? meta?.hint : undefined}
                              onClick={() => onToggle(opt.id)}
                            />
                          );
                        })}
                      </div>
                      {canExpand && (
                        <button
                          type="button"
                          onClick={() => toggleExpand(group.id)}
                          className="mt-1 flex items-center gap-1 text-sm font-semibold text-ink hover:underline"
                        >
                          {expanded.has(group.id) ? dict.filters.showLess : dict.filters.showMore}
                          <ChevronIcon up={expanded.has(group.id)} />
                        </button>
                      )}
                    </section>
                  );
                })}
              </div>

              {/* Sticky footer */}
              <div className="flex shrink-0 items-center justify-between gap-3 border-t border-soft-grey bg-white px-4 py-3">
                <button
                  type="button"
                  onClick={onClear}
                  className="text-base font-semibold text-ink underline underline-offset-2"
                >
                  {dict.filters.clearAll}
                </button>
                <Button type="button" className="px-8" onClick={close}>
                  {fill(dict.filters.viewResults, { count: String(resultCount) })}
                </Button>
              </div>
            </div>
          )}
        </Popover>

        <div className="relative min-w-0 flex-1">
          {/* Left fade + scroll-back arrow (only once scrolled). */}
          {canLeft && (
            <>
              <div
                className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-white to-transparent"
                aria-hidden
              />
              <button
                type="button"
                onClick={() => scrollChips(-1)}
                aria-label={dict.filters.scroll}
                className="absolute left-0 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-soft-grey bg-white text-ink shadow-sm transition-colors hover:bg-soft"
              >
                <NavChevron left />
              </button>
            </>
          )}

          <div
            ref={scrollerRef}
            onScroll={updateArrows}
            className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {orderedFacets.map((facet) => (
              <Chip
                key={facet.id}
                on={active.has(facet.id)}
                label={facetLabel(facet.id)}
                onClick={() => onToggle(facet.id)}
              />
            ))}
          </div>

          {/* Right fade + scroll-forward arrow (GetYourGuide-style). */}
          {canRight && (
            <>
              <div
                className="pointer-events-none absolute inset-y-0 right-0 z-10 w-14 bg-gradient-to-l from-white to-transparent"
                aria-hidden
              />
              <button
                type="button"
                onClick={() => scrollChips(1)}
                aria-label={dict.filters.scroll}
                className="absolute right-0 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-soft-grey bg-white text-ink shadow-sm transition-colors hover:bg-soft"
              >
                <NavChevron />
              </button>
            </>
          )}
        </div>
      </Container>
    </section>
  );
}
