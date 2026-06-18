import Link from "next/link";

/**
 * Horizontal, link-based filter tabs (used for the bookings list
 * all/current/travelled/cancelled). Each tab is a `<Link>` that sets a query
 * param on `baseHref`; the active one is highlighted. No client state — the
 * active tab is driven by the page's `searchParams`, so this stays a server
 * component (safe across SSR, no hydration drift).
 *
 * Style follows the FilterBar chip pattern: active `bg-ink text-white`,
 * inactive outlined with a hover toward `cta`. Optional `count` renders a small
 * counter pill inside the chip.
 */
export interface TabItem {
  /** Stable value, also the query-param value. */
  value: string;
  label: string;
  /** Optional counter shown inside the chip. */
  count?: number;
}

export interface TabsProps {
  items: TabItem[];
  /** Currently active tab value. */
  active: string;
  /** Base path the tabs link to, e.g. `/it/area/prenotazioni`. */
  baseHref: string;
  /** Query-param name to set, defaults to "tab". */
  param?: string;
  /** ARIA label for the tablist. */
  ariaLabel?: string;
}

export function Tabs({ items, active, baseHref, param = "tab", ariaLabel }: TabsProps) {
  return (
    <div role="tablist" aria-label={ariaLabel} className="flex flex-wrap gap-2">
      {items.map((item) => {
        const on = item.value === active;
        const href = `${baseHref}?${param}=${encodeURIComponent(item.value)}`;
        return (
          <Link
            key={item.value}
            href={href}
            role="tab"
            aria-selected={on}
            className={
              on
                ? "inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-white"
                : "inline-flex items-center gap-2 rounded-full border border-stroke px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-cta hover:text-cta"
            }
          >
            {item.label}
            {typeof item.count === "number" ? (
              <span
                className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-bold ${
                  on ? "bg-white text-ink" : "bg-soft text-ink"
                }`}
              >
                {item.count}
              </span>
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}
