"use client";

import Image from "next/image";
import { useRef } from "react";

import { Container } from "@/components/ui/Container";
import { filterFacets } from "@/data/listing";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type FacetLabels = Dictionary["filters"]["facets"];

/**
 * Horizontally scrollable facet chips + "Filtri" button with active count.
 * Controlled: the active set and toggles live in the parent so the result grid
 * can react to the same state. Figma 221:2781.
 */
export function FilterBar({
  dict,
  active,
  onToggle,
}: {
  dict: Dictionary;
  active: Set<string>;
  onToggle: (id: string) => void;
}) {
  const scroller = useRef<HTMLDivElement>(null);

  return (
    <section className="border-b border-soft-grey py-4">
      <Container className="flex items-center gap-3">
        <button
          type="button"
          className="flex shrink-0 items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-white"
        >
          <Image src="/images/icon-filter.svg" alt="" width={16} height={16} />
          {dict.filters.button}
          {active.size > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-xs font-bold text-ink">
              {active.size}
            </span>
          )}
        </button>

        <div
          ref={scroller}
          className="flex flex-1 items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {filterFacets.map((facet) => {
            const on = active.has(facet.id);
            const label = dict.filters.facets[facet.id as keyof FacetLabels] ?? facet.id;
            return (
              <button
                key={facet.id}
                type="button"
                onClick={() => onToggle(facet.id)}
                aria-pressed={on}
                className={
                  on
                    ? "flex shrink-0 items-center gap-1.5 rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-white"
                    : "shrink-0 rounded-full border border-stroke px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-cta hover:text-cta"
                }
              >
                {label}
                {on && <Image src="/images/icon-x.svg" alt={dict.filters.remove} width={11} height={11} />}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          aria-label={dict.filters.scroll}
          onClick={() => scroller.current?.scrollBy({ left: 240, behavior: "smooth" })}
          className="shrink-0"
        >
          <Image src="/images/icon-arrow.svg" alt="" width={40} height={40} />
        </button>
      </Container>
    </section>
  );
}
