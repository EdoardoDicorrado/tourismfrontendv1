"use client";

import Image from "next/image";
import { useState } from "react";

import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Popover } from "@/components/ui/Popover";
import { ListingResultCard } from "@/components/listing/ListingResultCard";
import type { Product } from "@/data/home";
import { fill, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const PAGE = 6;

/** Tour result grid with progressive "Mostra altro" reveal. Driven by the active filters. Figma 221:4132. */
export function ResultsGrid({
  lang,
  dict,
  products,
  count,
  hasFilters,
  onClear,
}: {
  lang: Locale;
  dict: Dictionary;
  products: Product[];
  count: number;
  hasFilters: boolean;
  onClear: () => void;
}) {
  const [visible, setVisible] = useState(PAGE);
  const shown = products.slice(0, visible);
  const hasMore = visible < products.length;

  return (
    <section className="pb-8 pt-3 sm:pb-10 sm:pt-4">
      <Container>
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-semibold text-cta">
            {fill(dict.results.found, { count: count.toLocaleString(lang) })}
          </h2>
          <Popover
            animated
            align="start"
            className="relative inline-flex shrink-0"
            panelClassName="w-64 max-w-[calc(100vw-2rem)] rounded-[10px] border border-stroke-2 bg-white p-4 text-sm font-medium leading-snug text-ink shadow-lg"
            trigger={({ open, toggle, id }) => (
              <button
                type="button"
                onClick={toggle}
                aria-label={dict.results.infoLabel}
                aria-expanded={open}
                aria-controls={id}
                className="inline-flex h-6 w-6 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta"
              >
                <Image src="/images/icon-info-circle.svg" alt="" width={14} height={14} className="shrink-0" />
              </button>
            )}
          >
            {() => <p>{dict.results.infoTooltip}</p>}
          </Popover>
        </div>

        {products.length > 0 ? (
          <>
            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
              {shown.map((p) => (
                <ListingResultCard key={p.id} product={p} lang={lang} dict={dict} />
              ))}
            </div>

            {hasMore && (
              <div className="mt-8">
                <Button
                  type="button"
                  size="md"
                  fullWidth
                  onClick={() => setVisible((v) => v + PAGE)}
                >
                  {dict.results.showMore}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="mt-8 flex flex-col items-center gap-4 rounded-[10px] border border-dashed border-stroke bg-soft/40 py-14 text-center">
            <p className="max-w-md text-sm text-ink/70">{dict.results.none}</p>
            {hasFilters && (
              <Button type="button" onClick={onClear} size="sm">
                {dict.results.clear}
              </Button>
            )}
          </div>
        )}
      </Container>
    </section>
  );
}
