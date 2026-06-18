"use client";

import Image from "next/image";
import { useState } from "react";

import { Popover } from "@/components/ui/Popover";
import { Stars } from "@/components/ui/Stars";
import type { PageReview } from "@/data/reviews";
import { fill, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type SortKey = "recent" | "oldest" | "highest" | "lowest";

/** Small down-chevron that flips when the dropdown is open. */
function CaretDown({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden
      className={`shrink-0 text-cta transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    >
      <path
        d="M2.5 4.5 6 8l3.5-3.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Check() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="shrink-0 text-cta">
      <path
        d="M3.5 8.5 6.5 11.5 12.5 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Client-side reviews list for `/[lang]/recensioni`. Holds the sort state and
 * renders a curated subset of reviews fully expanded, stacked one below the
 * other. Default order is most-recent-first.
 *
 * The sort control is a custom on-brand dropdown (the shared `Popover` with the
 * pop animation) rather than a native `<select>` — the native control's
 * OS-rendered arrow looked detached and crowded out the result count on mobile.
 */
export function ReviewsList({
  lang,
  dict,
  reviews,
}: {
  lang: Locale;
  dict: Dictionary;
  reviews: PageReview[];
}) {
  const [sort, setSort] = useState<SortKey>("recent");

  const options: { key: SortKey; label: string }[] = [
    { key: "recent", label: dict.reviewsPage.sort.recent },
    { key: "oldest", label: dict.reviewsPage.sort.oldest },
    { key: "highest", label: dict.reviewsPage.sort.highest },
    { key: "lowest", label: dict.reviewsPage.sort.lowest },
  ];
  const current = options.find((o) => o.key === sort) ?? options[0];

  const sorted = [...reviews].sort((a, b) => {
    switch (sort) {
      case "oldest":
        return a.publishedAt.localeCompare(b.publishedAt);
      case "highest":
        return b.rating - a.rating || b.publishedAt.localeCompare(a.publishedAt);
      case "lowest":
        return a.rating - b.rating || b.publishedAt.localeCompare(a.publishedAt);
      case "recent":
      default:
        return b.publishedAt.localeCompare(a.publishedAt);
    }
  });

  const dateFmt = new Intl.DateTimeFormat(lang, { month: "long", year: "numeric" });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-ink/70">
          {fill(dict.reviewsPage.count, { count: String(reviews.length) })}
        </p>

        <Popover
          animated
          align="start"
          className="relative shrink-0"
          panelClassName="w-56 max-w-[calc(100vw-2rem)] overflow-hidden rounded-[12px] border border-stroke-2 bg-white p-1 shadow-xl"
          trigger={({ open, toggle, id }) => (
            <button
              type="button"
              onClick={toggle}
              aria-haspopup="listbox"
              aria-expanded={open}
              aria-controls={id}
              className={`flex items-center gap-2 rounded-full border bg-white py-2 pl-4 pr-3 text-sm font-semibold text-ink transition-colors ${
                open ? "border-cta" : "border-stroke hover:border-cta"
              }`}
            >
              <span className="font-medium text-ink/60">{dict.reviewsPage.sortLabel}:</span>
              <span>{current.label}</span>
              <CaretDown open={open} />
            </button>
          )}
        >
          {({ close }) => (
            <ul role="listbox" aria-label={dict.reviewsPage.sortLabel} className="flex flex-col">
              {options.map((o) => {
                const active = o.key === sort;
                return (
                  <li key={o.key}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => {
                        setSort(o.key);
                        close();
                      }}
                      className={`flex w-full items-center justify-between gap-3 rounded-[8px] px-3 py-2.5 text-left text-sm transition-colors ${
                        active ? "bg-soft font-extrabold text-cta" : "font-semibold text-ink hover:bg-soft/60"
                      }`}
                    >
                      {o.label}
                      {active && <Check />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Popover>
      </div>

      <ul className="flex flex-col gap-4">
        {sorted.map((r) => (
          <li key={r.id}>
            <article className="flex flex-col gap-4 rounded-[10px] bg-soft p-4">
              <div className="flex items-center justify-between">
                <Stars value={r.rating} size={16} />
                <Image src="/images/icon-google.svg" alt="Google" width={16} height={16} />
              </div>

              <div className="flex items-center gap-3">
                <Image
                  src="/images/avatar-review-default.svg"
                  alt=""
                  width={44}
                  height={44}
                  className="shrink-0 rounded-full"
                />
                <div className="flex min-w-0 flex-col gap-1">
                  <p className="text-base font-extrabold text-ink">{r.author}</p>
                  <p className="truncate text-xs font-semibold text-cta">{r.tour}</p>
                </div>
                <span className="ml-auto shrink-0 text-xs font-medium text-ink/70">
                  {dateFmt.format(new Date(r.publishedAt))}
                </span>
              </div>

              <p className="text-sm font-medium leading-relaxed text-ink">{r.text}</p>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}
