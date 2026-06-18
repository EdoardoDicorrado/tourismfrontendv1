"use client";

import type { ReactNode } from "react";

import { cx } from "@/components/ui/buttonVariants";

/**
 * Tabs — client, state-driven chip tabs (e.g. the city tabs in home/Offers).
 * Controlled: pass `value` + `onValueChange`. Chip look matches the listing
 * quick-filters (active `bg-cta text-white`, inactive `bg-soft`).
 *
 * NB: for URL/link-driven tabs (no client state, e.g. the bookings list) use the
 * separate server `Tabs` in `account/ui` instead — that's navigation, this is
 * in-page state.
 */
export interface TabItem {
  value: string;
  label: ReactNode;
  count?: number;
}

export function Tabs({
  items,
  value,
  onValueChange,
  ariaLabel,
  className,
}: {
  items: TabItem[];
  value: string;
  onValueChange: (value: string) => void;
  ariaLabel?: string;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cx("flex gap-2 overflow-x-auto no-scrollbar", className)}
    >
      {items.map((item) => {
        const on = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onValueChange(item.value)}
            className={cx(
              "inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta focus-visible:ring-offset-2",
              on ? "bg-cta text-white" : "bg-soft text-ink hover:bg-cta-hover hover:text-white",
            )}
          >
            {item.label}
            {typeof item.count === "number" ? (
              <span
                className={cx(
                  "flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-bold",
                  on ? "bg-white text-cta" : "bg-white/70 text-ink",
                )}
              >
                {item.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
