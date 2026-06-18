"use client";

import { useState } from "react";

import { FilterBar } from "@/components/listing/FilterBar";
import { ResultsGrid } from "@/components/listing/ResultsGrid";
import { filterFacets } from "@/data/listing";
import type { Product } from "@/data/home";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const defaultActive = new Set(filterFacets.filter((f) => f.active).map((f) => f.id));

/**
 * Owns the active filter set so the chips and the result grid share it. A product
 * matches when it carries every selected facet tag (AND). `products` come from
 * the storefront API (with fixture fallback) and carry their facet `tags`, so the
 * client-side AND filter is unchanged; the catalog API will run the query
 * server-side once it exposes facets (see CLAUDE.md).
 */
export function ListingResults({ lang, dict, products }: { lang: Locale; dict: Dictionary; products: Product[] }) {
  const [active, setActive] = useState<Set<string>>(() => new Set(defaultActive));

  const toggle = (id: string) =>
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const clear = () => setActive(new Set());

  const selected = [...active];
  const results = products.filter((p) =>
    selected.every((id) => (p.tags ?? []).includes(id)),
  );

  return (
    <>
      <FilterBar dict={dict} active={active} onToggle={toggle} />
      <ResultsGrid
        lang={lang}
        dict={dict}
        products={results}
        count={results.length}
        hasFilters={active.size > 0}
        onClear={clear}
      />
    </>
  );
}
