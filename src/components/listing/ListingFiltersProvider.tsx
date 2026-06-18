"use client";

import { createContext, useContext, useMemo, useState } from "react";

import { filterFacets } from "@/data/listing";

export type DateRange = { start: string | null; end: string | null };

type ListingFilters = {
  /** Facet ids currently active (quick chips + advanced sheet). */
  active: Set<string>;
  toggle: (id: string) => void;
  clear: () => void;
  /** Date range chosen in the hero search calendar, applied in-page. */
  range: DateRange;
  setRange: (range: DateRange) => void;
};

const ListingFiltersContext = createContext<ListingFilters | null>(null);

const defaultActive = new Set(filterFacets.filter((f) => f.active).map((f) => f.id));

/**
 * Shares the listing's filter state between the hero search (date range) and the
 * results list, so confirming a date range filters in place instead of navigating
 * to /cerca. Wraps the hero + results in the listing page; both are client
 * components that read it via {@link useListingFilters}.
 */
export function ListingFiltersProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState<Set<string>>(() => new Set(defaultActive));
  const [range, setRange] = useState<DateRange>({ start: null, end: null });

  const toggle = (id: string) =>
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const clear = () => setActive(new Set());

  const value = useMemo<ListingFilters>(
    () => ({ active, toggle, clear, range, setRange }),
    [active, range],
  );

  return <ListingFiltersContext.Provider value={value}>{children}</ListingFiltersContext.Provider>;
}

export function useListingFilters(): ListingFilters {
  const ctx = useContext(ListingFiltersContext);
  if (!ctx) {
    throw new Error("useListingFilters must be used within a ListingFiltersProvider");
  }
  return ctx;
}
