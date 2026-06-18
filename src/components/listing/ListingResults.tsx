"use client";

import { FilterBar } from "@/components/listing/FilterBar";
import { ResultsGrid } from "@/components/listing/ResultsGrid";
import { useListingFilters, type DateRange } from "@/components/listing/ListingFiltersProvider";
import { hasDateInRange } from "@/data/availability";
import { tagToGroup } from "@/data/listing";
import type { Product } from "@/data/home";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * Filter matching: tags in the same advanced-filter group are OR'd (e.g. "Italian
 * OR English"), groups are AND'd across each other, and any selected tag that is
 * not part of a group (the quick chips like "skip-line") is its own AND constraint.
 */
function matchesFilters(tags: string[], selected: string[]): boolean {
  if (selected.length === 0) return true;
  const byGroup = new Map<string, string[]>();
  for (const id of selected) {
    const key = tagToGroup[id] ?? `solo:${id}`;
    const arr = byGroup.get(key);
    if (arr) arr.push(id);
    else byGroup.set(key, [id]);
  }
  for (const ids of byGroup.values()) {
    if (!ids.some((id) => tags.includes(id))) return false;
  }
  return true;
}

/**
 * Availability-by-date filter. A product matches when at least one of its
 * `availableDates` falls inside the chosen range (inclusive). No range selected →
 * everything matches. Availability is currently mock data attached in
 * `@/lib/catalog` (the CRM availability API doesn't exist yet, see CLAUDE.md);
 * when it lands, the products simply carry real `availableDates` and this stays.
 */
function matchesDates(product: Product, range: DateRange): boolean {
  return hasDateInRange(product.availableDates, range.start, range.end);
}

/**
 * Reads the shared listing filter state (facets + date range) and renders the
 * filter bar + result grid. The date range is committed by the hero search
 * calendar, so confirming a range filters here in place instead of navigating.
 * `products` come from the storefront API (with fixture fallback) and carry their
 * facet `tags`; the catalog API will run the query server-side once it exposes
 * facets/availability (see CLAUDE.md).
 */
export function ListingResults({ lang, dict, products }: { lang: Locale; dict: Dictionary; products: Product[] }) {
  const { active, toggle, clear, range } = useListingFilters();

  const selected = [...active];
  const results = products.filter(
    (p) => matchesFilters(p.tags ?? [], selected) && matchesDates(p, range),
  );

  return (
    // Bounds the sticky FilterBar to the results region: once this wrapper scrolls
    // past, the filter bar unsticks (so it's gone by "Attrazioni più popolari").
    <div>
      <FilterBar
        dict={dict}
        active={active}
        onToggle={toggle}
        onClear={clear}
        resultCount={results.length}
      />
      <ResultsGrid
        lang={lang}
        dict={dict}
        products={results}
        count={results.length}
        hasFilters={active.size > 0}
        onClear={clear}
      />
    </div>
  );
}
